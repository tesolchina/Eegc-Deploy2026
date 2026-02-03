<script setup lang="ts">
interface Duplicate {
    suffix: string
    students: {
        student_number_suffix: number
        name_prefix: string
        section_number: number
    }[]
}

const props = defineProps<{
    duplicates: Duplicate[]
    show: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>

            <!-- Modal Container -->
            <div
                class="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <!-- Header -->
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                            <span class="text-xl">⚠️</span>
                        </div>
                        <div>
                            <h2 class="text-xl font-black text-slate-800">Duplicate ID Suffixes</h2>
                            <p class="text-xs text-slate-500 font-medium tracking-widest">
                                Potential student ID conflicts detected
                            </p>
                        </div>
                    </div>
                    <button @click="$emit('close')"
                        class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <span class="text-2xl leading-none">&times;</span>
                    </button>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto p-6 space-y-6">
                    <div v-if="duplicates.length === 0" class="text-center py-12">
                        <div class="text-5xl mb-4">✅</div>
                        <h3 class="text-lg font-bold text-slate-800">All Clear!</h3>
                        <p class="text-slate-500">No duplicate student ID suffixes were found.</p>
                    </div>

                    <div v-else class="space-y-4">
                        <div v-for="dup in duplicates" :key="dup.suffix"
                            class="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                            <div
                                class="bg-slate-100/50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                <span class="text-sm font-bold text-slate-700">Suffix: {{ dup.suffix }}</span>
                                <span
                                    class="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full">
                                    {{ dup.students.length }} Students
                                </span>
                            </div>
                            <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div v-for="(student, idx) in dup.students" :key="idx"
                                    class="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
                                    <div
                                        class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                        {{ student.name_prefix }}
                                    </div>
                                    <div class="min-w-0">
                                        <p class="text-sm font-bold text-slate-800 truncate">{{ student.name_prefix
                                            }}...</p>
                                        <p class="text-[10px] text-slate-500 font-medium">Section {{
                                            student.section_number }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <button @click="$emit('close')"
                        class="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200">
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
