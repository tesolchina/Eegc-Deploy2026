import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const url = getRequestURL(event)

    // Only protect the poe-chat endpoint
    if (url.pathname !== '/api/poe-chat') {
        return
    }

    const studentToken = getCookie(event, 'student_auth')
    const teacherToken = getCookie(event, 'teacher_auth')

    const token = teacherToken || studentToken

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: No authentication token found',
        })
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret)
        event.context.user = decoded
    } catch (error) {
        console.error('JWT Verification Error:', error)
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: Invalid or expired token',
        })
    }
})
