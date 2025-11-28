import { Metadata } from 'next';
import { RoleGuard } from '@/shared/components/auth';
import { ServiceBoard } from '@/features/service-board';

export const metadata: Metadata = {
  title: 'Service Board | TKOB',
  description: 'Waiter service board for table management and orders',
};

export default function Page() {
  return (
    <RoleGuard allowedRoles={['waiter']}>
      <ServiceBoard />
    </RoleGuard>
  );
}
