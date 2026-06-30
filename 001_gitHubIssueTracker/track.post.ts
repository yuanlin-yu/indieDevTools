// server/api/track.post.ts

// Define the structure of the incoming analytics payload
interface AnalyticsPayload {
  event: string;
  timestamp: number;
  currentUrl: string;
  [key: string]: any; // Allows additional dynamic tracking metadata
}

export default defineEventHandler(async (event) => {
  try {
    // 1. Parse and validate the request body from the frontend
    const body = await readBody<AnalyticsPayload>(event)

    // 2. Load runtime configurations
    const config = useRuntimeConfig()
    const token = config.GH_TOKEN
    
    // It's highly recommended to fetch these from config/env as well
    const owner = config.GH_OWNER 
    const repo = config.GH_REPO 
    const issueNumber = config.GH_ISSUE_NUMBER 

    // 3. Verify GitHub Personal Access Token availability
    if (!token) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration missing: GH_TOKEN'
      })
    }

    // 4. Construct GitHub API endpoint for the specific issue
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`
    
    // 5. Post the analytics data as an issue comment
    await $fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        // Stringify the payload to format it nicely inside the Markdown codeblock
        body: JSON.stringify(body)
      }
    })

    return {
      success: true,
      message: 'Analytics event tracked successfully.'
    }

  } catch (error: any) {
    console.error('Failed to log tracking event:', error)

    return {
      success: false,
      message: error.message || 'Tracking failed, please try again later.'
    }
  }
})