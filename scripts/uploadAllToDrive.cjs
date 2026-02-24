const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { createReadStream } = require('fs');

const LOG_FILE = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'process.log');
const REPORTS_DIR = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'reports');
const UPLOAD_PROGRESS = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'upload_progress.json');
const DRIVE_FOLDER_ID = '1o3IfgifM8y8gThGRQfjXyCxShEHfqOAs';

function log(msg) {
  const line = new Date().toISOString() + ' - ' + msg;
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getAuthClient() {
  const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'google_tokens.json'), 'utf8'));
  const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

function loadProgress() {
  if (fs.existsSync(UPLOAD_PROGRESS)) {
    return new Set(JSON.parse(fs.readFileSync(UPLOAD_PROGRESS, 'utf8')));
  }
  return new Set();
}

function saveProgress(uploaded) {
  fs.writeFileSync(UPLOAD_PROGRESS, JSON.stringify([...uploaded]));
}

async function run() {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const allFiles = fs.readdirSync(REPORTS_DIR).sort();
  const uploaded = loadProgress();
  const remaining = allFiles.filter(f => !uploaded.has(f));

  log(`[UPLOAD] Starting: ${remaining.length} remaining of ${allFiles.length} (${uploaded.size} done)`);

  let success = 0, errors = 0;
  for (const fileName of remaining) {
    try {
      const filePath = path.join(REPORTS_DIR, fileName);
      const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'text/markdown';

      await drive.files.create({
        requestBody: { name: fileName, parents: [DRIVE_FOLDER_ID] },
        media: { mimeType, body: createReadStream(filePath) },
        fields: 'id',
      });
      uploaded.add(fileName);
      success++;

      if (success % 20 === 0) {
        saveProgress(uploaded);
        log(`[UPLOAD] Progress: ${uploaded.size}/${allFiles.length} (${errors} errors)`);
        await sleep(1000);
      }
    } catch (err) {
      errors++;
      log(`[UPLOAD ERROR] ${fileName}: ${err.message?.substring(0, 100)}`);
      saveProgress(uploaded);
      await sleep(3000);
    }
  }

  saveProgress(uploaded);
  log(`[UPLOAD] COMPLETE: ${success} uploaded, ${errors} errors. Total: ${uploaded.size}/${allFiles.length}`);
}

run().catch(e => { log(`[UPLOAD FATAL] ${e.message}`); process.exit(1); });
