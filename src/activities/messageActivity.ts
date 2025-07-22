import { OpenAIService } from '../services/OpenAIService';
import { NotificationMessage } from '../types';
import { logger } from '../utils/logger';

/**
 * Temporal activity to generate AI-powered delay messages for customers
 */
export async function generateDelayMessage(
  delayMinutes: number, 
  customerName?: string,
  origin?: string,
  destination?: string
): Promise<NotificationMessage> {
  logger.info('Generating delay message', {
    delayMinutes,
    customerName,
    origin,
    destination,
  });

  const openaiService = new OpenAIService(
    process.env.OPENAI_API_KEY,
    process.env.USE_MOCK_OPENAI === 'true'
  );

  try {
    const message = await openaiService.generateDelayMessage(
      delayMinutes,
      customerName,
      origin,
      destination
    );
    
    logger.info('Delay message generated successfully', {
      customerName,
      delayMinutes,
      subject: message.subject,
    });

    return message;

  } catch (error) {
    logger.error('Failed to generate delay message', {
      error,
      delayMinutes,
      customerName,
    });
    
    // Re-throw the error for Temporal to handle retries
    throw error;
  }
}