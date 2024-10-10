import { useState } from 'react';
import { useNavigate, Form } from '@remix-run/react';
import { json, ActionFunction } from '@remix-run/node';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    // Here you would typically set the token in a cookie or local storage
    // For this example, we'll just return it
    return json({ success: true, token: data.token });
  } else {
    const data = await response.json();
    return json({ error: data.error });
  }
};

export default function Login() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      // Here you would typically save the token to local storage or a cookie
      localStorage.setItem('token', data.token);
      navigate('/'); // Redirect to home page or dashboard
    } else {
      const data = await response.json();
      setError(data.error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">{t('login')}</h2>
      <Form method="post" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">{t('email')}</Label>
          <Input type="email" id="email" name="email" required />
        </div>
        <div>
          <Label htmlFor="password">{t('password')}</Label>
          <Input type="password" id="password" name="password" required />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" className="w-full">{t('login')}</Button>
      </Form>
      <p className="text-center">
        {t('dontHaveAccount')}{' '}
        <a href="/auth/signup" className="text-blue-500 hover:underline">
          {t('signup')}
        </a>
      </p>
    </div>
  );
}