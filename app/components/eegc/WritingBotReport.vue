<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white w-full max-w-5xl rounded-lg shadow-xl p-6 overflow-y-auto max-h-[90vh]">
      <!-- Header -->
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <h2 class="text-lg font-bold">📊 Learning Session Report</h2>
        <button class="text-gray-500 hover:text-gray-700 text-2xl" @click="$emit('close')">
          &times;
        </button>
      </div>

      <!-- Feedback Section -->
      <ReportFeedback v-if="props.mode === 'assessment'" :mode="props.mode" v-model:rating="rating"
        v-model:comment="comment" />


      <!-- Actions Section -->
      <ReportActions :generatingAnalysis="generatingAnalysis" :submitting="submitting" :submitted="submitted"
        @submit="submitReport" @downloadPDF="handleDownloadPDF" @downloadMarkdown="handleDownloadMarkdown"
        @copyReport="handleCopyReport" @close="$emit('close')" />

      <p><strong>Total Messages:</strong> {{ props.chatHistory.length }}</p>
      <h3>📈 Your Contribution Analysis</h3>
      <div
        class="prose prose-sm max-w-none break-words [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:list-disc"
        v-html="renderMarkdown(contributionAnalysis)" />

      <h3>📝 Complete Conversation</h3>
      <ReportChatHistory :chatHistory="chatHistory" :renderMarkdown="renderMarkdown" />

      <div class="text-sm text-gray-500 mt-4">Generated: {{ timestamp }}</div>
    </div>
  </div>
</template>

<script setup>
import MarkdownIt from "markdown-it";
import Swal from "sweetalert2";

import {
  ReportFeedback,
  ReportActions,
  ReportChatHistory,
  createMarkdownReport,
  downloadPDF,
  downloadMarkdownFile,
} from "./report";

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const emit = defineEmits(["submit", "close"]);
const props = defineProps({
  show: Boolean,
  chatHistory: {
    type: Array,
    default: () => [],
  },
  reportGenerationInstructions: {
    type: String,
  },
  bccEmail: {
    type: Array,
  },
  hiddenReport: {
    type: String,
  },
  ccEmail: {
    type: Array,
  },
  reprotInfo: {
    type: String,
  },
  mode: {
    type: String,
  },
});

const timestamp = ref("");
const contributionAnalysis = ref("[Analyzing contribution...]");
const generatingAnalysis = ref(true);
const rating = ref(0);
const comment = ref("");
const submitting = ref(false);
const submitted = ref(false);


watch(
  () => props.show,
  async (val) => {
    if (val) {
      timestamp.value = new Date().toLocaleString();
      if (props.chatHistory.length) {
        contributionAnalysis.value = "[Analyzing contribution...]";
        contributionAnalysis.value = await analyzeContribution(props.chatHistory, props);
      }
    }
  }
);

function renderMarkdown(text) {
  return markdown.render(text || "");
}

async function analyzeContribution(userMessages, props) {
  generatingAnalysis.value = true;
  try {
    const chat_history = [
      {
        role: "user",
        content: `${props.reportGenerationInstructions} here are the chat history ${JSON.stringify(
          userMessages
        )}`,
      },
    ];
    const res = await fetch("/api/poe-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_history,
        model_name: "gpt-5.2-instant",
        stream: false,
      }),
    });

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || data?.error || "[No response]";
  } catch (err) {
    console.error("Error analyzing contribution:", err);
    return "[Request failed]";
  } finally {
    generatingAnalysis.value = false;
  }
}

function handleDownloadPDF() {
  downloadPDF(props.chatHistory, contributionAnalysis.value);
}

function handleDownloadMarkdown() {
  const report = createMarkdownReport(props.chatHistory, contributionAnalysis.value);
  downloadMarkdownFile(report);
}

async function handleCopyReport() {
  try {
    const report = createMarkdownReport(props.chatHistory, contributionAnalysis.value);
    await navigator.clipboard.writeText(report);
    alert("✅ Full markdown report copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy report:", error);
    alert("❌ Failed to copy report.");
  }
}

async function submitReport() {
  const history = props.chatHistory;

  if (!history.length) {
    alert("No conversation to export");
    return;
  }


  submitting.value = true;

  try {
    const response = await fetch("/api/student/submit-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: rating.value,
        comment: comment.value,
        mode: props.mode,
        chat_history: history,
        contribution_analysis: contributionAnalysis.value,
        hidden_report: props.hiddenReport,
        report_info: props.reprotInfo,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || "Failed to submit report");
    }

    submitted.value = true;
    emit("submit");
    await Swal.fire({
      icon: "success",
      title: "Assessment Submitted",
      text: "Your assessment has been submitted successfully.",
      confirmButtonText: "OK",
    });
  } catch (error) {
    console.error("Submission error:", error);
    alert(`Error: ${error.message}`);
  } finally {
    submitting.value = false;
  }
}
</script>
