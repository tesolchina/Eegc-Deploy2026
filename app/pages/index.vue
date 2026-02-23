<script setup lang="ts">
useHead({
  title: 'EEGC - Enhancing English through Global Citizenship'
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-4xl mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-extrabold text-indigo-600 mb-4">EEGC</h1>
        <p class="text-xl text-gray-600">Enhancing English through Global Citizenship</p>
        <p class="text-sm text-gray-400 mt-2">LANG 0036</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">About This Platform</h2>
        <p class="text-gray-600 leading-relaxed mb-4">
          EEGC is an AI-powered English writing assistant designed for HKBU students
          taking LANG 0036. It provides step-by-step revision guidance to help you improve
          your academic essays through interactive feedback and structured learning.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div class="bg-indigo-50 rounded-xl p-4 text-center">
            <div class="text-2xl mb-2">1</div>
            <h3 class="font-semibold text-indigo-700">Briefing</h3>
            <p class="text-sm text-gray-600 mt-1">Learn the basics and connect with AI</p>
          </div>
          <div class="bg-indigo-50 rounded-xl p-4 text-center">
            <div class="text-2xl mb-2">2</div>
            <h3 class="font-semibold text-indigo-700">Training</h3>
            <p class="text-sm text-gray-600 mt-1">Practice with guided essay revision</p>
          </div>
          <div class="bg-indigo-50 rounded-xl p-4 text-center">
            <div class="text-2xl mb-2">3</div>
            <h3 class="font-semibold text-indigo-700">Assessment</h3>
            <p class="text-sm text-gray-600 mt-1">Submit your work for evaluation</p>
          </div>
        </div>
      </div>

      <div class="text-center">
        <NuxtLink to="/aiedit"
          class="inline-block px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95"
          data-testid="link-aiedit">
          Enter AI Edit Module
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
