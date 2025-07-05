-- Complete Fresh WhatsGrapp Supabase Schema
-- Run this to set up the database from scratch

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (careful - this will delete data!)
DROP TABLE IF EXISTS whatsapp_orders CASCADE;
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;

-- Create merchants table
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_phone TEXT NOT NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create whatsapp_messages table for storing all WhatsApp interactions
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('incoming', 'outgoing')),
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create whatsapp_orders table for WhatsApp-specific order tracking
CREATE TABLE whatsapp_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_phone TEXT NOT NULL,
  merchant_phone TEXT NOT NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  whatsapp_message_id UUID REFERENCES whatsapp_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_merchants_phone ON merchants(phone_number);
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_orders_customer ON orders(customer_phone);
CREATE INDEX idx_orders_merchant ON orders(merchant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_whatsapp_messages_from ON whatsapp_messages(from_number);
CREATE INDEX idx_whatsapp_messages_to ON whatsapp_messages(to_number);
CREATE INDEX idx_whatsapp_messages_created ON whatsapp_messages(created_at);
CREATE INDEX idx_whatsapp_orders_customer ON whatsapp_orders(customer_phone);
CREATE INDEX idx_whatsapp_orders_merchant ON whatsapp_orders(merchant_phone);
CREATE INDEX idx_whatsapp_orders_status ON whatsapp_orders(status);

-- Enable RLS on all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (no authentication required)
-- This allows the app to work without user authentication

-- Merchants policies
CREATE POLICY "Allow all access to merchants" ON merchants FOR ALL USING (true);

-- Products policies  
CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true);

-- Orders policies
CREATE POLICY "Allow all access to orders" ON orders FOR ALL USING (true);

-- WhatsApp messages policies
CREATE POLICY "Allow all access to whatsapp_messages" ON whatsapp_messages FOR ALL USING (true);

-- WhatsApp orders policies
CREATE POLICY "Allow all access to whatsapp_orders" ON whatsapp_orders FOR ALL USING (true);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products  
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_whatsapp_orders_updated_at BEFORE UPDATE ON whatsapp_orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data for testing
INSERT INTO merchants (phone_number, business_name, contact_name, category, status) VALUES
('default', 'WhatsGrapp Demo Store', 'Demo User', 'retail', 'active'),
('+6512345678', 'Tech Paradise', 'John Doe', 'electronics', 'active'),
('+6587654321', 'Fashion Hub', 'Jane Smith', 'fashion', 'active');

-- Get the merchant IDs for sample products
DO $$
DECLARE
    demo_merchant_id UUID;
    tech_merchant_id UUID;
    fashion_merchant_id UUID;
BEGIN
    SELECT id INTO demo_merchant_id FROM merchants WHERE phone_number = 'default';
    SELECT id INTO tech_merchant_id FROM merchants WHERE phone_number = '+6512345678';
    SELECT id INTO fashion_merchant_id FROM merchants WHERE phone_number = '+6587654321';
    
    -- Insert sample products
    INSERT INTO products (merchant_id, name, description, price, category, stock, active) VALUES
    (demo_merchant_id, 'Sample Product', 'A sample product for testing', 29.99, 'general', 100, true),
    (tech_merchant_id, 'iPhone 15', 'Latest smartphone with 128GB storage', 1199.00, 'electronics', 10, true),
    (tech_merchant_id, 'MacBook Pro', 'M3 chip, 16GB RAM, 512GB SSD', 2499.00, 'electronics', 5, true),
    (fashion_merchant_id, 'Designer T-Shirt', 'Premium cotton t-shirt', 39.99, 'fashion', 50, true),
    (fashion_merchant_id, 'Jeans', 'Classic blue denim jeans', 79.99, 'fashion', 25, true);
END $$;

-- Create a view for easy merchant-product lookup
CREATE OR REPLACE VIEW merchant_products AS
SELECT 
    m.id as merchant_id,
    m.phone_number,
    m.business_name,
    m.contact_name,
    m.category as merchant_category,
    m.status as merchant_status,
    p.id as product_id,
    p.name as product_name,
    p.description,
    p.price,
    p.image_url,
    p.category as product_category,
    p.stock,
    p.active,
    p.created_at as product_created_at
FROM merchants m
LEFT JOIN products p ON m.id = p.merchant_id;

-- Create a view for WhatsApp message history with merchant info
CREATE OR REPLACE VIEW whatsapp_conversation AS
SELECT 
    wm.id,
    wm.from_number,
    wm.to_number,
    wm.message_body,
    wm.message_type,
    wm.session_id,
    wm.created_at,
    m.business_name,
    m.contact_name
FROM whatsapp_messages wm
LEFT JOIN merchants m ON wm.merchant_id = m.id
ORDER BY wm.created_at DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a function to safely upsert merchants
CREATE OR REPLACE FUNCTION upsert_merchant(
    p_phone_number TEXT,
    p_business_name TEXT,
    p_contact_name TEXT DEFAULT NULL,
    p_category TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    merchant_id UUID;
BEGIN
    -- Try to find existing merchant
    SELECT id INTO merchant_id 
    FROM merchants 
    WHERE phone_number = p_phone_number;
    
    IF merchant_id IS NULL THEN
        -- Create new merchant
        INSERT INTO merchants (phone_number, business_name, contact_name, category, status)
        VALUES (p_phone_number, p_business_name, p_contact_name, p_category, 'active')
        RETURNING id INTO merchant_id;
    ELSE
        -- Update existing merchant
        UPDATE merchants 
        SET business_name = p_business_name,
            contact_name = COALESCE(p_contact_name, contact_name),
            category = COALESCE(p_category, category),
            updated_at = NOW()
        WHERE id = merchant_id;
    END IF;
    
    RETURN merchant_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to safely create products
CREATE OR REPLACE FUNCTION create_product(
    p_merchant_phone TEXT,
    p_name TEXT,
    p_price NUMERIC,
    p_description TEXT DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_stock INTEGER DEFAULT 100
) RETURNS UUID AS $$
DECLARE
    merchant_id UUID;
    product_id UUID;
BEGIN
    -- Get or create merchant
    SELECT id INTO merchant_id 
    FROM merchants 
    WHERE phone_number = p_merchant_phone;
    
    IF merchant_id IS NULL THEN
        -- Create a basic merchant record
        merchant_id := upsert_merchant(
            p_merchant_phone, 
            'Business ' || RIGHT(p_merchant_phone, 4),
            'WhatsApp User',
            'general'
        );
    END IF;
    
    -- Create product
    INSERT INTO products (merchant_id, name, price, description, category, image_url, stock, active)
    VALUES (merchant_id, p_name, p_price, p_description, p_category, p_image_url, p_stock, true)
    RETURNING id INTO product_id;
    
    RETURN product_id;
END;
$$ LANGUAGE plpgsql;

-- Display summary
DO $$
BEGIN
    RAISE NOTICE 'WhatsGrapp database schema created successfully!';
    RAISE NOTICE 'Tables created: merchants, products, orders, whatsapp_messages, whatsapp_orders';
    RAISE NOTICE 'Sample data inserted for testing';
    RAISE NOTICE 'All tables have public access (no auth required)';
    RAISE NOTICE 'Helper functions created: upsert_merchant(), create_product()';
END $$;
