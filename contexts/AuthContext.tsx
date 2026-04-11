'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthContextType, AuthUser, Agent, Organization } from '@/types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchAgentData(userId: string) {
    const { data } = await supabase
      .from('agents')
      .select('*, organizations(*)')
      .eq('user_id', userId)
      .single();

    if (data) {
      const { organizations: org, ...agentData } = data as Agent & { organizations: Organization };
      setAgent(agentData);
      setOrganization(org);
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(session.user as AuthUser);
        await fetchAgentData(session.user.id);
      } else {
        setUser(null);
        setAgent(null);
        setOrganization(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(email: string, password: string, orgName: string, fullName: string): Promise<{ needsEmailConfirmation: boolean }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { org_name: orgName, full_name: fullName } },
    });
    if (error) throw error;
    return { needsEmailConfirmation: !data.session };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      user,
      agent,
      organization,
      isLoading,
      isAuthenticated: !!user,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
