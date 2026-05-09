-- Migration: 004_add_priority_to_tasks
-- Description: Adds priority column to the tasks table.

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium' 
CHECK (priority IN ('High', 'Medium', 'Low'));
