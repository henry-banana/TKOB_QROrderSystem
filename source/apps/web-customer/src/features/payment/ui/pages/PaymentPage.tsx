'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, Copy, Check } from 'lucide-react'
import { useCreatePaymentIntent, usePaymentStatus } from '@/hooks/usePayment'
import Image from 'next/image'

interface PaymentPageProps {
  orderId: string
}

export function PaymentPage({ orderId }: PaymentPageProps) {
  const router = useRouter()
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const createPayment = useCreatePaymentIntent()
  const { data: paymentStatus, isLoading: isPolling } = usePaymentStatus(paymentId, !!paymentId)

  // Create payment intent on mount
  useEffect(() => {
    if (!paymentId && !createPayment.isPending) {
      createPayment.mutate(
        {
          orderId,
          amount: 0, // Amount will be fetched from order
          paymentMethod: 'SEPAY',
        },
        {
          onSuccess: (response) => {
            if (response.success && response.data) {
              setPaymentId(response.data.id)
            }
          },
        }
      )
    }
  }, [orderId, paymentId, createPayment])

  const payment = paymentStatus?.data

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Handle payment completion
  useEffect(() => {
    if (payment?.status === 'COMPLETED') {
      // Redirect to order detail page after 2 seconds
      setTimeout(() => {
        router.push(`/orders/${orderId}`)
      }, 2000)
    }
  }, [payment?.status, orderId, router])

  // Show loading state while creating payment
  if (createPayment.isPending || (!payment && !createPayment.error)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--orange-500)' }} />
          <p style={{ color: 'var(--gray-600)' }}>Preparing payment...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (createPayment.error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--red-500)' }} />
          <h2 className="text-xl mb-2" style={{ color: 'var(--gray-900)' }}>Payment Error</h2>
          <p className="mb-6" style={{ color: 'var(--gray-600)' }}>
            {createPayment.error instanceof Error ? createPayment.error.message : 'Failed to create payment'}
          </p>
          <button
            onClick={() => router.push('/checkout')}
            className="px-6 py-3 rounded-full"
            style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
          >
            Back to Checkout
          </button>
        </div>
      </div>
    )
  }

  // Show success state
  if (payment.status === 'COMPLETED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--green-500)' }} />
          <h2 className="text-xl mb-2" style={{ color: 'var(--gray-900)' }}>Payment Successful!</h2>
          <p className="mb-6" style={{ color: 'var(--gray-600)' }}>
            Your order has been confirmed. Redirecting to order details...
          </p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: 'var(--orange-500)' }} />
        </div>
      </div>
    )
  }

  // Show failed state
  if (payment.status === 'FAILED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--red-500)' }} />
          <h2 className="text-xl mb-2" style={{ color: 'var(--gray-900)' }}>Payment Failed</h2>
          <p className="mb-6" style={{ color: 'var(--gray-600)' }}>
            Please try again or contact staff for assistance
          </p>
          <button
            onClick={() => router.push('/checkout')}
            className="px-6 py-3 rounded-full"
            style={{ backgroundColor: 'var(--orange-500)', color: 'white' }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show payment pending state with QR code
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <h2 className="text-center" style={{ color: 'var(--gray-900)' }}>Scan to Pay</h2>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        {/* QR Code */}
        {payment.qrCode && (
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <div className="relative w-full aspect-square max-w-[280px] mx-auto mb-4">
              <Image
                src={payment.qrCode}
                alt="Payment QR Code"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-center" style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
              Scan this QR code with your banking app
            </p>
          </div>
        )}

        {/* Bank Transfer Info */}
        {payment.bankAccount && (
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm space-y-3">
            <h3 className="font-medium mb-3" style={{ color: 'var(--gray-900)' }}>
              Or transfer manually
            </h3>

            {/* Bank Name */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-50)' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Bank</div>
                <div style={{ color: 'var(--gray-900)' }}>{payment.bankAccount.bankName}</div>
              </div>
            </div>

            {/* Account Number */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-50)' }}>
              <div className="flex-1">
                <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Account Number</div>
                <div style={{ color: 'var(--gray-900)' }}>{payment.bankAccount.accountNumber}</div>
              </div>
              <button
                onClick={() => handleCopy(payment.bankAccount!.accountNumber, 'account')}
                className="ml-2 p-2 rounded-lg hover:bg-[var(--gray-100)]"
              >
                {copiedField === 'account' ? (
                  <Check className="w-4 h-4" style={{ color: 'var(--green-500)' }} />
                ) : (
                  <Copy className="w-4 h-4" style={{ color: 'var(--gray-600)' }} />
                )}
              </button>
            </div>

            {/* Account Name */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-50)' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Account Name</div>
                <div style={{ color: 'var(--gray-900)' }}>{payment.bankAccount.accountName}</div>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--orange-50)' }}>
              <div className="flex-1">
                <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Amount</div>
                <div className="text-xl font-semibold" style={{ color: 'var(--orange-600)' }}>
                  ${payment.amount.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => handleCopy(payment.amount.toString(), 'amount')}
                className="ml-2 p-2 rounded-lg hover:bg-[var(--orange-100)]"
              >
                {copiedField === 'amount' ? (
                  <Check className="w-4 h-4" style={{ color: 'var(--green-500)' }} />
                ) : (
                  <Copy className="w-4 h-4" style={{ color: 'var(--gray-600)' }} />
                )}
              </button>
            </div>

            {/* Transfer Content */}
            {payment.transferContent && (
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-50)' }}>
                <div className="flex-1">
                  <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Transfer Message</div>
                  <div className="font-mono" style={{ color: 'var(--gray-900)' }}>{payment.transferContent}</div>
                </div>
                <button
                  onClick={() => handleCopy(payment.transferContent!, 'content')}
                  className="ml-2 p-2 rounded-lg hover:bg-[var(--gray-100)]"
                >
                  {copiedField === 'content' ? (
                    <Check className="w-4 h-4" style={{ color: 'var(--green-500)' }} />
                  ) : (
                    <Copy className="w-4 h-4" style={{ color: 'var(--gray-600)' }} />
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-center gap-2">
            {isPolling && <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--orange-500)' }} />}
            <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
              Waiting for payment confirmation...
            </span>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center mt-6" style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
          Payment will be automatically confirmed once received. This usually takes a few seconds.
        </p>
      </div>
    </div>
  )
}
