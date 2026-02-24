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
  return `=?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`;
}

async function run() {
  const gmail = await getGmailClient();

  const subject = 'Room Booking Request - OEM 906, 10 March 2026 (10am-12pm)';
  const htmlBody = `<div style="font-family: Arial, sans-serif; line-height: 1.7; color: #333; max-width: 650px;">
  <p>Dear Sandy,</p>

  <p>Hope this email finds you well. Could you please help us book the following room for a team meeting?</p>

  <table style="border-collapse: collapse; margin: 16px 0;">
    <tr>
      <td style="padding: 8px 16px; font-weight: bold; background: #f5f5f5; border: 1px solid #ddd;">Room</td>
      <td style="padding: 8px 16px; border: 1px solid #ddd;">OEM 906</td>
    </tr>
    <tr>
      <td style="padding: 8px 16px; font-weight: bold; background: #f5f5f5; border: 1px solid #ddd;">Date</td>
      <td style="padding: 8px 16px; border: 1px solid #ddd;">Monday, 10 March 2026</td>
    </tr>
    <tr>
      <td style="padding: 8px 16px; font-weight: bold; background: #f5f5f5; border: 1px solid #ddd;">Time</td>
      <td style="padding: 8px 16px; border: 1px solid #ddd;">10:00 AM - 12:00 PM</td>
    </tr>
    <tr>
      <td style="padding: 8px 16px; font-weight: bold; background: #f5f5f5; border: 1px solid #ddd;">Purpose</td>
      <td style="padding: 8px 16px; border: 1px solid #ddd;">LC Website Development Meeting</td>
    </tr>
  </table>

  <p>Thank you very much for your help!</p>

  <p>Best regards,<br>Simon</p>
</div>`;

  const headers = [
    'To: sandyleung@hkbu.edu.hk',
    'Cc: simonwang@hkbu.edu.hk',
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody
  ];
  const encoded = Buffer.from(headers.join('\n')).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
  console.log('Room booking email resent to Sandy with proper greeting');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
