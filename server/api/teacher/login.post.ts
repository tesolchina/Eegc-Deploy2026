import jwt from 'jsonwebtoken'
import { findTeacher } from '~/server/config/teacherAccounts'

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

    const teacher = findTeacher(email, password)

    if (!teacher) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid email or password',
        })
    }

    const payload = {
        role: teacher.role,
        email: teacher.email,
        name: teacher.name,
        sections: teacher.sections,
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
            email: teacher.email,
            name: teacher.name,
            role: teacher.role,
            sections: teacher.sections,
        }
    }
})
