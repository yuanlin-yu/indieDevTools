// composables/useTrack.ts
export const useTrack = () => {
  const trackEvent = async (eventName: string, metadata: Record<string, any> = {}) => {
    try {
      await $fetch('/api/track', {
        method: 'POST',
        body: {
          event: eventName,
          timestamp: Date.now(),
          currentUrl: window.location.href,
          ...metadata
        }
      })
    } catch (err) {
      console.error('Tracking failed:', err)
    }
  }

  return { trackEvent }
}