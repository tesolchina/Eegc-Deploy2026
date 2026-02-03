<script setup lang="ts">
useHead({
  title: 'Login'
})

const loginAs = (role: string) => {
  if (role === 'student') {
    navigateTo('/student/login')
  } else if (role === 'teacher') {
    navigateTo('/teacher/login')
  } else {
    console.log(`Logging in as ${role}`)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="p-8 text-center bg-indigo-600">
        <h1 class="text-3xl font-extrabold text-white mb-2">EEGC</h1>
      </div>

      <div class="p-8 space-y-8">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p class="mt-2 text-gray-600">Please choose your role to continue</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <button @click="loginAs('teacher')"
            class="group relative flex items-center justify-center py-4 px-6 border-2 border-indigo-600 rounded-xl bg-white text-indigo-600 font-bold text-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95">
            <span class="mr-3 text-2xl">👨‍🏫</span>
            Teacher Portal
          </button>

          <button @click="loginAs('student')"
            class="group relative flex items-center justify-center py-4 px-6 border-2 border-indigo-600 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 hover:border-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95">
            <span class="mr-3 text-2xl">🎓</span>
            Student Entrance
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
