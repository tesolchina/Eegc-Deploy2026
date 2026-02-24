const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'reports');
const UPLOAD_PROGRESS = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'upload_progress.json');
const LOG_FILE = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'process.log');
const DRIVE_FOLDER_ID = '1o3IfgifM8y8gThGRQfjXyCxShEHfqOAs';
const BATCH = 10;

function log(msg) {
  fs.appendFileSync(LOG_FILE, new Date().toISOString() + ' - ' + msg + '\n');
}

async function run() {
  const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'google_tokens.json'), 'utf8'));
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials(tokens);
  const drive = google.drive({ version: 'v3', auth });

  const allFiles = fs.readdirSync(REPORTS_DIR).sort();
  let uploaded = [];
  try { uploaded = JSON.parse(fs.readFileSync(UPLOAD_PROGRESS, 'utf8')); } catch {}
  const uploadedSet = new Set(uploaded);
  const remaining = allFiles.filter(f => !uploadedSet.has(f));

  if (remaining.length === 0) {
    console.log(`DONE:${allFiles.length}`);
    return;
  }

  const batch = remaining.slice(0, BATCH);
  let ok = 0;
  for (const f of batch) {
    const mime = f.endsWith('.pdf') ? 'application/pdf' : 'text/markdown';
    await drive.files.create({
      requestBody: { name: f, parents: [DRIVE_FOLDER_ID] },
      media: { mimeType: mime, body: fs.createReadStream(path.join(REPORTS_DIR, f)) },
      fields: 'id',
    });
    uploaded.push(f);
    ok++;
  }
  fs.writeFileSync(UPLOAD_PROGRESS, JSON.stringify(uploaded));
  const total = uploaded.length;
  log(`[UPLOAD] ${total}/${allFiles.length} done (+${ok})`);
  console.log(`OK:${total}/${allFiles.length}`);
}

run().catch(e => {
  log(`[UPLOAD ERR] ${e.message}`);
  console.log(`ERR:${e.message}`);
  process.exit(1);
});
