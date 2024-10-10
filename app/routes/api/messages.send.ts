import { json, ActionFunction } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
import { getToken, getUserIdFromToken } from '~/utils/auth';

const prisma = new PrismaClient();

export const action: ActionFunction = async ({ request }) => {
  const token = getToken();
  if (!token) {
    return json({ error: '認証が必要です。' }, { status: 401 });
  }

  const senderId = getUserIdFromToken(token);
  if (!senderId) {
    return json({ error: '認証が必要です。' }, { status: 401 });
  }

  const formData = await request.formData();
  const content = formData.get('content') as string;
  const recipientId = formData.get('recipientId') as string;

  if (!content || !recipientId) {
    return json({ error: 'メッセージ内容と受信者IDは必須です。' }, { status: 400 });
  }

  try {
    const message = await prisma.message.create({
      data: {
        content,
        sender: { connect: { id: senderId } },
        recipient: { connect: { id: recipientId } },
      },
    });

    return json({ success: true, message });
  } catch (error) {
    console.error('Message sending error:', error);
    return json({ error: 'メッセージの送信中にエラーが発生しました。' }, { status: 500 });
  }
};