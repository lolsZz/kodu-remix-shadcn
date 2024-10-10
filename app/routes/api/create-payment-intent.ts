import { json, ActionFunction } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
import { getToken, getUserIdFromToken } from '~/utils/auth';
import stripe from '~/utils/stripe.server';

const prisma = new PrismaClient();

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
  const creatorId = formData.get('creatorId') as string;
  const price = parseFloat(formData.get('price') as string);

  if (!creatorId || isNaN(price)) {
    return json({ error: 'クリエイターIDと価格は必須です。' }, { status: 400 });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100), // Stripe expects amounts in cents
      currency: 'jpy',
      metadata: { userId, creatorId },
    });

    return json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return json({ error: '決済の準備中にエラーが発生しました。' }, { status: 500 });
  }
};