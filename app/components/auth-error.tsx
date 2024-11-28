/**
 * Authentication Error Component
 * Displays when GitHub API requests fail due to authentication issues
 */
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";

interface AuthErrorProps {
  onRetry?: () => void;
}

export function AuthError({ onRetry }: AuthErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto p-4"
    >
      <Alert variant="destructive" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <AlertTitle className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-200">
          GitHub Authentication Required
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          <p className="mb-4">
            To access all features and avoid rate limiting, please set up a GitHub personal access token.
            This will increase your API rate limit from 60 to 5,000 requests per hour.
          </p>
          <div className="mb-4 bg-amber-100/50 dark:bg-amber-900/50 p-4 rounded-md font-mono text-sm">
            <p className="mb-2">1. Create a <code>.env</code> file in the project root:</p>
            <pre className="whitespace-pre-wrap break-all">
              GITHUB_TOKEN=your_github_token_here
            </pre>
          </div>
          <p className="mb-4">
            Generate a token at{' '}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 dark:text-amber-200 underline hover:text-amber-900 dark:hover:text-amber-100"
            >
              GitHub Settings → Developer Settings → Personal Access Tokens
            </a>
          </p>
          <div className="flex items-center gap-4">
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="bg-white hover:bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-300 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 dark:border-amber-800"
              >
                Try Again
              </Button>
            )}
            <Button
              variant="link"
              onClick={() => window.location.reload()}
              className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              Refresh Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}