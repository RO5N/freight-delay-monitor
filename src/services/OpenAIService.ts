import OpenAI from 'openai';
import { NotificationMessage } from '../types';
import { logger } from '../utils/logger';

/**
 * Service for generating AI-powered delay notification messages
 */
export class OpenAIService {
  private client?: OpenAI;
  private useMock: boolean;

  constructor(apiKey?: string, useMock = false) {
    this.useMock = useMock || !apiKey;
    
    if (!this.useMock) {
      this.client = new OpenAI({ apiKey });
    }
  }

  /**
   * Generates a friendly delay message for customers
   */
  async generateDelayMessage(
    delayMinutes: number,
    customerName?: string,
    origin?: string,
    destination?: string
  ): Promise<NotificationMessage> {
    if (this.useMock) {
      return this.getMockMessage(delayMinutes, customerName);
    }

    try {
      const prompt = this.createPrompt(delayMinutes, customerName, origin, destination);
      
      const response = await this.client?.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful customer service assistant for a freight delivery company. Generate friendly, professional delay notifications.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const message = response?.choices[0]?.message?.content?.trim();
      
      if (!message) {
        throw new Error('No message generated');
      }

      return {
        subject: `Delivery Update - ${delayMinutes} Minute Delay`,
        message,
      };

    } catch (error) {
      logger.error('OpenAI API failed, using fallback message', { error });
      return this.getMockMessage(delayMinutes, customerName);
    }
  }

  /**
   * Creates prompt for OpenAI based on delay details
   */
  private createPrompt(
    delayMinutes: number,
    customerName?: string,
    origin?: string,
    destination?: string
  ): string {
    const name = customerName || 'Valued Customer';
    const route = origin && destination ? ` from ${origin} to ${destination}` : '';
    
    return `Generate a friendly and professional message for ${name} about a freight delivery delay of ${delayMinutes} minutes${route}. 
    
    Keep it concise, apologetic, and reassuring. Include:
    - Acknowledgment of the delay
    - Brief explanation (traffic conditions)
    - Reassurance about delivery
    - Professional tone
    
    Make it personal and customer-friendly.`;
  }

  /**
   * Generates fallback message when OpenAI is unavailable
   */
  private getMockMessage(delayMinutes: number, customerName?: string): NotificationMessage {
    const name = customerName || 'Valued Customer';
    
    const message = `Dear ${name},

We wanted to inform you that your freight delivery is experiencing a delay of approximately ${delayMinutes} minutes due to current traffic conditions.

We sincerely apologize for any inconvenience this may cause. Our team is actively monitoring the situation and working to minimize any further delays.

We appreciate your patience and will keep you updated on the delivery progress.

Best regards,
Freight Delivery Team`;

    return {
      subject: `Delivery Update - ${delayMinutes} Minute Delay`,
      message,
    };
  }
}