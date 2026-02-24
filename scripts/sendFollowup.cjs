const { google } = require('googleapis');

async function getGmailClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;
  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');
  const settings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(r => r.json()).then(d => d.items?.[0]);
  const token = settings?.settings?.access_token || settings?.settings?.oauth?.credentials?.access_token;
  if (!token) throw new Error('Gmail not connected');
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  return google.gmail({ version: 'v1', auth });
}

function encodeSubject(subject) {
  if (/^[\x20-\x7E]*$/.test(subject)) return subject;
  const encoded = Buffer.from(subject, 'utf-8').toString('base64');
  return `=?UTF-8?B?${encoded}?=`;
}

async function run() {
  const gmail = await getGmailClient();

  // Email to Kaitai - follow up on Felix's source codes, invite to review doc
  const to = 'zhang_kt@hkbu.edu.hk';
  const subject = 'Re: SSO Setup, Replit Deployment & Supabase Review';

  const htmlBody = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px;">
  <p>Hi Kaitai,</p>

  <p>Following up on our earlier thread - a couple of items:</p>

  <p><strong>1. Felix's Source Code</strong><br>
  Could you share more details about Felix's project source code? We'd like to review it as the SSO platform will also be used for Felix's project (Joshua). Any links or access info would be helpful.</p>

  <p><strong>2. Review the Development Notes</strong><br>
  I've put together a shared document with our development notes, task tracking, and technical details. Could you please take a look and add any comments or corrections?<br>
  <a href="https://docs.google.com/document/d/1GgJ8XvUlufvWDnZ36oOcLGpTt9u8q6DeJ6YLI-CMfQU/edit?tab=t.0" style="color: #1a73e8;">Development Notes Document</a></p>

  <p>If you need editing access, please let me know your Gmail address and I'll add you as an editor.</p>

  <p>Also, we need to loop in Larry regarding Joshua's project - could you share Larry's email address if you have it?</p>

  <p>Thanks!<br>Simon</p>
</div>`;

  const messageParts = [
    `To: ${to}`,
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
  console.log('Follow-up email sent to Kaitai (zhang_kt@hkbu.edu.hk)');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
