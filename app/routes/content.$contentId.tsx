import { useLoaderData, useParams } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { PrismaClient, Content, User } from '@prisma/client';
import { useTranslation } from 'react-i18next';

const prisma = new PrismaClient();

type LoaderData = {
  content: Content & {
    creator: User;
  };
};

export const loader: LoaderFunction = async ({ params }): Promise<Response> => {
  const { contentId } = params;
  if (!contentId) throw new Error("Content ID is required");
  
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      creator: true,
    },
  });

  if (!content) {
    throw new Response('コンテンツが見つかりません', { status: 404 });
  }

  return json<LoaderData>({ content });
};

export default function ContentDetail() {
  const { content } = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  const { contentId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
      <div className="mb-4">
        <p className="text-gray-600">{t('createdBy')} {content.creator.name}</p>
        <p className="text-gray-600">{t('createdAt')} {new Date(content.createdAt).toLocaleString()}</p>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{t('description')}</h2>
        <p>{content.description}</p>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{t('content')}</h2>
        {content.fileUrl.endsWith('.mp4') ? (
          <video controls className="w-full">
            <source src={content.fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={content.fileUrl} alt={content.title} className="max-w-full h-auto" />
        )}
      </div>
      {/* Here you can add more features like comments, likes, etc. */}
    </div>
  );
}