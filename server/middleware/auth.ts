import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const url = getRequestURL(event)

    // List of paths that require student authentication
    const studentPaths: string[] = [] // Add other student-only paths here if any
    // List of paths that require teacher authentication
    const teacherPaths = ['/api/teacher/']
    // List of paths that allow both roles
    const sharedPaths = ['/api/poe-chat']

    const isStudentPath = studentPaths.some(path => url.pathname.startsWith(path))
    const isTeacherPath = teacherPaths.some(path => url.pathname.startsWith(path)) && !url.pathname.startsWith('/api/teacher/login')
    const isSharedPath = sharedPaths.some(path => url.pathname.startsWith(path))

    if (!isStudentPath && !isTeacherPath && !isSharedPath) {
        return
    }

    const studentToken = getCookie(event, 'student_auth')
    const teacherToken = getCookie(event, 'teacher_auth')

    let token: string | undefined
    let expectedRole: 'student' | 'teacher' | 'any' | undefined

    if (isTeacherPath) {
        token = teacherToken
        expectedRole = 'teacher'
    } else if (isStudentPath) {
        token = studentToken
        expectedRole = 'student'
    } else if (isSharedPath) {
        token = teacherToken || studentToken
        expectedRole = 'any'
    }

    if (!token) {
        const roleMsg = expectedRole === 'any' ? 'teacher or student' : expectedRole
        throw createError({
            statusCode: 401,
            statusMessage: `Unauthorized: No ${roleMsg} authentication token found`,
        })
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret) as any

        // Role check
        if (expectedRole === 'teacher' && decoded.role !== 'teacher' && decoded.role !== 'superadmin') {
            throw createError({
                statusCode: 403,
                statusMessage: `Forbidden: Teacher role required.`,
            })
        }
        if (expectedRole === 'student' && decoded.role !== 'student') {
            throw createError({
                statusCode: 403,
                statusMessage: `Forbidden: Student role required.`,
            })
        }
        if (expectedRole === 'any' && decoded.role !== 'teacher' && decoded.role !== 'student') {
            throw createError({
                statusCode: 403,
                statusMessage: `Forbidden: Invalid role ${decoded.role}.`,
            })
        }

        event.context.user = decoded
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('JWT Verification Error:', error)
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: Invalid or expired token',
        })
    }
})
