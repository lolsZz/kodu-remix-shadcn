import React from 'react';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('about')}</h3>
            <p className="text-sm">{t('footerAboutText')}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm hover:text-pink-300">
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-pink-300">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-pink-300">
                  {t('contactUs')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('followUs')}</h3>
            <div className="flex space-x-4">
              {/* Add social media icons here */}
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} OnlyJapan. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}