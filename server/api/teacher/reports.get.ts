import { getPool } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const pool = getPool()

    try {
        const result = await pool.query(
            'SELECT * FROM learning_reports ORDER BY created_at DESC'
        )

        return {
            success: true,
            reports: result.rows
        }
    } catch (error: any) {
        console.error('DB Error fetching reports:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }
})
