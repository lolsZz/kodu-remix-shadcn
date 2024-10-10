import { useState } from 'react';
import { useNavigate, Form } from '@remix-run/react';
import { json, ActionFunction, redirect } from '@remix-run/node';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const name = formData.get('name');

  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (response.ok) {
    return redirect('/auth/login');
  } else {
    const data = await response.json();
    return json({ error: data.error });
  }
};

export default function Signup() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      navigate('/auth/login');
    } else {
      const data = await response.json();
      setError(data.error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">{t('signup')}</h2>
      <Form method="post" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">{t('name')}</Label>
          <Input type="text" id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">{t('email')}</Label>
          <Input type="email" id="email" name="email" required />
        </div>
        <div>
          <Label htmlFor="password">{t('password')}</Label>
          <Input type="password" id="password" name="password" required />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" className="w-full">{t('signup')}</Button>
      </Form>
      <p className="text-center">
        {t('alreadyHaveAccount')}{' '}
        <a href="/auth/login" className="text-blue-500 hover:underline">
          {t('login')}
        </a>
      </p>
    </div>
  );
}