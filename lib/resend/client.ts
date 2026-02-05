/**
 * Resend Email Client
 * Documentation: https://resend.com/docs
 */

import { Resend } from 'resend';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

class ResendClient {
  private resend: Resend | null = null;
  private defaultFrom: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured. Emails will not be sent.');
    } else {
      this.resend = new Resend(apiKey);
    }

    // Default to Resend's free onboarding email until you verify your own domain
    this.defaultFrom = process.env.RESEND_FROM_EMAIL || 'GridNexus <onboarding@resend.dev>';
  }

  /**
   * Send email to one or multiple recipients
   */
  async sendEmail({ to, subject, html, from }: SendEmailParams) {
    if (!this.resend) {
      console.warn('⚠️ Resend not configured. Email not sent.');
      return { success: false, error: 'Resend not configured' };
    }

    try {
      const recipients = Array.isArray(to) ? to : [to];

      const { data, error } = await this.resend.emails.send({
        from: from || this.defaultFrom,
        to: recipients,
        subject: subject,
        html: html,
      });

      if (error) {
        console.error('❌ Resend Email Error:', error);
        throw error;
      }

      console.log('✅ Email sent successfully:', {
        to: recipients,
        subject: subject.substring(0, 50),
        id: data?.id,
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('❌ Resend API Error:', error);
      throw error;
    }
  }

  /**
   * Send notification email to a user
   */
  async sendNotificationEmail(
    email: string,
    subject: string,
    message: string,
    link?: string
  ): Promise<boolean> {
    if (!email) {
      console.warn('⚠️ No email address provided');
      return false;
    }

    try {
      const html = this.createEmailTemplate(subject, message, link);
      
      await this.sendEmail({
        to: email,
        subject: subject,
        html: html,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send notification email:', error);
      return false;
    }
  }

  /**
   * Create HTML email template
   */
  private createEmailTemplate(title: string, message: string, link?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%);
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .content {
              padding: 30px 20px;
            }
            .content h2 {
              color: #1e293b;
              font-size: 20px;
              margin-top: 0;
            }
            .content p {
              color: #475569;
              margin: 16px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%);
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              background: #f8fafc;
              padding: 20px;
              text-align: center;
              color: #64748b;
              font-size: 12px;
              border-top: 1px solid #e2e8f0;
            }
            .footer a {
              color: #0EA5E9;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>GridNexus</h1>
            </div>
            <div class="content">
              <h2>${title}</h2>
              <p>${message}</p>
              ${link ? `<a href="${link}" class="button">View Details</a>` : ''}
            </div>
            <div class="footer">
              <p>This is an automated email from GridNexus.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://gridnexus.com'}">Visit GridNexus</a> |
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://gridnexus.com'}/client/profile">Manage Preferences</a>
              </p>
              <p>&copy; ${new Date().getFullYear()} GridNexus. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

// Export singleton instance
export const resendClient = new ResendClient();

// Export types
export type { SendEmailParams };
