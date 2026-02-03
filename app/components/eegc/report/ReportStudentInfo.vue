<template>
  <div class="mb-6 p-4 bg-gray-50 rounded-lg border">
    <h3 class="text-md font-semibold mb-3 text-gray-700">📋 Student Information</h3>
    <div class="space-y-3">
      <div>
        <label for="studentEmail" class="block text-sm font-medium text-gray-700 mb-1">
          Your Email Address:
        </label>
        <input
          id="studentEmail"
          :value="studentEmail"
          @input="$emit('update:studentEmail', $event.target.value)"
          type="email"
          placeholder="Enter your email address"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label for="studentNumber" class="block text-sm font-medium text-gray-700 mb-1">
          Student Number:
        </label>
        <input
          id="studentNumber"
          :value="studentNumber"
          @input="$emit('update:studentNumber', $event.target.value)"
          type="text"
          placeholder="Enter your student number"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label for="confirmStudentNumber" class="block text-sm font-medium text-gray-700 mb-1">
          Confirm Student Number:
        </label>
        <input
          id="confirmStudentNumber"
          :value="confirmStudentNumber"
          @input="$emit('update:confirmStudentNumber', $event.target.value)"
          type="text"
          placeholder="Enter your student number"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label for="sectionNumber" class="block text-sm font-medium text-gray-700 mb-1">
          Section Number:
        </label>
        <input
          id="sectionNumber"
          :value="sectionNumber"
          @input="$emit('update:sectionNumber', $event.target.value)"
          type="text"
          placeholder="Enter your section number"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Teacher:</label>
      <p class="border rounded-md px-3 py-2 bg-gray-100 text-gray-800">
        {{ teacherName }} — {{ teacherEmail }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  studentEmail: String,
  studentNumber: String,
  confirmStudentNumber: String,
  sectionNumber: String,
  teacherName: String,
  teacherEmail: String,
});

defineEmits([
  "update:studentEmail",
  "update:studentNumber",
  "update:confirmStudentNumber",
  "update:sectionNumber",
]);
</script>
