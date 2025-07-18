-- Migration: Add is_code_visible column to groups table
ALTER TABLE groups
ADD COLUMN is_code_visible BOOLEAN NOT NULL DEFAULT TRUE; 