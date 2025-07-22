import axios from 'axios';
import { TrafficData, DeliveryRoute } from '../types';
import { TrafficAPIError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Google Maps API response interface
 */
interface GoogleMapsResponse {
  status: string;
  rows: Array<{
    elements: Array<{
      status: string;
      duration?: { value: number };
      duration_in_traffic?: { value: number };
      distance?: { value: number };
    }>;
  }>;
}

/**
 * Service for fetching traffic data and calculating delivery delays
 */
export class TrafficService {
  private apiKey: string;
  private useMock: boolean;

  constructor(apiKey?: string, useMock = false) {
    this.apiKey = apiKey || '';
    this.useMock = useMock || !this.apiKey;
  }

  /**
   * Fetches traffic data for a delivery route
   */
  async getTrafficData(route: DeliveryRoute): Promise<TrafficData> {
    if (this.useMock) {
      //
      // 
      // return this.getMockTrafficData();
    }
    
    try {
      const response = await axios.get<GoogleMapsResponse>(
        'https://maps.googleapis.com/maps/api/distancematrix/json',
        {
          params: {
            origins: route.origin,
            destinations: route.destination,
            departure_time: 'now',
            traffic_model: 'best_guess',
            units: 'metric',
            key: this.apiKey,
          },
          timeout: 10000,
        }
      );
      
      return this.parseResponse(response.data);
    } catch (error) {
      logger.error('Traffic API failed, falling back to mock data', { error });
      return this.getMockTrafficData();
    }
  }

  /**
   * Parses Google Maps API response
   */
  private parseResponse(response: GoogleMapsResponse): TrafficData {
    const element = response.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') {
      throw new TrafficAPIError('No valid route found');
    }

    const normalDuration = element.duration?.value || 0; // seconds
    const trafficDuration = element.duration_in_traffic?.value || normalDuration;
    const distance = element.distance?.value || 0; // meters

    const delayMinutes = Math.max(0, Math.round((trafficDuration - normalDuration) / 60));
    const delayPercent = normalDuration > 0 ? ((trafficDuration - normalDuration) / normalDuration) * 100 : 0;

    return {
      estimatedDelayMinutes: delayMinutes,
      routeDistance: Math.round(distance / 1000), // km
      estimatedDuration: Math.round(trafficDuration / 60), // minutes
      trafficConditions: this.getTrafficCondition(delayPercent),
    };
  }

  /**
   * Categorizes traffic conditions based on delay
   */
  private getTrafficCondition(delayPercent: number): TrafficData['trafficConditions'] {
    if (delayPercent <= 10) return 'light';
    if (delayPercent <= 25) return 'moderate';
    if (delayPercent <= 50) return 'heavy';
    return 'severe';
  }

  /**
   * Generates mock traffic data
   */
  private async getMockTrafficData(): Promise<TrafficData> {
    // Simulate different delay scenarios for testing
    const scenarios = [
      { delay: 5, condition: 'light' as const },
      { delay: 15, condition: 'moderate' as const },
      { delay: 35, condition: 'heavy' as const },
      { delay: 65, condition: 'severe' as const },
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      estimatedDelayMinutes: scenario.delay,
      routeDistance: 120,
      estimatedDuration: 150 + scenario.delay,
      trafficConditions: scenario.condition,
    };
  }
}