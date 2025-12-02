-- TMRS Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Fridge Sections
CREATE TABLE IF NOT EXISTS public.fridge_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fridges
CREATE TABLE IF NOT EXISTS public.fridges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.fridge_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PIC Contacts
CREATE TABLE IF NOT EXISTS public.pic_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.fridge_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Temperature Reports
CREATE TABLE IF NOT EXISTS public.temperature_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time TEXT NOT NULL CHECK (time IN ('12am', '2am', '4am', '6am')),
  submitter_name TEXT NOT NULL,
  remarks TEXT,
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Temperature Report Entries
CREATE TABLE IF NOT EXISTS public.temperature_report_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.temperature_reports(id) ON DELETE CASCADE,
  fridge_id UUID NOT NULL REFERENCES public.fridges(id) ON DELETE CASCADE,
  temperature_in_range BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fridges_section ON public.fridges(section_id);
CREATE INDEX IF NOT EXISTS idx_pic_contacts_section ON public.pic_contacts(section_id);
CREATE INDEX IF NOT EXISTS idx_temp_reports_date ON public.temperature_reports(date);
CREATE INDEX IF NOT EXISTS idx_temp_reports_submitter ON public.temperature_reports(submitted_by);
CREATE INDEX IF NOT EXISTS idx_temp_entries_report ON public.temperature_report_entries(report_id);

-- Enable Row Level Security
ALTER TABLE public.fridge_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fridges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pic_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temperature_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temperature_report_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users have full access
CREATE POLICY "Allow all for authenticated users" ON public.fridge_sections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON public.fridges FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON public.pic_contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON public.temperature_reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON public.temperature_report_entries FOR ALL USING (auth.role() = 'authenticated');
