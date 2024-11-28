/**
 * GitHub API Service
 * Handles all interactions with the GitHub API for repository discovery and analysis
 */
import 'dotenv/config';
import { cacheService } from './cache.server';
import { rateLimiter } from './rate-limiter.server';

const GITHUB_API_URL = 'https://api.github.com';
const CACHE_TTL = 600; // Cache for 10 minutes

interface RateLimitResponse {
  resources: {
    core: {
      limit: number;
      remaining: number;
      reset: number;
    };
  };
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  updated_at: string;
  created_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  commit_count?: number;
  contributor_count?: number;
  qualityScore?: number;
  metrics?: QualityMetrics;
}

interface SearchParams {
  language?: string;
  timePeriod?: 'week' | 'month' | 'quarter' | 'year';
  sortBy?: 'quality' | 'stars' | 'updated' | 'created';
  query?: string;
}

interface QualityMetrics {
  documentationScore: number;
  maintenanceScore: number;
  communityScore: number;
  codeQualityScore: number;
}

class GitHubError extends Error {
  constructor(
    message: string,
    public status?: number,
    public rateLimitRemaining?: number,
    public rateLimitReset?: number
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

export class GitHubService {
  private token: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN || '';
    if (!this.token) {
      console.warn('GitHub token not found. API requests will be rate-limited.');
      rateLimiter.setConfig({
        maxRequests: 60,
        interval: 3600000, // 1 hour
        minDelay: 1000,
      });
    } else {
      rateLimiter.setConfig({
        maxRequests: 5000,
        interval: 3600000,
        minDelay: 100,
      });
    }
  }

  private async fetchWithAuth(endpoint: string, useCache: boolean = true): Promise<any> {
    // Check cache first if enabled
    if (useCache) {
      const cachedData = cacheService.get<any>(endpoint);
      if (cachedData) {
        return cachedData;
      }
    }

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return rateLimiter.enqueue(async () => {
      try {
        const response = await fetch(`${GITHUB_API_URL}${endpoint}`, { headers });
        
        // Update rate limiter based on GitHub headers
        const remaining = parseInt(response.headers.get('x-ratelimit-remaining') || '0');
        const reset = parseInt(response.headers.get('x-ratelimit-reset') || '0');
        rateLimiter.updateLimits(remaining, reset);

        if (!response.ok) {
          if (response.status === 403 && remaining === 0) {
            const resetDate = new Date(reset * 1000);
            throw new GitHubError(
              `API rate limit exceeded. Resets at ${resetDate.toLocaleString()}`,
              403,
              remaining,
              reset
            );
          }
          throw new GitHubError(
            `GitHub API error: ${response.statusText}`,
            response.status,
            remaining,
            reset
          );
        }

        const data = await response.json();

        // Cache the successful response if caching is enabled
        if (useCache) {
          cacheService.set(endpoint, data, { ttl: CACHE_TTL });
        }

        return data;
      } catch (error) {
        if (error instanceof GitHubError) {
          throw error;
        }
        throw new GitHubError(
          `Failed to fetch from GitHub API: ${error instanceof Error ? error.message : 'Unknown error'}`,
          500
        );
      }
    });
  }

  private async checkRateLimit(): Promise<void> {
    if (rateLimiter.isRateLimited()) {
      const resetTime = rateLimiter.getTimeUntilReset();
      const resetDate = new Date(Date.now() + resetTime);
      throw new GitHubError(
        `API rate limit exceeded. Resets at ${resetDate.toLocaleString()}`,
        429,
        0,
        Math.floor(resetDate.getTime() / 1000)
      );
    }
  }

  private calculateQualityScore(repo: Repository, metrics: QualityMetrics): number {
    const weights = {
      documentation: 0.25,
      maintenance: 0.3,
      community: 0.25,
      codeQuality: 0.2,
    };

    return (
      metrics.documentationScore * weights.documentation +
      metrics.maintenanceScore * weights.maintenance +
      metrics.communityScore * weights.community +
      metrics.codeQualityScore * weights.codeQuality
    );
  }

  private async getQualityMetrics(repo: Repository): Promise<QualityMetrics> {
    const cacheKey = `metrics:${repo.full_name}`;
    const cachedMetrics = cacheService.get<QualityMetrics>(cacheKey);
    
    if (cachedMetrics) {
      return cachedMetrics;
    }

    try {
      // Fetch additional data for metrics calculation
      const [commits, contributors, readme] = await Promise.all([
        this.fetchWithAuth(`/repos/${repo.full_name}/commits?per_page=1`),
        this.fetchWithAuth(`/repos/${repo.full_name}/contributors?per_page=1`),
        this.fetchWithAuth(`/repos/${repo.full_name}/readme`).catch(() => null),
      ]);

      // Calculate documentation score based on readme presence and size
      const documentationScore = readme ? Math.min(0.8 + (readme.size / 50000) * 0.2, 1) : 0.2;

      // Calculate maintenance score based on recent commits
      const lastCommitDate = new Date(commits[0]?.commit?.author?.date);
      const daysSinceLastCommit = (new Date().getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
      const maintenanceScore = Math.max(0, 1 - daysSinceLastCommit / 365);

      // Calculate community score based on contributors and engagement
      const communityScore = Math.min(contributors.length / 10, 1);

      // Code quality score (based on available metrics)
      const codeQualityScore = 0.7; // Base score, could be improved with more metrics

      const metrics = {
        documentationScore,
        maintenanceScore,
        communityScore,
        codeQualityScore,
      };

      // Cache the metrics
      cacheService.set(cacheKey, metrics, { ttl: CACHE_TTL });

      return metrics;
    } catch (error) {
      console.error(`Failed to get quality metrics for ${repo.full_name}:`, error);
      return {
        documentationScore: 0.5,
        maintenanceScore: 0.5,
        communityScore: 0.5,
        codeQualityScore: 0.5,
      };
    }
  }

  public async searchRepositories(params: SearchParams): Promise<Repository[]> {
    await this.checkRateLimit();

    const { language, timePeriod, sortBy, query } = params;
    const cacheKey = cacheService.getCacheKey({ ...params, type: 'search' });
    
    // Check cache first
    const cachedResults = cacheService.get<Repository[]>(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    // Build search query
    let searchQuery = 'stars:>10';
    if (language) searchQuery += ` language:${language}`;
    if (query) searchQuery += ` ${query}`;

    // Add time period filter
    const date = new Date();
    if (timePeriod) {
      date.setDate(date.getDate() - {
        week: 7,
        month: 30,
        quarter: 90,
        year: 365,
      }[timePeriod]);
      searchQuery += ` pushed:>${date.toISOString().split('T')[0]}`;
    }

    try {
      // Fetch repositories
      const endpoint = `/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=100`;
      const data = await this.fetchWithAuth(endpoint);

      // Process and enhance repository data
      const repositories = await Promise.all(
        data.items.map(async (repo: Repository) => {
          try {
            const metrics = await this.getQualityMetrics(repo);
            const qualityScore = this.calculateQualityScore(repo, metrics);
            return {
              ...repo,
              qualityScore,
              metrics,
            };
          } catch (error) {
            console.error(`Failed to process repository ${repo.full_name}:`, error);
            return repo;
          }
        })
      );

      // Sort repositories
      const sortedRepositories = repositories.sort((a, b) => {
        switch (sortBy) {
          case 'quality':
            return (b.qualityScore || 0) - (a.qualityScore || 0);
          case 'stars':
            return b.stargazers_count - a.stargazers_count;
          case 'updated':
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          case 'created':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default:
            return (b.qualityScore || 0) - (a.qualityScore || 0);
        }
      });

      // Cache the results
      cacheService.set(cacheKey, sortedRepositories, { ttl: CACHE_TTL });

      return sortedRepositories;
    } catch (error) {
      if (error instanceof GitHubError) {
        throw error;
      }
      throw new GitHubError('Failed to search repositories', 500);
    }
  }
}

export const githubService = new GitHubService();