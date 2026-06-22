# Nuxt GitHub Issue Tracker

A serverless, lightweight analytics and user tracking solution for Nuxt applications. It leverages GitHub Issues as a free, quick, secure, and structured data store, bypassing the need for a traditional database setup.

## Features

- **Zero Database Costs:** Uses GitHub Issue Comments to log events, exceptions, or user behavior.
- **Visual Dashboard:** Read your analytics directly inside GitHub's clean Markdown interface.
- **Secure Integration:** Keeps your GitHub Token safe on the server-side, completely hidden from the client browser.

---

## Getting Started

### 1. Set Up GitHub

1. **Create a Repository:** Create a public or private GitHub repository (e.g., `track-data`) to store your tracking logs.
2. **Create a Target Issue:** Open a new issue in that repository (e.g., `#1: comments`). Note down the **Issue Number**.
3. **Generate a Personal Access Token (PAT):**
   - Go to GitHub **Settings** -> **Developer Settings** -> **Personal Access Tokens (Fine-grained)**.
   - Generate a token with **Read and Write** access to **Issues**.

### 2. Configure Your Nuxt Project

Add your secret token to your .env file:

```
NUXT_GH_TOKEN=github_pat_your_actual_token_here
NUXT_GH_OWNER=your-github-username,
NUXT_GH_REPO=your-repo-name,
NUXT_GH_ISSUE_NUMBER=1 // The target issue number
```

Add the server route code to `server/api/track.post.ts`. Then, configure your environment variables in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    // Secret key (Server-side only)
    GH_TOKEN: '',
    
    public: {
      // Configuration details exposed to server utilities safely
      GH_OWNER: '',
      GH_REPO: '',
      GH_ISSUE_NUMBER: '' 
    }
  }
})
```

### 3. Implement Frontend Tracking
Create a reusable tracking function or composable in your frontend application:

```typescript
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
```

Usage in Components:

```typescript
<script setup>
const { trackEvent } = useTrack()

onMounted(() => {
  // Track page view automatically
  trackEvent('page_view')
})

const handlePurchase = () => {
  // Track custom user interactions
  trackEvent('click_purchase', { itemId: 'sku_123', price: 99 })
}
</script>
```

### License
This project is licensed under the MIT License.