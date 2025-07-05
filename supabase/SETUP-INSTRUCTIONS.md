# WhatsGrapp Database Schema Setup Instructions

## Step 1: Apply the New Schema

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query and copy the entire contents of `fresh-complete-schema.sql`
4. Run the query to create the complete database schema

⚠️ **WARNING**: This will drop existing tables and recreate them. All existing data will be lost.

## Step 2: Verify Tables Created

After running the schema, verify these tables exist:
- `merchants`
- `products` 
- `orders`
- `whatsapp_messages`
- `whatsapp_orders`

## Step 3: Test the Database Functions

The schema includes helper functions:
- `upsert_merchant()` - Creates or updates merchants
- `create_product()` - Creates products linked to merchants

## Step 4: Verify RLS Policies

All tables should have Row Level Security enabled with public access policies for:
- No authentication required
- All operations (SELECT, INSERT, UPDATE, DELETE) allowed

## Step 5: Test Sample Data

The schema includes sample merchants and products for testing:
- Default merchant: "WhatsGrapp Demo Store"
- Tech Paradise: "+6512345678"
- Fashion Hub: "+6587654321"

## What This Fixes:

1. **Proper foreign key relationships** between merchants, products, and orders
2. **WhatsApp message tracking** with merchant linking
3. **Helper functions** for safe data insertion
4. **Public access policies** - no authentication required
5. **Sample data** for immediate testing
6. **Database views** for easy queries
7. **Automatic timestamp updates** via triggers

## API Endpoints That Will Work:

- `GET /api/products` - List all products
- `GET /api/merchants-list` - List all merchants  
- `GET /api/whatsapp-messages` - List WhatsApp messages
- `POST /api/whatsapp/webhook` - WhatsApp webhook (saves data)

## Next Steps After Schema Setup:

1. Restart your Next.js server
2. Test WhatsApp message sending - data should save to all relevant tables
3. Check the website pages to see real data displayed
4. Verify merchant registration and product creation via WhatsApp

The WhatsApp webhook will now properly save:
- ✅ Merchants (when business details are provided)
- ✅ Products (when product details are provided)  
- ✅ Messages (all incoming/outgoing messages)
- ✅ Orders (when purchase commands are used)
