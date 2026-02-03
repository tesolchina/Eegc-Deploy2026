import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseKey)

    // Fetch all students
    const { data: students, error } = await supabase
        .from('students')
        .select('student_number_suffix, name_prefix, section_number')

    if (error) {
        console.error('Supabase Error fetching students:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    // Count occurrences of each student_number_suffix
    const suffixCounts: Record<string, any[]> = {}
    students.forEach(student => {
        const suffix = student.student_number_suffix.toString()
        if (!suffixCounts[suffix]) {
            suffixCounts[suffix] = []
        }
        suffixCounts[suffix].push(student)
    })

    // Filter for duplicates
    const duplicates = Object.entries(suffixCounts)
        .filter(([_, list]) => list.length > 1)
        .map(([suffix, list]) => ({
            suffix,
            students: list
        }))

    return {
        success: true,
        duplicates
    }
})
