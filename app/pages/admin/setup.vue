<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Admin Setup</h1>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Admin Key</h2>
        <input
          v-model="adminKey"
          type="password"
          placeholder="Enter admin key"
          class="w-full border rounded px-3 py-2 mb-4"
          data-testid="input-admin-key"
        />
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">1. Populate Student Whitelist</h2>
        <p class="text-sm text-gray-600 mb-4">
          This will add all {{ studentData.length }} students from the class list to the whitelist.
        </p>
        <button
          @click="populateWhitelist"
          :disabled="loading.whitelist"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          data-testid="button-populate-whitelist"
        >
          {{ loading.whitelist ? 'Processing...' : 'Populate Whitelist' }}
        </button>
        <div v-if="results.whitelist" class="mt-4 p-3 rounded text-sm" :class="results.whitelist.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
          <pre>{{ JSON.stringify(results.whitelist, null, 2) }}</pre>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">2. Create Test Accounts</h2>
        <p class="text-sm text-gray-600 mb-4">
          Creates 3 test student accounts (one per section). Whitelist must be populated first.
        </p>
        <button
          @click="createTestAccounts"
          :disabled="loading.test"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          data-testid="button-create-test-accounts"
        >
          {{ loading.test ? 'Creating...' : 'Create Test Accounts' }}
        </button>
        <div v-if="results.test" class="mt-4 p-3 bg-gray-50 rounded text-sm">
          <div v-for="(account, i) in results.test" :key="i" class="mb-2">
            <strong>Section {{ account.section }}:</strong>
            <span v-if="account.loginId" class="text-green-700 font-mono">{{ account.loginId }}</span>
            <span v-else class="text-red-600">{{ account.error }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const adminKey = ref('')

const loading = ref({ whitelist: false, test: false })
const results = ref<{ whitelist: any; test: any[] | null }>({ whitelist: null, test: null })

const studentData = [
  { sid: "25239422", name: "AU Cheung Tai" },
  { sid: "25281542", name: "BAO Lizhao" },
  { sid: "25245333", name: "CHAN Cho Kwan" },
  { sid: "25285726", name: "CHEN Changrui" },
  { sid: "25288326", name: "CHEN Yunnan" },
  { sid: "25275917", name: "CHENG Zixuan" },
  { sid: "25241214", name: "CHU Siu Fung" },
  { sid: "25284916", name: "JI Xiaofei" },
  { sid: "25271350", name: "LIN Jiapeng" },
  { sid: "25235958", name: "NG Sze Wing" },
  { sid: "25250302", name: "SHEN Kangteng" },
  { sid: "25236776", name: "TAN Yee Man" },
  { sid: "25233491", name: "WANG Zi" },
  { sid: "25246852", name: "WONG Hei King" },
  { sid: "25222716", name: "XU Yaxi" },
  { sid: "25281356", name: "XUE Siyu" },
  { sid: "25243462", name: "YOUNG Kwan Laam" },
  { sid: "25222201", name: "ZHANG Qianyu" },
  { sid: "25288555", name: "ZHOU Qihao" },
  { sid: "25234412", name: "CHAN Chon Hong" },
  { sid: "25222511", name: "CHEN Jingtian" },
  { sid: "25211269", name: "CHENG Ruoxuan" },
  { sid: "25514369", name: "KONSTANTINOV Leonid" },
  { sid: "25259377", name: "LIU Kaiwei" },
  { sid: "25277863", name: "MA Zihan" },
  { sid: "25235672", name: "RUAN Yuze" },
  { sid: "25244752", name: "TSANG Trinity" },
  { sid: "25214012", name: "ZHOU Junan" },
  { sid: "25208756", name: "JEONG Jaeyeong" },
  { sid: "25245198", name: "KONG Lok Yin" },
  { sid: "25238787", name: "KWAN Sin Man" },
  { sid: "25215965", name: "LIN Man Tik" },
  { sid: "25277596", name: "LIU Huaize" },
  { sid: "25274104", name: "LYU Jiayan" },
  { sid: "25203495", name: "WANG Yuanzhi" },
  { sid: "25241915", name: "WONG Tsz Hin" },
  { sid: "25273469", name: "XIAO Junkai" },
  { sid: "25280007", name: "ZHANG Fangzheng" },
  { sid: "00001111", name: "TEST Section1" },
  { sid: "00002222", name: "TEST Section2" },
  { sid: "00003333", name: "TEST Section3" },
]

async function populateWhitelist() {
  if (!adminKey.value) { alert('Please enter admin key'); return }
  loading.value.whitelist = true
  try {
    const whitelistData = studentData.map(s => ({
      first_name: s.name,
      student_number_suffix: parseInt(s.sid.slice(-4)),
    }))
    const res = await $fetch<any>('/api/admin/populate-whitelist', {
      method: 'POST',
      body: { students: whitelistData, admin_key: adminKey.value },
    })
    results.value.whitelist = res
  } catch (e: any) {
    results.value.whitelist = { success: false, error: e.message || 'Failed' }
  }
  loading.value.whitelist = false
}

async function createTestAccounts() {
  if (!adminKey.value) { alert('Please enter admin key'); return }
  loading.value.test = true
  const accounts = [
    { student_number_suffix: 1111, name_prefix: 'TS', section_number: 1 },
    { student_number_suffix: 2222, name_prefix: 'TS', section_number: 2 },
    { student_number_suffix: 3333, name_prefix: 'TS', section_number: 3 },
  ]
  const testResults: any[] = []
  for (const account of accounts) {
    try {
      const res = await $fetch<any>('/api/student/signup', {
        method: 'POST',
        body: account,
      })
      testResults.push({
        section: account.section_number,
        loginId: `${account.student_number_suffix}-${account.name_prefix}-${res.random_code}`,
      })
    } catch (e: any) {
      testResults.push({
        section: account.section_number,
        error: e.data?.statusMessage || e.message || 'Failed',
      })
    }
  }
  results.value.test = testResults
  loading.value.test = false
}
</script>
