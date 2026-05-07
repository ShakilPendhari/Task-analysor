-- Migration: 002_create_task_logs_table.sql
-- Description: Tracks task lifecycle events for the Task Analyser

CREATE TABLE IF NOT EXISTS public.task_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL, -- e.g., 'created', 'completed', 'notified_50', 'notified_70', 'deadline_reached'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own task logs" 
ON public.task_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task logs" 
ON public.task_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_task_logs_task_id ON public.task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_user_id ON public.task_logs(user_id);
