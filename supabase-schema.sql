-- Supabase Database Schema for Hierarchy Management
-- Run this SQL in your Supabase SQL Editor

-- Create hierarchies table
CREATE TABLE IF NOT EXISTS hierarchies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS hierarchies_user_id_idx ON hierarchies(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE hierarchies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only see their own hierarchies
CREATE POLICY "Users can view own hierarchies"
  ON hierarchies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own hierarchies
CREATE POLICY "Users can insert own hierarchies"
  ON hierarchies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own hierarchies
CREATE POLICY "Users can update own hierarchies"
  ON hierarchies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own hierarchies
CREATE POLICY "Users can delete own hierarchies"
  ON hierarchies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_hierarchies_updated_at
  BEFORE UPDATE ON hierarchies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON hierarchies TO authenticated;

