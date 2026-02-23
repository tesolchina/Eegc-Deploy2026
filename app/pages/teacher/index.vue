<script setup lang="ts">
import Swal from 'sweetalert2'

useHead({
    title: 'Teacher Login'
})

const email = ref('')
const password = ref('')
const isLoggingIn = ref(false)

const goBack = () => {
    navigateTo('/teacher')
}

const handleLogin = async () => {
    if (!email.value || !password.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Credentials Required',
            text: 'Please enter both your email and password.',
            confirmButtonColor: '#4f46e5'
        })
        return
    }

    isLoggingIn.value = true

    try {
        const response = await $fetch<{ success: boolean, teacher: { email: string, id: string } }>('/api/teacher/login', {
            method: 'POST',
            body: {
                email: email.value.trim(),
                password: password.value
            }
        })

        if (response.success) {
            localStorage.setItem('userStatus', 'teacher')
            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: `Welcome back, ${response.teacher.email}!`,
                timer: 1500,
                showConfirmButton: false
            })

            // Redirect to a dashboard
            setTimeout(() => {
                navigateTo('/teacher/dashboard')
            }, 1500)
        }
    } catch (error: any) {
        console.error('Login error:', error)
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: error.data?.statusMessage || 'Invalid email or password.',
            confirmButtonColor: '#4f46e5'
        })
    } finally {
        isLoggingIn.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <div class="p-8 text-center bg-indigo-600">
                <h1 class="text-3xl font-extrabold text-white mb-2">Teacher Portal</h1>
                <p class="text-indigo-100 italic">EEGC</p>
            </div>

            <div class="p-8 space-y-6">
                <div class="text-center mb-6">
                    <h2 class="text-xl font-bold text-gray-900">Sign In</h2>
                    <p class="text-sm text-gray-500 mt-1">Please enter your teacher credentials</p>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        <input v-model="email" type="email" placeholder="teacher@example.com"
                            class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            required>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <input v-model="password" type="password" placeholder="••••••••"
                            class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            required>
                    </div>

                    <button type="submit" :disabled="isLoggingIn"
                        class="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                        <span v-if="isLoggingIn">Verifying...</span>
                        <span v-else>Login to Portal 🚀</span>
                    </button>
                </form>

                <div class="pt-2 text-center">
                    <p class="text-sm text-gray-500">
                        Don't have an account? Please contact <span class="font-semibold text-indigo-600">Simon</span>
                        to register.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
