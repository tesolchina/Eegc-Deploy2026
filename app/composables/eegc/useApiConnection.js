export function useApiConnection({ model, showNotification, talkToChatbot }) {
  const isConnected = ref(false)
  const isConnecting = ref(false)

  async function connectAPI() {
    isConnecting.value = true

    try {
      const reply = await talkToChatbot([
        { role: 'system', content: 'connection test, return 1' },
        { role: 'user', content: 'Hello!' },
      ])
      isConnected.value = reply?.trim().length > 0
      showNotification(
        isConnected.value ? '✅ Connected!' : '⚠️ No valid reply',
        isConnected.value ? 'success' : 'error'
      )
    } catch {
      showNotification('❌ Connection failed', 'error')
    } finally {
      isConnecting.value = false
    }
  }

  const clearAPI = () => {
    isConnected.value = false
  }

  return {
    isConnected,
    isConnecting,
    connectAPI,
    clearAPI,
  }
}
