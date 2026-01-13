import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useCheckout } from '@/hooks/useCheckout'
import { useSession } from '@/hooks/useSession'
import { SERVICE_CHARGE_RATE, type CheckoutFormData, type CheckoutState } from '../model'

export function useCheckoutController() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items: cartItems, subtotal, tax, serviceCharge, total } = useCart()
  const checkout = useCheckout()
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    notes: '',
    paymentMethod: 'counter',
  })

  const state: CheckoutState = useMemo(
    () => ({
      ...formData,
    }),
    [formData]
  )

  const updateField = (field: keyof CheckoutFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Validate cart is not empty
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    try {
      // Map paymentMethod to backend enum
      const paymentMethod = formData.paymentMethod === 'card' ? 'SEPAY' : 'STRIPE'
      
      const result = await checkout.mutateAsync({
        customerName: formData.name || undefined,
        specialInstructions: formData.notes || undefined,
        paymentMethod,
      })

      // Navigate based on payment method
      if (result.success && result.data) {
        const orderId = result.data.id
        
        if (formData.paymentMethod === 'card') {
          // Redirect to payment page with orderId
          router.push(`/payment/${orderId}`)
        } else {
          // Counter payment - go directly to success/order tracking
          router.push(`/orders/${orderId}`)
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create order. Please try again.')
    }
  }

  const handleBack = () => {
    router.back()
  }

  return {
    // Form state
    state,
    updateField,

    // Cart info
    cartItems,
    tableNumber: session?.table.number || '?',
    subtotal,
    tax,
    serviceCharge,
    total,

    // Mutation state
    isLoading: checkout.isPending,
    error: checkout.error,

    // Actions
    handleSubmit,
    handleBack,
  }
}
