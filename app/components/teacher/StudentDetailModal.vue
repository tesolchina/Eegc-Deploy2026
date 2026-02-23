<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import type { StudentRecord } from '~/constants/studentRoster'

const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

interface Report {
    id: string
    created_at: string
    student_number_suffix: string
    student_name_prefix: string
    section_number: number
    rating: number
    comment: string
    mode: string
    chat_history: { role: string; content: string }[]
    contribution_analysis: any
    metadata: any
}

const props = defineProps<{
    student: StudentRecord | null
    reports: Report[]
    show: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'view-report', report: Report): void
}>()

const activeTab = ref<'overview' | 'training' | 'assessment'>('overview')

const trainingReports = computed(() =>
    props.reports.filter(r => r.mode === 'training').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
)

const assessmentReports = computed(() =>
    props.reports.filter(r => r.mode === 'assessment').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
)

const latestAssessmentRating = computed(() => {
    const r = assessmentReports.value[0]
    return r?.rating || null
})

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const renderMarkdown = (text: string) => md.render(text || '')

const getContributionSummary = (report: Report) => {
    const content = report.contribution_analysis?.content || report.contribution_analysis || ''
    if (!content) return 'No AI feedback available'
    const text = typeof content === 'string' ? content : JSON.stringify(content)
    return text.length > 200 ? text.substring(0, 200) + '...' : text
}

watch(() => props.show, (val) => {
    if (val) activeTab.value = 'overview'
})
</script>

<template>
    <Teleport to="body">
        <div v-if="show && student" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

            <div class="relative bg-white w-full h-full rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                            {{ student.lastName[0] }}
                        </div>
                        <div>
                            <h2 class="text-xl font-black text-slate-800">{{ student.fullName }}</h2>
                            <p class="text-sm text-slate-500">
                                Section {{ student.section }} | ID: {{ student.studentId }} | Teacher: {{ student.teacher }}
                            </p>
                        </div>
                    </div>
                    <button @click="$emit('close')" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <span class="text-2xl leading-none">&times;</span>
                    </button>
                </div>

                <div class="flex border-b border-slate-100 bg-slate-50/50">
                    <button
                        v-for="tab in (['overview', 'training', 'assessment'] as const)"
                        :key="tab"
                        @click="activeTab = tab"
                        :class="[
                            'px-6 py-3 text-sm font-bold capitalize transition-all border-b-2',
                            activeTab === tab
                                ? 'text-indigo-600 border-indigo-600 bg-white'
                                : 'text-slate-400 border-transparent hover:text-slate-600'
                        ]"
                    >
                        {{ tab }}
                        <span v-if="tab === 'training'" class="ml-1 text-xs">({{ trainingReports.length }})</span>
                        <span v-if="tab === 'assessment'" class="ml-1 text-xs">({{ assessmentReports.length }})</span>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 md:p-8">
                    <template v-if="activeTab === 'overview'">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Submissions</p>
                                <p class="text-3xl font-black text-slate-800">{{ reports.length }}</p>
                            </div>
                            <div class="bg-green-50 rounded-2xl p-5 border border-green-100 text-center">
                                <p class="text-xs font-bold text-green-500 uppercase tracking-widest mb-2">Training</p>
                                <p class="text-3xl font-black text-green-700">{{ trainingReports.length }}</p>
                            </div>
                            <div class="bg-purple-50 rounded-2xl p-5 border border-purple-100 text-center">
                                <p class="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Assessment</p>
                                <p class="text-3xl font-black text-purple-700">{{ assessmentReports.length }}</p>
                            </div>
                        </div>

                        <div v-if="latestAssessmentRating" class="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 mb-8">
                            <p class="text-xs font-bold text-yellow-600/60 uppercase tracking-widest mb-2">Latest Assessment Rating</p>
                            <div class="flex items-center text-3xl text-yellow-400">
                                <span v-for="i in 5" :key="i">{{ i <= latestAssessmentRating ? '★' : '☆' }}</span>
                            </div>
                        </div>

                        <div v-if="reports.length === 0" class="text-center py-16">
                            <div class="text-5xl mb-4 text-slate-200">📭</div>
                            <p class="text-slate-400 text-lg">No submissions yet from this student.</p>
                        </div>

                        <div v-else class="space-y-4">
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                                All Submissions
                            </h3>
                            <div v-for="report in [...reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())"
                                :key="report.id"
                                class="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer"
                                @click="emit('view-report', report)"
                            >
                                <div class="flex items-center space-x-4">
                                    <span :class="[
                                        'px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                        report.mode === 'assessment' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                    ]">
                                        {{ report.mode }}
                                    </span>
                                    <span class="text-sm text-slate-600">{{ formatDate(report.created_at) }}</span>
                                    <div v-if="report.rating" class="flex items-center text-yellow-400 text-sm">
                                        <span v-for="i in 5" :key="i">{{ i <= report.rating ? '★' : '☆' }}</span>
                                    </div>
                                </div>
                                <span class="text-indigo-600 text-sm font-bold">View Details →</span>
                            </div>
                        </div>
                    </template>

                    <template v-if="activeTab === 'training'">
                        <div v-if="trainingReports.length === 0" class="text-center py-16">
                            <div class="text-5xl mb-4 text-slate-200">📝</div>
                            <p class="text-slate-400 text-lg">No training submissions yet.</p>
                        </div>
                        <div v-else class="space-y-6">
                            <div v-for="report in trainingReports" :key="report.id"
                                class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div class="p-5 border-b border-slate-100 flex justify-between items-center">
                                    <div>
                                        <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Training</span>
                                        <span class="ml-3 text-sm text-slate-500">{{ formatDate(report.created_at) }}</span>
                                    </div>
                                    <button @click="emit('view-report', report)" class="text-indigo-600 text-sm font-bold hover:underline">
                                        Full Report →
                                    </button>
                                </div>
                                <div class="p-5">
                                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI Feedback Summary</h4>
                                    <p class="text-sm text-slate-600">{{ getContributionSummary(report) }}</p>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template v-if="activeTab === 'assessment'">
                        <div v-if="assessmentReports.length === 0" class="text-center py-16">
                            <div class="text-5xl mb-4 text-slate-200">📋</div>
                            <p class="text-slate-400 text-lg">No assessment submissions yet.</p>
                        </div>
                        <div v-else class="space-y-6">
                            <div v-for="report in assessmentReports" :key="report.id"
                                class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div class="p-5 border-b border-slate-100 flex justify-between items-center">
                                    <div class="flex items-center space-x-3">
                                        <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">Assessment</span>
                                        <span class="text-sm text-slate-500">{{ formatDate(report.created_at) }}</span>
                                        <div v-if="report.rating" class="flex items-center text-yellow-400">
                                            <span v-for="i in 5" :key="i">{{ i <= report.rating ? '★' : '☆' }}</span>
                                        </div>
                                    </div>
                                    <button @click="emit('view-report', report)" class="text-indigo-600 text-sm font-bold hover:underline">
                                        Full Report →
                                    </button>
                                </div>
                                <div v-if="report.comment" class="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
                                    <p class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Student Comment</p>
                                    <p class="text-sm text-slate-700 italic">"{{ report.comment }}"</p>
                                </div>
                                <div class="p-5">
                                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI Feedback Summary</h4>
                                    <p class="text-sm text-slate-600">{{ getContributionSummary(report) }}</p>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end sticky bottom-0 z-10">
                    <button @click="$emit('close')"
                        class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
