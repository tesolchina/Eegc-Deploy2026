import { google } from 'googleapis'
import { writeFileSync } from 'fs'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const code = query.code as string

    if (!code) {
        return { error: 'No authorization code received' }
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = getRequestURL(event).origin + '/api/google-auth/callback'

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

    try {
        const { tokens } = await oauth2Client.getToken(code)

        writeFileSync('/home/runner/workspace/google_tokens.json', JSON.stringify(tokens, null, 2))

        return `
        <html>
        <body style="font-family: Arial; max-width: 600px; margin: 40px auto; padding: 20px;">
            <h1 style="color: #4f46e5;">Google Authorization Successful</h1>
            <p>Tokens have been saved. You can close this window now.</p>
            <p style="color: #64748b; font-size: 14px;">Refresh token: ${tokens.refresh_token ? 'Received' : 'Not received (may already exist)'}</p>
        </body>
        </html>
        `
    } catch (error: any) {
        return { error: 'Failed to exchange code for tokens', details: error.message }
    }
})
