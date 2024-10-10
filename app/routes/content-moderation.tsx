import React, { useState } from 'react';
import { useLoaderData, useNavigate, Form } from '@remix-run/react';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { PrismaClient, Content } from '@prisma/client';
import { getToken, getUserIdFromToken } from '~/utils/auth';

const prisma = new PrismaClient();

type LoaderData = {
  contents: Content[];
};

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData> => {
  const token = getToken();
  if (!token) {
    throw new Response('認証が必要です', { status: 401 });
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    throw new Response('認証が必要です', { status: 401 });
  }

  // Check if the user is an admin (you might want to add an 'isAdmin' field to your User model)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'ADMIN') {
    throw new Response('権限がありません', { status: 403 });
  }

  const contents = await prisma.content.findMany({
    where: { isModerated: false },
    take: 10, // Limit to 10 unmoderated contents
  });

  return json({ contents });
};

export const action: ActionFunction = async ({ request }) => {
  const token = getToken();
  if (!token) {
    return json({ error: '認証が必要です。' }, { status: 401 });
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    return json({ error: '認証が必要です。' }, { status: 401 });
  }

  const formData = await request.formData();
  const contentId = formData.get('contentId') as string;
  const action = formData.get('action') as 'approve' | 'reject';

  if (!contentId || !action) {
    return json({ error: 'コンテンツIDとアクションは必須です。' }, { status: 400 });
  }

  try {
    await prisma.content.update({
      where: { id: contentId },
      data: {
        isModerated: true,
        isApproved: action === 'approve',
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error('Content moderation error:', error);
    return json({ error: 'コンテンツの審査中にエラーが発生しました。' }, { status: 500 });
  }
};

export default function ContentModeration() {
  const { contents } = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleModeration = async (contentId: string, action: 'approve' | 'reject') => {
    const formData = new FormData();
    formData.append('contentId', contentId);
    formData.append('action', action);

    const response = await fetch('/content-moderation', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      // Refresh the page or update the content list
      navigate('.', { replace: true });
    } else {
      // Handle error
      console.error('Moderation failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('contentModeration')}</h1>
      <div className="space-y-4">
        {contents.map((content) => (
          <div key={content.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{content.title}</h2>
            <p className="mb-4">{content.description}</p>
            {content.fileUrl.endsWith('.mp4') ? (
              <video src={content.fileUrl} controls className="w-full mb-4" />
            ) : (
              <img src={content.fileUrl} alt={content.title} className="w-full mb-4" />
            )}
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => handleModeration(content.id, 'approve')}
                variant="primary"
              >
                {t('approve')}
              </Button>
              <Button
                onClick={() => handleModeration(content.id, 'reject')}
                variant="destructive"
              >
                {t('reject')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}