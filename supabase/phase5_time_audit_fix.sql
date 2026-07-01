-- Phase 5 fixup — categories table exists but is empty, time_blocks was never created.
-- Run this instead of the original phase5_time_audit.sql.

INSERT INTO categories (name, color, sort_order) VALUES
  ('Deep Work',    '#FF3D00', 1),
  ('Admin',        '#737373', 2),
  ('Meetings',     '#4A9EFF', 3),
  ('Learning',     '#A78BFA', 4),
  ('Health',       '#34D399', 5),
  ('Personal',     '#F59E0B', 6),
  ('Social',       '#EC4899', 7),
  ('Transit',      '#6B7280', 8);

CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  title TEXT,
  primary_category_id UUID REFERENCES categories(id),
  secondary_category_id UUID REFERENCES categories(id),
  notes TEXT,
  google_calendar_event_id TEXT UNIQUE,
  energy_level INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
