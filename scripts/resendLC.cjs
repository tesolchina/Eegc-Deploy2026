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

  const subject = 'Re: LC Website Development - Touchbase & Meeting (10 Mar)';
  const to = 'cchae0801@hkbu.edu.hk, rhettyu@hkbu.edu.hk, hermine_chan@hkbu.edu.hk';
  const cc = 'simonwang@hkbu.edu.hk, joshuachan@hkbu.edu.hk, yxli@hkbu.edu.hk';

  const htmlBody = `<div style="font-family: Arial, sans-serif; line-height: 1.7; color: #333; max-width: 650px;">
  <p>Dear Larry, Rhett, and Hermine,</p>

  <p>My apologies for the earlier email without a proper greeting - please kindly disregard that one.</p>

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
    <strong>Time:</strong> 10:00 AM - 12:00 PM<br>
    <strong>Venue:</strong> OEM 906 (to be confirmed)<br><br>
    A calendar invite has been sent. Please let me know if this time works for you.
  </p>

  <p>Looking forward to our discussion!</p>

  <p>Best regards,<br>Simon</p>
</div>`;

  const headers = [
    `To: ${to}`,
    `Cc: ${cc}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody
  ];
  const encoded = Buffer.from(headers.join('\n')).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
  console.log('Corrected email sent to Larry, Rhett, Hermine with apology and proper greeting');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
