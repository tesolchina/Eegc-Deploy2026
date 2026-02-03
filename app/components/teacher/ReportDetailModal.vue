<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import ChatMessageItem from '../eegc/chat/ChatMessageItem.vue'

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
})

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
    report: Report | null
    show: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const isAssessment = computed(() => props.report?.mode === 'assessment')

const renderMarkdown = (text: string) => {
    return md.render(text || '')
}

const contributionContent = computed(() => {
    if (!props.report) return ''
    return renderMarkdown(props.report.contribution_analysis?.content || props.report.contribution_analysis || '')
})
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

            <!-- Modal Container -->
            <div
                class="relative bg-white w-full h-full rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <!-- Header -->
                <div
                    class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div class="flex items-center space-x-4">
                        <div
                            class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                            {{ report?.student_name_prefix?.[0] || '?' }}
                        </div>
                        <div>
                            <h2 class="text-xl font-black text-slate-800">
                                Report from {{ report?.student_name_prefix }}...{{ report?.student_number_suffix }}
                            </h2>
                            <p class="text-xs text-slate-500 font-medium uppercase tracking-widest">
                                Section {{ report?.section_number }} • ID Suffix: {{ report?.student_number_suffix }}
                            </p>
                        </div>
                    </div>
                    <button @click="$emit('close')"
                        class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <span class="text-2xl leading-none">&times;</span>
                    </button>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    <!-- Top Info Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <span
                                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Session
                                Mode</span>
                            <div class="flex items-center space-x-2">
                                <span :class="[
                                    'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                                    report?.mode === 'assessment' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                ]">
                                    {{ report?.mode }}
                                </span>
                            </div>
                        </div>

                        <div v-if="isAssessment" class="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
                            <span
                                class="text-[10px] font-bold text-yellow-600/60 uppercase tracking-widest block mb-2">Student
                                Rating</span>
                            <div class="flex items-center text-2xl text-yellow-400">
                                <span v-for="i in 5" :key="i">{{ i <= (report?.rating || 0) ? '★' : '☆' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Comment -->
                    <div v-if="isAssessment && report?.comment"
                        class="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                        <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-3">Student
                            Comment</span>
                        <p class="text-lg text-slate-700 italic font-serif">
                            "{{ report?.comment }}"
                        </p>
                    </div>

                    <!-- Contribution Analysis -->
                    <div class="space-y-4">
                        <div class="flex items-center space-x-2 border-b border-slate-100 pb-2">
                            <span class="text-xl">📈</span>
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest">Contribution Analysis
                            </h3>
                        </div>
                        <div class="prose prose-indigo max-w-none bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 [&_pre]:whitespace-pre-wrap [&_code]:whitespace-pre-wrap [&_ol]:list-decimal [&_ul]:list-disc"
                            v-html="contributionContent">
                        </div>
                    </div>

                    <!-- Chat History -->
                    <div class="space-y-4 pb-10">
                        <div class="flex items-center space-x-2 border-b border-slate-100 pb-2">
                            <span class="text-xl">📝</span>
                            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest">Conversation History
                            </h3>
                        </div>

                        <div v-if="report?.chat_history && report.chat_history.length > 0"
                            class="space-y-4 w-full mx-auto">
                            <ChatMessageItem v-for="(msg, i) in report.chat_history" :key="i" :message="msg"
                                user-label="Student" ai-label="AI Assistant" full-width />
                        </div>
                        <div v-else
                            class="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <div class="text-4xl mb-4 text-slate-300">😶‍🌫️</div>
                            <p class="text-slate-400 italic">No conversation history recorded for this session.</p>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end sticky bottom-0 z-10">
                    <button @click="$emit('close')"
                        class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.prose {
    --tw-prose-body: inherit;
    --tw-prose-headings: inherit;
}
</style>
