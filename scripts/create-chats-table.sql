-- Create the chats table in Supabase
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on timestamp for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_timestamp ON chats(timestamp DESC);

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at DESC);
