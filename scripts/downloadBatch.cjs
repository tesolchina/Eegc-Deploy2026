const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'process.log');
const REPORTS_DIR = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'reports');
const PROGRESS_FILE = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'progress.json');
const MSG_IDS_FILE = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'message_ids.json');
const BATCH_SIZE = 40;

function log(msg) {
  const line = new Date().toISOString() + ' - ' + msg;
  fs.appendFileSync(LOG_FILE, line + '\n');
  console.log(line);
}

function getAuthClient() {
  const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'google_tokens.json'), 'utf8'));
  const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

function extractStudentInfo(text) {
  return {
    studentNumber: (text.match(/Student Number:\s*(.+)/) || [,'unknown'])[1].trim(),
    section: (text.match(/Section:\s*(.+)/) || [,'unknown'])[1].trim(),
    generatedDate: (text.match(/Generated:\s*(.+)/) || [,'unknown'])[1].trim(),
  };
}

function getTextFromParts(parts) {
  if (!parts) return '';
  for (const p of parts) {
    if (p.mimeType === 'text/plain' && p.body?.data)
      return Buffer.from(p.body.data, 'base64').toString('utf8');
    if (p.parts) { const r = getTextFromParts(p.parts); if (r) return r; }
  }
  return '';
}

async function fetchMessageIds(gmail) {
  if (fs.existsSync(MSG_IDS_FILE)) {
    return JSON.parse(fs.readFileSync(MSG_IDS_FILE, 'utf8'));
  }
  log('Fetching all message IDs...');
  let ids = [], pageToken;
  do {
    const res = await gmail.users.messages.list({
      userId: 'me', q: 'from:no-reply@hkbuchatbot.smartutor.me', maxResults: 100, pageToken
    });
    if (res.data.messages) ids = ids.concat(res.data.messages.map(m => m.id));
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  fs.writeFileSync(MSG_IDS_FILE, JSON.stringify(ids));
  log(`Cached ${ids.length} message IDs`);
  return ids;
}

async function run() {
  const auth = getAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const allIds = await fetchMessageIds(gmail);
  const existingFiles = new Set(fs.readdirSync(REPORTS_DIR));

  let progress = { lastIndex: 0, downloaded: 0, skipped: 0, errors: 0 };
  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }

  const startIdx = progress.lastIndex;
  const endIdx = Math.min(startIdx + BATCH_SIZE, allIds.length);

  if (startIdx >= allIds.length) {
    log(`All ${allIds.length} emails processed! Total files: ${existingFiles.size}`);
    return;
  }

  log(`=== Batch: emails ${startIdx + 1}-${endIdx} of ${allIds.length} (files so far: ${existingFiles.size}) ===`);

  for (let i = startIdx; i < endIdx; i++) {
    try {
      const msg = await gmail.users.messages.get({ userId: 'me', id: allIds[i], format: 'full' });
      const text = getTextFromParts(msg.data.payload.parts);
      const info = extractStudentInfo(text);
      const prefix = `${info.studentNumber.replace(/[^a-zA-Z0-9]/g,'_')}_sec${info.section.replace(/[^a-zA-Z0-9]/g,'_')}_${info.generatedDate.replace(/[^0-9-]/g,'_').substring(0,10)}`;

      for (const part of (msg.data.payload.parts || [])) {
        if (!part.filename || !part.body?.attachmentId) continue;
        const ext = part.filename.endsWith('.pdf') ? 'pdf' : 'md';
        const fileName = `${prefix}.${ext}`;
        if (existingFiles.has(fileName)) { progress.skipped++; continue; }

        const att = await gmail.users.messages.attachments.get({
          userId: 'me', messageId: allIds[i], id: part.body.attachmentId
        });
        fs.writeFileSync(path.join(REPORTS_DIR, fileName), Buffer.from(att.data.data, 'base64url'));
        existingFiles.add(fileName);
        progress.downloaded++;
      }
    } catch (err) {
      progress.errors++;
      log(`[ERROR ${i+1}] ${err.message?.substring(0, 100)}`);
    }
  }

  progress.lastIndex = endIdx;
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
  log(`Batch done. Downloaded: ${progress.downloaded}, Skipped: ${progress.skipped}, Errors: ${progress.errors}, Files: ${existingFiles.size}`);
  log(`Next batch starts at: ${endIdx}/${allIds.length}`);
}

run().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
