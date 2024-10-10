import { useLoaderData, useParams } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { PrismaClient, User, Content, Subscription } from '@prisma/client';
import { useTranslation } from 'react-i18next';

const prisma = new PrismaClient();

type LoaderData = {
  user: User & {
    createdContent: Content[];
    subscribers: Subscription[];
  };
};

export const loader: LoaderFunction = async ({ params }): Promise<Response> => {
  const { userId } = params;
  if (!userId) throw new Error("User ID is required");
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      createdContent: true,
      subscribers: true,
    },
  });

  if (!user) {
    throw new Response('ユーザーが見つかりません', { status: 404 });
  }

  return json<LoaderData>({ user });
};

export default function UserProfile() {
  const { user } = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  const { userId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative">
        {user.coverImage && (
          <img
            src={user.coverImage}
            alt="カバー画像"
            className="w-full h-64 object-cover rounded-t-lg"
          />
        )}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-end">
            <img
              src={user.profileImage || 'https://via.placeholder.com/150'}
              alt={user.name || ''}
              className="w-24 h-24 rounded-full border-4 border-white mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-300">{user.role === 'CREATOR' ? t('creator') : t('subscriber')}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">{t('about')}</h2>
        <p>{user.bio || t('noBio')}</p>
      </div>

      {user.role === 'CREATOR' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">{t('content')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.createdContent.map((content) => (
              <div key={content.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{content.title}</h3>
                <p className="text-sm text-gray-600">{content.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">
          {user.role === 'CREATOR' ? t('subscribers') : t('subscriptions')}
        </h2>
        <p>{user.subscribers.length} {user.role === 'CREATOR' ? t('subscribers') : t('subscriptions')}</p>
      </div>
    </div>
  );
}
