/**
 * Arkesel SMS Client
 * Documentation: https://developers.arkesel.com/sms-api
 */

interface ArkeSMSResponse {
  code: string
  message: string
  data?: {
    balance: string
    user: string
    country: string
    network: string
  }
}

interface SendSMSParams {
  recipients: string | string[]
  message: string
  senderId?: string
}

class ArkeselClient {
  private apiKey: string
  private defaultSenderId: string
  private baseUrl = 'https://sms.arkesel.com/api/v2/sms'

  constructor() {
    this.apiKey = process.env.ARKESEL_API_KEY || ''
    this.defaultSenderId = process.env.ARKESEL_SENDER_ID || 'GridNexus'

    if (!this.apiKey) {
      console.warn('⚠️ ARKESEL_API_KEY not configured. SMS will not be sent.')
    }
  }

  /**
   * Send SMS to one or multiple recipients
   */
  async sendSMS({ recipients, message, senderId }: SendSMSParams): Promise<ArkeSMSResponse> {
    if (!this.apiKey) {
      throw new Error('Arkesel API key not configured')
    }

    // Normalize recipients to array
    const recipientArray = Array.isArray(recipients) ? recipients : [recipients]

    // Format phone numbers (remove spaces, ensure proper format)
    const formattedRecipients = recipientArray.map(phone => this.formatPhoneNumber(phone))

    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: senderId || this.defaultSenderId,
          recipients: formattedRecipients,
          message: message,
        }),
      })

      const data: ArkeSMSResponse = await response.json()

      if (!response.ok) {
        console.error('❌ Arkesel SMS Error:', data)
        throw new Error(data.message || 'Failed to send SMS')
      }

      console.log('✅ SMS sent successfully:', {
        recipients: formattedRecipients,
        message: message.substring(0, 50) + '...',
        response: data.code,
      })

      return data
    } catch (error: any) {
      console.error('❌ Arkesel API Error:', error)
      throw error
    }
  }

  /**
   * Send SMS notification to a single user
   */
  async sendNotification(phoneNumber: string, title: string, message: string): Promise<boolean> {
    if (!phoneNumber) {
      console.warn('⚠️ No phone number provided for SMS notification')
      return false
    }

    try {
      const fullMessage = `${title}\n\n${message}\n\n- GridNexus`
      await this.sendSMS({
        recipients: phoneNumber,
        message: fullMessage,
      })
      return true
    } catch (error) {
      console.error('Failed to send SMS notification:', error)
      return false
    }
  }

  /**
   * Format phone number to Ghanaian format
   * Accepts: 0241234567, 233241234567, +233241234567
   * Returns: 233241234567
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')

    // If starts with 0, replace with 233
    if (cleaned.startsWith('0')) {
      cleaned = '233' + cleaned.substring(1)
    }

    // Ensure it starts with 233
    if (!cleaned.startsWith('233')) {
      cleaned = '233' + cleaned
    }

    return cleaned
  }

  /**
   * Check SMS balance (optional feature)
   */
  async checkBalance(): Promise<{ balance: string; currency: string }> {
    if (!this.apiKey) {
      throw new Error('Arkesel API key not configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        method: 'GET',
        headers: {
          'api-key': this.apiKey,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check balance')
      }

      return {
        balance: data.balance || '0',
        currency: 'GHS',
      }
    } catch (error) {
      console.error('Failed to check Arkesel balance:', error)
      throw error
    }
  }
}

// Export singleton instance
export const arkeselClient = new ArkeselClient()

// Export types
export type { SendSMSParams, ArkeSMSResponse }
