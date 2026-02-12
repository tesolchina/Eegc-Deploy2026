import { getPool } from '../../utils/db'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

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

    const pool = getPool()

    try {
        await pool.query(
            `INSERT INTO learning_reports (student_number_suffix, student_name_prefix, section_number, rating, comment, mode, chat_history, contribution_analysis, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                student_number_suffix,
                name_prefix,
                section_number ? parseInt(section_number) : null,
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
