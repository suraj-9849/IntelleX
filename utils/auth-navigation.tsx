'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { ActionButton } from '@/components/action-button';

export default function AuthNavigation() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error('Error checking authentication:', error);
        }
        setUser(user);
      } catch (err) {
        console.error('Failed to check auth:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  if (loading) {
    return (
      <div className='flex gap-4'>
        <div className='h-10 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
      </div>
    );
  }

  return (
    <div className='flex gap-4'>
      {user ? (
        <Button onClick={handleSignOut} variant='outline'>
          Sign out
        </Button>
      ) : (
        <>
          <ActionButton href='/sign-in' label='SignIn'></ActionButton>
          <ActionButton href='/sign-up' label='Signup'></ActionButton>
        </>
      )}
    </div>
  );
}
