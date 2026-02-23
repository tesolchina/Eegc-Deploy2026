<script setup lang="ts">
import Swal from 'sweetalert2'
import type { StudentRecord } from '~/constants/studentRoster'

useHead({
    title: 'Teacher Dashboard | EEGC'
})

const isAuthChecked = ref(false)

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

const activeView = ref<'roster' | 'reports'>('roster')
const reports = ref<Report[]>([])
const isLoading = ref(true)
const selectedReport = ref<Report | null>(null)
const showReportModal = ref(false)

const selectedStudent = ref<StudentRecord | null>(null)
const selectedStudentReports = ref<Report[]>([])
const showStudentModal = ref(false)

const duplicates = ref<any[]>([])
const isCheckingDuplicates = ref(false)
const showDuplicateModal = ref(false)

const stats = computed(() => {
    const total = reports.value.length
    const assessmentReports = reports.value.filter(r => r.mode === 'assessment')
    const totalAssessment = assessmentReports.length
    const avgRating = totalAssessment > 0
        ? (assessmentReports.reduce((acc, r) => acc + (r.rating || 0), 0) / totalAssessment).toFixed(1)
        : 0
    const trainingCount = reports.value.filter(r => r.mode === 'training').length
    const assessmentCount = totalAssessment

    return { total, avgRating, trainingCount, assessmentCount }
})

const fetchReports = async () => {
    isLoading.value = true
    try {
        const response = await $fetch<{ success: boolean, reports: Report[] }>('/api/teacher/reports')
        if (response.success) {
            reports.value = response.reports
        }
    } catch (error: any) {
        console.error('Error fetching reports:', error)
        if (error.statusCode === 401) {
            navigateTo('/teacher')
        }
    } finally {
        isLoading.value = false
    }
}

const handleLogout = () => {
    Swal.fire({
        title: 'Logging out...',
        text: 'Are you sure you want to log out?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('userStatus')
            navigateTo('/teacher')
        }
    })
}

const viewReport = (report: Report) => {
    selectedReport.value = report
    showReportModal.value = true
}

const viewStudent = (student: StudentRecord, studentReports: Report[]) => {
    selectedStudent.value = student
    selectedStudentReports.value = studentReports
    showStudentModal.value = true
}

const handleStudentViewReport = (report: Report) => {
    showStudentModal.value = false
    viewReport(report)
}

const checkDuplicates = async () => {
    isCheckingDuplicates.value = true
    try {
        const response = await $fetch<{ success: boolean, duplicates: any[] }>('/api/teacher/duplicate-check')
        if (response.success) {
            duplicates.value = response.duplicates
            showDuplicateModal.value = true
        }
    } catch (error: any) {
        console.error('Error checking duplicates:', error)
        Swal.fire('Error', 'Failed to check duplicates', 'error')
    } finally {
        isCheckingDuplicates.value = false
    }
}

onMounted(() => {
    const userStatus = localStorage.getItem('userStatus')
    if (userStatus !== 'teacher') {
        navigateTo('/teacher')
        return
    }
    isAuthChecked.value = true
    fetchReports()
})
</script>

<template>
    <div v-if="!isAuthChecked" class="min-h-screen bg-slate-50 flex items-center justify-center">
        <div class="text-slate-400 text-lg">Loading...</div>
    </div>
    <div v-else class="min-h-screen bg-slate-50 font-sans text-slate-900">
        <nav class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16 items-center">
                    <div class="flex items-center space-x-3">
                        <div class="bg-indigo-600 p-2 rounded-lg">
                            <span class="text-white font-bold text-xl leading-none">EE</span>
                        </div>
                        <h1 class="text-xl font-extrabold text-slate-800 tracking-tight">
                            Teacher <span class="text-indigo-600">Portal</span>
                        </h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button @click="handleLogout"
                            class="flex items-center space-x-2 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-medium text-sm">
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 class="text-3xl font-black text-slate-900 mb-2">Dashboard</h2>
                    <p class="text-slate-500">Monitor student progress and review learning reports.</p>
                </div>
                <div class="flex items-center space-x-3">
                    <button @click="checkDuplicates" :disabled="isCheckingDuplicates"
                        class="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-50">
                        <span>{{ isCheckingDuplicates ? 'Checking...' : 'Check Duplicates' }}</span>
                    </button>
                </div>
            </div>

            <TeacherDashboardStats :stats="stats" />

            <div class="flex space-x-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
                <button
                    @click="activeView = 'roster'"
                    :class="[
                        'px-5 py-2.5 rounded-lg text-sm font-bold transition-all',
                        activeView === 'roster'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    ]"
                    data-testid="tab-roster"
                >
                    Student Roster
                </button>
                <button
                    @click="activeView = 'reports'"
                    :class="[
                        'px-5 py-2.5 rounded-lg text-sm font-bold transition-all',
                        activeView === 'reports'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    ]"
                    data-testid="tab-reports"
                >
                    Recent Reports
                </button>
            </div>

            <TeacherStudentRoster
                v-if="activeView === 'roster'"
                :reports="reports"
                @view-student="viewStudent"
            />

            <TeacherDashboardReportTable
                v-if="activeView === 'reports'"
                :reports="reports"
                :isLoading="isLoading"
                @refresh="fetchReports"
                @view-report="viewReport"
            />
        </main>

        <TeacherReportDetailModal :report="selectedReport" :show="showReportModal" @close="showReportModal = false" />

        <TeacherStudentDetailModal
            :student="selectedStudent"
            :reports="selectedStudentReports"
            :show="showStudentModal"
            @close="showStudentModal = false"
            @view-report="handleStudentViewReport"
        />

        <TeacherDuplicateIdModal :duplicates="duplicates" :show="showDuplicateModal"
            @close="showDuplicateModal = false" />
    </div>
</template>
