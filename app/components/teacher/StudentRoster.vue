<script setup lang="ts">
import { STUDENT_ROSTER, SECTIONS, type StudentRecord } from '~/constants/studentRoster'

interface Report {
    id: string
    created_at: string
    student_number_suffix: string
    student_name_prefix: string
    section_number: number
    rating: number
    comment: string
    mode: string
    chat_history: any
    contribution_analysis: any
    metadata: any
}

const props = defineProps<{
    reports: Report[]
    allowedSections?: number[]
}>()

const emit = defineEmits<{
    (e: 'view-student', student: StudentRecord, studentReports: Report[]): void
}>()

const selectedSection = ref<number | null>(null)

const visibleSections = computed(() => {
    if (props.allowedSections && props.allowedSections.length > 0) {
        return SECTIONS.filter(s => props.allowedSections!.includes(s))
    }
    return [...SECTIONS]
})

const rosterStudents = computed(() => {
    if (props.allowedSections && props.allowedSections.length > 0) {
        return STUDENT_ROSTER.filter(s => props.allowedSections!.includes(s.section))
    }
    return STUDENT_ROSTER
})

const filteredStudents = computed(() => {
    if (selectedSection.value === null) return rosterStudents.value
    return rosterStudents.value.filter(s => s.section === selectedSection.value)
})

const reportsByStudent = computed(() => {
    const map = new Map<number, Report[]>()
    for (const report of props.reports) {
        const suffix = parseInt(String(report.student_number_suffix))
        if (!map.has(suffix)) map.set(suffix, [])
        map.get(suffix)!.push(report)
    }
    return map
})

function getStudentReports(suffix: number): Report[] {
    return reportsByStudent.value.get(suffix) || []
}

function getTrainingCount(suffix: number): number {
    return getStudentReports(suffix).filter(r => r.mode === 'training').length
}

function getAssessmentCount(suffix: number): number {
    return getStudentReports(suffix).filter(r => r.mode === 'assessment').length
}

function getLatestRating(suffix: number): number | null {
    const assessments = getStudentReports(suffix)
        .filter(r => r.mode === 'assessment' && r.rating)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return assessments.length > 0 ? assessments[0].rating : null
}

function getSubmissionStatus(suffix: number): 'none' | 'training' | 'complete' {
    const reports = getStudentReports(suffix)
    if (reports.length === 0) return 'none'
    const hasAssessment = reports.some(r => r.mode === 'assessment')
    return hasAssessment ? 'complete' : 'training'
}

const sectionStats = computed(() => {
    return visibleSections.value.map(sec => {
        const students = rosterStudents.value.filter(s => s.section === sec)
        const withSubmissions = students.filter(s => getStudentReports(s.studentNumberSuffix).length > 0).length
        return { section: sec, total: students.length, submitted: withSubmissions }
    })
})
</script>

<template>
    <div>
        <div class="flex flex-wrap gap-3 mb-6">
            <button
                @click="selectedSection = null"
                :class="[
                    'px-4 py-2 rounded-xl text-sm font-bold transition-all',
                    selectedSection === null
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                ]"
                data-testid="filter-all-sections"
            >
                All Sections ({{ rosterStudents.length }})
            </button>
            <button
                v-for="stat in sectionStats"
                :key="stat.section"
                @click="selectedSection = stat.section"
                :class="[
                    'px-4 py-2 rounded-xl text-sm font-bold transition-all',
                    selectedSection === stat.section
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                ]"
                :data-testid="'filter-section-' + stat.section"
            >
                Section {{ stat.section }} ({{ stat.submitted }}/{{ stat.total }})
            </button>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 class="font-bold text-lg text-slate-800">Student Roster</h3>
                <p class="text-sm text-slate-500 mt-1">Click on a student to view their submissions and AI feedback</p>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-slate-400 text-xs uppercase tracking-widest bg-slate-50/50">
                            <th class="px-6 py-3 font-semibold">#</th>
                            <th class="px-6 py-3 font-semibold">Student Name</th>
                            <th class="px-6 py-3 font-semibold">Student ID</th>
                            <th class="px-6 py-3 font-semibold">Section</th>
                            <th class="px-6 py-3 font-semibold">Training</th>
                            <th class="px-6 py-3 font-semibold">Assessment</th>
                            <th class="px-6 py-3 font-semibold">Rating</th>
                            <th class="px-6 py-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr
                            v-for="(student, index) in filteredStudents"
                            :key="student.studentId"
                            class="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                            @click="emit('view-student', student, getStudentReports(student.studentNumberSuffix))"
                            :data-testid="'student-row-' + student.studentNumberSuffix"
                        >
                            <td class="px-6 py-4 text-sm text-slate-400">{{ index + 1 }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                        {{ student.lastName[0] }}
                                    </div>
                                    <div>
                                        <div class="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            {{ student.fullName }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 font-mono text-sm text-slate-500">{{ student.studentId }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-mono">
                                    Sec {{ student.section }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span v-if="getTrainingCount(student.studentNumberSuffix) > 0"
                                    class="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                    {{ getTrainingCount(student.studentNumberSuffix) }}
                                </span>
                                <span v-else class="text-slate-300 text-sm">--</span>
                            </td>
                            <td class="px-6 py-4">
                                <span v-if="getAssessmentCount(student.studentNumberSuffix) > 0"
                                    class="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                    {{ getAssessmentCount(student.studentNumberSuffix) }}
                                </span>
                                <span v-else class="text-slate-300 text-sm">--</span>
                            </td>
                            <td class="px-6 py-4">
                                <div v-if="getLatestRating(student.studentNumberSuffix)" class="flex items-center text-yellow-400 text-sm">
                                    <span v-for="i in 5" :key="i">{{ i <= getLatestRating(student.studentNumberSuffix)! ? '★' : '☆' }}</span>
                                </div>
                                <span v-else class="text-slate-300 text-sm">--</span>
                            </td>
                            <td class="px-6 py-4">
                                <span :class="[
                                    'px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                    getSubmissionStatus(student.studentNumberSuffix) === 'complete' ? 'bg-indigo-100 text-indigo-700' :
                                    getSubmissionStatus(student.studentNumberSuffix) === 'training' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-400'
                                ]">
                                    {{ getSubmissionStatus(student.studentNumberSuffix) === 'complete' ? 'Completed' :
                                       getSubmissionStatus(student.studentNumberSuffix) === 'training' ? 'In Progress' : 'Not Started' }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
