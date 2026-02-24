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

async function sendEmail(gmail, { to, cc, subject, htmlBody }) {
  const headers = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : null,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody
  ].filter(Boolean);

  const message = headers.join('\n');
  const encodedMessage = Buffer.from(message).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage }
  });
}

async function run() {
  const gmail = await getGmailClient();

  // Email 1: LC Website Dev touchbase
  const lcSubject = 'LC Website Development - Touchbase & Meeting (10 Mar)';
  const lcTo = 'cchae0801@hkbu.edu.hk, rhettyu@hkbu.edu.hk, hermine_chan@hkbu.edu.hk';
  const lcCc = 'simonwang@hkbu.edu.hk, joshuachan@hkbu.edu.hk, yxli@hkbu.edu.hk';

  const lcHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.7; color: #333; max-width: 650px;">
  <p>Hi Larry, Rhett, and Hermine,</p>

  <p>I'd like to touch base with everyone on the LC website development work. Here are the key items I'd like to discuss:</p>

  <ol style="padding-left: 20px;">
    <li><strong>Kaitai's Work</strong><br>
    Kaitai has been working on the SSO (Single Sign-On) platform and related infrastructure. This includes setting up federated SSO login for HKBU, handling the security assessment process (v-scan), and managing the Supabase database setup. His work will form the foundation for authentication across our LC projects.</li>

    <li><strong>LCMIS Reference</strong><br>
    We should review the existing LCMIS system as a reference point. I've asked Kaitai to share the link to the LCMIS source code so we can all take a look at the current architecture and identify what can be reused or improved.</li>

    <li><strong>New Software Development Framework</strong><br>
    We need to develop a new framework for software development in LC that incorporates vibe coding technology. This is an opportunity to modernize our development workflow and make it more efficient. I'd like to discuss our approach and how we can best adopt this for our projects.</li>
  </ol>

  <p style="background: #f0f7ff; padding: 14px 18px; border-left: 4px solid #1a73e8; border-radius: 4px;">
    <strong>Proposed Meeting:</strong><br>
    <strong>Date:</strong> Monday, 10 March 2026<br>
    <strong>Time:</strong> 10:00 AM<br>
    <strong>Venue:</strong> OEM 906 (to be confirmed)<br><br>
    Please let me know if this time works for you. A calendar invite will follow shortly.
  </p>

  <p>Looking forward to our discussion!</p>

  <p>Best regards,<br>Simon</p>
</div>`;

  await sendEmail(gmail, { to: lcTo, cc: lcCc, subject: lcSubject, htmlBody: lcHtml });
  console.log('Email 1 sent: LC Website Dev touchbase to Larry, Rhett, Hermine (cc: Simon, Joshua, yxli)');

  // Email 2: Room booking request to Sandy
  const roomSubject = 'Room Booking Request - OEM 906, 10 March 2026 (10am-12pm)';
  const roomTo = 'sandyleung@hkbu.edu.hk';
  const roomCc = 'simonwang@hkbu.edu.hk';

  const roomHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.7; color: #333; max-width: 650px;">
  <p>Hi Sandy,</p>

  <p>Could you please help us book the following room?</p>

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

  await sendEmail(gmail, { to: roomTo, cc: roomCc, subject: roomSubject, htmlBody: roomHtml });
  console.log('Email 2 sent: Room booking to Sandy (cc: Simon)');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
