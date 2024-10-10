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
  const subscriptionId = formData.get('subscriptionId') as string;

  if (!subscriptionId) {
    return json({ error: '購読IDは必須です。' }, { status: 400 });
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return json({ error: '購読が見つかりません。' }, { status: 404 });
    }

    if (subscription.subscriberId !== userId) {
      return json({ error: 'この購読をキャンセルする権限がありません。' }, { status: 403 });
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED' as const,
        endDate: new Date(), // End the subscription immediately
      },
    });

    return json({ success: true, subscription: updatedSubscription });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return json({ error: '購読のキャンセル中にエラーが発生しました。' }, { status: 500 });
  }
};