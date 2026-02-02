<template>
  <div class="mb-6 p-6 bg-gray-50 rounded-lg">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-900">🎓 Training Mode Tutorial</h2>
      <div class="flex gap-2">
        <button
          @click="$emit('toggle')"
          class="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        >
          {{ isVisible ? "▼ Hide Tutorial" : "▶ Show Tutorial" }}
        </button>

        <button
          @click="openTutorial"
          class="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        >
          🔗 Jump to Tutorial
        </button>
      </div>
    </div>
    <div
      v-if="isVisible"
      class="bg-white border border-gray-300 rounded-lg p-4 shadow-sm"
    >
      <iframe
        src="https://smartlessons.hkbu.tech/tutorial-training-mode.html"
        width="100%"
        height="800"
        allow="fullscreen"
        style="border: 0; min-height: 640px"
        title="Training Mode Tutorial"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle'])

function openTutorial() {
  window.open('https://smartlessons.hkbu.tech/tutorial-training-mode.html', '_blank')
}
</script>
