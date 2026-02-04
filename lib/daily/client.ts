// Using Jitsi Meet - completely free, no API keys required!
// Meetings are now embedded directly in the website!

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
      const errorText = await response.text()
      console.error('Meeting creation failed:', response.status, errorText)
      throw new Error('Failed to create meeting')
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response from meeting server')
    }

    return await response.json()
  } catch (error) {
    console.error('Meeting creation error:', error)
    throw error
  }
}

export async function joinMeeting(sessionId: string) {
  try {
    // Open meeting in same window (embedded)
    window.location.href = `/meetings/${sessionId}`
  } catch (error) {
    console.error('Join meeting error:', error)
    throw error
  }
}
