import { google } from 'googleapis'

export default defineEventHandler(async (event) => {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = getRequestURL(event).origin + '/api/google-auth/callback'

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
    ]

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
    })

    return sendRedirect(event, url)
})
