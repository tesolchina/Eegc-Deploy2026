<template>
    <div class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
        <div class="max-w-lg md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow text-base break-words"
            :class="msgClasses(message)">
            <div class="font-semibold text-xs mb-1">
                {{ msgSenderLabel(message.role) }}
            </div>
            <div class="prose prose-sm max-w-none break-words [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:list-disc"
                :class="{ 'pl-3': message.role !== 'user' }" v-html="renderMarkdown(message.content)" />
            <div class="text-xs text-gray-400 mt-2 text-right">
                {{ message.timestamp?.toLocaleTimeString?.() || '' }}
            </div>
        </div>
    </div>
</template>

<script setup>
import MarkdownIt from "markdown-it";

const props = defineProps({
    message: {
        type: Object,
        required: true,
    },
});

const markdown = new MarkdownIt({ linkify: true, typographer: true });
const renderMarkdown = (text = "") => markdown.render(text);

const msgSenderLabel = (role) => (role === "user" ? "You" : "AI Tutor");
const msgClasses = (msg) =>
    msg.role === "user"
        ? "bg-indigo-600 text-white rounded-br-none"
        : "bg-gray-100 text-gray-800 rounded-bl-none";
</script>
