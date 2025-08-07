-- ==========================================
-- DATA AUDIT QUERY
-- Run this first to see what data we have
-- ==========================================

-- Check existing users
SELECT 'EXISTING USERS' as section, id, username, hr FROM users ORDER BY username;

-- Check user_dates table
SELECT 'USER_DATES RECORDS' as section, user_id, dates FROM user_dates ORDER BY user_id;

-- Find orphaned user_dates (dates for users that don't exist)
SELECT 
  'ORPHANED USER_DATES' as section,
  ud.user_id,
  ud.dates,
  'NO MATCHING USER' as issue
FROM user_dates ud
LEFT JOIN users u ON ud.user_id = u.id
WHERE u.id IS NULL;

-- Find users without dates
SELECT 
  'USERS WITHOUT DATES' as section,
  u.id,
  u.username,
  'NO DATE RECORDS' as status
FROM users u
LEFT JOIN user_dates ud ON u.id = ud.user_id
WHERE ud.user_id IS NULL;
