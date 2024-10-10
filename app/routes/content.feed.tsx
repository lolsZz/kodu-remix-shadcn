import { useLoaderData } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { PrismaClient, Content, User } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { getToken, getUserIdFromToken } from '~/utils/auth';

const prisma = new PrismaClient();

type LoaderData = {
  contents: (Content & {
    creator: User;
  })[];
};

export const loader: LoaderFunction = async ({ request }): Promise<Response> => {
  const token = getToken();
  if (!token) {
    throw new Response('認証が必要です', { status: 401 });
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    throw new Response('認証が必要です', { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          include: {
            creator: {
              include: {
                createdContent: {
                  include: {
                    creator: true,
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Response('ユーザーが見つかりません', { status: 404 });
    }

    const contents = user.subscriptions.flatMap(sub => sub.creator.createdContent);

    return json<LoaderData>({ contents });
  } catch (error) {
    console.error('Content feed error:', error);
    throw new Response('コンテンツの取得中にエラーが発生しました', { status: 500 });
  }
};

export default function ContentFeed() {
  const { contents } = useLoaderData<LoaderData>();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('contentFeed')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contents.map((content) => (
          <div key={content.id} className="border rounded-lg overflow-hidden shadow-lg">
            <img src={content.fileUrl} alt={content.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{content.title}</h2>
              <p className="text-gray-600 mb-4">{content.description}</p>
              <p className="text-sm text-gray-500">
                {t('createdBy')} {content.creator.name} • {new Date(content.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}