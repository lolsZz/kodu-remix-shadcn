import { useState, useEffect } from 'react';
import { useLoaderData, Form, useActionData, useNavigation } from '@remix-run/react';
import { json, LoaderFunction, ActionFunction, redirect } from '@remix-run/node';
import { PrismaClient, User } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { getToken, getUserIdFromToken } from '~/utils/auth';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const prisma = new PrismaClient();

// Make sure to set this in your environment variables
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY || '');

type LoaderData = {
  creator: User;
};

export const loader: LoaderFunction = async ({ params, request }): Promise<Response> => {
  const { creatorId } = params;
  if (!creatorId) throw new Error("Creator ID is required");

  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
  });

  if (!creator) {
    throw new Response('クリエイターが見つかりません', { status: 404 });
  }

  return json<LoaderData>({ creator });
};

export const action: ActionFunction = async ({ request, params }) => {
  const token = getToken();
  if (!token) {
    return redirect('/auth/login');
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    return redirect('/auth/login');
  }

  const { creatorId } = params;
  if (!creatorId) throw new Error("Creator ID is required");

  const formData = await request.formData();
  const price = parseFloat(formData.get('price') as string);
  const paymentIntentId = formData.get('paymentIntentId') as string;

  if (isNaN(price) || price <= 0) {
    return json({ error: '有効な価格を入力してください。' }, { status: 400 });
  }

  if (!paymentIntentId) {
    return json({ error: '決済情報が見つかりません。' }, { status: 400 });
  }

  try {
    // Verify the payment was successful with Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return json({ error: '決済が完了していません。' }, { status: 400 });
    }

    const subscription = await prisma.subscription.create({
      data: {
        subscriber: { connect: { id: userId } },
        creator: { connect: { id: creatorId } },
        price: price,
        status: 'ACTIVE',
      },
    });

    await prisma.payment.create({
      data: {
        amount: price,
        status: 'COMPLETED',
        paymentMethod: 'CREDIT_CARD',
        transactionId: paymentIntentId,
        user: { connect: { id: userId } },
        subscription: { connect: { id: subscription.id } },
      },
    });

    return redirect(`/profile/${creatorId}`);
  } catch (error) {
    console.error('Subscription creation error:', error);
    return json({ error: '購読の作成中にエラーが発生しました。' }, { status: 500 });
  }
};

function CheckoutForm({ price }: { price: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [price]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('カード情報の入力欄が見つかりません。');
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (result.error) {
      setError(result.error.message || '決済処理中にエラーが発生しました。');
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        // Pass the payment intent ID to the server
        const form = event.currentTarget;
        const formData = new FormData(form);
        formData.append('paymentIntentId', result.paymentIntent.id);
        
        // Submit the form with the payment intent ID
        form.submit();
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit} method="post">
      <CardElement />
      <input type="hidden" name="price" value={price} />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <Button type="submit" disabled={!stripe || navigation.state === 'submitting'} className="mt-4">
        支払う
      </Button>
    </Form>
  );
}

export default function Subscribe() {
  const { creator } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ error?: string }>();
  const { t } = useTranslation();
  const [price, setPrice] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('subscribeToCreator', { name: creator.name })}</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="price">{t('subscriptionPrice')}</Label>
          <Input 
            type="number" 
            id="price" 
            name="price" 
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            required 
          />
        </div>
        {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
        {price && (
          <Elements stripe={stripePromise}>
            <CheckoutForm price={parseFloat(price)} />
          </Elements>
        )}
      </div>
    </div>
  );
}
