import { Training_Greetings, Assessment_Greetings } from '~/composables/eegc/promptAndEssay'

export const MODE_COLORS = {
  training: 'bg-green-100 text-green-800',
  assessment: 'bg-red-100 text-red-800',
  briefing: 'bg-blue-100 text-blue-800',
} as const

export const MODE_LABELS = {
  training: 'Training Mode Active',
  assessment: 'Assessment Mode Active',
  briefing: 'Briefing Mode Active',
} as const

export const MODE_GREETINGS = {
  training: Training_Greetings,
  assessment: Assessment_Greetings,
  briefing: 'Welcome to LANG 0036! Configure your API to start.',
} as const

export type ModeType = keyof typeof MODE_COLORS
