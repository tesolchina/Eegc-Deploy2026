const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'process.log');
const REPORTS_DIR = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'reports');

function log(msg) {
  const line = new Date().toISOString() + ' - ' + msg;
  fs.appendFileSync(LOG_FILE, line + '\n');
  console.log(line);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getAuthClient() {
  const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'google_tokens.json'), 'utf8'));
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

function extractStudentInfo(textContent) {
  const emailMatch = textContent.match(/Student Email:\s*(.+)/);
  const numberMatch = textContent.match(/Student Number:\s*(.+)/);
  const sectionMatch = textContent.match(/Section:\s*(.+)/);
  const dateMatch = textContent.match(/Generated:\s*(.+)/);
  return {
    studentEmail: emailMatch ? emailMatch[1].trim() : 'unknown',
    studentNumber: numberMatch ? numberMatch[1].trim() : 'unknown',
    section: sectionMatch ? sectionMatch[1].trim() : 'unknown',
    generatedDate: dateMatch ? dateMatch[1].trim() : 'unknown',
  };
}

function getTextFromParts(parts) {
  if (!parts) return '';
  for (const p of parts) {
    if (p.mimeType === 'text/plain' && p.body?.data) {
      return Buffer.from(p.body.data, 'base64').toString('utf8');
    }
    if (p.parts) {
      const result = getTextFromParts(p.parts);
      if (result) return result;
    }
  }
  return '';
}

async function run() {
  const auth = getAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const existingFiles = new Set(fs.existsSync(REPORTS_DIR) ? fs.readdirSync(REPORTS_DIR) : []);

  log('=== Phase 1: Download reports from Gmail ===');

  let allMessageIds = [];
  let pageToken = undefined;
  do {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'from:no-reply@hkbuchatbot.smartutor.me',
      maxResults: 100,
      pageToken
    });
    if (res.data.messages) allMessageIds = allMessageIds.concat(res.data.messages.map(m => m.id));
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  log(`Found ${allMessageIds.length} emails, ${existingFiles.size} already downloaded`);

  let processed = 0, downloaded = 0, skipped = 0, errors = 0;
  const BATCH = 50;
  const startIdx = parseInt(process.env.START_FROM || '0');

  for (let i = startIdx; i < allMessageIds.length; i++) {
    try {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: allMessageIds[i],
        format: 'full'
      });

      const textContent = getTextFromParts(msg.data.payload.parts);
      const info = extractStudentInfo(textContent);

      const safeNum = info.studentNumber.replace(/[^a-zA-Z0-9]/g, '_');
      const safeDate = info.generatedDate.replace(/[^0-9-]/g, '_').substring(0, 10);
      const safeSec = info.section.replace(/[^a-zA-Z0-9]/g, '_');

      const parts = msg.data.payload.parts || [];
      for (const part of parts) {
        if (!part.filename || !part.body?.attachmentId) continue;

        const ext = part.filename.endsWith('.pdf') ? 'pdf' : 'md';
        const fileName = `${safeNum}_sec${safeSec}_${safeDate}.${ext}`;

        if (existingFiles.has(fileName)) {
          skipped++;
          continue;
        }

        const att = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: allMessageIds[i],
          id: part.body.attachmentId
        });

        const fileData = Buffer.from(att.data.data, 'base64url');
        fs.writeFileSync(path.join(REPORTS_DIR, fileName), fileData);
        existingFiles.add(fileName);
        downloaded++;
      }

      processed++;
      if (processed % 20 === 0) {
        log(`[${i + 1}/${allMessageIds.length}] ${downloaded} downloaded, ${skipped} skipped, ${errors} errors`);
        if (global.gc) global.gc();
        await sleep(500);
      }
    } catch (err) {
      errors++;
      log(`[ERROR ${i + 1}] ${err.message?.substring(0, 120)}`);
      await sleep(2000);
    }
  }

  log('=== Phase 1 complete ===');
  log(`Processed: ${processed}, Downloaded: ${downloaded}, Skipped: ${skipped}, Errors: ${errors}`);
  log(`Total files: ${existingFiles.size}`);
}

run().catch(e => {
  log(`FATAL: ${e.message}`);
  process.exit(1);
});
