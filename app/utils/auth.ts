import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  if (response.ok) {
    removeToken();
    // Redirect to home page or login page after logout
    window.location.href = '/';
  } else {
    console.error('Logout failed');
  }
};

export const getUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};