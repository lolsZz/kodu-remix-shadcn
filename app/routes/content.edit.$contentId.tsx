import { useState } from 'react';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { json, ActionFunction, LoaderFunction, redirect } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { getToken, getUserIdFromToken } from '~/utils/auth';

const prisma = new PrismaClient();

type LoaderData = {
  content: {
    id: string;
    title: string;
    description: string | null;
    fileUrl: string;
    creatorId: string;
  };
};

export const loader: LoaderFunction = async ({ params, request }): Promise<Response> => {
  const token = getToken();
  if (!token) {
    throw redirect('/auth/login');
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    throw redirect('/auth/login');
  }

  const { contentId } = params;
  if (!contentId) throw new Error("Content ID is required");

  const content = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new Response('コンテンツが見つかりません', { status: 404 });
  }

  if (content.creatorId !== userId) {
    throw new Response('このコンテンツを編集する権限がありません', { status: 403 });
  }

  return json<LoaderData>({ content });
};

export const action: ActionFunction = async ({ request, params }) => {
  const token = getToken();
  if (!token) {
    throw redirect('/auth/login');
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    throw redirect('/auth/login');
  }

  const { contentId } = params;
  if (!contentId) throw new Error("Content ID is required");

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const file = formData.get('file') as File | null;

  if (!title) {
    return json({ error: 'タイトルは必須です。' }, { status: 400 });
  }

  try {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new Response('コンテンツが見つかりません', { status: 404 });
    }

    if (content.creatorId !== userId) {
      throw new Response('このコンテンツを編集する権限がありません', { status: 403 });
    }

    let fileUrl = content.fileUrl;
    if (file) {
      // Here you would typically upload the new file to a storage service
      // and get back a new URL. For this example, we'll use a placeholder URL.
      fileUrl = 'https://example.com/new-placeholder.jpg';
    }

    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: {
        title,
        description,
        fileUrl,
      },
    });

    return redirect(`/content/${updatedContent.id}`);
  } catch (error) {
    console.error('Content update error:', error);
    return json({ error: 'コンテンツの更新中にエラーが発生しました。' }, { status: 500 });
  }
};

export default function EditContent() {
  const { content } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(content.fileUrl);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('editContent')}</h1>
      <Form method="post" className="space-y-4" encType="multipart/form-data">
        <div>
          <Label htmlFor="title">{t('title')}</Label>
          <Input type="text" id="title" name="title" defaultValue={content.title} required />
        </div>
        <div>
          <Label htmlFor="description">{t('description')}</Label>
          <Textarea id="description" name="description" defaultValue={content.description || ''} />
        </div>
        <div>
          <Label htmlFor="file">{t('file')}</Label>
          <Input type="file" id="file" name="file" onChange={handleFileChange} />
          {previewUrl && (
            <div className="mt-2">
              <img src={previewUrl} alt="プレビュー" className="max-w-full h-auto" />
            </div>
          )}
        </div>
        {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
        <Button type="submit" disabled={navigation.state === 'submitting'}>
          {navigation.state === 'submitting' ? t('updating') : t('update')}
        </Button>
      </Form>
    </div>
  );
}