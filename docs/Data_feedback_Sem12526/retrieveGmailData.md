# Data Retrieval Scripts - Semester 1 25/26

## Overview

These scripts download learning report attachments (PDF + Markdown) from Gmail and upload them to Google Drive. Reports are sent by `no-reply@hkbuchatbot.smartutor.me` to teacher emails including `simonwanghkteacher+test@gmail.com`.

**Google Drive folder:** https://drive.google.com/drive/folders/1o3IfgifM8y8gThGRQfjXyCxShEHfqOAs

## Prerequisites

- Google OAuth tokens saved at `google_tokens.json` (root of project)
- Environment secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- npm packages: `googleapis` (already installed)

## Scripts

### 1. `scripts/downloadBatch.cjs` - Download Reports from Gmail

Downloads report attachments (PDF + MD) from Gmail in batches of 40 emails per run. Saves files to `docs/Data_feedback_Sem12526/reports/`.

**File naming:** `{studentNumber}_sec{section}_{date}.{pdf|md}`

**How it works:**
- First run fetches all message IDs and caches them in `message_ids.json`
- Tracks progress in `progress.json` (which email index it's up to)
- Skips already-downloaded files
- Each run processes 40 emails then exits

**Usage:**
```bash
# Single batch
node scripts/downloadBatch.cjs

# Run all batches until complete
for batch in $(seq 1 20); do node scripts/downloadBatch.cjs; done
```

### 2. `scripts/uploadSmallBatch.cjs` - Upload to Google Drive (Single Batch)

Uploads 10 files per run to the Google Drive folder. Tracks progress in `upload_progress.json`.

**Usage:**
```bash
node scripts/uploadSmallBatch.cjs
# Output: OK:170/1162  or  DONE:1162
```

### 3. `scripts/uploadLoop.sh` - Upload All to Google Drive (Loop)

Wrapper that runs `uploadSmallBatch.cjs` in a loop until all files are uploaded. Handles errors with retries. Max 200 iterations (2000 files).

**Usage:**
```bash
# Foreground
bash scripts/uploadLoop.sh

# Background (use setsid to survive session cleanup)
setsid bash scripts/uploadLoop.sh </dev/null > /tmp/upload.log 2>&1 &
```

### 4. `scripts/uploadAllToDrive.cjs` - Upload All (Single Process)

Alternative: uploads all remaining files in one node process. May crash on systems with limited memory or process restrictions. Use `uploadLoop.sh` instead for reliability.

### 5. `scripts/downloadReports.cjs` - Original Download Script (Legacy)

Original all-in-one download script. Tends to crash after ~60 emails. Superseded by `downloadBatch.cjs`.

## Progress Tracking Files

All stored in `docs/Data_feedback_Sem12526/`:

| File | Purpose |
|------|---------|
| `message_ids.json` | Cached list of all Gmail message IDs (734 total) |
| `progress.json` | Download progress: which email index we're up to |
| `upload_progress.json` | List of filenames already uploaded to Drive |
| `process.log` | Timestamped log of all operations |

## Re-running / Resuming

All scripts are **idempotent** - safe to re-run at any time:
- Downloads skip files that already exist in `reports/`
- Uploads skip files already listed in `upload_progress.json`
- To start fresh: delete the progress files listed above

## Stats (Semester 1 25/26)

- Total emails: 734
- Total report files: 1162 (mix of PDF and Markdown)
- Each email typically has 2 attachments (1 PDF + 1 MD)

## Troubleshooting

- **Process gets killed in background:** Use `setsid` instead of `nohup` to prevent session cleanup from killing the process
- **Token expired:** Re-run the OAuth flow to refresh `google_tokens.json`
- **Partial upload:** Just re-run `uploadLoop.sh` - it picks up where it left off
- **Check progress:** `tail -5 docs/Data_feedback_Sem12526/process.log`
