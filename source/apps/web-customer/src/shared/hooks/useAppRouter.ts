'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

export function useAppRouter() {
  const router = useRouter();

  const goTo = (path: string) => router.push(path);
  const replace = (path: string) => router.replace(path);
  const back = () => router.back();

  const goHome = () => router.push(ROUTES.home);
  const goMenu = () => router.push(ROUTES.menu);
  const goCart = () => router.push(ROUTES.cart);
  const goCheckout = () => router.push(ROUTES.checkout);

  return { goTo, replace, back, goHome, goMenu, goCart, goCheckout };
}
