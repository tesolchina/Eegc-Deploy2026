import { getPool } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const { student_number_suffix, name_prefix, section_number } = body

    if (!student_number_suffix || !name_prefix || !section_number) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields',
        })
    }

    const pool = getPool()

    const whitelistResult = await pool.query(
        'SELECT * FROM student_whitelist WHERE student_number_suffix = $1',
        [student_number_suffix]
    )

    if (whitelistResult.rows.length === 0) {
        throw createError({
            statusCode: 403,
            statusMessage: 'NOT_IN_WHITELIST',
        })
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let random_code = ''
    for (let i = 0; i < 2; i++) {
        random_code += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    try {
        const result = await pool.query(
            'INSERT INTO students (student_number_suffix, name_prefix, section_number, random_code) VALUES ($1, $2, $3, $4) RETURNING id',
            [student_number_suffix, name_prefix, section_number, random_code]
        )

        return {
            success: true,
            id: result.rows[0].id,
            random_code: random_code
        }
    } catch (error: any) {
        console.error('DB Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }
})
