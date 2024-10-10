import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('termsOfService')}</h1>
      <div className="space-y-4">
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('introduction')}</h2>
          <p>{t('termsIntroduction')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('useOfService')}</h2>
          <p>{t('useOfServiceDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('userAccounts')}</h2>
          <p>{t('userAccountsDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('contentGuidelines')}</h2>
          <p>{t('contentGuidelinesDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('intellectualProperty')}</h2>
          <p>{t('intellectualPropertyDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('paymentAndSubscriptions')}</h2>
          <p>{t('paymentAndSubscriptionsDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('terminationOfService')}</h2>
          <p>{t('terminationOfServiceDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('disclaimersAndLimitations')}</h2>
          <p>{t('disclaimersAndLimitationsDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('governingLaw')}</h2>
          <p>{t('governingLawDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('changes')}</h2>
          <p>{t('changesDescription')}</p>
        </section>
      </div>
    </div>
  );
}