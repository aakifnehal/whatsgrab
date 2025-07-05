-- Temporary fix for WhatsApp sessions RLS policy
-- Run this in your Supabase SQL editor to fix the RLS issue

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Service role can manage sessions" ON whatsapp_sessions;

-- Create a more permissive policy for testing
CREATE POLICY "Allow WhatsApp session management" ON whatsapp_sessions FOR ALL 
USING (true);

-- Also add anon access for API endpoints
CREATE POLICY "Anon can manage sessions for API" ON whatsapp_sessions FOR ALL 
USING (auth.role() = 'anon' OR auth.role() = 'service_role');
