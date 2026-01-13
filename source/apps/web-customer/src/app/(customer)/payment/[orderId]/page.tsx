import { PaymentPage } from '@/features/payment/ui/pages/PaymentPage'

export default function PaymentRoute({ params }: { params: { orderId: string } }) {
  return <PaymentPage orderId={params.orderId} />
}
