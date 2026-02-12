import { getPool } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const pool = getPool()

    try {
        await pool.query(
            `INSERT INTO student_whitelist (first_name, student_number_suffix)
             VALUES ('Test', 1111), ('Test', 2222), ('Test', 3333), ('Test', 4444), ('Test', 5555), ('Test', 5678)
             ON CONFLICT (student_number_suffix) DO NOTHING`
        )

        await pool.query(
            `INSERT INTO teachers (email, password)
             VALUES ('teacher1@test.com', 'teacher123'), ('teacher2@test.com', 'teacher456')
             ON CONFLICT (email) DO NOTHING`
        )

        await pool.query(
            `INSERT INTO students (student_number_suffix, name_prefix, section_number, random_code)
             VALUES (1111, 'TA', 1, 'X1'), (2222, 'TB', 2, 'Y2'), (3333, 'TC', 3, 'Z3'), (4444, 'TD', 4, 'A4'), (5555, 'TE', 5, 'B5')
             ON CONFLICT DO NOTHING`
        )

        const students = await pool.query('SELECT student_number_suffix, name_prefix, random_code, section_number FROM students ORDER BY student_number_suffix')
        const teachers = await pool.query('SELECT email FROM teachers ORDER BY email')
        const whitelist = await pool.query('SELECT student_number_suffix FROM student_whitelist ORDER BY student_number_suffix')

        return {
            success: true,
            whitelist: whitelist.rows,
            teachers: teachers.rows,
            student_accounts: students.rows.map((s: any) => ({
                login_code: `${s.student_number_suffix}-${s.name_prefix}-${s.random_code}`,
                section: s.section_number
            }))
        }
    } catch (error: any) {
        console.error('Seed error:', error)
        return { success: false, error: error.message }
    }
})
