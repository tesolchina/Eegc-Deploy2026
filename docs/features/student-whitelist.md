# Student Registration Whitelist Feature

**Implementation Date**: 2026-02-03  
**Checkpoint**: `72007c0ae01b498794c8ccac41fa6a65d7de6f7f`

---

## Overview

This feature restricts student registration to only those whose last 4 digits of student ID are in an approved whitelist. Students not in the whitelist receive a warning message asking them to contact the administrator.

---

## Files Modified

### 1. Database Table Creation

**Location**: Supabase Database (executed via SQL)

```sql
CREATE TABLE IF NOT EXISTS student_whitelist (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    student_number_suffix INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Explanation**:
- `first_name`: Student's first name (for teacher reference/identification)
- `student_number_suffix`: Last 4 digits of student ID (used for validation during registration)
- `UNIQUE` constraint on `student_number_suffix` ensures no duplicate entries

---

### 2. Backend API Modification

**File**: `server/api/student/signup.post.ts`

**Code Added** (Lines 15-29):

```typescript
const supabase = createClient(config.supabaseUrl, config.supabaseKey)

// Check if student is in the whitelist
const { data: whitelistEntry, error: whitelistError } = await supabase
    .from('student_whitelist')
    .select('*')
    .eq('student_number_suffix', student_number_suffix)
    .single()

if (whitelistError || !whitelistEntry) {
    throw createError({
        statusCode: 403,
        statusMessage: 'NOT_IN_WHITELIST',
    })
}
```

**Explanation**:
- Before allowing registration, the API queries the `student_whitelist` table
- Checks if the provided `student_number_suffix` exists in the whitelist
- If not found, returns HTTP 403 with `NOT_IN_WHITELIST` status message
- Only if the student is in the whitelist does registration proceed

---

### 3. Frontend Error Handling

**File**: `app/pages/student/signup.vue`

**Code Added** (Lines 78-95):

```typescript
} catch (error: any) {
    console.error('Signup error:', error)
    if (error.statusMessage === 'NOT_IN_WHITELIST' || error.data?.statusMessage === 'NOT_IN_WHITELIST') {
        Swal.fire({
            icon: 'warning',
            title: 'Registration Not Allowed',
            html: 'Your student number is not in the authorized list.<br><br>Please contact your teacher or administrator to be added to the system.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4f46e5'
        })
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: error.statusMessage || 'An error occurred during registration. Please try again.',
            confirmButtonColor: '#4f46e5'
        })
    }
}
```

**Explanation**:
- Catches the `NOT_IN_WHITELIST` error from the API
- Displays a user-friendly warning dialog using SweetAlert2
- Instructs the student to contact their teacher or administrator
- Other errors are handled with a generic error message

---

## Rollback Instructions

If you need to revert this feature:

1. **Using Replit Checkpoints**:
   - Go to the Replit editor
   - Click on "Version History" or "Checkpoints"
   - Find the checkpoint before `72007c0ae01b498794c8ccac41fa6a65d7de6f7f`
   - Click "Restore" to roll back

2. **Manual Rollback via Git**:
   ```bash
   git revert 72007c0ae01b498794c8ccac41fa6a65d7de6f7f
   ```

3. **Database Cleanup** (if needed):
   ```sql
   DROP TABLE IF EXISTS student_whitelist;
   ```

---

## Testing Guide

### Test Case 1: Unauthorized Student (Not in Whitelist)

1. Navigate to `/student/signup`
2. Enter a 4-digit student number NOT in the whitelist (e.g., `9999`)
3. Fill in name prefix (e.g., `TS`) and section number (e.g., `1`)
4. Click "Register & Get My Code"
5. **Expected**: Warning dialog appears with title "Registration Not Allowed"

### Test Case 2: Authorized Student (In Whitelist)

1. First, add a test entry to the whitelist:
   ```sql
   INSERT INTO student_whitelist (first_name, student_number_suffix) 
   VALUES ('Test', 1234);
   ```
2. Navigate to `/student/signup`
3. Enter `1234` as student number
4. Fill in name prefix and section number
5. Click "Register & Get My Code"
6. **Expected**: Registration succeeds and unique code is generated

---

## Debugging Tips

### Check if whitelist table exists:
```sql
SELECT * FROM student_whitelist;
```

### Check API logs:
- Open the Replit console
- Look for `Supabase Error:` messages in the workflow logs

### Verify API response:
Use browser developer tools (F12) → Network tab → Look for `/api/student/signup` request

### Common Issues:

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| All registrations fail | Whitelist table is empty | Add entries to `student_whitelist` |
| API returns 500 | Database connection issue | Check Supabase credentials in environment variables |
| Warning not showing | Frontend not catching error | Check browser console for JavaScript errors |

---

## Adding Students to Whitelist

### Single Entry:
```sql
INSERT INTO student_whitelist (first_name, student_number_suffix) 
VALUES ('John', 1234);
```

### Multiple Entries:
```sql
INSERT INTO student_whitelist (first_name, student_number_suffix) VALUES
('Alice', 1001),
('Bob', 1002),
('Charlie', 1003);
```

### View All Whitelisted Students:
```sql
SELECT * FROM student_whitelist ORDER BY first_name;
```

### Remove a Student:
```sql
DELETE FROM student_whitelist WHERE student_number_suffix = 1234;
```

---

## Related Documentation

- [Development Progress](../Progress/development-progress.md)
- [Technical Implementation](../discussion/implications4Dev.md)
