-- WhatsGrapp Database Schema
-- This file contains all the SQL commands to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS whatsapp_sessions CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;

-- Create merchants table
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  store_name TEXT,
  business_details TEXT,
  locale TEXT DEFAULT 'en-SG',
  currency TEXT DEFAULT 'SGD',
  mcp_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  discount NUMERIC(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  image_url TEXT,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  customer_phone TEXT,
  customer_name TEXT,
  customer_address TEXT,
  payment_method TEXT DEFAULT 'grab_pay',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create whatsapp_sessions table for managing chat sessions
CREATE TABLE whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'start',
  session_data JSONB DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_insights table for storing AI-generated insights
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('restock_alert', 'sales_forecast', 'recommendation')),
  data JSONB NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_merchants_phone ON merchants(phone);
CREATE INDEX idx_products_merchant_id ON products(merchant_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_whatsapp_sessions_phone ON whatsapp_sessions(phone);
CREATE INDEX idx_whatsapp_sessions_expires_at ON whatsapp_sessions(expires_at);
CREATE INDEX idx_ai_insights_merchant_id ON ai_insights(merchant_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for merchants (service role can access all, users through API)
CREATE POLICY "Service role can manage merchants" ON merchants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anon can read merchants" ON merchants FOR SELECT USING (auth.role() = 'anon');

-- RLS Policies for products (public can view active products)
CREATE POLICY "Service role can manage products" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (active = TRUE OR auth.role() = 'service_role');

-- RLS Policies for orders (service role only for now)
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for whatsapp_sessions (service role only)
CREATE POLICY "Service role can manage sessions" ON whatsapp_sessions FOR ALL USING (auth.role() = 'service_role');

-- Create storage bucket for product images (run this separately if needed)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('product-images', 'product-images', true) 
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN others THEN
    -- Bucket creation might fail if storage is not enabled, that's ok
    NULL;
END $$;

-- Storage policies for product images (run this separately if needed)
DO $$
BEGIN
  -- Public can view product images
  CREATE POLICY "Public can view product images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'product-images');
  
  -- Authenticated users can upload product images
  CREATE POLICY "Authenticated users can upload product images" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
  
  -- Service role can manage product images
  CREATE POLICY "Service role can manage product images" ON storage.objects 
  FOR ALL USING (bucket_id = 'product-images' AND auth.role() = 'service_role');
EXCEPTION
  WHEN others THEN
    -- Storage policies might fail if storage is not enabled, that's ok
    NULL;
END $$;
