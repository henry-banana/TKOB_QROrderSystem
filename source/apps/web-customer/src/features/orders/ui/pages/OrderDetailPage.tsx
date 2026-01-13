'use client'

import { ArrowLeft, Loader2, Clock, CheckCircle2, XCircle, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useOrder } from '@/hooks/useOrders'

interface OrderDetailPageProps {
  orderId: string
}

const STATUS_CONFIG = {
  PENDING: { icon: Clock, color: 'var(--orange-500)', label: 'Pending' },
  CONFIRMED: { icon: CheckCircle2, color: 'var(--blue-500)', label: 'Confirmed' },
  PREPARING: { icon: Package, color: 'var(--purple-500)', label: 'Preparing' },
  READY: { icon: CheckCircle2, color: 'var(--green-500)', label: 'Ready' },
  COMPLETED: { icon: CheckCircle2, color: 'var(--green-600)', label: 'Completed' },
  CANCELLED: { icon: XCircle, color: 'var(--red-500)', label: 'Cancelled' },
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const router = useRouter()
  const { data: orderResponse, isLoading, error } = useOrder(orderId)
  
  const order = orderResponse?.data

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--orange-500)' }} />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="p-4 text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--red-500)' }} />
          <p style={{ color: 'var(--gray-600)' }}>Failed to load order</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 rounded-full"
            style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
  const StatusIcon = statusConfig.icon

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <div className="flex-1">
            <h2 style={{ color: 'var(--gray-900)' }}>Order #{order.orderNumber}</h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${statusConfig.color}20` }}
            >
              <StatusIcon className="w-6 h-6" style={{ color: statusConfig.color }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Status</p>
              <p className="font-medium" style={{ color: statusConfig.color }}>
                {statusConfig.label}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        {(order.customerName || order.specialInstructions) && (
          <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
            <h3 className="font-medium mb-3" style={{ color: 'var(--gray-900)' }}>Order Info</h3>
            {order.customerName && (
              <div className="mb-2">
                <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Customer</p>
                <p style={{ color: 'var(--gray-900)' }}>{order.customerName}</p>
              </div>
            )}
            {order.specialInstructions && (
              <div>
                <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Notes</p>
                <p style={{ color: 'var(--gray-900)' }}>{order.specialInstructions}</p>
              </div>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
          <h3 className="font-medium mb-3" style={{ color: 'var(--gray-900)' }}>Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div className="flex-1">
                  <p style={{ color: 'var(--gray-900)' }}>{item.name}</p>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Qty: {item.quantity}</p>
                </div>
                <p style={{ color: 'var(--gray-900)' }}>
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-4 border" style={{ borderColor: 'var(--gray-200)' }}>
          <h3 className="font-medium mb-3" style={{ color: 'var(--gray-900)' }}>Summary</h3>
          <div className="space-y-2" style={{ fontSize: '14px' }}>
            <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--gray-700)' }}>
              <span>Service Charge</span>
              <span>${order.serviceCharge.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-medium" style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-900)' }}>
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
