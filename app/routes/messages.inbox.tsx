import { useLoaderData, Link } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { PrismaClient, User } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { getToken, getUserIdFromToken } from '~/utils/auth';

const prisma = new PrismaClient();

type LoaderData = {
  conversations: {
    user: User;
    lastMessage: {
      content: string;
      createdAt: Date;
    };
  }[];
};

export const loader: LoaderFunction = async ({ request }): Promise<Response> => {
  const token = getToken();
  if (!token) {
    throw new Response('認証が必要です', { status: 401 });
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    throw new Response('認証が必要です', { status: 401 });
  }

  try {
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['senderId', 'recipientId'],
      select: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        content: true,
        createdAt: true,
      },
    });

    const formattedConversations = conversations.map((conversation) => {
      const otherUser = conversation.senderId === userId ? conversation.recipient : conversation.sender;
      return {
        user: otherUser,
        lastMessage: {
          content: conversation.content,
          createdAt: conversation.createdAt,
        },
      };
    });

    return json<LoaderData>({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error loading conversations:', error);
    throw new Response('会話の読み込み中にエラーが発生しました', { status: 500 });
  }
};

export default function MessageInbox() {
  const { conversations } = useLoaderData<LoaderData>();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('messageInbox')}</h1>
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <Link
            key={conversation.user.id}
            to={`/messages/${conversation.user.id}`}
            className="block bg-white shadow rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex items-center">
              <img
                src={conversation.user.profileImage || 'https://via.placeholder.com/50'}
                alt={conversation.user.name || ''}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h2 className="font-semibold">{conversation.user.name}</h2>
                <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.content}</p>
                <small className="text-gray-500">
                  {new Date(conversation.lastMessage.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}