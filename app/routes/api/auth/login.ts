import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return json({ error: 'メールアドレスとパスワードは必須です。' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return json({ error: 'ユーザーが見つかりません。' }, { status: 400 });
    }

    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      return json({ error: 'パスワードが正しくありません。' }, { status: 400 });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    return json({ message: 'ログインに成功しました。', token, userId: user.id });
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'ログイン中にエラーが発生しました。' }, { status: 500 });
  }
};