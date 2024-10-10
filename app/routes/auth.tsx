import { Outlet } from '@remix-run/react';

export default function Auth() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}