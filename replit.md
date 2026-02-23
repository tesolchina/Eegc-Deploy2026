# EEGC-Nuxt

## Overview

EEGC (English Essay Guidance Companion) is an AI-powered language learning assistant built for HKBU (Hong Kong Baptist University). The application helps students improve their English essay writing through structured three-step revision guidance. It supports three modes: Briefing (introduction/setup), Training (practice with sample essays), and Assessment (formal evaluation). The system manages student and teacher accounts, stores learning reports, and generates PDF/Markdown exports of learning sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **Nuxt 4.3.0 with Vue 3**: Chosen for its server-side rendering capabilities, file-based routing, and composables pattern for state management
- **TailwindCSS**: Used for styling via the `@nuxtjs/tailwindcss` module

### Backend Architecture
- **Nitro Server**: Nuxt's built-in server handles API routes in `server/api/`
- **JWT Authentication**: Custom middleware (`server/middleware/auth.ts`) validates tokens for protected routes. Separate tokens exist for students (`student_auth`) and teachers (`teacher_auth`)

### Data Storage
- **IMPORTANT: External Supabase Database** - This project uses an EXTERNAL Supabase instance, NOT Replit's built-in database. DO NOT use Replit's `execute_sql_tool` for database operations. All table creation/modification must be done through the Supabase Console SQL Editor.
- See `agent.md` for detailed instructions and bug history
- Four main tables:
  - `learning_reports`: Stores chat histories, ratings, and AI-generated contribution analysis
  - `students`: Registration data with unique ID generation (suffix + name prefix + random code)
  - `teachers`: Email-based accounts with plaintext passwords (acknowledged limitation)
  - `student_whitelist`: Controls which students can register (currently bypassed - open registration)

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
- `/` - Landing page with platform info and link to AI Edit module
- `/aiedit` - Student login portal (choose existing ID or sign up)
- `/aiedit/signup` - Student registration form
- `/aiedit/eegc` - Main application interface with mode switching, chat, and report generation
- `/teacher` - Teacher login portal (hidden, no link from public pages)
- `/teacher/dashboard` - Teacher dashboard for viewing reports
- `/admin/setup` - Admin page for populating student whitelist data

## External Dependencies

### Services
- **Supabase**: PostgreSQL database hosting (configured via `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`)
- **Poe API**: AI chat completions endpoint at `api.poe.com/v1` (configured via `POE_API_KEY`)

### Key NPM Packages
- `@supabase/supabase-js`: Database client
- `openai`: Used for Poe API compatibility layer
- `jsonwebtoken`: JWT token creation and verification
- `jspdf` + `html2canvas`: PDF report generation
- `markdown-it`: Markdown rendering for chat messages and reports
- `sweetalert2`: User notification dialogs

### Environment Variables Required
| Variable | Purpose |
|----------|---------|
| `POE_API_KEY` | Poe API authentication |
| `SUPABASE_URL` | Database connection |
| `SUPABASE_PUBLISHABLE_KEY` | Database authentication |
| `JWT_SECRET` | Token signing (has default fallback) |