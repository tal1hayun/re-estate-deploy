'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import HomeNavbar from '@/components/home/HomeNavbar';
import HomeHero from '@/components/home/HomeHero';

export default function InternalHomePage() {
  const { user, agent, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div className="spinner" />
      </div>
    );
  }

  const agentInitial =
    agent?.full_name?.[0]?.toUpperCase() ??
    user.email?.[0]?.toUpperCase() ??
    '?';

  return (
    <>
      <HomeNavbar agentInitial={agentInitial} onSignOut={signOut} />
      <HomeHero />
    </>
  );
}
