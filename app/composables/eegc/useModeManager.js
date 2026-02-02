import Swal from 'sweetalert2'
import { MODE_GREETINGS } from '~/constants/eegcModes'
import { Sample_Essay } from './promptAndEssay'

export function useModeManager({ isConnected }) {
  const currentMode = ref('briefing')
  
  // Separate state by mode
  const trainingOriginalDraft = ref('')
  const trainingFinalDraft = ref('')
  const trainingIsSubmitted = ref(false)
  const trainingIsOriginalDraftConfirmed = ref(true) // Training starts confirmed by default in current logic

  const assessmentOriginalDraft = ref('')
  const assessmentFinalDraft = ref('')
  const assessmentIsSubmitted = ref(false)
  const assessmentIsOriginalDraftConfirmed = ref(false)
  
  // Active working state
  const originalDraft = ref('')
  const finalDraft = ref('')
  const isSubmitted = ref(false)
  const isOriginalDraftConfirmed = ref(false)
  
  // Chat histories per mode
  const trainingChatHistory = ref([])
  const assessmentChatHistory = ref([])
  const activeChatHistory = ref([])

  const makeChatHistoryEntry = (role, content) => ({
    role,
    content,
    timestamp: new Date(),
  })

  async function switchMode(mode) {
    if (!isConnected.value && mode !== 'briefing') {
      return Swal.fire({
        title: 'Not connected to API',
        text: 'Please connect to the chatbot API before switching modes.',
        icon: 'warning',
      })
    }

    // Save current mode's state
    if (currentMode.value === 'training') {
      trainingOriginalDraft.value = originalDraft.value
      trainingFinalDraft.value = finalDraft.value
      trainingIsSubmitted.value = isSubmitted.value
      trainingIsOriginalDraftConfirmed.value = isOriginalDraftConfirmed.value
    } else if (currentMode.value === 'assessment') {
      assessmentOriginalDraft.value = originalDraft.value
      assessmentFinalDraft.value = finalDraft.value
      assessmentIsSubmitted.value = isSubmitted.value
      assessmentIsOriginalDraftConfirmed.value = isOriginalDraftConfirmed.value
    }

    currentMode.value = mode

    const chatMap = {
      training: trainingChatHistory,
      assessment: assessmentChatHistory,
    }

    if (mode in chatMap) {
      activeChatHistory.value = chatMap[mode].value
      
      // Initialize chat history with greeting if empty
      if (!chatMap[mode].value.length) {
        chatMap[mode].value.push(makeChatHistoryEntry('assistant', MODE_GREETINGS[mode]))
      }

      // Load mode-specific state
      originalDraft.value =
        mode === 'training'
          ? trainingOriginalDraft.value || Sample_Essay
          : assessmentOriginalDraft.value || ''
      finalDraft.value =
        mode === 'training'
          ? trainingFinalDraft.value
          : assessmentFinalDraft.value
      
      isSubmitted.value =
        mode === 'training'
          ? trainingIsSubmitted.value
          : assessmentIsSubmitted.value
      
      isOriginalDraftConfirmed.value =
        mode === 'training'
          ? trainingIsOriginalDraftConfirmed.value
          : assessmentIsOriginalDraftConfirmed.value
    } else {
      activeChatHistory.value = []
    }
  }

  // Sync state changes to their mode-specific refs
  watch([originalDraft, finalDraft, isSubmitted, isOriginalDraftConfirmed, currentMode], () => {
    if (currentMode.value === 'training') {
      trainingOriginalDraft.value = originalDraft.value
      trainingFinalDraft.value = finalDraft.value
      trainingIsSubmitted.value = isSubmitted.value
      trainingIsOriginalDraftConfirmed.value = isOriginalDraftConfirmed.value
    } else if (currentMode.value === 'assessment') {
      assessmentOriginalDraft.value = originalDraft.value
      assessmentFinalDraft.value = finalDraft.value
      assessmentIsSubmitted.value = isSubmitted.value
      assessmentIsOriginalDraftConfirmed.value = isOriginalDraftConfirmed.value
    }
  })

  const confirmDraft = () => {
    if (!originalDraft.value.trim()) {
      return alert(
        currentMode.value === 'assessment'
          ? 'Please paste your essay first.'
          : 'Please paste the original draft first.'
      )
    }
    isOriginalDraftConfirmed.value = true
    finalDraft.value = originalDraft.value
  }

  const clearChatHistory = () => {
    activeChatHistory.value = []
  }

  return {
    currentMode,
    originalDraft,
    finalDraft,
    activeChatHistory,
    isSubmitted,
    isOriginalDraftConfirmed,
    switchMode,
    confirmDraft,
    clearChatHistory,
  }
}
