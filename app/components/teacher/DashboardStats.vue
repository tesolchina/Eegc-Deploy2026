<script setup lang="ts">
import { STUDENT_ROSTER } from '~/constants/studentRoster'

const props = defineProps<{
    stats: {
        total: number
        avgRating: string | number
        trainingCount: number
        assessmentCount: number
    }
    allowedSections?: number[]
}>()

const totalStudents = computed(() => {
    if (props.allowedSections && props.allowedSections.length > 0) {
        return STUDENT_ROSTER.filter(s => props.allowedSections!.includes(s.section)).length
    }
    return STUDENT_ROSTER.length
})
</script>

<template>
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-3">
            <div class="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                <span class="text-xl">👥</span>
            </div>
            <div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Students</p>
                <p class="text-xl font-bold text-slate-800">{{ totalStudents }}</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-3">
            <div class="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                <span class="text-xl">📊</span>
            </div>
            <div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Reports</p>
                <p class="text-xl font-bold text-slate-800">{{ stats.total }}</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-3">
            <div class="bg-green-100 p-2.5 rounded-xl text-green-600">
                <span class="text-xl">🎓</span>
            </div>
            <div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Training</p>
                <p class="text-xl font-bold text-slate-800">{{ stats.trainingCount }}</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-3">
            <div class="bg-purple-100 p-2.5 rounded-xl text-purple-600">
                <span class="text-xl">📝</span>
            </div>
            <div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Assessment</p>
                <p class="text-xl font-bold text-slate-800">{{ stats.assessmentCount }}</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center space-x-3">
            <div class="bg-yellow-100 p-2.5 rounded-xl text-yellow-600">
                <span class="text-xl">⭐</span>
            </div>
            <div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Rating</p>
                <p class="text-xl font-bold text-slate-800">{{ stats.avgRating }}/5</p>
            </div>
        </div>
    </div>
</template>
