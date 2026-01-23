const dailyApiKey = process.env.NEXT_PUBLIC_DAILY_API_KEY!

export interface DailyConfig {
  apiKey: string
  domain: string
}

export const dailyConfig: DailyConfig = {
  apiKey: dailyApiKey,
  domain: process.env.NEXT_PUBLIC_DAILY_DOMAIN || '',
}

export async function createMeeting(projectId: string) {
  try {
    const response = await fetch('/api/meetings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId }),
    })

    if (!response.ok) {
      throw new Error('Failed to create meeting')
    }

    return await response.json()
  } catch (error) {
    console.error('Meeting creation error:', error)
    throw error
  }
}

export async function joinMeeting(sessionId: string) {
  try {
    window.location.href = `/api/meetings/join?sessionId=${sessionId}`
  } catch (error) {
    console.error('Join meeting error:', error)
    throw error
  }
}
