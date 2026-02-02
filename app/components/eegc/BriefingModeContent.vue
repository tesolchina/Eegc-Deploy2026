<template>
  <div class="w-full p-4 flex-1">
    <div class="mb-6 p-4 bg-gray-50 rounded-lg text-center">
      <h2 class="text-xl font-bold text-gray-900 mb-1">Connect to Chatbot</h2>
      <p class="text-gray-600 text-sm mb-4">
        Configure your API settings to start using the chatbot
      </p>

      <div class="flex flex-col gap-4 justify-center items-stretch w-full">
        <div class="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 class="font-semibold text-yellow-800 mb-2 text-sm">🤖 Model Selection</h3>

          <div class="flex flex-col items-center gap-2">
            <div class="w-full md:w-1/2 text-left flex flex-col">
              <label class="block text-xs font-semibold text-gray-700 mb-1">
                Select Chatbot Model
              </label>
              <select
                :value="model"
                @input="$emit('update:model', $event.target.value)"
                class="w-full border rounded-lg p-2 text-sm focus:ring focus:ring-indigo-300"
              >
                <optgroup label="Available Models">
                  <option value="gpt-5.2-instant">GPT-5.2 Instant</option>
                    <option value="gpt-5.2">GPT-5.2</option>
                  <option value="gemini-3-flash">Gemini 3 Flash</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-4 justify-center mt-4">
        <button
          class="px-20 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50 transition-opacity"
          @click="$emit('connect')"
          :disabled="isConnecting || isConnected || !model"
        >
          <span v-if="isConnecting">🔄 Connecting...</span>
          <span v-else-if="isConnected">✔️ Connected</span>
          <span v-else>✅ Connect</span>
        </button>
        <button
          class="px-20 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium"
          @click="$emit('clear')"
          :disabled="isConnecting"
        >
          🗑️ Clear
        </button>
      </div>

      <div
        v-if="notification.visible"
        class="mt-3 p-3 rounded-lg text-sm text-center"
        :class="
          notification.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        "
      >
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  model: {
    type: String,
    required: true,
  },
  isConnecting: {
    type: Boolean,
    default: false,
  },
  isConnected: {
    type: Boolean,
    default: false,
  },
  notification: {
    type: Object,
    default: () => ({ message: '', type: 'success', visible: false }),
  },
})

defineEmits(['update:model', 'connect', 'clear'])
</script>
