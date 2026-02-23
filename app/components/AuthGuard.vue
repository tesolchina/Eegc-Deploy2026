<script setup lang="ts">
const props = withDefaults(defineProps<{
    redirectTo?: string
}>(), {
    redirectTo: '/aiedit'
})

const isAuthenticated = ref(false)

onMounted(() => {
    const userStatus = localStorage.getItem('userStatus')
    if (userStatus !== 'student' && userStatus !== 'teacher') {
        navigateTo(props.redirectTo)
    } else {
        isAuthenticated.value = true
    }
})

provide('authGuardAuthenticated', isAuthenticated)
</script>

<template>
    <div style="display: none;"></div>
</template>
