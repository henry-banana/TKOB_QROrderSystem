import { Metadata } from 'next';
import { RoleGuard } from '@/shared/components/auth';
import { KDSBoard } from '@/features/kds';

export const metadata: Metadata = {
  title: 'Kitchen Display System | TKOB',
  description: 'Kitchen order display and management',
};

export default function Page() {
  return (
    <RoleGuard allowedRoles={['kds']}>
      <KDSBoard />
    </RoleGuard>
  );
}
