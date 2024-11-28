/**
 * Rate Limiter Service
 * Manages API request rates and provides queuing functionality
 */

interface RateLimitConfig {
  maxRequests: number;
  interval: number; // in milliseconds
  minDelay: number; // minimum delay between requests in milliseconds
}

interface QueuedRequest {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private requestQueue: QueuedRequest[] = [];
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();
  private isProcessing: boolean = false;
  private config: RateLimitConfig;

  private constructor() {
    this.config = {
      maxRequests: 30, // GitHub's default is 60 requests per hour for unauthenticated requests
      interval: 3600000, // 1 hour in milliseconds
      minDelay: 1000, // 1 second minimum delay between requests
    };
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public setConfig(config: Partial<RateLimitConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  private resetCountIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastResetTime >= this.config.interval) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      this.resetCountIfNeeded();

      if (this.requestCount >= this.config.maxRequests) {
        const waitTime = this.lastResetTime + this.config.interval - Date.now();
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.resetCountIfNeeded();
      }

      const request = this.requestQueue.shift();
      if (!request) continue;

      try {
        this.requestCount++;
        const result = await request.execute();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }

      // Add minimum delay between requests
      await new Promise(resolve => setTimeout(resolve, this.config.minDelay));
    }

    this.isProcessing = false;
  }

  public async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        execute: request,
        resolve,
        reject,
      });

      this.processQueue().catch(error => {
        console.error('Error processing queue:', error);
      });
    });
  }

  public getRemainingRequests(): number {
    this.resetCountIfNeeded();
    return Math.max(0, this.config.maxRequests - this.requestCount);
  }

  public getTimeUntilReset(): number {
    return Math.max(0, this.lastResetTime + this.config.interval - Date.now());
  }

  public isRateLimited(): boolean {
    this.resetCountIfNeeded();
    return this.requestCount >= this.config.maxRequests;
  }

  public updateLimits(remaining: number, resetTime: number): void {
    this.config.maxRequests = remaining;
    this.lastResetTime = resetTime * 1000; // Convert from Unix timestamp to milliseconds
  }
}

export const rateLimiter = RateLimiter.getInstance();