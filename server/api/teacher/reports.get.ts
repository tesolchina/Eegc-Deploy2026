import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // Auth is now handled by server/middleware/auth.ts
    // The decoded user info is available in event.context.user

    const supabase = createClient(config.supabaseUrl, config.supabaseKey)

    const { data, error } = await supabase
        .from('learning_reports')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Supabase Error fetching reports:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message,
        })
    }

    return {
        success: true,
        reports: data
    }
})
