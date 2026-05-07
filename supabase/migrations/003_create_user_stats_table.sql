-- Migration: 003_create_user_stats_table.sql
-- Description: Stores aggregated user productivity metrics

CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    expired_tasks INTEGER DEFAULT 0,
    completion_rate NUMERIC(5,2) DEFAULT 0,
    productivity_score INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own stats" 
ON public.user_stats FOR SELECT 
USING (auth.uid() = user_id);

-- Create a function to update stats on task changes (Optional but recommended)
-- This can be implemented via triggers in a later migration
