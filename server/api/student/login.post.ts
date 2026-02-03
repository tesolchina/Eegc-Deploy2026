import { createClient } from '@supabase/supabase-js'
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

    // Expected format: SSSS-NN-RR (Suffix-NamePrefix-RandomCode)
    // Example: 1234-JD-A1
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

    const supabase = createClient(config.supabaseUrl, config.supabaseKey)

    // Search for the student in database
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('student_number_suffix', student_number_suffix)
        .eq('name_prefix', namePrefix.toUpperCase())
        .eq('random_code', randomCode.toUpperCase())
        .single()

    if (error || !data) {
        console.error('Login error:', error)
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid ID or student not found',
        })
    }

    // Create JWT Token
    const payload = {
        role: 'student',
        student_number_suffix: data.student_number_suffix,
        name_prefix: data.name_prefix,
        section_number: data.section_number,
        id: data.id
    }

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })

    // Set cookie
    setCookie(event, 'student_auth', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 // 24 hours
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
