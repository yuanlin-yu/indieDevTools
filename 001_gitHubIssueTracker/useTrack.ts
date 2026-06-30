// composables/useTrack.ts
export const useTrack = () => {
  const { fullPath } = useRoute();
  const trackEvent = async (eventName: string, metadata: Record<string, any> = {}) => {
    try {
      await $fetch('/api/track', {
        method: 'POST',
        body: {
          event: eventName,
          timestamp: new Date().toISOString(),
          currentUrl: fullPath,
          ...metadata
        }
      })
    } catch (err) {
      console.error('Tracking failed:', err)
    }
  }

  return { trackEvent }
}