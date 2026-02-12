import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseKey)

    const testSuffixes = [1111, 2222, 3333, 4444, 5555]

    const whitelistEntries = testSuffixes.map(s => ({
        student_number_suffix: s,
        first_name: 'Test Student'
    }))
    const { error: wlError } = await supabase
        .from('student_whitelist')
        .upsert(whitelistEntries, { onConflict: 'student_number_suffix' })

    if (wlError) {
        return { success: false, step: 'whitelist', error: wlError.message }
    }

    const { error: teacherError } = await supabase
        .from('teachers')
        .upsert([
            { email: 'teacher1@test.com', password: 'teacher123' },
            { email: 'teacher2@test.com', password: 'teacher456' }
        ], { onConflict: 'email' })

    if (teacherError) {
        return { success: false, step: 'teachers', error: teacherError.message }
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const randomCode = () => {
        let code = ''
        for (let i = 0; i < 2; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        return code
    }

    const studentAccounts = [
        { student_number_suffix: 1111, name_prefix: 'TA', section_number: 1, random_code: randomCode() },
        { student_number_suffix: 2222, name_prefix: 'TB', section_number: 2, random_code: randomCode() },
        { student_number_suffix: 3333, name_prefix: 'TC', section_number: 3, random_code: randomCode() },
        { student_number_suffix: 4444, name_prefix: 'TD', section_number: 4, random_code: randomCode() },
        { student_number_suffix: 5555, name_prefix: 'TE', section_number: 5, random_code: randomCode() },
    ]

    const { data, error: stuError } = await supabase
        .from('students')
        .upsert(studentAccounts, { onConflict: 'student_number_suffix' })
        .select()

    if (stuError) {
        return { success: false, step: 'students', error: stuError.message }
    }

    const accounts = (data || []).map((s: any) => ({
        login_code: `${s.student_number_suffix}-${s.name_prefix}-${s.random_code}`,
        section: s.section_number
    }))

    return {
        success: true,
        whitelist_added: testSuffixes,
        teacher_accounts: [
            { email: 'teacher1@test.com', password: 'teacher123' },
            { email: 'teacher2@test.com', password: 'teacher456' }
        ],
        student_accounts: accounts
    }
})
