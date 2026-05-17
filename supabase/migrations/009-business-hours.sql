-- Add schedule column to settings table
ALTER TABLE public.settings ADD COLUMN schedule JSONB DEFAULT '{
  "0": { "isOpen": false, "open": "18:00", "close": "23:00" },
  "1": { "isOpen": true, "open": "18:00", "close": "23:00" },
  "2": { "isOpen": true, "open": "18:00", "close": "23:00" },
  "3": { "isOpen": true, "open": "18:00", "close": "23:00" },
  "4": { "isOpen": true, "open": "18:00", "close": "23:00" },
  "5": { "isOpen": true, "open": "18:00", "close": "23:00" },
  "6": { "isOpen": true, "open": "18:00", "close": "23:00" }
}'::jsonb;
