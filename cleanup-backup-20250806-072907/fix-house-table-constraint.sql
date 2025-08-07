-- Fix house table constraint issue
-- This SQL script checks and creates the missing unique constraint

-- First, let's see what constraints currently exist on the house table
SELECT conname as constraint_name, 
       contype as constraint_type,
       pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'house'::regclass;

-- Check the current structure of the house table
\d house;

-- Create the missing unique constraint if it doesn't exist
-- This constraint ensures we can upsert on (user_id, hr_number, day_number, date, topic)
DO $$ 
BEGIN
    -- Try to create the constraint, ignore if it already exists
    BEGIN
        ALTER TABLE house 
        ADD CONSTRAINT house_unique_key 
        UNIQUE (user_id, hr_number, day_number, date, topic);
        
        RAISE NOTICE 'Successfully created unique constraint house_unique_key';
    EXCEPTION 
        WHEN duplicate_table 
        THEN RAISE NOTICE 'Constraint house_unique_key already exists';
        WHEN others 
        THEN RAISE NOTICE 'Error creating constraint: %', SQLERRM;
    END;
END $$;

-- Verify the constraint was created
SELECT conname as constraint_name, 
       contype as constraint_type,
       pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'house'::regclass
AND conname = 'house_unique_key';
