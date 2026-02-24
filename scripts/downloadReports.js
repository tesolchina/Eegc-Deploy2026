const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'process.log');
const REPORTS_DIR = path.join(__dirname, '..', 'docs', 'Data_feedback_Sem12526', 'reports');
const DRIVE_FOLDER_ID = '1o3IfgifM8y8gThGRQfjXyCxShEHfqOAs';

function log(msg) {
  const line = new Date().toISOString() + ' - ' + msg;
  fs.appendFileSync(LOG_FILE, line + '\n');
  console.log(line);
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
    if (p.mimeType === 'multipart/alternative' && p.parts) {
      return getTextFromParts(p.parts);
    }
    if (p.parts) {
      const result = getTextFromParts(p.parts);
      if (result) return result;
    }
  }
  return '';
}

async function downloadAllReports() {
  const auth = getAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  log('=== Starting report download process ===');
  log('Searching for all emails from no-reply@hkbuchatbot.smartutor.me...');

  let allMessages = [];
  let pageToken = undefined;
  do {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'from:no-reply@hkbuchatbot.smartutor.me',
      maxResults: 100,
      pageToken: pageToken
    });
    if (res.data.messages) allMessages = allMessages.concat(res.data.messages);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  log(`Found ${allMessages.length} emails total`);

  const teacherEmails = [];
  const studentEmails = [];
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < allMessages.length; i++) {
    try {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: allMessages[i].id,
        format: 'full'
      });

      const headers = msg.data.payload.headers;
      const to = headers.find(h => h.name === 'To')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      const textContent = getTextFromParts(msg.data.payload.parts);
      const info = extractStudentInfo(textContent);

      const isTeacherVersion = to.includes('hkbu.edu.hk') && !to.includes('@life.hkbu.edu.hk') && !to.includes('simonwanghkteacher');
      const isStudentVersion = to.includes('@life.hkbu.edu.hk') || to.includes('@gmail.com');

      const recipients = to.split(',').map(e => e.trim());
      const hasTeacher = recipients.some(r => r.includes('hkbu.edu.hk') && !r.includes('@life.hkbu.edu.hk') && !r.includes('simonwanghkteacher'));

      const safeStudentNum = info.studentNumber.replace(/[^a-zA-Z0-9]/g, '_');
      const safeDate = info.generatedDate.replace(/[^0-9-]/g, '_').substring(0, 10);
      const safeSection = info.section.replace(/[^a-zA-Z0-9]/g, '_');

      const parts = msg.data.payload.parts || [];
      for (const part of parts) {
        if (part.filename && part.body?.attachmentId) {
          const attachment = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: allMessages[i].id,
            id: part.body.attachmentId
          });

          const fileData = Buffer.from(attachment.data.data, 'base64url');
          const ext = part.filename.endsWith('.pdf') ? 'pdf' : 'md';
          const fileName = `${safeStudentNum}_sec${safeSection}_${safeDate}.${ext}`;

          const localPath = path.join(REPORTS_DIR, fileName);
          fs.writeFileSync(localPath, fileData);

          try {
            const driveFile = await drive.files.create({
              requestBody: {
                name: fileName,
                parents: [DRIVE_FOLDER_ID],
              },
              media: {
                mimeType: ext === 'pdf' ? 'application/pdf' : 'text/markdown',
                body: require('stream').Readable.from(fileData),
              },
              fields: 'id,name',
            });
            log(`[${i + 1}/${allMessages.length}] Uploaded: ${fileName} → Drive (${driveFile.data.id})`);
          } catch (driveErr) {
            log(`[${i + 1}/${allMessages.length}] Saved locally: ${fileName} (Drive upload failed: ${driveErr.message})`);
          }
        }
      }

      processed++;
      if (processed % 50 === 0) {
        log(`Progress: ${processed}/${allMessages.length} emails processed`);
      }
    } catch (err) {
      errors++;
      log(`[ERROR] Message ${i + 1}: ${err.message}`);
    }
  }

  log(`=== Download complete ===`);
  log(`Total processed: ${processed}, Errors: ${errors}`);
  log(`Reports saved locally to: ${REPORTS_DIR}`);
  log(`Reports uploaded to Google Drive folder: ${DRIVE_FOLDER_ID}`);
}

downloadAllReports().catch(e => {
  log(`FATAL ERROR: ${e.message}`);
  console.error(e);
});
