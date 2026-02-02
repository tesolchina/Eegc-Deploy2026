import Swal from 'sweetalert2'

export function useApiConnection({ model, showNotification, talkToChatbot }) {
  const isConnected = ref(false)
  const isConnecting = ref(false)

  async function connectAPI() {
    isConnecting.value = true
    isConnected.value = false

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out')), 15000)
      )

      const connectionPromise = talkToChatbot([
        { role: 'system', content: 'connection test, return 1' },
        { role: 'user', content: 'Hello!' },
      ])

      const reply = await Promise.race([connectionPromise, timeoutPromise])

      if (reply?.trim().length > 0) {
        isConnected.value = true
        showNotification('✅ Connected!', 'success')
      } else {
        throw new Error('No valid reply from chatbot')
      }
    } catch (error) {
      isConnected.value = false
      Swal.fire({
        title: 'Connection Failed',
        text: 'The chatbot is not responding. Please check your internet connection or try again later.',
        icon: 'error',
        confirmButtonColor: '#4f46e5',
      })
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

