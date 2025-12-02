'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/supabase-auth';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getUser();
    if (user) {
      // User is authenticated, redirect to temperature reporting
      router.push('/temperature-reporting');
    } else {
      // User is not authenticated, redirect to login
      router.push('/login');
    }
  };

  // Show loading spinner while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
