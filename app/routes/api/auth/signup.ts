import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password) {
    return json({ error: 'メールアドレスとパスワードは必須です。' }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return json({ error: 'このメールアドレスは既に使用されています。' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name,
      },
    });

    return json({ message: 'ユーザーが正常に作成されました。', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return json({ error: 'ユーザーの作成中にエラーが発生しました。' }, { status: 500 });
  }
};