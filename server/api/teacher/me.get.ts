export default defineEventHandler(async (event) => {
    const user = event.context.user

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        })
    }

    return {
        success: true,
        teacher: {
            email: user.email,
            name: user.name || user.email,
            role: user.role,
            sections: user.sections || [1, 2, 3],
        }
    }
})
