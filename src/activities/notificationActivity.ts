import { NotificationService } from '../services/NotificationService';
import { NotificationMessage, NotificationResult } from '../types';
import { logger } from '../utils/logger';

/**
 * Temporal activity to send email notifications to customers
 */
export async function sendNotification(
  customerEmail: string,
  message: NotificationMessage,
  customerName?: string
): Promise<NotificationResult> {
  logger.info('Sending notification', {
    customerEmail,
    customerName,
    subject: message.subject,
  });

  const notificationService = new NotificationService(
    process.env.SENDGRID_API_KEY,
    process.env.SENDGRID_FROM_EMAIL,
    process.env.SENDGRID_FROM_NAME,
    process.env.USE_MOCK_NOTIFICATIONS === 'true'
  );

  try {
    const result = await notificationService.sendEmailNotification(
      customerEmail,
      message,
      customerName
    );
    
    logger.info('Notification sent successfully', {
      customerEmail,
      messageId: result.messageId,
      success: result.success,
    });

    return result;

  } catch (error) {
    logger.error('Failed to send notification', {
      error,
      customerEmail,
      customerName,
    });
    
    // Re-throw the error for Temporal to handle retries
    throw error;
  }
} 