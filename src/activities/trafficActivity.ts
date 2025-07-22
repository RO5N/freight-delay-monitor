import { TrafficService } from '../services/TrafficService';
import { DeliveryRoute, TrafficData } from '../types';
import { logger } from '../utils/logger';

/**
 * Temporal activity to check traffic conditions for a delivery route
 */
export async function checkTrafficConditions(route: DeliveryRoute): Promise<TrafficData> {
  logger.info('Checking traffic conditions for route', {
    customerId: route.customerId,
    origin: route.origin,
    destination: route.destination,
  });

  const trafficService = new TrafficService(
    process.env.GOOGLE_MAPS_API_KEY,
    process.env.USE_MOCK_TRAFFIC === 'true'
  );

  try {
    const trafficData = await trafficService.getTrafficData(route);
    
    logger.info('Traffic conditions retrieved', {
      customerId: route.customerId,
      delayMinutes: trafficData.estimatedDelayMinutes,
      trafficConditions: trafficData.trafficConditions,
      duration: trafficData.estimatedDuration,
    });

    return trafficData;

  } catch (error) {
    logger.error('Failed to check traffic conditions', {
      error,
      customerId: route.customerId,
    });
    
    // Re-throw the error for Temporal to handle retries
    throw error;
  }
}