/**
 * Hidden Gems Finder - Main Interface
 * A tool to discover valuable but lesser-known GitHub repositories
 */
import { useEffect, useState } from 'react';
import type { MetaFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams, useNavigate } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "~/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { motion, AnimatePresence } from 'framer-motion';
import { githubService } from '~/services/github.server';
import { RateLimitError } from '~/components/rate-limit-error';
import { AuthError } from '~/components/auth-error';

const CACHE_KEY = 'hiddenGems_repositories';
const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

// Quality score calculation
const getQualityScore = (repo: any) => {
  return (
    repo.stargazers_count * 0.3 +
    (repo.contributor_count || 0) * 0.3 +
    (repo.commit_count || 0) * 0.4
  );
};

export const meta: MetaFunction = () => {
  return [
    { title: 'Hidden Gems Finder' },
    {
      name: 'description',
      content: 'Discover valuable but lesser-known GitHub repositories',
    },
  ];
};

interface LoaderData {
  repositories: any[];
  error?: {
    message: string;
    status?: number;
    rateLimitReset?: number;
  };
  cacheTimestamp?: number;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') || '';
  const language = url.searchParams.get('language') || undefined;
  const timePeriod = url.searchParams.get('timePeriod') as 'week' | 'month' | 'quarter' | 'year' | undefined;
  const sortBy = url.searchParams.get('sortBy') as 'quality' | 'stars' | 'updated' | 'created' | undefined;

  try {
    const repositories = await githubService.searchRepositories({
      query,
      language,
      timePeriod,
      sortBy,
    });

    return json<LoaderData>({ 
      repositories, 
      error: undefined,
      cacheTimestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    if (error instanceof Error) {
      const errorData = {
        message: error.message,
        status: (error as any).status,
        rateLimitReset: (error as any).rateLimitReset,
      };
      return json<LoaderData>({ repositories: [], error: errorData }, { status: errorData.status || 500 });
    }
    return json<LoaderData>({ 
      repositories: [], 
      error: { message: 'An unexpected error occurred' } 
    }, { status: 500 });
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function Index() {
  const { repositories, error, cacheTimestamp } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [discoveryInput, setDiscoveryInput] = useState(searchParams.get('query') || '');
  const [cachedRepos, setCachedRepos] = useState<any[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<any[]>([]);
  const navigate = useNavigate();

  // Load cached repositories on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        setCachedRepos(data);
        setFilteredRepos(data);
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }, []);

  // Update cache when new repositories are fetched
  useEffect(() => {
    if (repositories.length > 0 && cacheTimestamp) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: repositories,
        timestamp: cacheTimestamp
      }));
      setCachedRepos(repositories);
      setFilteredRepos(repositories);
    }
  }, [repositories, cacheTimestamp]);

  useEffect(() => {
    // Simulate loading state for smoother transitions
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [filteredRepos]);

  const filterRepositories = () => {
    const language = searchParams.get('language');
    const timePeriod = searchParams.get('timePeriod');
    const sortBy = searchParams.get('sortBy');
    
    let filtered = [...cachedRepos];

    // Apply filters
    if (discoveryInput) {
      const searchTerm = discoveryInput.toLowerCase();
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(searchTerm) ||
        (repo.description || '').toLowerCase().includes(searchTerm) ||
        (repo.language || '').toLowerCase().includes(searchTerm)
      );
    }

    if (language && language !== 'all') {
      filtered = filtered.filter(repo => repo.language?.toLowerCase() === language.toLowerCase());
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'stars':
            return b.stargazers_count - a.stargazers_count;
          case 'updated':
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          case 'created':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'quality':
          default:
            return getQualityScore(b) - getQualityScore(a);
        }
      });
    }

    setFilteredRepos(filtered);
  };

  const handleDiscover = () => {
    filterRepositories();
    const newParams = new URLSearchParams(searchParams);
    if (discoveryInput) {
      newParams.set('query', discoveryInput);
    } else {
      newParams.delete('query');
    }
    setSearchParams(newParams);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDiscover();
    }
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    filterRepositories();
  };

  const handleRetry = () => {
    // Refresh the current route
    navigate('.', { replace: true });
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-slate-800"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 py-8">
        <motion.header className="text-center mb-12" variants={itemVariants}>
          <motion.h1
            className="text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Hidden Gems Finder
          </motion.h1>
          <motion.p
            className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Discover valuable repositories that might otherwise go unnoticed, focusing on code quality and community engagement
          </motion.p>
        </motion.header>

        <motion.div 
          className="max-w-3xl mx-auto mb-12 space-y-4"
          variants={itemVariants}
        >
          <Command className="rounded-lg border shadow-lg bg-white dark:bg-slate-900">
            <div className="flex items-center p-2">
              <CommandInput 
                placeholder="What kind of hidden gems would you like to discover?" 
                className="h-12 text-lg flex-1"
                value={discoveryInput}
                onValueChange={setDiscoveryInput}
                onKeyPress={handleKeyPress}
              />
              <Button 
                className="ml-2 h-12 px-6"
                onClick={handleDiscover}
              >
                Discover Gems
              </Button>
            </div>
            <CommandEmpty>No hidden gems found matching your criteria.</CommandEmpty>
            <CommandGroup>
              <div className="p-4 flex flex-wrap gap-4">
                <Select
                  value={searchParams.get('language') || 'all'}
                  onValueChange={(value) => handleFilterChange('language', value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={searchParams.get('timePeriod') || 'all'}
                  onValueChange={(value) => handleFilterChange('timePeriod', value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="quarter">Past 3 Months</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={searchParams.get('sortBy') || 'quality'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality">Quality Score</SelectItem>
                    <SelectItem value="stars">Stars</SelectItem>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="created">Recently Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CommandGroup>
          </Command>
        </motion.div>

        {error?.status === 429 && error.rateLimitReset ? (
          <RateLimitError
            resetTime={new Date(error.rateLimitReset * 1000)}
            onRetry={handleRetry}
          />
        ) : error?.status === 403 ? (
          <AuthError onRetry={handleRetry} />
        ) : error ? (
          <motion.div 
            className="max-w-3xl mx-auto mb-8"
            variants={itemVariants}
          >
            <Alert variant="destructive">
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            key={isLoading ? 'loading' : 'loaded'}
          >
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div key={`skeleton-${index}`} variants={itemVariants}>
                  <Card className="bg-white/50 dark:bg-slate-900/50">
                    <CardHeader>
                      <Skeleton className="h-8 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/3 mb-4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Separator />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : filteredRepos.length === 0 && !error ? (
              <motion.div 
                className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400"
                variants={itemVariants}
              >
                No hidden gems found matching your criteria. Try adjusting your filters to discover more!
              </motion.div>
            ) : (
              filteredRepos.map((repo: any) => (
                <motion.div 
                  key={repo.id} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                              {repo.name}
                            </a>
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {repo.language && (
                              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                                {repo.language}
                              </Badge>
                            )}
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              by {repo.owner.login}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">⭐ {repo.stargazers_count}</Badge>
                        </div>
                      </div>
                      <CardDescription className="mt-2 line-clamp-2 text-slate-600 dark:text-slate-300">
                        {repo.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <span>🔄</span> Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </div>
                          {repo.commit_count && (
                            <div className="flex items-center gap-1">
                              <span>📦</span> {repo.commit_count} commits
                            </div>
                          )}
                          {repo.contributor_count && (
                            <div className="flex items-center gap-1">
                              <span>👥</span> {repo.contributor_count} contributors
                            </div>
                          )}
                        </div>
                        <Separator />
                        <div className="flex flex-wrap gap-2">
                          {repo.topics?.map((topic: string) => (
                            <Badge 
                              key={topic}
                              variant="outline" 
                              className="hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>

        <motion.footer 
          className="mt-12 text-center text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-8"
          variants={itemVariants}
        >
          <p className="max-w-2xl mx-auto text-sm">
            Discover repositories based on code quality, documentation, and community engagement. 
            Our algorithm considers factors like maintenance activity, test coverage, and issue response time.
          </p>
        </motion.footer>
      </div>
    </motion.div>
  );
}
