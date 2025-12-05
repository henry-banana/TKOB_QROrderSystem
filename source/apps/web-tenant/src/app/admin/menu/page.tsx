import { Metadata } from 'next';
import { RoleGuard } from '@/shared/components/auth';
import { MenuManagementPage } from '@/features/menu-management';

export const metadata: Metadata = {
  title: 'Menu Management | TKOB Admin',
  description: 'Manage your restaurant menu items, categories, and modifiers',
};

export default function MenuPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <MenuManagementPage />
    </RoleGuard>
  );
}
