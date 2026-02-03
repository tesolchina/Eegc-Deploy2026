import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const supabase = createClient(config.supabaseUrl, config.supabaseKey)

  const { error } = await supabase
    .from('learning_reports')
    .insert([
      {
        student_number: body.student_number,
        student_email: body.student_email,
        section_number: body.section_number ? parseInt(body.section_number) : null,
        rating: body.rating,
        comment: body.comment,
        mode: body.mode,
        teacher_name: body.teacher_name,
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
