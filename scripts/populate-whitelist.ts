const studentData = [
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25239422", name: "AU Cheung Tai" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25281542", name: "BAO Lizhao" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25245333", name: "CHAN Cho Kwan" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25285726", name: "CHEN Changrui" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25288326", name: "CHEN Yunnan" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25275917", name: "CHENG Zixuan" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25241214", name: "CHU Siu Fung" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25284916", name: "JI Xiaofei" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25271350", name: "LIN Jiapeng" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25235958", name: "NG Sze Wing" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25250302", name: "SHEN Kangteng" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25236776", name: "TAN Yee Man" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25233491", name: "WANG Zi" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25246852", name: "WONG Hei King" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25222716", name: "XU Yaxi" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25281356", name: "XUE Siyu" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25243462", name: "YOUNG Kwan Laam" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25222201", name: "ZHANG Qianyu" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", sid: "25288555", name: "ZHOU Qihao" },
  { section: 2, teacher: "Ms Leung Hiu Mann", sid: "25234412", name: "CHAN Chon Hong" },
  { section: 2, teacher: "Ms Leung Hiu Mann", sid: "25222511", name: "CHEN Jingtian" },
  { section: 2, teacher: "Ms Leung Hiu Mann", sid: "25211269", name: "CHENG Ruoxuan" },
  { section: 2, teacher: "Ms Leung Hiu Mann", sid: "25514369", name: "KONSTANTINOV Leonid" },
  { section: 2, teacher: "Ms Leung Hiu Mann", sid: "25259377", name: "LIU Kaiwei" },
  { section: 2, teacher: "Ms Leung Hiu Mann", sid: "25277863", name: "MA Zihan" },
  { section: 2, teacher: "Ms Leung Hiu Mann", sid: "25235672", name: "RUAN Yuze" },
  { section: 2, teacher: "Ms Leung Hiu Mann", sid: "25244752", name: "TSANG Trinity" },
  { section: 2, teacher: "Ms Leung Hiu Mann", sid: "25214012", name: "ZHOU Junan" },
  { section: 3, teacher: "Ms Leung Hiu Mann", sid: "25208756", name: "JEONG Jaeyeong" },
  { section: 3, teacher: "Ms Leung Hiu Mann", sid: "25245198", name: "KONG Lok Yin" },
  { section: 3, teacher: "Ms Leung Hiu Mann", sid: "25238787", name: "KWAN Sin Man" },
  { section: 3, teacher: "Ms Leung Hiu Mann", sid: "25215965", name: "LIN Man Tik" },
  { section: 3, teacher: "Ms Leung Hiu Mann", sid: "25277596", name: "LIU Huaize" },
  { section: 3, teacher: "Ms Leung Hiu Mann", sid: "25274104", name: "LYU Jiayan" },
  { section: 3, teacher: "Ms Leung Hiu Mann", sid: "25203495", name: "WANG Yuanzhi" },
  { section: 3, teacher: "Ms Leung Hiu Mann", sid: "25241915", name: "WONG Tsz Hin" },
  { section: 3, teacher: "Ms Leung Hiu Mann", sid: "25273469", name: "XIAO Junkai" },
  { section: 3, teacher: "Ms Leung Hiu Mann", sid: "25280007", name: "ZHANG Fangzheng" },
  { section: 0, teacher: "Test", sid: "00001111", name: "TEST Section1" },
  { section: 0, teacher: "Test", sid: "00002222", name: "TEST Section2" },
  { section: 0, teacher: "Test", sid: "00003333", name: "TEST Section3" },
]

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000'
const ADMIN_KEY = process.env.ADMIN_KEY || 'eegc-admin-2026'

async function populateWhitelist() {
  const whitelistData = studentData.map(s => ({
    first_name: s.name,
    student_number_suffix: parseInt(s.sid.slice(-4)),
  }))

  console.log(`Populating whitelist with ${whitelistData.length} students...`)

  const res = await fetch(`${BASE_URL}/api/admin/populate-whitelist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ students: whitelistData, admin_key: ADMIN_KEY }),
  })

  const data = await res.json()
  console.log('Whitelist result:', JSON.stringify(data, null, 2))

  if (!data.success) {
    console.error('Failed to populate whitelist')
    return
  }

  console.log('\n--- Creating test student accounts ---')

  const testAccounts = [
    { student_number_suffix: 1111, name_prefix: 'TS', section_number: 1 },
    { student_number_suffix: 2222, name_prefix: 'TS', section_number: 2 },
    { student_number_suffix: 3333, name_prefix: 'TS', section_number: 3 },
  ]

  for (const account of testAccounts) {
    const signupRes = await fetch(`${BASE_URL}/api/student/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    })

    const signupData = await signupRes.json()

    if (signupRes.ok && signupData.success) {
      const loginId = `${account.student_number_suffix}-${account.name_prefix}-${signupData.random_code}`
      console.log(`Section ${account.section_number} test account created!`)
      console.log(`  Login ID: ${loginId}`)
    } else {
      console.log(`Section ${account.section_number}: ${signupData.statusMessage || 'Already exists or error'}`)
    }
  }
}

populateWhitelist().catch(console.error)
