'use client';
import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  image?: string | null;
}

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Fetch user profile with username from database
    fetch(`/api/user/profile?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setProfile(data.user);
        } else {
          setProfile(null);
        }
      })
      .catch(() => {
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, authLoading]);

  return { profile, loading: loading || authLoading };
}

