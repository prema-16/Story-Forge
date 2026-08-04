'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { FullPageSpinner } from '../components/ui/spinner';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe().then(() => {
      if (useAuthStore.getState().isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    });
  }, []);

  return <FullPageSpinner />;
}
