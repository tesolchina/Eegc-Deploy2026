<script setup lang="ts">
const props = withDefaults(defineProps<{
    redirectTo?: string
}>(), {
    redirectTo: '/aiedit'
})

onMounted(() => {
    const userStatus = localStorage.getItem('userStatus')
    if (userStatus !== 'student' && userStatus !== 'teacher') {
        navigateTo(props.redirectTo)
    }
})
</script>

<template>
    <div style="display: none;"></div>
</template>
