  export class TrafficAPIError extends Error {
    constructor(message: string, public statusCode?: number) {
      super(message);
      this.name = 'TrafficAPIError';
    }
  }

  export class NotificationError extends Error {
    constructor(message: string, public provider?: string) {
      super(message);
      this.name = 'NotificationError';
    }
  }