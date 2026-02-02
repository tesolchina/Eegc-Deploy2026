import Swal from 'sweetalert2'
import { MODE_GREETINGS } from '~/constants/eegcModes'
import { Sample_Essay } from './promptAndEssay'

export function useModeManager({ isConnected }) {
  const currentMode = ref('briefing')
  
  // Separate drafts by mode
  const trainingOriginalDraft = ref('')
  const trainingFinalDraft = ref('')
  const assessmentOriginalDraft = ref('')
  const assessmentFinalDraft = ref('')
  
  // Active working drafts
  const originalDraft = ref('')
  const finalDraft = ref('')
  
  // Chat histories per mode
  const trainingChatHistory = ref([])
  const assessmentChatHistory = ref([])
  const activeChatHistory = ref([])
  
  // Draft confirmation state
  const isOriginalDraftConfirmed = ref(false)

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

    // Save current mode's drafts
    if (currentMode.value === 'training') {
      trainingOriginalDraft.value = originalDraft.value
      trainingFinalDraft.value = finalDraft.value
    } else if (currentMode.value === 'assessment') {
      assessmentOriginalDraft.value = originalDraft.value
      assessmentFinalDraft.value = finalDraft.value
    }

    currentMode.value = mode
    
    // Set draft confirmation state based on mode
    if (mode === 'training') {
      isOriginalDraftConfirmed.value = true
    } else {
      isOriginalDraftConfirmed.value = false
    }

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

      // Load mode-specific drafts
      originalDraft.value =
        mode === 'training'
          ? trainingOriginalDraft.value || Sample_Essay
          : assessmentOriginalDraft.value || ''
      finalDraft.value = 
        mode === 'training' 
          ? trainingFinalDraft.value 
          : assessmentFinalDraft.value
    } else {
      activeChatHistory.value = []
    }
  }

  // Sync draft changes to their mode-specific refs
  watch([originalDraft, finalDraft, currentMode], () => {
    if (currentMode.value === 'training') {
      trainingOriginalDraft.value = originalDraft.value
      trainingFinalDraft.value = finalDraft.value
    } else if (currentMode.value === 'assessment') {
      assessmentOriginalDraft.value = originalDraft.value
      assessmentFinalDraft.value = finalDraft.value
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
    isOriginalDraftConfirmed,
    switchMode,
    confirmDraft,
    clearChatHistory,
  }
}
