/**
 * Rate Limit Error Component
 * Displays a user-friendly message when GitHub API rate limit is exceeded
 */
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";

interface RateLimitErrorProps {
  resetTime: Date;
  onRetry?: () => void;
}

export function RateLimitError({ resetTime, onRetry }: RateLimitErrorProps) {
  const timeUntilReset = Math.max(0, resetTime.getTime() - Date.now());
  const minutesUntilReset = Math.ceil(timeUntilReset / (1000 * 60));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto p-4"
    >
      <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <AlertTitle className="text-lg font-semibold mb-2 text-red-800 dark:text-red-200">
          API Rate Limit Exceeded
        </AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-300">
          <p className="mb-4">
            We've hit GitHub's API rate limit. This helps ensure fair usage of their services.
            The limit will reset in approximately {minutesUntilReset} minute{minutesUntilReset !== 1 ? 's' : ''}.
          </p>
          <p className="mb-4">
            Reset time: {resetTime.toLocaleString()}
          </p>
          <div className="flex items-center gap-4">
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:border-red-800"
              >
                Try Again
              </Button>
            )}
            <Button
              variant="link"
              onClick={() => window.location.reload()}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Refresh Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}