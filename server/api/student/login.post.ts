import { getPool } from '../../utils/db'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    const { uniqueId } = body

    if (!uniqueId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Unique ID is required',
        })
    }

    const parts = uniqueId.split('-')
    if (parts.length !== 3) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID format. Expected format: Suffix-NamePrefix-RandomCode (e.g., 1234-JD-A1)',
        })
    }

    const [suffixStr, namePrefix, randomCode] = parts
    const student_number_suffix = parseInt(suffixStr)

    if (isNaN(student_number_suffix)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid student number suffix in ID',
        })
    }

    const pool = getPool()

    const result = await pool.query(
        'SELECT * FROM students WHERE student_number_suffix = $1 AND name_prefix = $2 AND random_code = $3',
        [student_number_suffix, namePrefix.toUpperCase(), randomCode.toUpperCase()]
    )

    if (result.rows.length === 0) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid ID or student not found',
        })
    }

    const data = result.rows[0]

    const payload = {
        role: 'student',
        student_number_suffix: data.student_number_suffix,
        name_prefix: data.name_prefix,
        section_number: data.section_number,
        id: data.id
    }

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })

    setCookie(event, 'student_auth', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7
    })

    return {
        success: true,
        student: {
            student_number_suffix: data.student_number_suffix,
            name_prefix: data.name_prefix,
            section_number: data.section_number
        }
    }
})
