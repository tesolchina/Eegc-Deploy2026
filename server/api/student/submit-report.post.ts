import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  // Extract student info from JWT
  const token = getCookie(event, 'student_auth')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Student login required',
    })
  }

  let decoded: any
  try {
    decoded = jwt.verify(token, config.jwtSecret)
  } catch (err) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }

  const { student_number_suffix, name_prefix, section_number } = decoded

  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  const { error } = await supabase
    .from('learning_reports')
    .insert([
      {
        student_number_suffix: student_number_suffix,
        student_name_prefix: name_prefix,
        section_number: section_number ? parseInt(section_number) : null,
        rating: body.rating,
        comment: body.comment,
        mode: body.mode,
        chat_history: body.chat_history,
        contribution_analysis: { content: body.contribution_analysis },
        metadata: {
          hidden_report: body.hidden_report,
          report_info: body.report_info,
        },
      }
    ])

  if (error) {
    console.error('Supabase Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return { success: true }
})
