<script setup lang="ts">
import Swal from 'sweetalert2'

useHead({
    title: 'Student Sign-up'
})

const form = ref({
    studentNumberSuffix: '',
    namePrefix: '',
    sectionNumber: ''
})

const isSubmitting = ref(false)
const generatedCode = ref('')

const goBack = () => {
    navigateTo('/aiedit')
}

const handleSubmit = async () => {
    if (!form.value.studentNumberSuffix || !form.value.namePrefix || !form.value.sectionNumber) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill in all fields!',
            confirmButtonColor: '#4f46e5'
        })
        return
    }

    if (form.value.studentNumberSuffix.length !== 4 || isNaN(Number(form.value.studentNumberSuffix))) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Student Number',
            text: 'Please enter the last 4 digits of your student number.',
            confirmButtonColor: '#4f46e5'
        })
        return
    }

    if (form.value.namePrefix.length !== 2) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Name Initials',
            text: 'Please enter the initials of your first and last name (2 letters). e.g. John Kwok → JK',
            confirmButtonColor: '#4f46e5'
        })
        return
    }

    isSubmitting.value = true

    try {
        const response = await $fetch('/api/student/signup', {
            method: 'POST',
            body: {
                student_number_suffix: parseInt(form.value.studentNumberSuffix),
                name_prefix: form.value.namePrefix,
                section_number: parseInt(form.value.sectionNumber)
            }
        })

        if (response.success) {
            const fullCode = `${form.value.studentNumberSuffix}-${form.value.namePrefix.toUpperCase()}-${response.random_code.toUpperCase()}`
            generatedCode.value = fullCode
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful!',
                html: `Your unique code is: <b class="text-2xl text-indigo-600 font-mono">${fullCode}</b><br><br>Please save this code to log in later.`,
                confirmButtonText: 'Great!',
                confirmButtonColor: '#4f46e5'
            })
        }
    } catch (error: any) {
        console.error('Signup error:', error)
        Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: error.statusMessage || error.data?.statusMessage || 'An error occurred during registration. Please try again.',
                confirmButtonColor: '#4f46e5'
            })
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <div class="p-8 text-center bg-indigo-600">
                <h1 class="text-3xl font-extrabold text-white mb-2">Student Sign-up</h1>
                <p class="text-indigo-100 italic">EEGC</p>
            </div>

            <div class="p-8 space-y-6">
                <!-- Success Message after Registration -->
                <div v-if="generatedCode" class="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 text-center">
                    <p class="text-indigo-800 font-medium mb-2">Your Registration Code:</p>
                    <div class="text-3xl font-black text-indigo-600 tracking-tight mb-4 font-mono">
                        {{ generatedCode }}
                    </div>
                    <p class="text-sm text-indigo-600">Please keep this code safe. You will need it to access your
                        portal.</p>
                    <button @click="goBack"
                        class="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
                        Go to Login
                    </button>
                </div>

                <!-- Registration Form -->
                <form v-else @submit.prevent="handleSubmit" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Student Number (Last 4
                            digits)</label>
                        <input v-model="form.studentNumberSuffix" type="text" maxlength="4" placeholder="e.g. 1234"
                            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            required>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Name Initials (First & Last Name)</label>
                        <p class="text-xs text-gray-500 mb-1">e.g. John Kwok → JK</p>
                        <input v-model="form.namePrefix" type="text" maxlength="2" placeholder="e.g. JK"
                            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none uppercase"
                            data-testid="input-name-prefix"
                            required>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                        <select v-model="form.sectionNumber"
                            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                            data-testid="select-section"
                            required>
                            <option value="" disabled>Select your section</option>
                            <option v-for="n in 3" :key="n" :value="String(n)">Section {{ n }}</option>
                        </select>
                    </div>

                    <button type="submit" :disabled="isSubmitting"
                        class="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="isSubmitting">Creating your ID...</span>
                        <span v-else>Register & Get My Code ✨</span>
                    </button>
                </form>

                <div v-if="!generatedCode" class="text-center">
                    <button @click="goBack"
                        class="text-sm font-medium text-gray-500 hover:text-indigo-600 flex items-center justify-center mx-auto">
                        <span class="mr-1">←</span> Back to Login
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
