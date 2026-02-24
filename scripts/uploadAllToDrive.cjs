const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const stream = require('stream');

const LOG_FILE = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'process.log');
const REPORTS_DIR = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'reports');
const UPLOAD_PROGRESS = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'upload_progress.json');
const DRIVE_FOLDER_ID = '1o3IfgifM8y8gThGRQfjXyCxShEHfqOAs';

function log(msg) {
  const line = new Date().toISOString() + ' - ' + msg;
  fs.appendFileSync(LOG_FILE, line + '\n');
  console.log(line);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getAuthClient() {
  const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'google_tokens.json'), 'utf8'));
  const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

async function run() {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const allFiles = fs.readdirSync(REPORTS_DIR).sort();
  let uploaded = new Set();
  if (fs.existsSync(UPLOAD_PROGRESS)) {
    uploaded = new Set(JSON.parse(fs.readFileSync(UPLOAD_PROGRESS, 'utf8')));
  }

  const remaining = allFiles.filter(f => !uploaded.has(f));
  log(`=== Upload ALL: ${remaining.length} remaining of ${allFiles.length} total (${uploaded.size} already done) ===`);

  let success = 0, errors = 0;
  for (let i = 0; i < remaining.length; i++) {
    const fileName = remaining[i];
    try {
      const filePath = path.join(REPORTS_DIR, fileName);
      const fileData = fs.readFileSync(filePath);
      const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'text/markdown';

      await drive.files.create({
        requestBody: { name: fileName, parents: [DRIVE_FOLDER_ID] },
        media: { mimeType, body: stream.Readable.from(fileData) },
        fields: 'id',
      });
      uploaded.add(fileName);
      success++;

      if (success % 30 === 0) {
        fs.writeFileSync(UPLOAD_PROGRESS, JSON.stringify([...uploaded]));
        log(`Progress: ${uploaded.size}/${allFiles.length} uploaded (${errors} errors)`);
        await sleep(500);
      }
    } catch (err) {
      errors++;
      log(`[UPLOAD ERROR] ${fileName}: ${err.message?.substring(0, 100)}`);
      await sleep(2000);
    }
  }

  fs.writeFileSync(UPLOAD_PROGRESS, JSON.stringify([...uploaded]));
  log(`=== Upload complete: ${success} uploaded, ${errors} errors. Total: ${uploaded.size}/${allFiles.length} ===`);
}

run().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
