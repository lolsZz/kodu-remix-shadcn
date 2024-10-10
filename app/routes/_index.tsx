import { useTranslation } from 'react-i18next';
import { Link } from '@remix-run/react';
import { Button } from '~/components/ui/button';

export default function Index() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('welcome')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('tagline')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">{t('forCreators')}</h2>
            <p className="mb-4">{t('creatorsDescription')}</p>
            <Button asChild>
              <Link to="/auth/signup">{t('becomeCreator')}</Link>
            </Button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">{t('forSubscribers')}</h2>
            <p className="mb-4">{t('subscribersDescription')}</p>
            <Button asChild variant="secondary">
              <Link to="/explore">{t('exploreCreators')}</Link>
            </Button>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">{t('featuredCreators')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Add featured creators here */}
          </div>
        </div>
      </div>
    </div>
  );
}
