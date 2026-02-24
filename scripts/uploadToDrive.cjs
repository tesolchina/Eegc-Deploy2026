const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const stream = require('stream');

const LOG_FILE = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'process.log');
const REPORTS_DIR = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'reports');
const UPLOAD_PROGRESS = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'upload_progress.json');
const DRIVE_FOLDER_ID = '1o3IfgifM8y8gThGRQfjXyCxShEHfqOAs';
const BATCH_SIZE = 30;

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

async function run() {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const allFiles = fs.readdirSync(REPORTS_DIR).sort();
  let uploaded = new Set();
  if (fs.existsSync(UPLOAD_PROGRESS)) {
    uploaded = new Set(JSON.parse(fs.readFileSync(UPLOAD_PROGRESS, 'utf8')));
  }

  const remaining = allFiles.filter(f => !uploaded.has(f));

  if (remaining.length === 0) {
    log(`All ${allFiles.length} files already uploaded to Drive!`);
    return;
  }

  const batch = remaining.slice(0, BATCH_SIZE);
  log(`=== Upload batch: ${batch.length} files (${uploaded.size}/${allFiles.length} done) ===`);

  let success = 0, errors = 0;
  for (const fileName of batch) {
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
    } catch (err) {
      errors++;
      log(`[UPLOAD ERROR] ${fileName}: ${err.message?.substring(0, 100)}`);
    }
  }

  fs.writeFileSync(UPLOAD_PROGRESS, JSON.stringify([...uploaded]));
  log(`Batch uploaded: ${success} ok, ${errors} errors. Total: ${uploaded.size}/${allFiles.length}`);
}

run().catch(e => { log(`FATAL: ${e.message}`); process.exit(1); });
