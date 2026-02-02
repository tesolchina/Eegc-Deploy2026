import Swal from 'sweetalert2'
import { AssessBot_Prompt } from './promptAndEssay'

export function useReportGenerator({
  currentMode,
  originalDraft,
  finalDraft,
  activeChatHistory,
  isOriginalDraftConfirmed,
  courseInfo,
  courseInfoAssessment,
  talkToChatbot,
  showNotification,
}) {
  const isGeneratingAssessment = ref(false)
  const isThinking = ref(false)
  const showReport = ref(false)
  const reportChatHistory = ref([])
  const reportGenerationInstructions = ref('')
  const hiddenReport = ref('')
  const bccEmail = ref([])
  const ccEmail = ref([])
  const reprotInfo = ref('')
  const isTrainingModeFinished = ref(false)

  const makeChatHistoryEntry = (role, content) => ({
    role,
    content,
    timestamp: new Date(),
  })

  const makeReportTemplate = (mode) =>
    mode === 'training'
      ? 'Please provide a student training progress report emphasizing AI collaboration.'
      : 'Please provide a comprehensive assessment based on the essay and chat history.'

  const makeReportHeader = (mode, body) =>
    `${
      mode === 'training' ? 'TRAINING' : 'FINAL'
    } ASSESSMENT REPORT\n\n${body}\n\n(Do not mention scores. Also do not mention that the score is hidden. Do not mention "remove all scores and numerical references" or similar things. Do not mention anything like "align with your requirements " You should process as if there were no score.)`

  async function generateAssessmentReport(mode = 'final') {
    isGeneratingAssessment.value = true
    isThinking.value = true
    
    try {
      const data = {
        original: originalDraft.value || '(empty)',
        revised: finalDraft.value || '(empty)',
        chat: activeChatHistory.value.map(({ role, content, timestamp }) => ({
          role,
          content,
          timestamp,
        })),
      }

      const report = await talkToChatbot([
        {
          role: 'system',
          content: `
                  Check whether the student has completed the following tasks:
                    1. Revised the thesis statement
                    2. Revised one of the topic sentence
                    3. Revised one of the body paragraph

                    If the student has not completed any of the above tasks, then you should say 'not finished'.

                    Then execute the following:
                    ${AssessBot_Prompt}\n\n${JSON.stringify(data, null, 2)}`,
        },
        { role: 'user', content: makeReportTemplate(mode) },
      ])

      if (report.includes('not finish')) {
        const result = await Swal.fire({
          text: 'It seems that you have not revised all the required components (thesis statement, topic sentence, body paragraph). Please make sure to complete these revisions before generating the report.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Confirm to Submit',
          cancelButtonText: 'Back to editing',
          reverseButtons: true,
        })

        if (!result.isConfirmed) {
          isGeneratingAssessment.value = false
          return
        }
        isGeneratingAssessment.value = false
      }

      hiddenReport.value = report
      isTrainingModeFinished.value = true
      reportGenerationInstructions.value = makeReportHeader(mode, report)
      reportChatHistory.value = [
        makeChatHistoryEntry('system', `Original:\n${data.original}\n\nRevised:\n${data.revised}`),
        ...activeChatHistory.value,
      ]

      bccEmail.value =
        currentMode.value === 'training'
          ? ['simonwanghkteacher@gmail.com', 'azikabanyuki2@gmail.com']
          : ['simonwanghkteacher+test@gmail.com', 'azikabanyuki2@gmail.com']

      if (currentMode.value === 'training') {
        reprotInfo.value = courseInfo.value
      } else if (currentMode.value === 'assessment') {
        reprotInfo.value = courseInfoAssessment.value
      }

      showReport.value = true
      showNotification(`📊 ${mode === 'training' ? 'Training' : 'Assessment'} report generated!`)
    } catch (e) {
      console.error(e)
      showNotification('⚠️ Error generating report — fallback used', 'error')
    } finally {
      isGeneratingAssessment.value = false
      isThinking.value = false
    }
  }

  const submitAssessment = async () => {
    if (!isOriginalDraftConfirmed.value) {
      return alert('Please confirm your original essay first.')
    }
    await generateAssessmentReport('final')
  }

  const confirmFinalDraft = async () => {
    if (!originalDraft.value.trim() || !finalDraft.value.trim()) {
      return alert('Please paste your final draft first.')
    }
    await generateAssessmentReport('training')
  }

  return {
    isGeneratingAssessment,
    isThinking,
    showReport,
    reportChatHistory,
    reportGenerationInstructions,
    hiddenReport,
    bccEmail,
    ccEmail,
    reprotInfo,
    isTrainingModeFinished,
    submitAssessment,
    confirmFinalDraft,
  }
}
