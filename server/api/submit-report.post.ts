import { getPool } from '../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const pool = getPool()

    try {
        await pool.query(
            `INSERT INTO learning_reports (student_number_suffix, student_name_prefix, section_number, rating, comment, mode, chat_history, contribution_analysis, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                body.student_number,
                body.student_email,
                body.section_number ? parseInt(body.section_number) : null,
                body.rating,
                body.comment,
                body.mode,
                JSON.stringify(body.chat_history),
                JSON.stringify({ content: body.contribution_analysis }),
                JSON.stringify({
                    hidden_report: body.hidden_report,
                    report_info: body.report_info,
                }),
            ]
        )

        return { success: true }
    } catch (error: any) {
        console.error('DB Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }
})
