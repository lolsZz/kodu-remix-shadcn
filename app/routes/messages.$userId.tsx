import { useState, useEffect } from 'react';
import { useLoaderData, useParams, Form } from '@remix-run/react';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { PrismaClient, User, Message } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { getToken, getUserIdFromToken } from '~/utils/auth';

const prisma = new PrismaClient();

type LoaderData = {
  currentUser: User;
  otherUser: User;
  messages: Message[];
};

export const loader: LoaderFunction = async ({ params, request }): Promise<Response> => {
  const token = getToken();
  if (!token) {
    throw new Response('認証が必要です', { status: 401 });
  }

  const currentUserId = getUserIdFromToken(token);
  if (!currentUserId) {
    throw new Response('認証が必要です', { status: 401 });
  }

  const { userId: otherUserId } = params;
  if (!otherUserId) throw new Error("User ID is required");

  try {
    const [currentUser, otherUser, messages] = await Promise.all([
      prisma.user.findUnique({ where: { id: currentUserId } }),
      prisma.user.findUnique({ where: { id: otherUserId } }),
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: currentUserId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    if (!currentUser || !otherUser) {
      throw new Response('ユーザーが見つかりません', { status: 404 });
    }

    return json<LoaderData>({ currentUser, otherUser, messages });
  } catch (error) {
    console.error('Error loading messages:', error);
    throw new Response('メッセージの読み込み中にエラーが発生しました', { status: 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const token = getToken();
  if (!token) {
    return json({ error: '認証が必要です。' }, { status: 401 });
  }

  const senderId = getUserIdFromToken(token);
  if (!senderId) {
    return json({ error: '認証が必要です。' }, { status: 401 });
  }

  const { userId: recipientId } = params;
  if (!recipientId) throw new Error("Recipient ID is required");

  const formData = await request.formData();
  const content = formData.get('content') as string;

  if (!content) {
    return json({ error: 'メッセージ内容は必須です。' }, { status: 400 });
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

export default function MessageThread() {
  const { currentUser, otherUser, messages } = useLoaderData<LoaderData>();
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('messagingWith', { name: otherUser.name })}</h1>
      <div className="bg-gray-100 p-4 rounded-lg mb-4 h-96 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded-lg ${
              message.senderId === currentUser.id ? 'bg-blue-200 ml-auto' : 'bg-white'
            }`}
          >
            <p>{message.content}</p>
            <small className="text-gray-500">
              {new Date(message.createdAt).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
      <Form method="post" className="flex gap-2">
        <Input
          type="text"
          name="content"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t('typeYourMessage')}
          className="flex-grow"
        />
        <Button type="submit">{t('send')}</Button>
      </Form>
    </div>
  );
}