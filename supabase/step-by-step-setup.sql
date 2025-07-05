-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create merchants table
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

-- Step 3: Create products table
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

-- Step 4: Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'pending',
  customer_phone TEXT,
  customer_name TEXT,
  customer_address TEXT,
  payment_method TEXT DEFAULT 'grab_pay',
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create whatsapp_sessions table
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

-- Step 6: Create basic indexes
CREATE INDEX idx_merchants_phone ON merchants(phone);
CREATE INDEX idx_products_merchant_id ON products(merchant_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_whatsapp_sessions_phone ON whatsapp_sessions(phone);

-- Step 7: Enable RLS (but keep policies simple for now)
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Step 8: Create simple RLS policies
CREATE POLICY "Service role can manage merchants" ON merchants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage products" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (active = TRUE);
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage sessions" ON whatsapp_sessions FOR ALL USING (auth.role() = 'service_role');
