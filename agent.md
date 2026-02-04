# Agent Instructions

## Critical: Database Configuration

**This project uses an EXTERNAL Supabase database, NOT Replit's built-in database.**

### Common Mistake to Avoid
- DO NOT use Replit's `execute_sql_tool` to create or modify tables
- The `execute_sql_tool` operates on Replit's internal PostgreSQL, which is NOT connected to this application
- All database operations must be done through the Supabase console/SQL Editor

### Correct Workflow for Database Changes
1. Prepare the SQL statements
2. Provide the SQL to the user
3. User executes the SQL in Supabase Console (https://supabase.com) → SQL Editor
4. Verify the changes work in the application

### Bug History

**2026-02-03: Whitelist Table Creation Bug**
- Issue: AI used `execute_sql_tool` to create `student_whitelist` table
- Result: Table was created in Replit's local database, not in Supabase
- Error: `Could not find the table 'public.student_whitelist' in the schema cache`
- Fix: User manually created the table in Supabase console
- Lesson: Always verify database connection type before creating tables

### Database Connection Details
- Database Service: External Supabase (PostgreSQL)
- Connection configured via: `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` environment variables
- Tables: `students`, `teachers`, `learning_reports`, `student_whitelist`
