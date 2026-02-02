<template>
  <!-- Main Content -->
  <div class="w-full p-4 flex-1 flex flex-col">
    <!-- Header -->
    <EegcCourseHeader />
    
    <!-- Mode Selection -->
    <EegcModeSelector
      :currentMode="currentMode"
      :isThinking="isThinking"
      :modeLabels="MODE_LABELS"
      :modeColors="MODE_COLORS"
      :is-open="isModeSelectorOpen"
      @switch-mode="switchMode"
      @toggle-open="isModeSelectorOpen = $event"
    />
    
    <div
      class="flex-1 transition-all duration-500 ease-in-out p-4"
      :class="isModeSelectorOpen ? 'ml-64' : 'ml-0'"
    >
      <!-- Briefing Mode -->
      <template v-if="currentMode === 'briefing'">
        <EegcBriefingModeContent
          v-model:model="model"
          :isConnecting="isConnecting"
          :isConnected="isConnected"
          :notification="notification"
          @connect="connectAPI"
          @clear="handleClearAPI"
        />
        <EegcBriefMode />
      </template>

      <!-- Training Tutorial Section -->
      <EegcTrainingTutorialSection
        v-if="currentMode === 'training'"
        :isVisible="isTrainingTutorialVisible"
        @toggle="isTrainingTutorialVisible = !isTrainingTutorialVisible"
      />

      <!-- Background and Rubrics for Training Mode -->
      <EegcBackgroundAndRubrics
        v-if="currentMode === 'training'"
        v-model:courseInfo="courseInfo"
        v-model:currentMode="currentMode"
        v-model:isShowArea="isTrainingBackgroundAreaVisible"
        v-model:isSubmitted="hasSubmittedTrainingBackground"
        @submitAll="handleSubmitRubrics"
        @toggleArea="isTrainingBackgroundAreaVisible = $event"
      />

      <!-- Background and Rubrics for Assessment Mode -->
      <EegcBackgroundAndRubrics
        v-if="currentMode === 'assessment'"
        v-model:courseInfo="courseInfoAssessment"
        v-model:currentMode="currentMode"
        v-model:isShowArea="isAssessmentBackgroundAreaVisible"
        v-model:isSubmitted="hasSubmittedAssessmentBackground"
        @submitAll="handleSubmitRubrics"
        @toggleArea="isAssessmentBackgroundAreaVisible = $event"
      />

      <!-- Chat Interface -->
      <EegcChatInterface
        v-if="
          (currentMode === 'training' && hasSubmittedTrainingBackground) ||
          (currentMode === 'assessment' && hasSubmittedAssessmentBackground)
        "
        v-model:userMessage="userMessage"
        v-model:originalDraft="originalDraft"
        v-model:finalDraft="finalDraft"
        :activeChatHistory="activeChatHistory"
        :currentMode="currentMode"
        :isConnected="isConnected"
        :isThinking="isThinking"
        :isUpdatingDraft="isUpdatingDraft"
        :isGeneratingAssessment="isGeneratingAssessment"
        :isOriginalDraftConfirmed="isOriginalDraftConfirmed"
        :isSubmitted="isSubmitted"
        :bulletPoints="bulletPoints"
        @sendMessage="sendMessage"
        @confirmDraft="confirmDraft"
        @submitAssessment="submitAssessment"
        @confirmFinalDraft="confirmFinalDraft"
        @update:currentTopic="handleTopicChange"
      />

      <!-- Report Modal -->
      <EegcWritingBotReport
        v-bind="{
          show: showReport,
          chatHistory: reportChatHistory,
          reportGenerationInstructions,
          hiddenReport,
          bccEmail,
          ccEmail,
          reprotInfo,
          mode: currentMode,
        }"
        @close="showReport = false"
        @submit="isSubmitted = true"
      />
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { MODE_COLORS, MODE_LABELS } from '~/constants/eegcModes'
import { Rubric, Sample_Essay } from '~/composables/eegc/promptAndEssay'
import { useNotification } from '~/composables/eegc/useNotification'
import { useApiConnection } from '~/composables/eegc/useApiConnection'
import { useModeManager } from '~/composables/eegc/useModeManager'
import { useReportGenerator } from '~/composables/eegc/useReportGenerator'

/* ------------ Core State ------------ */
const model = ref('gpt-5.2-instant')
const userMessage = ref('')
const bulletPoints = ref('No bullet points extracted yet.')
const isUpdatingDraft = ref(false)
const isSubmitted = ref(false)
const isModeSelectorOpen = ref(true)
const isTrainingTutorialVisible = ref(false)
const isTrainingBackgroundAreaVisible = ref(true)
const isAssessmentBackgroundAreaVisible = ref(true)
const hasSubmittedTrainingBackground = ref(false)
const hasSubmittedAssessmentBackground = ref(false)

/* ------------ Course Information ------------ */
const courseInfo = ref(`Course Information:
Course: LANG 0036 - English for Academic Purposes
Level: Intermediate to Advanced
Focus: Academic writing and critical thinking
Assessment: Essay writing with rubric-based evaluation\n
Student Background:
Academic Level: University student
Language: English as additional language
Goals: Improve academic writing skills
Challenges: Structure, vocabulary, critical analysis\n
Rubric:
${Rubric}`)

const courseInfoAssessment = ref(`
  Course Information:
  Course:
  Level:
  Focus:
  Assessment: \n
  Student Background:
  Academic Level:
  Language:
  Goals:
  Challenges: \n
  Rubric:
`)

const currentTopic = ref(`Some people believe that individual actions are insignificant in the fight
            against climate change compared to the efforts of governments and large corporations. To
            what extent do you agree or disagree with this statement?`)

/* ------------ Composables ------------ */
const { notification, showNotification } = useNotification()

// Create shared refs to break circular dependency
const isConnected = ref(false)
const isConnecting = ref(false)
const isThinking = ref(false)

const {
  currentMode,
  originalDraft,
  finalDraft,
  activeChatHistory,
  isOriginalDraftConfirmed,
  switchMode,
  confirmDraft,
  clearChatHistory,
} = useModeManager({ isConnected })

const { sendMessage, talkToChatbot } = useChatFunctions({
  userMessage,
  currentMode,
  activeChatHistory,
  originalDraft,
  finalDraft,
  bulletPoints,
  isConnected,
  model,
  isThinking,
  isOriginalDraftConfirmed,
  isUpdatingDraft,
  courseInfo,
  courseInfoAssessment,
  currentTopic,
})

const apiConnection = useApiConnection({
  model,
  showNotification,
  talkToChatbot,
})

// Sync API connection state with our refs
watch(() => apiConnection.isConnected.value, (val) => {
  isConnected.value = val
})
watch(() => apiConnection.isConnecting.value, (val) => {
  isConnecting.value = val
})

const connectAPI = apiConnection.connectAPI
const clearAPI = apiConnection.clearAPI

const reportGenerator = useReportGenerator({
  currentMode,
  originalDraft,
  finalDraft,
  activeChatHistory,
  isOriginalDraftConfirmed,
  courseInfo,
  courseInfoAssessment,
  talkToChatbot,
  showNotification,
})

// Sync report generator's isThinking with our ref
watch(() => reportGenerator.isThinking.value, (val) => {
  isThinking.value = val
})

const {
  isGeneratingAssessment,
  showReport,
  reportChatHistory,
  reportGenerationInstructions,
  hiddenReport,
  bccEmail,
  ccEmail,
  reprotInfo,
  submitAssessment,
  confirmFinalDraft,
} = reportGenerator

/* ------------ Event Handlers ------------ */
function handleClearAPI() {
  clearAPI()
  clearChatHistory()
}

function handleTopicChange(newTopic) {
  if (newTopic.toLowerCase() === 'automation') {
    currentTopic.value = `Automation is transforming industries, potentially reducing jobs while boosting
                  efficiency. Does this technological shift ultimately enhance or undermine global
                  employment prospects in the long term?`
  } else if (newTopic.toLowerCase() === 'migrant') {
    currentTopic.value = `Migrant workers face exploitation due to weak regulations, enduring long hours and
                  unfair pay. Should governments enforce stricter laws to safeguard their rights?`
  }
}

function handleSubmitRubrics(newBackground) {
  if (currentMode.value === 'assessment') {
    hasSubmittedAssessmentBackground.value = true
    courseInfoAssessment.value = newBackground
    Swal.fire({
      title: 'Rubrics Submitted!',
      text: 'The information is sent to AI tutor.',
      icon: 'success',
    })
  } else {
    hasSubmittedTrainingBackground.value = true
    courseInfo.value = newBackground
    navigator.clipboard.writeText(Rubric)
    Swal.fire({
      title: 'Rubrics Submitted!',
      text: `The information have been submitted. Please note that this is training mode, so the
      information has been pre-filled for your convenience. You will be required to enter it
      manually in assessment mode. The rubrics have also been copied to your clipboard for easy pasting later.`,
      icon: 'success',
    })
  }
}

/* ------------ Lifecycle ------------ */
const handleBeforeUnload = (e) => {
  if (!isSubmitted.value) {
    e.preventDefault()
    e.returnValue = ''
    Swal.fire({
      text: 'You have not sent the report yet. Please make sure to submit before leaving.',
      icon: 'warning',
    })
  }
}

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  switchMode(currentMode.value)
  connectAPI()
})

onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload))
</script>
