import { useState } from 'react';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { json, LoaderFunction, ActionFunction, redirect } from '@remix-run/node';
import { PrismaClient, User } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { getToken } from '~/utils/auth';

const prisma = new PrismaClient();

type LoaderData = {
  user: User;
};

export const loader: LoaderFunction = async ({ request }): Promise<Response> => {
  const token = getToken();
  if (!token) {
    throw redirect('/auth/login');
  }

  // Here you would decode the token and get the user ID
  // For simplicity, let's assume we have a function to do this
  const userId = getUserIdFromToken(token);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Response('ユーザーが見つかりません', { status: 404 });
  }

  return json<LoaderData>({ user });
};

export const action: ActionFunction = async ({ request }) => {
  const token = getToken();
  if (!token) {
    throw redirect('/auth/login');
  }

  const userId = getUserIdFromToken(token);
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string | null;
  const profileImage = formData.get('profileImage') as string | null;
  const coverImage = formData.get('coverImage') as string | null;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        name, 
        bio, 
        profileImage, 
        coverImage 
      },
    });

    return redirect(`/profile/${userId}`);
  } catch (error) {
    return json({ error: 'プロフィールの更新中にエラーが発生しました。' });
  }
};

export default function EditProfile() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ error?: string }>();
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('editProfile')}</h1>
      <Form method="post" className="space-y-4">
        <div>
          <Label htmlFor="name">{t('name')}</Label>
          <Input type="text" id="name" name="name" defaultValue={user.name || ''} required />
        </div>
        <div>
          <Label htmlFor="bio">{t('bio')}</Label>
          <Textarea id="bio" name="bio" defaultValue={user.bio || ''} />
        </div>
        <div>
          <Label htmlFor="profileImage">{t('profileImage')}</Label>
          <Input type="file" id="profileImage" name="profileImage" onChange={handleImageChange} />
          {previewImage && (
            <img src={previewImage} alt="プレビュー" className="mt-2 w-32 h-32 object-cover rounded-full" />
          )}
        </div>
        <div>
          <Label htmlFor="coverImage">{t('coverImage')}</Label>
          <Input type="file" id="coverImage" name="coverImage" />
        </div>
        {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
        <Button type="submit">{t('saveChanges')}</Button>
      </Form>
    </div>
  );
}

// This is a placeholder function. In a real application, you would implement proper token decoding.
function getUserIdFromToken(token: string): string {
  // Implement token decoding logic here
  return 'user-id-from-token';
}