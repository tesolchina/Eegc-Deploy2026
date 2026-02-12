import { createClient } from '@supabase/supabase-js'
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

    const supabase = createClient(config.supabaseUrl, config.supabaseKey)

    // Search for the teacher in database
    const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .eq('password', password) // Plain text password as per requirement
        .single()

    if (error || !data) {
        console.error('Teacher login error:', error)
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid email or password',
        })
    }

    // Check if teacher is active
    if (!data.is_active) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Your account is inactive. Please contact the administrator.',
        })
    }

    // Create JWT Token
    const payload = {
        role: 'teacher',
        email: data.email,
        id: data.id
    }

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })

    // Set cookie
    setCookie(event, 'teacher_auth', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return {
        success: true,
        teacher: {
            email: data.email,
            id: data.id
        }
    }
})
