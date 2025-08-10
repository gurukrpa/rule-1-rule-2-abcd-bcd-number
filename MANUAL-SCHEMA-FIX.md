# 🔧 Manual Schema Fix Instructions

## The Issue
Your automation database is missing the `hr` and `days` columns in the `users` table that your application expects.

## Quick Fix Solution

### Option 1: Use Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/oqbusqbsmvwkwhggzvhl/sql

2. **Run this SQL**:
   ```sql
   -- Add missing columns
   ALTER TABLE users ADD COLUMN IF NOT EXISTS hr INTEGER DEFAULT 0;
   ALTER TABLE users ADD COLUMN IF NOT EXISTS days INTEGER DEFAULT 0;
   
   -- Add sample test data
   INSERT INTO users (username, hr, days) VALUES 
       ('test_user', 100, 30),
       ('demo_user', 150, 45)
   ON CONFLICT (username) DO NOTHING;
   
   -- Verify the fix
   SELECT 'Fix applied successfully!' as status, count(*) as user_count FROM users;
   ```

3. **Click "Run"**

### Option 2: Use the Browser Debug Tool

After applying the SQL fix above:

1. Go to: http://localhost:5173/debug
2. Click "Run Database Tests"
3. You should see: ✅ User created successfully

### Option 3: Test User Creation

1. Go to: http://localhost:5173/users
2. Try creating a new user with:
   - Username: "my_test_user"
   - Total HR: 120
   - Total Days: 25
3. Click "Add User"

## Expected Results

After applying the fix:
- ✅ No more "Could not find the 'days' column" error
- ✅ Users can be created successfully
- ✅ User list displays properly
- ✅ Test users appear in the table

## What This Fixes

The original schema was missing these columns:
- `hr INTEGER` - stores total HR value for each user
- `days INTEGER` - stores total days value for each user

These columns are required by the UserList component for user creation and display.

---

**🎯 Next Steps**: After applying this fix, your automation environment should work exactly like the production environment for user management!
