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
      <ReportFeedback
        v-if="props.mode === 'assessment'"
        :mode="props.mode"
        v-model:rating="rating"
        v-model:comment="comment"
      />

      <!-- Student Information Section -->
      <ReportStudentInfo
        v-model:studentEmail="student_email"
        v-model:studentNumber="student_number"
        v-model:confirmStudentNumber="confirm_student_number"
        v-model:sectionNumber="section_number"
        :teacherName="teacher_name"
        :teacherEmail="teacher_email"
      />

      <!-- Actions Section -->
      <ReportActions
        :generatingAnalysis="generatingAnalysis"
        :submitting="submitting"
        :submitted="submitted"
        @submit="submitReport"
        @downloadPDF="handleDownloadPDF"
        @downloadMarkdown="handleDownloadMarkdown"
        @copyReport="handleCopyReport"
        @close="$emit('close')"
      />

      <p><strong>Total Messages:</strong> {{ props.chatHistory.length }}</p>
      <h3>📈 Your Contribution Analysis</h3>
      <div
        class="prose prose-sm max-w-none break-words [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:list-disc"
        v-html="renderMarkdown(contributionAnalysis)"
      />

      <h3>📝 Complete Conversation</h3>
      <ReportChatHistory
        :chatHistory="chatHistory"
        :renderMarkdown="renderMarkdown"
      />

      <div class="text-sm text-gray-500 mt-4">Generated: {{ timestamp }}</div>
    </div>
  </div>
</template>

<script setup>
import MarkdownIt from "markdown-it";
import studentSectionMap from "~/components/eegc/student_section_map.json";
import sectionInfoMap from "~/components/eegc/section_info_map.json";
import Swal from "sweetalert2";

import ReportFeedback from "./report/ReportFeedback.vue";
import ReportStudentInfo from "./report/ReportStudentInfo.vue";
import ReportActions from "./report/ReportActions.vue";
import ReportChatHistory from "./report/ReportChatHistory.vue";
import {
  createMarkdownReport,
  downloadPDF,
  downloadMarkdownFile,
  isValidEmail,
} from "./report/reportUtils";

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
const student_number = ref("");
const confirm_student_number = ref("");
const section_number = ref("");
const contributionAnalysis = ref("[Analyzing contribution...]");
const generatingAnalysis = ref(true);
const teacher_name = ref("");
const teacher_email = ref("");
const rating = ref(0);
const comment = ref("");
const student_email = ref("@life.hkbu.edu.hk");
const submitting = ref(false);
const submitted = ref(false);

watch(student_number, (newVal) => {
  if (newVal && studentSectionMap[newVal]) {
    const secNum = studentSectionMap[newVal];
    section_number.value = secNum;
    teacher_name.value = sectionInfoMap[secNum].teacher;
    teacher_email.value = sectionInfoMap[secNum].email;
  } else {
    section_number.value = "";
    teacher_name.value = "No Teacher Found";
    teacher_email.value = "Please Check Your Student Number";
  }
});

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

  if (student_number.value !== confirm_student_number.value) {
    alert("Student number does not match!");
    return;
  }

  if (!isValidEmail(student_email.value)) {
    alert("Please enter a valid email address");
    return;
  }

  submitting.value = true;

  try {
    const response = await fetch("/api/student/submit-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_number: student_number.value,
        student_email: student_email.value,
        section_number: section_number.value,
        rating: rating.value,
        comment: comment.value,
        mode: props.mode,
        teacher_name: teacher_name.value,
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
