<script setup lang="ts">
onMounted(() => {
    const userStatus = localStorage.getItem('userStatus')
    if (userStatus !== 'student' && userStatus !== 'teacher') {
        navigateTo('/')
    }
})
</script>

<template>
    <!-- AuthGuard Component: Performs client-side auth check -->
    <div style="display: none;"></div>
</template>
