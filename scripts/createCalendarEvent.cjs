const { google } = require('googleapis');

async function getCalendarClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;
  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');
  const settings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(r => r.json()).then(d => d.items?.[0]);
  const token = settings?.settings?.access_token || settings?.settings?.oauth?.credentials?.access_token;
  if (!token) throw new Error('Google Calendar not connected');
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token });
  return google.calendar({ version: 'v3', auth });
}

async function run() {
  const calendar = await getCalendarClient();

  const event = {
    summary: 'LC Website Development Meeting',
    location: 'OEM 906',
    description: `Meeting to discuss LC website development.\n\nAgenda:\n1. Kaitai's work on SSO platform and infrastructure\n2. LCMIS review - source code and architecture\n3. New software development framework for LC with vibe coding technology\n\nAll colleagues are welcome to share ideas and feedback.`,
    start: {
      dateTime: '2026-03-10T10:00:00',
      timeZone: 'Asia/Hong_Kong',
    },
    end: {
      dateTime: '2026-03-10T12:00:00',
      timeZone: 'Asia/Hong_Kong',
    },
    attendees: [
      { email: 'cchae0801@hkbu.edu.hk' },    // Larry
      { email: 'rhettyu@hkbu.edu.hk' },       // Rhett
      { email: 'simonwang@hkbu.edu.hk' },     // Simon
      { email: 'hermine_chan@hkbu.edu.hk' },   // Hermine
      { email: 'joshuachan@hkbu.edu.hk' },     // Joshua
      { email: 'yxli@hkbu.edu.hk' },           // yxli
      { email: 'zhang_kt@hkbu.edu.hk' },       // Kaitai
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },  // 1 day before
        { method: 'popup', minutes: 30 },         // 30 min before
      ],
    },
  };

  const result = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    sendUpdates: 'all',  // Send email invites to all attendees
  });

  console.log('Calendar event created!');
  console.log('Event link:', result.data.htmlLink);
  console.log('Event ID:', result.data.id);
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
