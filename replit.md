# EEGC-Nuxt

## Overview

EEGC (English Essay Guidance Companion) is an AI-powered language learning assistant built for HKBU (Hong Kong Baptist University). The application helps students improve their English essay writing through structured three-step revision guidance. It supports three modes: Briefing (introduction/setup), Training (practice with sample essays), and Assessment (formal evaluation). The system manages student and teacher accounts, stores learning reports, and generates PDF/Markdown exports of learning sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **2026-02-12**: Migrated from external Supabase to Replit's built-in PostgreSQL database. Removed `@supabase/supabase-js` dependency. All server API routes now use `node-postgres` (`pg`) with connection pooling via `server/utils/db.ts`.
- **2026-02-12**: Cleaned up `nuxt.config.ts` to remove Supabase runtime config references.
- **2026-02-12**: Student signup form updated: Section field changed to dropdown (1-10), Name Prefix relabeled to "Name Initials" with example "John Kwok → JK".

## System Architecture

### Frontend Framework
- **Nuxt 4.3.0 with Vue 3**: Chosen for its server-side rendering capabilities, file-based routing, and composables pattern for state management
- **TailwindCSS**: Used for styling via the `@nuxtjs/tailwindcss` module

### Backend Architecture
- **Nitro Server**: Nuxt's built-in server handles API routes in `server/api/`
- **JWT Authentication**: Custom middleware (`server/middleware/auth.ts`) validates tokens for protected routes. Separate tokens exist for students (`student_auth`) and teachers (`teacher_auth`)

### Data Storage
- **Replit Built-in PostgreSQL**: Uses `DATABASE_URL` environment variable (auto-configured by Replit). Database operations use `node-postgres` (`pg`) with connection pooling via `server/utils/db.ts`.
- Four main tables:
  - `learning_reports`: Stores chat histories, ratings, and AI-generated contribution analysis
  - `students`: Registration data with unique ID generation (suffix + name prefix + random code)
  - `teachers`: Email-based accounts with plaintext passwords (acknowledged limitation)
  - `student_whitelist`: Controls which students can register
- **Temporary seed endpoint**: `POST /api/admin/seed-test-data` exists for one-time production seeding. Should be removed after production data is seeded.

### AI Integration
- **Poe API** (OpenAI-compatible format): Server-side API key management eliminates need for students to provide keys
- Supports streaming responses for real-time chat feedback
- Models available: `gpt-5.2`, `gemini-3-flash`, `gpt-5.2-instant`

### State Management Pattern
- Vue Composables in `app/composables/eegc/` handle all business logic:
  - `useChatFunctions`: AI chat interactions with streaming support
  - `useModeManager`: Mode switching and per-mode state isolation
  - `useReportGenerator`: Assessment report generation and submission
  - `useApiConnection`: Connection testing and status management

### Key Pages
- `/` - Landing page with login options
- `/eegc` - Main application interface with mode switching, chat, and report generation
- `/student/signup` - Student registration form

## External Dependencies

### Services
- **Replit PostgreSQL**: Built-in database (configured via `DATABASE_URL`)
- **Poe API**: AI chat completions endpoint at `api.poe.com/v1` (configured via `POE_API_KEY`)

### Key NPM Packages
- `pg`: PostgreSQL client with connection pooling
- `openai`: Used for Poe API compatibility layer
- `jsonwebtoken`: JWT token creation and verification
- `jspdf` + `html2canvas`: PDF report generation
- `markdown-it`: Markdown rendering for chat messages and reports
- `sweetalert2`: User notification dialogs

### Environment Variables Required
| Variable | Purpose |
|----------|---------|
| `POE_API_KEY` | Poe API authentication |
| `DATABASE_URL` | PostgreSQL connection (auto-configured by Replit) |
| `JWT_SECRET` | Token signing (has default fallback) |
