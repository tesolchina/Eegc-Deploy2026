const { google } = require('googleapis');

const DOC_ID = process.argv[2] || '1GgJ8XvUlufvWDnZ36oOcLGpTt9u8q6DeJ6YLI-CMfQU';

async function getDocsClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;
  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');
  const settings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-docs',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(r => r.json()).then(d => d.items?.[0]);
  const token = settings?.settings?.access_token || settings?.settings?.oauth?.credentials?.access_token;
  if (!token) throw new Error('Google Docs not connected');
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  return google.docs({ version: 'v1', auth });
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
        const cells = [];
        for (const cell of row.tableCells || []) {
          cells.push(extractText(cell).trim());
        }
        text += '| ' + cells.join(' | ') + ' |\n';
      }
      text += '\n';
    } else if (el.sectionBreak) {
      text += '\n--- PAGE BREAK ---\n';
    }
  }
  return text;
}

async function run() {
  const docs = await getDocsClient();
  const doc = await docs.documents.get({ documentId: DOC_ID, includeTabsContent: true });

  const tabs = doc.data.tabs || [];
  for (const tab of tabs) {
    const title = tab.tabProperties?.title || '(untitled)';
    const tabId = tab.tabProperties?.tabId || '';
    console.log(`\n=== TAB: "${title}" (ID: ${tabId}) ===\n`);
    if (tab.documentTab?.body) {
      console.log(extractText(tab.documentTab.body));
    }
    for (const child of tab.childTabs || []) {
      const childTitle = child.tabProperties?.title || '(untitled)';
      const childId = child.tabProperties?.tabId || '';
      console.log(`\n=== CHILD TAB: "${childTitle}" (ID: ${childId}) ===\n`);
      if (child.documentTab?.body) {
        console.log(extractText(child.documentTab.body));
      }
    }
  }
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
