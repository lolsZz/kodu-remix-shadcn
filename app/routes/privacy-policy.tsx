import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('privacyPolicy')}</h1>
      <div className="space-y-4">
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('informationWeCollect')}</h2>
          <p>{t('informationWeCollectDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('howWeUseInformation')}</h2>
          <p>{t('howWeUseInformationDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('informationSharing')}</h2>
          <p>{t('informationSharingDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('dataSecurity')}</h2>
          <p>{t('dataSecurityDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('userRights')}</h2>
          <p>{t('userRightsDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('cookiesAndTracking')}</h2>
          <p>{t('cookiesAndTrackingDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('changesTo PrivacyPolicy')}</h2>
          <p>{t('changesToPrivacyPolicyDescription')}</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-2">{t('contactUs')}</h2>
          <p>{t('contactUsDescription')}</p>
        </section>
      </div>
    </div>
  );
}