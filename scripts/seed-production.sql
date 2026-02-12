-- ============================================
-- EEGC Production Database Seed Script
-- Run these statements against the production database
-- ============================================

-- 1. Seed the student whitelist (unregistered IDs available for signup)
INSERT INTO student_whitelist (first_name, student_number_suffix)
VALUES
  ('Test', 1111),
  ('Test', 2222),
  ('Test', 3333),
  ('Test', 4444),
  ('Test', 5555),
  ('Test', 5678),
  ('Alice', 6001),
  ('Bob', 6002),
  ('Charlie', 6003),
  ('Diana', 6004),
  ('Edward', 6005),
  ('Fiona', 6006),
  ('George', 6007),
  ('Helen', 6008),
  ('Ivan', 6009),
  ('Julia', 6010)
ON CONFLICT (student_number_suffix) DO NOTHING;

-- 2. Seed teacher accounts
INSERT INTO teachers (email, password)
VALUES
  ('teacher1@test.com', 'teacher123'),
  ('teacher2@test.com', 'teacher456')
ON CONFLICT (email) DO NOTHING;

-- 3. Seed a few pre-registered student accounts (for login testing)
INSERT INTO students (student_number_suffix, name_prefix, section_number, random_code)
VALUES
  (1111, 'TA', 1, 'X1'),
  (2222, 'TB', 2, 'Y2'),
  (3333, 'TC', 3, 'Z3'),
  (4444, 'TD', 4, 'A4'),
  (5555, 'TE', 5, 'B5')
ON CONFLICT DO NOTHING;

-- ============================================
-- Verification queries (run after seeding)
-- ============================================

-- Check whitelist with registration status
SELECT w.student_number_suffix, w.first_name,
       CASE WHEN s.id IS NOT NULL THEN 'registered' ELSE 'not_registered' END AS status
FROM student_whitelist w
LEFT JOIN students s ON w.student_number_suffix = s.student_number_suffix
ORDER BY w.student_number_suffix;

-- Check teacher accounts
SELECT email, is_active FROM teachers ORDER BY email;

-- Check registered students with their login codes
SELECT student_number_suffix || '-' || name_prefix || '-' || random_code AS login_code,
       section_number
FROM students
ORDER BY student_number_suffix;
