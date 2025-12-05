import { Metadata } from 'next';
import { RoleGuard } from '@/shared/components/auth';
import { MenuModifiersPage } from '@/features/menu-modifiers';

export const metadata: Metadata = {
  title: 'Modifiers | TKQR Admin',
  description:
    'Manage reusable modifier groups (sizes, toppings, extras) for your menu items',
};

export default function MenuModifiersRoute() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <MenuModifiersPage />
    </RoleGuard>
  );
}
