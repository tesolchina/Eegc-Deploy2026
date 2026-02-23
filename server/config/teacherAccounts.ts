export interface TeacherAccount {
  email: string
  password: string
  name: string
  role: 'teacher' | 'superadmin'
  sections: number[]
  is_active: boolean
}

export const TEACHER_ACCOUNTS: TeacherAccount[] = [
  {
    email: 'mariafunghk@hkbu.edu.hk',
    password: 'EEGC@Fung2026!',
    name: 'Ms Fung Maria Mo Kit',
    role: 'teacher',
    sections: [1],
    is_active: true,
  },
  {
    email: 'lhmconi@hkbu.edu.hk',
    password: 'EEGC@Leung2026!',
    name: 'Ms Leung Hiu Mann',
    role: 'teacher',
    sections: [2, 3],
    is_active: true,
  },
  {
    email: 'zhxemma@hkbu.edu.hk',
    password: 'EEGC@Emma2026!',
    name: 'Emma (Super Admin)',
    role: 'superadmin',
    sections: [1, 2, 3],
    is_active: true,
  },
  {
    email: 'simonwang@hkbu.edu.hk',
    password: 'EEGC@Simon2026!',
    name: 'Simon Wang (Super Admin)',
    role: 'superadmin',
    sections: [1, 2, 3],
    is_active: true,
  },
  {
    email: 'zhang_kt@hkbu.edu.hk',
    password: 'EEGC@Zhang2026!',
    name: 'Zhang KT (Super Admin)',
    role: 'superadmin',
    sections: [1, 2, 3],
    is_active: true,
  },
  {
    email: '22256342@life.hkbu.edu.hk',
    password: 'EEGC@22256342!',
    name: '22256342 (Super Admin)',
    role: 'superadmin',
    sections: [1, 2, 3],
    is_active: true,
  },
]

export function findTeacher(email: string, password: string): TeacherAccount | undefined {
  return TEACHER_ACCOUNTS.find(
    t => t.email.toLowerCase() === email.toLowerCase() && t.password === password && t.is_active
  )
}
