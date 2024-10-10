import React from 'react';
import { useLoaderData, Link } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { PrismaClient, User } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';

const prisma = new PrismaClient();

type LoaderData = {
  creators: User[];
};

export const loader: LoaderFunction = async (): Promise<Response> => {
  const creators = await prisma.user.findMany({
    where: { role: 'CREATOR' },
    take: 12, // Limit to 12 creators for now
  });

  return json<LoaderData>({ creators });
};

export default function Explore() {
  const { creators } = useLoaderData<LoaderData>();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('exploreCreators')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {creators.map((creator) => (
          <div key={creator.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <img
              src={creator.profileImage || 'https://via.placeholder.com/300x200'}
              alt={creator.name || ''}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{creator.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{creator.bio}</p>
              <Button asChild variant="primary" className="w-full">
                <Link to={`/profile/${creator.id}`}>{t('viewProfile')}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}