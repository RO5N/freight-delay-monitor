import { proxyActivities, log } from '@temporalio/workflow';
import { DeliveryRoute } from '../types';

// Proxy activities with timeout and retry configuration
const activities = proxyActivities<typeof import('../activities')>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 3,
    initialInterval: '1 second',
  },
});

/**
 * Temporal workflow to monitor freight delivery delays and notify customers
 * 
 * Workflow Steps:
 * 1. Check traffic conditions for delivery route
 * 2. Evaluate if delay exceeds threshold (30 minutes)
 * 3. Generate AI-powered message if delay is significant
 * 4. Send notification to customer via email
 */
export async function deliveryMonitoringWorkflow(
  route: DeliveryRoute, 
  delayThreshold: number = 30
): Promise<string> {
  
  log.info('Starting delivery monitoring workflow', {
    customerId: route.customerId,
    customerName: route.customerName,
    origin: route.origin,
    destination: route.destination,
    delayThreshold,
  });

  try {
    // Step 1: Check traffic conditions for the delivery route
    log.info('Step 1: Checking traffic conditions');
    const trafficData = await activities.checkTrafficConditions(route);
    
    log.info('Traffic data retrieved', {
      delayMinutes: trafficData.estimatedDelayMinutes,
      trafficConditions: trafficData.trafficConditions,
      duration: trafficData.estimatedDuration,
    });

    // Step 2: Evaluate if delay exceeds threshold
    log.info('Step 2: Evaluating delay threshold', {
      delayMinutes: trafficData.estimatedDelayMinutes,
      threshold: delayThreshold,
    });

    if (trafficData.estimatedDelayMinutes <= delayThreshold) {
      log.info('Delay is within acceptable limits - no notification needed', {
        delayMinutes: trafficData.estimatedDelayMinutes,
        threshold: delayThreshold,
      });
      
      return `Delivery monitoring completed. Delay of ${trafficData.estimatedDelayMinutes} minutes is within acceptable threshold of ${delayThreshold} minutes. No notification sent.`;
    }

    // Step 3: Generate AI-powered delay message
    log.info('Step 3: Generating delay message for customer', {
      delayMinutes: trafficData.estimatedDelayMinutes,
      customerName: route.customerName,
      customerId: route.customerId,
    });

    const message = await activities.generateDelayMessage(
      trafficData.estimatedDelayMinutes,
      route.customerName,
      route.origin,
      route.destination
    );

    log.info('Delay message generated successfully', {
      subject: message.subject,
    });

    // Step 4: Send notification to customer
    log.info('Step 4: Sending notification to customer', {
      customerName: route.customerName,
      customerEmail: route.customerEmail,
    });

    const notificationResult = await activities.sendNotification(
      route.customerEmail,
      message,
      route.customerName
    );

    if (notificationResult.success) {
      log.info('Workflow completed successfully', {
        customerId: route.customerId,
        customerName: route.customerName,
        delayMinutes: trafficData.estimatedDelayMinutes,
        messageId: notificationResult.messageId,
      });

      return `Delivery monitoring completed successfully. Customer ${route.customerName} (${route.customerId}) notified about ${trafficData.estimatedDelayMinutes} minute delay. Message ID: ${notificationResult.messageId}`;
    } else {
      log.error('Notification failed', {
        error: notificationResult.error,
      });

      return `Workflow completed with notification failure. Delay detected (${trafficData.estimatedDelayMinutes} minutes) but customer notification failed: ${notificationResult.error}`;
    }

  } catch (error) {
    log.error('Workflow failed with error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      customerId: route.customerId,
      customerName: route.customerName,
    });

    // Re-throw error for Temporal to handle
    throw error;
  }
}