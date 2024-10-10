import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
import { getToken, getUserIdFromToken } from '~/utils/auth';

const prisma = new PrismaClient();

export const loader: LoaderFunction = async ({ params }) => {
  // Redirect to the content page if accessed directly
  return redirect(`/content/${params.contentId}`);
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

  try {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new Response('コンテンツが見つかりません', { status: 404 });
    }

    if (content.creatorId !== userId) {
      throw new Response('このコンテンツを削除する権限がありません', { status: 403 });
    }

    await prisma.content.delete({
      where: { id: contentId },
    });

    // Redirect to the creator's profile or content list
    return redirect('/profile');
  } catch (error) {
    console.error('Content deletion error:', error);
    return new Response('コンテンツの削除中にエラーが発生しました。', { status: 500 });
  }
};