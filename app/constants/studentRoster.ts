export interface StudentRecord {
  section: number
  teacher: string
  studentId: string
  studentNumberSuffix: number
  fullName: string
  lastName: string
  firstName: string
}

export const TEACHERS: Record<string, { name: string; sections: number[] }> = {
  'ms_fung': { name: 'Ms Fung Maria Mo Kit', sections: [1] },
  'ms_leung': { name: 'Ms Leung Hiu Mann', sections: [2, 3] },
}

export const STUDENT_ROSTER: StudentRecord[] = [
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25239422", studentNumberSuffix: 9422, fullName: "AU Cheung Tai", lastName: "AU", firstName: "Cheung Tai" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25281542", studentNumberSuffix: 1542, fullName: "BAO Lizhao", lastName: "BAO", firstName: "Lizhao" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25245333", studentNumberSuffix: 5333, fullName: "CHAN Cho Kwan", lastName: "CHAN", firstName: "Cho Kwan" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25285726", studentNumberSuffix: 5726, fullName: "CHEN Changrui", lastName: "CHEN", firstName: "Changrui" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25288326", studentNumberSuffix: 8326, fullName: "CHEN Yunnan", lastName: "CHEN", firstName: "Yunnan" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25275917", studentNumberSuffix: 5917, fullName: "CHENG Zixuan", lastName: "CHENG", firstName: "Zixuan" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25241214", studentNumberSuffix: 1214, fullName: "CHU Siu Fung", lastName: "CHU", firstName: "Siu Fung" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25284916", studentNumberSuffix: 4916, fullName: "JI Xiaofei", lastName: "JI", firstName: "Xiaofei" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25271350", studentNumberSuffix: 1350, fullName: "LIN Jiapeng", lastName: "LIN", firstName: "Jiapeng" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25235958", studentNumberSuffix: 5958, fullName: "NG Sze Wing", lastName: "NG", firstName: "Sze Wing" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25250302", studentNumberSuffix: 302, fullName: "SHEN Kangteng", lastName: "SHEN", firstName: "Kangteng" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25236776", studentNumberSuffix: 6776, fullName: "TAN Yee Man", lastName: "TAN", firstName: "Yee Man" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25233491", studentNumberSuffix: 3491, fullName: "WANG Zi", lastName: "WANG", firstName: "Zi" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25246852", studentNumberSuffix: 6852, fullName: "WONG Hei King", lastName: "WONG", firstName: "Hei King" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25222716", studentNumberSuffix: 2716, fullName: "XU Yaxi", lastName: "XU", firstName: "Yaxi" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25281356", studentNumberSuffix: 1356, fullName: "XUE Siyu", lastName: "XUE", firstName: "Siyu" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25243462", studentNumberSuffix: 3462, fullName: "YOUNG Kwan Laam", lastName: "YOUNG", firstName: "Kwan Laam" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25222201", studentNumberSuffix: 2201, fullName: "ZHANG Qianyu", lastName: "ZHANG", firstName: "Qianyu" },
  { section: 1, teacher: "Ms Fung Maria Mo Kit", studentId: "25288555", studentNumberSuffix: 8555, fullName: "ZHOU Qihao", lastName: "ZHOU", firstName: "Qihao" },
  { section: 2, teacher: "Ms Leung Hiu Mann", studentId: "25234412", studentNumberSuffix: 4412, fullName: "CHAN Chon Hong", lastName: "CHAN", firstName: "Chon Hong" },
  { section: 2, teacher: "Ms Leung Hiu Mann", studentId: "25222511", studentNumberSuffix: 2511, fullName: "CHEN Jingtian", lastName: "CHEN", firstName: "Jingtian" },
  { section: 2, teacher: "Ms Leung Hiu Mann", studentId: "25211269", studentNumberSuffix: 1269, fullName: "CHENG Ruoxuan", lastName: "CHENG", firstName: "Ruoxuan" },
  { section: 2, teacher: "Ms Leung Hiu Mann", studentId: "25514369", studentNumberSuffix: 4369, fullName: "KONSTANTINOV Leonid", lastName: "KONSTANTINOV", firstName: "Leonid" },
  { section: 2, teacher: "Ms Leung Hiu Mann", studentId: "25259377", studentNumberSuffix: 9377, fullName: "LIU Kaiwei", lastName: "LIU", firstName: "Kaiwei" },
  { section: 2, teacher: "Ms Leung Hiu Mann", studentId: "25277863", studentNumberSuffix: 7863, fullName: "MA Zihan", lastName: "MA", firstName: "Zihan" },
  { section: 2, teacher: "Ms Leung Hiu Mann", studentId: "25235672", studentNumberSuffix: 5672, fullName: "RUAN Yuze", lastName: "RUAN", firstName: "Yuze" },
  { section: 2, teacher: "Ms Leung Hiu Mann", studentId: "25244752", studentNumberSuffix: 4752, fullName: "TSANG Trinity", lastName: "TSANG", firstName: "Trinity" },
  { section: 2, teacher: "Ms Leung Hiu Mann", studentId: "25214012", studentNumberSuffix: 4012, fullName: "ZHOU Junan", lastName: "ZHOU", firstName: "Junan" },
  { section: 3, teacher: "Ms Leung Hiu Mann", studentId: "25208756", studentNumberSuffix: 8756, fullName: "JEONG Jaeyeong", lastName: "JEONG", firstName: "Jaeyeong" },
  { section: 3, teacher: "Ms Leung Hiu Mann", studentId: "25245198", studentNumberSuffix: 5198, fullName: "KONG Lok Yin", lastName: "KONG", firstName: "Lok Yin" },
  { section: 3, teacher: "Ms Leung Hiu Mann", studentId: "25238787", studentNumberSuffix: 8787, fullName: "KWAN Sin Man", lastName: "KWAN", firstName: "Sin Man" },
  { section: 3, teacher: "Ms Leung Hiu Mann", studentId: "25215965", studentNumberSuffix: 5965, fullName: "LIN Man Tik", lastName: "LIN", firstName: "Man Tik" },
  { section: 3, teacher: "Ms Leung Hiu Mann", studentId: "25277596", studentNumberSuffix: 7596, fullName: "LIU Huaize", lastName: "LIU", firstName: "Huaize" },
  { section: 3, teacher: "Ms Leung Hiu Mann", studentId: "25274104", studentNumberSuffix: 4104, fullName: "LYU Jiayan", lastName: "LYU", firstName: "Jiayan" },
  { section: 3, teacher: "Ms Leung Hiu Mann", studentId: "25203495", studentNumberSuffix: 3495, fullName: "WANG Yuanzhi", lastName: "WANG", firstName: "Yuanzhi" },
  { section: 3, teacher: "Ms Leung Hiu Mann", studentId: "25241915", studentNumberSuffix: 1915, fullName: "WONG Tsz Hin", lastName: "WONG", firstName: "Tsz Hin" },
  { section: 3, teacher: "Ms Leung Hiu Mann", studentId: "25273469", studentNumberSuffix: 3469, fullName: "XIAO Junkai", lastName: "XIAO", firstName: "Junkai" },
  { section: 3, teacher: "Ms Leung Hiu Mann", studentId: "25280007", studentNumberSuffix: 7, fullName: "ZHANG Fangzheng", lastName: "ZHANG", firstName: "Fangzheng" },
]

export const SECTIONS = [1, 2, 3] as const

export function getStudentsBySection(section: number): StudentRecord[] {
  return STUDENT_ROSTER.filter(s => s.section === section)
}

export function getStudentBySuffix(suffix: number): StudentRecord | undefined {
  return STUDENT_ROSTER.find(s => s.studentNumberSuffix === suffix)
}
