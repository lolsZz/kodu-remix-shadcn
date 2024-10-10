import React from 'react';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="header py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          OnlyJapan
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/explore" className="text-white hover:text-pink-200">
                {t('explore')}
              </Link>
            </li>
            <li>
              <Link to="/messages" className="text-white hover:text-pink-200">
                {t('messages')}
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-white hover:text-pink-200">
                {t('profile')}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex space-x-2">
          <Button variant="secondary" asChild>
            <Link to="/auth/login">{t('login')}</Link>
          </Button>
          <Button variant="default" asChild>
            <Link to="/auth/signup">{t('signup')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}