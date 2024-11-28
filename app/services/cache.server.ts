/**
 * Cache Service
 * Provides in-memory caching for API responses to reduce rate limiting issues
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number = 300; // 5 minutes default TTL

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const timestamp = Date.now();
    const ttl = options.ttl || this.defaultTTL;
    const expiresAt = timestamp + (ttl * 1000);

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt,
    });

    // Schedule cleanup for expired entry
    setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  public getCacheKey(params: Record<string, any>): string {
    // Create a stable cache key from the parameters
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, any>);

    return JSON.stringify(sortedParams);
  }
}

export const cacheService = CacheService.getInstance();