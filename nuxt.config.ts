// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  runtimeConfig: {
    poeApiKey: process.env.POE_API_KEY || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
    jwtSecret: process.env.JWT_SECRET || 'F6ucvnzSYQofmivdyxehpa7Te3nWlgIyxeh',
  },
  devtools: { enabled: true },
  vite: {
    server: {
      allowedHosts: true
    }
  },
  devServer: {
    host: '0.0.0.0',
    port: 5000
  },

  // 添加这一行，让 Nuxt 知道你在使用这个模块
  modules: ['@nuxtjs/tailwindcss'],

  // 现在编辑器就能识别这个属性了
  tailwindcss: {
    viewer: false
  }
})