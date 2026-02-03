<script setup lang="ts">
import Swal from 'sweetalert2'

useHead({
    title: 'Student Login'
})

const showLoginForm = ref(false)
const uniqueId = ref('')
const isLoggingIn = ref(false)

const goBack = () => {
    if (showLoginForm.value) {
        showLoginForm.value = false
    } else {
        navigateTo('/')
    }
}

const handleExistingId = () => {
    showLoginForm.value = true
}

const handleNewId = () => {
    navigateTo('/student/signup')
}

const handleLogin = async () => {
    if (!uniqueId.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Code Required',
            text: 'Please enter your unique registration code.',
            confirmButtonColor: '#4f46e5'
        })
        return
    }

    isLoggingIn.value = true

    try {
        const response = await $fetch('/api/student/login', {
            method: 'POST',
            body: {
                uniqueId: uniqueId.value.trim()
            }
        })

        if (response.success) {
            localStorage.setItem('userStatus', 'student')
            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: `Welcome back!`,
                timer: 1500,
                showConfirmButton: false
            })

            // Redirect to student dashboard
            setTimeout(() => {
                navigateTo('/eegc')
            }, 1500)
        }
    } catch (error: any) {
        console.error('Login error:', error)
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: error.data?.statusMessage || 'Invalid code or student not found.',
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
                <h1 class="text-3xl font-extrabold text-white mb-2">Student Portal</h1>
                <p class="text-indigo-100 italic">EEGC</p>
            </div>

            <div class="p-8 space-y-6">
                <!-- Choice Selection -->
                <div v-if="!showLoginForm" class="space-y-4">
                    <div class="text-center mb-6">
                        <h2 class="text-xl font-bold text-gray-900">How would you like to start?</h2>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        <button @click="handleExistingId"
                            class="group w-full flex flex-col items-center justify-center p-6 border-2 border-indigo-600 rounded-xl bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95">
                            <div class="text-3xl mb-2">🔑</div>
                            <div class="text-lg font-bold">I have an ID</div>
                            <div class="text-xs opacity-80 mt-1">Enter your existing student ID to log in</div>
                        </button>

                        <button @click="handleNewId"
                            class="group w-full flex flex-col items-center justify-center p-6 border-2 border-indigo-600 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95">
                            <div class="text-3xl mb-2">✨</div>
                            <div class="text-lg font-bold">I'm new here</div>
                            <div class="text-xs text-indigo-100 mt-1">Create a new student ID in seconds</div>
                        </button>
                    </div>
                </div>

                <!-- Login Form -->
                <div v-else class="space-y-4">
                    <div class="text-center mb-6">
                        <h2 class="text-xl font-bold text-gray-900">Enter Your Code</h2>
                        <p class="text-sm text-gray-500 mt-1">Please enter the unique ID you received during
                            registration
                        </p>
                    </div>

                    <form @submit.prevent="handleLogin" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Unique Registration
                                Code</label>
                            <input v-model="uniqueId" type="text" placeholder="e.g. 1234-JD-A1"
                                class="w-full px-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-center text-lg tracking-widest uppercase"
                                required>
                        </div>

                        <button type="submit" :disabled="isLoggingIn"
                            class="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                            <span v-if="isLoggingIn">Verifying...</span>
                            <span v-else>Access My Portal 🚀</span>
                        </button>
                    </form>
                </div>

                <div class="pt-2 text-center">
                    <button @click="goBack"
                        class="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center justify-center mx-auto">
                        <span class="mr-1">←</span> {{ showLoginForm ? 'Change Option' : 'Back to Role Selection' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
