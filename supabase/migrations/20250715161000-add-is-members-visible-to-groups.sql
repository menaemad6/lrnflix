-- Migration: Add is_members_visible column to groups table
ALTER TABLE groups
ADD COLUMN is_members_visible BOOLEAN NOT NULL DEFAULT TRUE; 