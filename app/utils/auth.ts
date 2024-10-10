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