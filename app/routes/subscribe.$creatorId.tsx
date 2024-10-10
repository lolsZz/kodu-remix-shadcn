import { useState } from 'react';
import { useLoaderData, Form, useActionData, useNavigation } from '@remix-run/react';
import { json, LoaderFunction, ActionFunction, redirect } from '@remix-run/node';
import { PrismaClient, User } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { getToken, getUserIdFromToken } from '~/utils/auth';

const prisma = new PrismaClient();

type LoaderData = {
  creator: User;
};

export const loader: LoaderFunction = async ({ params, request }): Promise<Response> => {
  const { creatorId } = params;
  if (!creatorId) throw new Error("Creator ID is required");

  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
  });

  if (!creator) {
    throw new Response('クリエイターが見つかりません', { status: 404 });
  }

  return json<LoaderData>({ creator });
};

export const action: ActionFunction = async ({ request, params }) => {
  const token = getToken();
  if (!token) {
    return redirect('/auth/login');
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    return redirect('/auth/login');
  }

  const { creatorId } = params;
  if (!creatorId) throw new Error("Creator ID is required");

  const formData = await request.formData();
  const price = parseFloat(formData.get('price') as string);

  if (isNaN(price) || price <= 0) {
    return json({ error: '有効な価格を入力してください。' }, { status: 400 });
  }

  try {
    const subscription = await prisma.subscription.create({
      data: {
        subscriber: { connect: { id: userId } },
        creator: { connect: { id: creatorId } },
        price: price,
        status: 'ACTIVE',
      },
    });

    // Here you would typically integrate with a payment gateway
    // For now, we'll create a dummy payment record
    await prisma.payment.create({
      data: {
        amount: price,
        status: 'COMPLETED',
        paymentMethod: 'CREDIT_CARD',
        user: { connect: { id: userId } },
        subscription: { connect: { id: subscription.id } },
      },
    });

    return redirect(`/profile/${creatorId}`);
  } catch (error) {
    console.error('Subscription creation error:', error);
    return json({ error: '購読の作成中にエラーが発生しました。' }, { status: 500 });
  }
};

export default function Subscribe() {
  const { creator } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [price, setPrice] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('subscribeToCreator', { name: creator.name })}</h1>
      <Form method="post" className="space-y-4">
        <div>
          <Label htmlFor="price">{t('subscriptionPrice')}</Label>
          <Input 
            type="number" 
            id="price" 
            name="price" 
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            required 
          />
        </div>
        {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
        <Button type="submit" disabled={navigation.state === 'submitting'}>
          {navigation.state === 'submitting' ? t('processing') : t('subscribe')}
        </Button>
      </Form>
    </div>
  );
}