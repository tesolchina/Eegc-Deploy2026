<template>
  <div class="chat-interface flex-1 flex flex-col h-full">
    <div class="flex-1 p-5 overflow-hidden">
      <div class="w-full mx-auto flex gap-4" style="height: 80vh">
        <!-- Left: Chat messages + input -->
        <div class="flex flex-col w-1/2 h-full">
          <!-- Chat history -->
          <div ref="chatMessages"
            class="chat-messages flex-1 overflow-y-auto p-5 space-y-4 border rounded-t-lg bg-white">
            <div v-for="(msg, i) in activeChatHistory" :key="`${i}-${msg.content?.length || 0}`" class="flex"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div class="max-w-lg md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow text-base break-words"
                :class="msgClasses(msg)">
                <div class="font-semibold text-xs mb-1">
                  {{ msgSenderLabel(msg.role) }}
                </div>
                <div
                  class="prose prose-sm max-w-none break-words [&_pre]:whitespace-pre-wrap [&_code]:whitespace-pre-wrap [&_ol]:list-decimal [&_ul]:list-disc"
                  v-html="renderMarkdown(msg.content)" />
                <div class="text-xs text-gray-400 mt-2 text-right">
                  {{ msg.timestamp?.toLocaleTimeString?.() || '' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Chat input -->
          <div class="mt-0 flex gap-2 items-start relative bg-gray-50 p-3 border border-t-0 rounded-b-lg">
            <div class="flex-1 flex flex-col-reverse">
              <textarea v-model="localUserMessage" :style="{ height: inputHeight + 'px' }" :placeholder="isConnected ? 'Type your message...' : 'Please connect to API first...'
                "
                class="border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                @keyup.enter.exact.prevent="$emit('sendMessage')" :disabled="isThinking || !isConnected"
                ref="chatInput"></textarea>

              <div class="h-2 cursor-ns-resize bg-transparent hover:bg-indigo-200 transition-colors rounded-t-lg"
                @mousedown="startDrag" @touchstart.prevent="startDrag"></div>
            </div>

            <button @click="$emit('sendMessage')"
              class="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
              :disabled="isThinking || !isConnected || isSubmitted">
              {{ isThinking ? "Thinking..." : "Send" }}
            </button>
          </div>
        </div>

        <!-- Right: Draft area -->
        <div class="flex-1 space-y-4 overflow-y-auto h-full pr-2">
          <!-- Original Draft -->
          <div class="bg-gray-100 border border-gray-300 text-gray-800 rounded-md p-4 mb-4"
            v-if="currentMode == 'training'">
            Topic: Some people believe that individual actions are insignificant in the fight
            against climate change compared to the efforts of governments and large corporations. To
            what extent do you agree or disagree with this statement?
          </div>
          <div class="bg-gray-100 border border-gray-300 text-gray-800 rounded-md p-4 mb-4" v-else>
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-800">Select Topic</p>

              <div class="space-y-3">
                <!-- Automation block -->
                <button type="button"
                  class="w-full text-left rounded-lg border p-3 sm:p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  :class="currentTopic === 'Automation'
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    " @click="selectTopic('Automation')" role="radio"
                  :aria-checked="(currentTopic === 'Automation').toString()">
                  <p class="text-xs sm:text-sm font-semibold mb-1"
                    :class="currentTopic === 'Automation' ? 'text-indigo-700' : 'text-gray-800'">
                    Automation
                  </p>
                  <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    Automation is transforming industries, potentially reducing jobs while boosting
                    efficiency. Does this technological shift ultimately enhance or undermine global
                    employment prospects in the long term?
                  </p>
                </button>

                <!-- Migrant Workers block -->
                <button type="button"
                  class="w-full text-left rounded-lg border p-3 sm:p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  :class="currentTopic === 'Migrant'
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    " @click="selectTopic('Migrant')" role="radio"
                  :aria-checked="(currentTopic === 'Migrant').toString()">
                  <p class="text-xs sm:text-sm font-semibold mb-1"
                    :class="currentTopic === 'Migrant' ? 'text-indigo-700' : 'text-gray-800'">
                    Migrant Workers
                  </p>
                  <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    Migrant workers face exploitation due to weak regulations, enduring long hours
                    and unfair pay. Should governments enforce stricter laws to safeguard their
                    rights?
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white p-4 rounded-lg shadow">
            <h2 class="text-lg font-bold mb-2">
              {{ currentMode === "assessment" ? "Your Original Essay" : "Original Draft" }}
            </h2>

            <textarea v-model="localOriginalDraft" rows="7" :placeholder="currentMode === 'assessment'
              ? 'Paste your original essay here...'
              : 'Paste or write the original draft here...'
              " class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :disabled="isOriginalDraftConfirmed" />

            <button @click="$emit('confirmDraft')"
              class="w-full mt-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isOriginalDraftConfirmed">
              {{
                currentMode === "assessment"
                  ? isOriginalDraftConfirmed
                    ? "Essay Confirmed"
                    : "Confirm Your Essay"
                  : isOriginalDraftConfirmed
                    ? "Draft Confirmed (Training)"
                    : "Confirm Training Draft"
              }}
            </button>
          </div>
          <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 class="text-md font-semibold mb-2 text-gray-700">Checklist</h3>
            <ul style="list-style: none; padding: 0; margin: 0">
              <li style="margin-bottom: 8px">
                <label> <input type="checkbox" /> Step 1: Revise thesis statement </label>
              </li>
              <li style="margin-bottom: 8px">
                <label> <input type="checkbox" /> Step 2: Revise topic sentences </label>
              </li>
              <li style="margin-bottom: 8px">
                <label> <input type="checkbox" /> Step 3: Revise one body paragraph </label>
              </li>
              <li style="margin-bottom: 8px">
                <label>
                  <input type="checkbox" /> Step 4 (optional): Revise the rest of the essay
                </label>
              </li>
              <li>
                <label> <input type="checkbox" /> Step 5: Submit the final draft </label>
              </li>
            </ul>
          </div>
          <!-- Final Draft -->
          <div class="bg-white p-4 rounded-lg shadow">
            <h2 class="text-lg font-bold mb-2">
              {{ currentMode === "assessment" ? "Revised Version" : "Final Draft" }}
            </h2>
            <div class="bg-gray-100 border border-gray-300 text-gray-800 rounded-md p-4 mb-4">
              Please revise the texts in the box below and complete the steps in the checklist
              above. When finished, please click the blue button to confirm the final draft and
              generate report. You will be asked to enter your name and student ID to receive the
              chat history and report via email.
            </div>
            <div class="relative w-full">
              <textarea v-model="localFinalDraft" rows="7" :placeholder="currentMode === 'assessment'
                ? 'This will be updated automatically as you revise through chat...'
                : 'Paste or write the improved draft here...'
                " class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                :disabled="!isOriginalDraftConfirmed" />
            </div>

            <button @click="
              currentMode === 'assessment'
                ? $emit('submitAssessment')
                : $emit('confirmFinalDraft')
              "
              class="w-full mt-2 px-3 py-2 text-white rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              :class="currentMode === 'assessment' ? 'bg-green-600' : 'bg-blue-600'" :disabled="!isOriginalDraftConfirmed ||
                isGeneratingAssessment ||
                isSubmitted ||
                isThinking
                ">
              <span v-if="isGeneratingAssessment">
                {{
                  currentMode === "assessment"
                    ? "🔄 Generating Assessment..."
                    : "🔄 Generating Report..."
                }}
              </span>
              <span v-else>
                {{
                  currentMode === "assessment"
                    ? "✅ Submit Assessment"
                    : "✅ Confirm Final Draft & Generate Report"
                }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import MarkdownIt from "markdown-it";

const props = defineProps({
  activeChatHistory: Array,
  currentMode: String,
  bulletPoints: String,
  isConnected: Boolean,
  isThinking: Boolean,
  isUpdatingDraft: Boolean,
  isSubmitted: Boolean,
  isGeneratingAssessment: Boolean,
  isOriginalDraftConfirmed: Boolean,
  userMessage: String,
  originalDraft: String,
  finalDraft: String,
});

const emits = defineEmits([
  "update:userMessage",
  "update:originalDraft",
  "update:finalDraft",
  "update:currentTopic",
  "sendMessage",
  "confirmDraft",
  "submitAssessment",
  "confirmFinalDraft",
]);

const trainingBulletPoints = ref("No bullet points extracted yet.");
const assessmentBulletPoints = ref("No bullet points extracted yet.");
const currentTopic = ref("Automation");

onMounted(() => {
  if (props.currentMode == "training") {
    localFinalDraft.value = props.originalDraft;
  }
});

watch(
  () => props.bulletPoints,
  (newVal) => {
    if (props.currentMode === "training") {
      trainingBulletPoints.value = newVal || "";
    } else if (props.currentMode === "assessment") {
      assessmentBulletPoints.value = newVal || "";
    }
  },
  { immediate: true }
);

function selectTopic(topic) {
  currentTopic.value = topic;
  emits("update:currentTopic", topic);
}


const localUserMessage = ref(props.userMessage);
const localOriginalDraft = ref(props.originalDraft);
const localFinalDraft = ref(props.finalDraft);

const bindSync = (localRef, propName) => {
  watch(localRef, (v) => emits(`update:${propName}`, v));
  watch(
    () => props[propName],
    (v) => (localRef.value = v)
  );
};
bindSync(localUserMessage, "userMessage");
bindSync(localOriginalDraft, "originalDraft");
bindSync(localFinalDraft, "finalDraft");

const markdown = new MarkdownIt({ linkify: true, typographer: true });
const renderMarkdown = (text = "") => markdown.render(text);

const msgSenderLabel = (role) => (role === "user" ? "You" : "AI Tutor");
const msgClasses = (msg) =>
  msg.role === "user"
    ? "bg-indigo-600 text-white rounded-br-none"
    : "bg-gray-100 text-gray-800 rounded-bl-none";

const chatMessages = ref(null);
function scrollToBottom() {
  nextTick(() => {
    if (chatMessages.value) chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
  });
}
watch(() => props.activeChatHistory, scrollToBottom, { deep: true, flush: "post" });

watch(() => props.isThinking, (isThinking) => {
  if (!isThinking) {
    nextTick(() => {
      chatInput.value?.focus();
    });
  }
});

const chatInput = ref(null);
const inputHeight = ref(80);
let dragState = { startY: 0, startHeight: 0 };

function startDrag(e) {
  const y = e.touches?.[0]?.clientY ?? e.clientY;
  dragState = { startY: y, startHeight: chatInput.value.offsetHeight };

  const move = (ev) => {
    const currentY = ev.touches?.[0]?.clientY ?? ev.clientY;
    const diff = dragState.startY - currentY;
    inputHeight.value = Math.max(60, Math.min(400, dragState.startHeight + diff));
  };
  const stop = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", stop);
    window.removeEventListener("touchmove", move);
    window.removeEventListener("touchend", stop);
  };
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", stop);
  window.addEventListener("touchmove", move);
  window.addEventListener("touchend", stop);
}
</script>
