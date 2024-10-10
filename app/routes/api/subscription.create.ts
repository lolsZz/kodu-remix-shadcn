import { json, ActionFunction } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
import { getToken, getUserIdFromToken } from '~/utils/auth';

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
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: {
          subscriberId: userId,
          creatorId: creatorId,
        },
      },
    });

    if (existingSubscription) {
      return json({ error: 'すでにこのクリエイターを購読しています。' }, { status: 400 });
    }

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

    return json({ success: true, subscription });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return json({ error: '購読の作成中にエラーが発生しました。' }, { status: 500 });
  }
};