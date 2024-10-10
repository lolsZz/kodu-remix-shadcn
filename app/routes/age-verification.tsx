import React, { useState } from 'react';
import { useNavigate, Form } from '@remix-run/react';
import { json, ActionFunction, redirect } from '@remix-run/node';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { PrismaClient } from '@prisma/client';
import { getToken, getUserIdFromToken } from '~/utils/auth';

const prisma = new PrismaClient();

export const action: ActionFunction = async ({ request }) => {
  const token = getToken();
  if (!token) {
    return redirect('/auth/login');
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    return redirect('/auth/login');
  }

  const formData = await request.formData();
  const birthDate = formData.get('birthDate') as string;

  if (!birthDate) {
    return json({ error: '生年月日は必須です。' }, { status: 400 });
  }

  const birthDateObj = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  if (age < 18) {
    return json({ error: '18歳未満の方はご利用いただけません。' }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { ageVerified: true },
    });

    return redirect('/');
  } catch (error) {
    console.error('Age verification error:', error);
    return json({ error: '年齢確認中にエラーが発生しました。' }, { status: 500 });
  }
};

export default function AgeVerification() {
  const { t } = useTranslation();
  const [birthDate, setBirthDate] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Form submission is handled by Remix action
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('ageVerification')}</h1>
      <p className="mb-4">{t('ageVerificationDescription')}</p>
      <Form method="post" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="birthDate">{t('birthDate')}</Label>
          <Input
            type="date"
            id="birthDate"
            name="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>
        <Button type="submit">{t('verify')}</Button>
      </Form>
    </div>
  );
}