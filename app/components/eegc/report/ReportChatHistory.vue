<template>
  <div class="report-chat-history mt-4">
    <ChatMessageList :messages="chatHistory" />
  </div>
</template>

<script setup>
import ChatMessageList from "../chat/ChatMessageList.vue";

defineProps({
  chatHistory: {
    type: Array,
    default: () => [],
  },
  renderMarkdown: Function,
});
</script>

