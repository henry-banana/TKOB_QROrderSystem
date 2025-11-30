import { Metadata } from 'next';
import { RoleGuard } from '@/shared/components/auth';
import { MenuItemModifiersPage } from '@/features/menu-management';

export const metadata: Metadata = {
  title: 'Item Modifiers | TKQR Admin',
  description: 'Manage size and topping modifiers for a specific menu item',
};

export default function MenuItemModifiersRoute() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <MenuItemModifiersPage />
    </RoleGuard>
  );
}
