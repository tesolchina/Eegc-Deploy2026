<script setup lang="ts">
useHead({
    title: 'Student Login'
})

const goBack = () => {
    navigateTo('/')
}

const handleExistingId = () => {
    console.log('Login with existing ID')
}

const handleNewId = () => {
    navigateTo('/student/signup')
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <div class="p-8 text-center bg-indigo-600">
                <h1 class="text-3xl font-extrabold text-white mb-2">Student Portal</h1>
                <p class="text-indigo-100 italic">EEGC</p>
            </div>

            <div class="p-8 space-y-4">
                <div class="text-center mb-6">
                    <h2 class="text-xl font-bold text-gray-900">How would you like to start?</h2>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <button @click="handleExistingId"
                        class="group w-full flex flex-col items-center justify-center p-4 border-2 border-indigo-600 rounded-xl bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95">
                        <div class="text-2xl mb-1">🔑</div>
                        <div class="text-lg font-bold">I have an ID</div>
                        <div class="text-xs opacity-80 mt-1">Enter your existing student ID to log in</div>
                    </button>

                    <button @click="handleNewId"
                        class="group w-full flex flex-col items-center justify-center p-4 border-2 border-indigo-600 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95">
                        <div class="text-2xl mb-1">✨</div>
                        <div class="text-lg font-bold">I'm new here</div>
                        <div class="text-xs text-indigo-100 mt-1">Create a new student ID in seconds</div>
                    </button>
                </div>

                <div class="pt-6 text-center">
                    <button @click="goBack"
                        class="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center justify-center mx-auto">
                        <span class="mr-1">←</span> Back to Role Selection
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
