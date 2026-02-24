const { google } = require('googleapis');

const DOC_ID = '1fBtcTfS8IbblScevX-VekB3ser1euxHwmqF-wRHFYg4';
const BRIEFING_TAB_ID = 't.xrt2iibf9abm';

let docsConnectionSettings = null;
let gmailConnectionSettings = null;

async function getConnectorToken(connectorName) {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;
  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');
  const settings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=' + connectorName,
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(r => r.json()).then(d => d.items?.[0]);
  return settings?.settings?.access_token || settings?.settings?.oauth?.credentials?.access_token;
}

async function getDocsClient() {
  const token = await getConnectorToken('google-docs');
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  return google.docs({ version: 'v1', auth });
}

async function getGmailClient() {
  const token = await getConnectorToken('google-mail');
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  return google.gmail({ version: 'v1', auth });
}

async function reformatDoc() {
  const docs = await getDocsClient();
  const doc = await docs.documents.get({ documentId: DOC_ID, includeTabsContent: true });

  const tabs = doc.data.tabs || [];
  let briefingTab = null;
  for (const tab of tabs) {
    if (tab.tabProperties?.tabId === BRIEFING_TAB_ID) {
      briefingTab = tab;
      break;
    }
    for (const child of tab.childTabs || []) {
      if (child.tabProperties?.tabId === BRIEFING_TAB_ID) {
        briefingTab = child;
        break;
      }
    }
  }

  if (!briefingTab) throw new Error('Briefing tab not found');

  const body = briefingTab.documentTab?.body;
  const endIndex = body.content[body.content.length - 1].endIndex;

  // Delete all content except the first newline
  const requests = [];
  if (endIndex > 2) {
    requests.push({
      deleteContentRange: {
        range: { startIndex: 1, endIndex: endIndex - 1, tabId: BRIEFING_TAB_ID }
      }
    });
  }

  // Insert new formatted content
  const newContent = `EEGC AI Edit Module — Teacher Briefing
Meeting Date: 25 February 2026

1. Module Overview

The EEGC AI Edit module is a web-based English writing assistant that helps students revise essays through structured AI-guided feedback. It supports two main operational modes:

Training Mode — Students practice with a sample essay, guided through a 3-step revision process (thesis statement → topic sentence → paragraph revision). The AI provides feedback but never rewrites for the student.

Assessment Mode — Students work on their own essays. Before revision, the AI conducts a diagnostic evaluation and negotiates learning targets with the student. The same 3-step revision process follows, with feedback aligned to the student's chosen priorities.

The module is live at: https://eegc.hkbu.me/aiedit
The domain eegc.hkbu.me is reserved for future development into a full course portal (to be discussed).


2. Teacher & Admin Accounts

Teacher accounts have been set up and credentials emailed:

Teacher Accounts (section-specific access):
  • Ms Fung Maria Mo Kit (mariafunghk@hkbu.edu.hk) — Section 1
  • Ms Leung Hiu Mann Connie (lhmconi@hkbu.edu.hk) — Sections 2 & 3

Admin Accounts (full access to all sections):
  • Emma (zhxemma@hkbu.edu.hk)
  • Kaitai (zhang_kt@hkbu.edu.hk)
  • Simon Wang (simonwang@hkbu.edu.hk)
  • 22256342 (22256342@life.hkbu.edu.hk)

Teacher Login: https://eegc.hkbu.me/teacher
After login, teachers/admins can view their students' learning reports and records.


3. Student Registration & Login

Students register with their last 4 digits of student ID.
Note: The system currently does not validate these digits against the class roster — if students enter incorrect digits, they can still register.

After registration, students receive a unique login ID. They must remember this ID for future logins. If forgotten, teachers can retrieve it from the dashboard, but this creates extra work — please remind students to save their ID.


4. AI Prompts & Rubric

All AI system prompts are defined in one file:
  app/composables/eegc/promptAndEssay.js

The prompts control how the AI guides students through the revision process. See the "prompts" tab in this document for the full text of each prompt and its codebase location.

Assessment rubric used for grading:
  Part 1: Point-of-view Essay (10%) — Content, Organization, Vocabulary, Grammar (each 1-5)
  Part 2: AI-Assisted Review Skills (10%) — Conversation Depth, Critical Review, Refining Process (each 1-5)


5. Areas for Discussion

  a) Background information — Should we add more context/instructions on the module landing page for students?
  b) Course portal — Future plans for eegc.hkbu.me as a full course website
  c) UI improvements — For example, allowing students to resize the chat vs. revision panes
  d) Prompt modifications — Any changes needed to the AI prompts or rubric for this semester?
  e) Student data from Semester 1 — 734 report emails have been downloaded (1162 PDF + Markdown files) and are being uploaded to Google Drive
  f) Registration validation — Should we enforce student ID checking against the roster?


6. Technical Notes

  • The codebase is built with Nuxt 4 (Vue 3) and hosted on Replit
  • AI is powered by Poe API (GPT-5.2 / Gemini 3 Flash models)
  • Student data is stored in an external Supabase database
  • Teacher accounts are hardcoded in the codebase (not in the database) — changes require redeployment
  • Reports are automatically emailed to teachers when students complete sessions

`;

  requests.push({
    insertText: {
      location: { index: 1, tabId: BRIEFING_TAB_ID },
      text: newContent
    }
  });

  // Apply formatting after insertion
  const titleEnd = 1 + 'EEGC AI Edit Module — Teacher Briefing\n'.length;
  const dateEnd = titleEnd + 'Meeting Date: 25 February 2026\n'.length;

  // Title formatting - bold and larger
  requests.push({
    updateTextStyle: {
      range: { startIndex: 1, endIndex: titleEnd - 1, tabId: BRIEFING_TAB_ID },
      textStyle: { bold: true, fontSize: { magnitude: 18, unit: 'PT' } },
      fields: 'bold,fontSize'
    }
  });

  // Date formatting - italic
  requests.push({
    updateTextStyle: {
      range: { startIndex: titleEnd, endIndex: dateEnd - 1, tabId: BRIEFING_TAB_ID },
      textStyle: { italic: true, fontSize: { magnitude: 11, unit: 'PT' } },
      fields: 'italic,fontSize'
    }
  });

  // Find and format section headers (lines starting with number + period)
  const lines = newContent.split('\n');
  let offset = 1;
  for (const line of lines) {
    if (/^\d+\.\s/.test(line)) {
      requests.push({
        updateTextStyle: {
          range: { startIndex: offset, endIndex: offset + line.length, tabId: BRIEFING_TAB_ID },
          textStyle: { bold: true, fontSize: { magnitude: 14, unit: 'PT' } },
          fields: 'bold,fontSize'
        }
      });
    }
    offset += line.length + 1; // +1 for newline
  }

  await docs.documents.batchUpdate({
    documentId: DOC_ID,
    requestBody: { requests }
  });

  console.log('Doc reformatted successfully!');
}

// IMPORTANT: Email subject lines only support ASCII in raw MIME headers.
// Non-ASCII characters (em dash —, curly quotes, accented letters, etc.)
// will appear garbled. Either:
//   1. Use only plain ASCII in subjects (replace — with -, etc.)
//   2. Or encode with RFC 2047: =?UTF-8?B?<base64>?=
function encodeSubject(subject) {
  if (/^[\x20-\x7E]*$/.test(subject)) return subject;
  const encoded = Buffer.from(subject, 'utf-8').toString('base64');
  return `=?UTF-8?B?${encoded}?=`;
}

async function sendEmails() {
  const gmail = await getGmailClient();

  const recipients = [
    { email: 'zhxemma@hkbu.edu.hk', name: 'Emma' },
    { email: 'mariafunghk@hkbu.edu.hk', name: 'Maria' },
    { email: 'lhmconi@hkbu.edu.hk', name: 'Connie' },
    { email: 'zhang_kt@hkbu.edu.hk', name: 'Kaitai' },
  ];

  // NOTE: Email subjects with non-ASCII characters (em dash, curly quotes, etc.)
  // must be RFC 2047 encoded. Use encodeSubject() helper below.
  const subject = 'EEGC AI Edit Module - Meeting Tomorrow (25 Feb)';

  const htmlBody = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px;">
  <p>Hi everyone,</p>

  <p>This is a reminder about our meeting <strong>tomorrow (25 February)</strong> to discuss the EEGC AI Edit module for this semester.</p>

  <p>Here's a brief outline of what we plan to cover:</p>

  <ol style="padding-left: 20px;">
    <li><strong>Module Overview & Demo</strong> — A walkthrough of the AI Edit module at <a href="https://eegc.hkbu.me/aiedit">eegc.hkbu.me/aiedit</a>, including Training and Assessment modes</li>
    <li><strong>Teacher & Admin Accounts</strong> — Login access, the teacher dashboard, and how to view student records</li>
    <li><strong>Student Registration</strong> — How students sign up, the unique login ID system, and important reminders</li>
    <li><strong>AI Prompts & Rubric</strong> — Review the current prompts that guide the AI, and the assessment rubric — discuss any modifications needed</li>
    <li><strong>UI Improvements</strong> — Potential enhancements such as resizable chat/revision panes</li>
    <li><strong>Semester 1 Data</strong> — Student report data from last semester (734 reports downloaded and being uploaded to Google Drive)</li>
    <li><strong>Future Plans</strong> — Developing eegc.hkbu.me into a full course portal</li>
  </ol>

  <p>I've prepared a briefing document with more details and the full AI prompts for your reference:<br>
  <a href="https://docs.google.com/document/d/1fBtcTfS8IbblScevX-VekB3ser1euxHwmqF-wRHFYg4/edit?tab=t.xrt2iibf9abm" style="color: #1a73e8;">📄 EEGC Teacher Briefing Document</a></p>

  <p style="background: #f0f4ff; padding: 12px 16px; border-left: 4px solid #1a73e8; border-radius: 4px;">
    <strong>One request:</strong> Could you please reply with your <strong>personal Gmail address</strong>? I'd like to add you as commenters on the document so you can leave feedback and suggestions directly.
  </p>

  <p>Looking forward to our discussion tomorrow!</p>

  <p>Best regards,<br>Simon</p>
</div>`;

  for (const r of recipients) {
    try {
      const messageParts = [
        `To: ${r.email}`,
        `Subject: ${encodeSubject(subject)}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        htmlBody
      ];
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage }
      });
      console.log(`Email sent to ${r.name} (${r.email})`);
    } catch (err) {
      console.error(`Failed to send to ${r.name}: ${err.message}`);
    }
  }
}

async function main() {
  const action = process.argv[2] || 'all';
  if (action === 'reformat' || action === 'all') {
    await reformatDoc();
  }
  if (action === 'email' || action === 'all') {
    await sendEmails();
  }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
