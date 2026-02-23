import { sendEmail } from '../../utils/gmail'
import { TEACHER_ACCOUNTS } from '../../config/teacherAccounts'

export default defineEventHandler(async (event) => {
    const loginUrl = 'https://eegc.hkbu.me/teacher'
    const newEmails = ['zhang_kt@hkbu.edu.hk', '22256342@life.hkbu.edu.hk']
    const newAccounts = TEACHER_ACCOUNTS.filter(t => newEmails.includes(t.email))
    const results: { email: string; status: string; error?: string }[] = []

    for (const teacher of newAccounts) {
        const roleName = 'Super Admin'
        const sectionText = 'All Sections (1, 2, 3)'

        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; }
    .credential-box { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
    .value { font-size: 16px; color: #1e293b; font-weight: bold; margin-top: 4px; }
    .btn { display: inline-block; background: #4f46e5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 24px;">EEGC Teacher Portal</h1>
      <p style="margin:4px 0 0; opacity:0.9;">Enhancing English through Global Citizenship (LANG 0036)</p>
    </div>
    <div class="content">
      <p>Dear <strong>${teacher.name}</strong>,</p>
      <p>Your ${roleName} account for the EEGC Teacher Portal has been created. Below are your login credentials:</p>
      
      <div class="credential-box">
        <div style="margin-bottom: 12px;">
          <div class="label">Email</div>
          <div class="value">${teacher.email}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div class="label">Password</div>
          <div class="value">${teacher.password}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div class="label">Role</div>
          <div class="value">${roleName}</div>
        </div>
        <div>
          <div class="label">Assigned Sections</div>
          <div class="value">${sectionText}</div>
        </div>
      </div>

      <p><strong>Your account will be ready for use by tomorrow.</strong></p>

      <p>To log in, please visit the link below:</p>
      <p style="text-align: center;">
        <a href="${loginUrl}" class="btn" style="color: white;">Login to Teacher Portal</a>
      </p>
      <p style="text-align: center; font-size: 13px; color: #64748b; margin-top: 8px;">
        Or copy this link: <a href="${loginUrl}">${loginUrl}</a>
      </p>

      <p style="margin-top: 24px;">If you have any questions, please contact Simon Wang.</p>
      <p>Best regards,<br><strong>EEGC Team</strong></p>
    </div>
    <div class="footer">
      <p>HKBU - Enhancing English through Global Citizenship (LANG 0036)</p>
    </div>
  </div>
</body>
</html>`

        try {
            await sendEmail(
                teacher.email,
                'EEGC Teacher Portal - Your Login Credentials',
                htmlBody
            )
            results.push({ email: teacher.email, status: 'sent' })
            console.log(`Email sent successfully to ${teacher.email}`)
        } catch (error: any) {
            console.error(`Failed to send email to ${teacher.email}:`, error)
            results.push({ email: teacher.email, status: 'failed', error: error.message })
        }
    }

    return {
        success: true,
        results
    }
})
