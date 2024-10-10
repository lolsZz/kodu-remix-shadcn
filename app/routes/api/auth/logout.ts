import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';

export const action: ActionFunction = async () => {
  // For a simple logout, we just need to clear the token on the client side
  // Here, we'll just return a success message
  return json({ message: 'ログアウトしました。' });
};

// You might want to add some server-side logic here if you're using sessions
// For example, invalidating the token on the server or clearing server-side sessions