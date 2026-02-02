export function useNotification() {
  const notification = ref({
    message: '',
    type: 'success',
    visible: false,
  })

  const showNotification = (msg, type = 'success') => {
    notification.value = { message: msg, type, visible: true }
    setTimeout(() => {
      notification.value.visible = false
    }, 3000)
  }

  return {
    notification,
    showNotification,
  }
}
