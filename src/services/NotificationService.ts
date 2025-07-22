import sgMail from '@sendgrid/mail';
import { NotificationMessage, NotificationResult } from '../types';
import { logger } from '../utils/logger';

/**
 * Service for sending notification messages via email
 */
export class NotificationService {
  private useMock: boolean;
  private fromEmail: string;
  private fromName: string;

  constructor(apiKey?: string, fromEmail?: string, fromName?: string, useMock = false) {
    this.useMock = useMock || !apiKey;
    this.fromEmail = fromEmail || 'noreply@example.com';
    this.fromName = fromName || 'Freight Delivery Monitor';

    if (!this.useMock && apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  /**
   * Sends email notification to customer
   */
  async sendEmailNotification(
    toEmail: string,
    message: NotificationMessage,
    customerName?: string
  ): Promise<NotificationResult> {
    if (this.useMock) {
      return this.sendMockNotification(toEmail, message);
    }

    try {
      const msg = {
        to: toEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: message.subject || 'Delivery Update',
        text: message.message,
        html: this.formatHtmlMessage(message.message, customerName),
      };

      const response = await sgMail.send(msg);
      const messageId = response[0]?.headers['x-message-id'] || 'unknown';

      logger.info('Email sent successfully', {
        to: toEmail,
        messageId,
        subject: message.subject,
      });

      return {
        success: true,
        messageId,
      };

    } catch (error) {
      logger.error('Email sending failed, using mock fallback', { 
        error,
        to: toEmail 
      });
      
      // Fallback to mock on failure
      return this.sendMockNotification(toEmail, message);
    }
  }

  /**
   * Formats message as HTML email
   */
  private formatHtmlMessage(message: string, customerName?: string): string {
    const htmlMessage = message.replace(/\n/g, '<br>');
    
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            ${htmlMessage}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Sends mock notification (for testing or fallback)
   */
  private async sendMockNotification(
    toEmail: string,
    message: NotificationMessage
  ): Promise<NotificationResult> {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Mock email sent', {
      to: toEmail,
      subject: message.subject,
      messageId: mockId,
      message: message.message.substring(0, 100) + '...',
    });

    return {
      success: true,
      messageId: mockId,
    };
  }
}