-- Additional tables for WhatsApp integration
-- Add these to your existing Supabase database

-- Add missing columns to merchants table if they don't exist
DO $$
BEGIN
    -- Add phone_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'phone_number') THEN
        ALTER TABLE merchants ADD COLUMN phone_number TEXT;
    END IF;
    
    -- Add business_name column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'business_name') THEN
        ALTER TABLE merchants ADD COLUMN business_name TEXT;
    END IF;
    
    -- Add contact_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'contact_name') THEN
        ALTER TABLE merchants ADD COLUMN contact_name TEXT;
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'category') THEN
        ALTER TABLE merchants ADD COLUMN category TEXT;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'merchants' AND column_name = 'status') THEN
        ALTER TABLE merchants ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END
$$;

-- Create whatsapp_messages table for storing all WhatsApp interactions
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('incoming', 'outgoing')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table with simplified structure for WhatsApp orders
CREATE TABLE IF NOT EXISTS whatsapp_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_phone TEXT NOT NULL,
  merchant_phone TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_merchants_phone_number ON merchants(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from ON whatsapp_messages(from_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_customer ON whatsapp_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_orders_merchant ON whatsapp_orders(merchant_phone);

-- Enable RLS on new tables
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for public access (no authentication required)
CREATE POLICY "Allow all access to whatsapp_messages" ON whatsapp_messages FOR ALL USING (true);
CREATE POLICY "Allow all access to whatsapp_orders" ON whatsapp_orders FOR ALL USING (true);
CREATE POLICY "Allow all access to merchants" ON merchants FOR ALL USING (true);
CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all access to orders" ON orders FOR ALL USING (true);
