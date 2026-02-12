import { getPool } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const pool = getPool()

    try {
        const result = await pool.query(
            'SELECT student_number_suffix, name_prefix, section_number FROM students'
        )

        const students = result.rows

        const suffixCounts: Record<string, any[]> = {}
        students.forEach(student => {
            const suffix = student.student_number_suffix.toString()
            if (!suffixCounts[suffix]) {
                suffixCounts[suffix] = []
            }
            suffixCounts[suffix].push(student)
        })

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
    } catch (error: any) {
        console.error('DB Error fetching students:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }
})
