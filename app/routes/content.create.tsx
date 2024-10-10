import { useState } from 'react';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { json, ActionFunction, redirect } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { getToken, getUserIdFromToken } from '~/utils/auth';

const prisma = new PrismaClient();

export const action: ActionFunction = async ({ request }) => {
  const token = getToken();
  if (!token) {
    throw redirect('/auth/login');
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    throw redirect('/auth/login');
  }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const file = formData.get('file') as File;

  if (!title || !file) {
    return json({ error: 'タイトルとファイルは必須です。' }, { status: 400 });
  }

  try {
    // Here you would typically upload the file to a storage service
    // and get back a URL. For this example, we'll use a placeholder URL.
    const fileUrl = 'https://example.com/placeholder.jpg';

    const content = await prisma.content.create({
      data: {
        title,
        description,
        fileUrl,
        creatorId: userId,
      },
    });

    return redirect(`/content/${content.id}`);
  } catch (error) {
    console.error('Content creation error:', error);
    return json({ error: 'コンテンツの作成中にエラーが発生しました。' }, { status: 500 });
  }
};

export default function CreateContent() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      <h1 className="text-2xl font-bold mb-4">{t('createContent')}</h1>
      <Form method="post" className="space-y-4" encType="multipart/form-data">
        <div>
          <Label htmlFor="title">{t('title')}</Label>
          <Input type="text" id="title" name="title" required />
        </div>
        <div>
          <Label htmlFor="description">{t('description')}</Label>
          <Textarea id="description" name="description" />
        </div>
        <div>
          <Label htmlFor="file">{t('file')}</Label>
          <Input type="file" id="file" name="file" onChange={handleFileChange} required />
          {previewUrl && (
            <div className="mt-2">
              <img src={previewUrl} alt="プレビュー" className="max-w-full h-auto" />
            </div>
          )}
        </div>
        {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
        <Button type="submit" disabled={navigation.state === 'submitting'}>
          {navigation.state === 'submitting' ? t('creating') : t('create')}
        </Button>
      </Form>
    </div>
  );
}