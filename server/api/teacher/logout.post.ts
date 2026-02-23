export default defineEventHandler(async (event) => {
    deleteCookie(event, 'teacher_auth')
    return { success: true }
})
