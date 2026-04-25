"use client";

import { useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: 'PATIENT' | 'DOCTOR' | 'SUPER_ADMIN';
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setUser(data?.data ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return { user, loading, logout };
}
