<template>
  <div>
    <!-- Toggle Button (when sidebar is closed) -->
    <button v-if="!isOpen" @click="toggleSidebar(true)"
      class="fixed top-4 left-4 z-30 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 transition">
      ☰ Menu
    </button>

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 h-full w-64 bg-gray-50 shadow-lg z-40 p-4 flex flex-col justify-between transform transition-transform duration-300"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'">
      <div>
        <!-- Close Button -->
        <button @click="toggleSidebar(false)" class="text-gray-600 hover:text-gray-900 font-bold text-lg mb-6">
          ✕ Close
        </button>

        <!-- Mode Buttons -->
        <div class="flex flex-col gap-4">
          <button v-for="mode in modes" :key="mode" @click="selectMode(mode)" :class="[
            currentMode === mode ? activeBtn : inactiveBtn,
            isThinking ? 'cursor-not-allowed opacity-50' : '',
          ]" :disabled="isThinking">
            {{ mode.charAt(0).toUpperCase() + mode.slice(1) }} Mode
          </button>
        </div>

        <!-- Mode Label -->
        <div class="mt-10 px-4 py-2 rounded-full text-sm font-medium text-center mb-6" :class="modeColors[currentMode]">
          {{ modeLabels[currentMode] }}
        </div>

        <!-- Logout Button -->
        <button @click="handleLogout"
          class="w-full mt-auto px-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold border border-red-200 transition hover:bg-red-600 hover:text-white flex items-center justify-center gap-2 group">
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
const props = defineProps({
  currentMode: { type: String, required: true },
  isThinking: { type: Boolean, required: true },
  modeLabels: { type: Object, required: true },
  modeColors: { type: Object, required: true },
});

const emit = defineEmits(["switch-mode", "toggle-open"]);

const modes = ["briefing", "training", "assessment"];

const isOpen = ref(true);

watch(isOpen, (val) => emit("toggle-open", val));

const activeBtn =
  "px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold transition hover:bg-indigo-700";
const inactiveBtn =
  "px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold transition hover:bg-gray-400";

const toggleSidebar = (state) => {
  isOpen.value = state;
};

const selectMode = (mode) => {
  emit("switch-mode", mode);
};

const handleLogout = () => {
  localStorage.removeItem("userStatus");
  navigateTo("/aiedit");
};
</script>
