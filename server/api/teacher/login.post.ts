import { getPool } from '../../utils/db'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    const { email, password } = body

    if (!email || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email and password are required',
        })
    }

    const pool = getPool()

    const result = await pool.query(
        'SELECT * FROM teachers WHERE email = $1 AND password = $2',
        [email, password]
    )

    if (result.rows.length === 0) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid email or password',
        })
    }

    const data = result.rows[0]

    if (!data.is_active) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Your account is inactive. Please contact the administrator.',
        })
    }

    const payload = {
        role: 'teacher',
        email: data.email,
        id: data.id
    }

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })

    setCookie(event, 'teacher_auth', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7
    })

    return {
        success: true,
        teacher: {
            email: data.email,
            id: data.id
        }
    }
})
