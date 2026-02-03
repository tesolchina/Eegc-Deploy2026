# Development Implications

Based on Simon's answers in [questions-for-simon.md](./questions-for-simon.md)

**Date**: 2026-02-02  
**Status**: Ready for implementation

---

## Summary of Simon's Decisions

### Question 1: Student Registration & Section Info

**Decision**: Custom registration flow with section tracking

**Key Points from Simon**:
- Students register with: **last 4 digits of student ID** + **last name** + **first name initial** + **section number**
- System generates **Unique ID** during registration
- Pre-check for duplicate last 4 digits needed
- **No need** to show teacher info to students
- **Must track** which section students belong to

### Question 2: Teacher Login

**Decision**: Manual email-based registration

**Key Points from Simon**:
- Teachers registered manually using **HKBU email**
- Password sent via email
- **No password change UI** - teachers retrieve password from email
- Emma provides: teacher names, emails, and section assignments + student lists

### Question 3: Student ID Handling

**Decision**: Unique ID only (no full student ID)

**Key Points from Simon**:
- Students only use **Unique ID** (not full student ID)
- Identification via Unique ID is sufficient
- May help expedite grading by matching students

---

## Development Tasks

### Database Schema Updates

```sql
-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(10) UNIQUE NOT NULL,  -- Generated: last4digits + lastname + firstinitial
  last_4_digits VARCHAR(4) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  first_name_initial CHAR(1) NOT NULL,
  section_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teachers table  
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,     -- HKBU email
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  sections INTEGER[] NOT NULL,            -- Array of section numbers
  created_at TIMESTAMP DEFAULT NOW()
);

-- Section-Teacher mapping (if needed)
CREATE TABLE section_teachers (
  section_number INTEGER PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id)
);
```

**Files to update**: 
- `Database_Schema.md`
- Supabase dashboard

---

### Frontend: Student Registration Page

**New page needed**: `app/pages/register.vue`

**Form fields**:
| Field | Type | Validation |
|-------|------|------------|
| Last 4 digits of Student ID | Text | 4 digits only |
| Last Name | Text | Required |
| First Name Initial | Text | 1 character |
| Section Number | Dropdown | Pre-defined sections |

**Logic**:
1. Check for duplicate last 4 digits before submission
2. Generate Unique ID: `{last4digits}{lastname}{firstinitial}`
3. Save to database
4. Show generated Unique ID to student

**Files to create/update**:
- `app/pages/register.vue` (new)
- `server/api/register-student.post.ts` (new)

---

### Frontend: Student Login Page

**Update existing or new page**: `app/pages/login.vue`

**Form fields**:
| Field | Type |
|-------|------|
| Unique ID | Text |

**Files to create/update**:
- `app/pages/login.vue` (new or update)
- `server/api/login-student.post.ts` (new)

---

### Backend: Teacher Management (Admin Only)

**No UI needed** - manual process via:
1. Direct Supabase dashboard
2. Or admin API endpoint

**Process**:
1. Emma provides teacher list (name, email, sections)
2. Admin creates teacher accounts manually
3. System sends password via email

**Files to create**:
- `server/api/admin/create-teacher.post.ts` (optional)

---

### Pre-registration Check API

**New endpoint**: `POST /api/check-duplicate`

**Purpose**: Check if last 4 digits already exist

**Request**:
```json
{
  "last_4_digits": "1234"
}
```

**Response**:
```json
{
  "exists": false,
  "message": "Available"
}
```

**Files to create**:
- `server/api/check-duplicate.post.ts` (new)

---

## Implementation Priority

| Priority | Task | Effort |
|----------|------|--------|
| 1 | Update database schema | Low |
| 2 | Student registration page | Medium |
| 3 | Student login page | Low |
| 4 | Duplicate check API | Low |
| 5 | Teacher account creation (manual) | Low |

---

## Questions for Bob

1. Should we implement email notification for student registration confirmation?
2. Do we need a "forgot Unique ID" recovery flow?
3. Should section numbers be hardcoded or fetched from database?

---

## Reference Files

- Original discussion: [questions-for-simon.md](./questions-for-simon.md)
- Current database schema: `Database_Schema.md`
- Server API docs: `docs/modules/server-api.md`
