import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    const { student_number_suffix, name_prefix, section_number } = body

    if (!student_number_suffix || !name_prefix || !section_number) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields',
        })
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseKey)

    // Check if student is in the whitelist
    const { data: whitelistEntry, error: whitelistError } = await supabase
        .from('student_whitelist')
        .select('*')
        .eq('student_number_suffix', student_number_suffix)
        .single()

    if (whitelistError || !whitelistEntry) {
        throw createError({
            statusCode: 403,
            statusMessage: 'NOT_IN_WHITELIST',
        })
    }

    // Generate a random 2-character code (letters and digits)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let random_code = ''
    for (let i = 0; i < 2; i++) {
        random_code += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    const { data, error } = await supabase
        .from('students')
        .insert([
            {
                student_number_suffix,
                name_prefix,
                section_number,
                random_code
            }
        ])
        .select()

    if (error) {
        console.error('Supabase Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    return {
        success: true,
        id: data[0].id,
        random_code: random_code
    }
})
