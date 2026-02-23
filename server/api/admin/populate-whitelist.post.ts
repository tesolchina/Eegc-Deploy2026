import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    const { students, admin_key } = body

    if (admin_key !== config.adminKey) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Unauthorized',
        })
    }

    if (!students || !Array.isArray(students) || students.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Students array is required',
        })
    }

    const supabase = createClient(config.supabaseUrl, config.supabaseKey)

    const results = { inserted: 0, skipped: 0, errors: [] as string[] }

    for (const student of students) {
        const { first_name, student_number_suffix } = student

        if (!first_name || !student_number_suffix) {
            results.errors.push(`Missing fields for: ${JSON.stringify(student)}`)
            continue
        }

        const { error } = await supabase
            .from('student_whitelist')
            .upsert(
                { first_name, student_number_suffix },
                { onConflict: 'student_number_suffix' }
            )

        if (error) {
            results.errors.push(`Error inserting ${student_number_suffix}: ${error.message}`)
        } else {
            results.inserted++
        }
    }

    return {
        success: true,
        results
    }
})
