const { google } = require('googleapis');

const DOC_ID = '1fBtcTfS8IbblScevX-VekB3ser1euxHwmqF-wRHFYg4';

let docsConnectionSettings = null;
let gmailConnectionSettings = null;

async function getDocsAccessToken() {
  if (docsConnectionSettings && docsConnectionSettings.settings.expires_at && new Date(docsConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return docsConnectionSettings.settings.access_token;
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;
  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');
  docsConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-docs',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(r => r.json()).then(d => d.items?.[0]);
  return docsConnectionSettings?.settings?.access_token || docsConnectionSettings?.settings?.oauth?.credentials?.access_token;
}

async function getGmailAccessToken() {
  if (gmailConnectionSettings && gmailConnectionSettings.settings.expires_at && new Date(gmailConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return gmailConnectionSettings.settings.access_token;
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;
  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');
  gmailConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(r => r.json()).then(d => d.items?.[0]);
  return gmailConnectionSettings?.settings?.access_token || gmailConnectionSettings?.settings?.oauth?.credentials?.access_token;
}

function extractText(body) {
  let text = '';
  for (const el of body.content || []) {
    if (el.paragraph) {
      for (const elem of el.paragraph.elements || []) {
        if (elem.textRun) text += elem.textRun.content;
      }
    } else if (el.table) {
      for (const row of el.table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          text += extractText(cell) + '\t';
        }
        text += '\n';
      }
    } else if (el.sectionBreak) {
      text += '\n';
    }
  }
  return text;
}

async function run() {
  const mode = process.argv[2]; // 'read', 'email', or 'reformat'

  const docsToken = await getDocsAccessToken();
  const docsAuth = new google.auth.OAuth2();
  docsAuth.setCredentials({ access_token: docsToken });
  const docs = google.docs({ version: 'v1', auth: docsAuth });

  const doc = await docs.documents.get({ documentId: DOC_ID, includeTabsContent: true });

  if (mode === 'read') {
    // Print all tab names and content
    const tabs = doc.data.tabs || [];
    for (const tab of tabs) {
      const title = tab.tabProperties?.title || '(untitled)';
      const tabId = tab.tabProperties?.tabId || '';
      console.log(`\n=== TAB: "${title}" (ID: ${tabId}) ===`);
      if (tab.documentTab?.body) {
        console.log(extractText(tab.documentTab.body));
      }
      // Check child tabs
      for (const child of tab.childTabs || []) {
        const childTitle = child.tabProperties?.title || '(untitled)';
        const childId = child.tabProperties?.tabId || '';
        console.log(`\n  === CHILD TAB: "${childTitle}" (ID: ${childId}) ===`);
        if (child.documentTab?.body) {
          console.log(extractText(child.documentTab.body));
        }
      }
    }
  }
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
