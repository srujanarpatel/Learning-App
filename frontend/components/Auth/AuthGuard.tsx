'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

const publicPaths = ['/auth/login', '/auth/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Auth logic for protected vs public routes
    const isPublicPath = publicPaths.includes(pathname);
    
    if (!isAuthenticated && !isPublicPath) {
      router.replace('/auth/login');
    } else if (isAuthenticated && isPublicPath) {
      router.replace('/subjects'); // Default redirect upon being logged in
    }
  }, [mounted, isAuthenticated, pathname, router]);

  if (!mounted) return null; // Avoid hydration mismatch

  // Wait for redirect to happen if conditions match Auth rules
  if ((!isAuthenticated && !publicPaths.includes(pathname)) ||
      (isAuthenticated && publicPaths.includes(pathname))) {
      return null;
  }

  return <>{children}</>;
}
