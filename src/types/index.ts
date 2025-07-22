export interface DeliveryRoute {
    origin: string;
    destination: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
  }

  export interface TrafficData {
    estimatedDelayMinutes: number;
    routeDistance: number;
    estimatedDuration: number;
    trafficConditions: 'light' | 'moderate' | 'heavy' | 'severe';
  }

  export interface NotificationMessage {
    message: string;
    subject?: string;
  }

  export interface NotificationResult {
    success: boolean;
    messageId?: string;
    error?: string;
  }