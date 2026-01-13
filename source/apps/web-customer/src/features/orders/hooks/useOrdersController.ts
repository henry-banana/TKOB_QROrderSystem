"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTableOrders } from '@/hooks/useOrders'
import { useSession } from '@/hooks/useSession'
import { type OrdersState } from '../model'

export function useOrdersController() {
  const router = useRouter()
  const { data: session } = useSession()
  const tableId = session?.table?.id
  
  const { data: ordersResponse, isLoading } = useTableOrders(tableId ?? null)
  const orders = ordersResponse?.data ?? []

  // State
  const state: OrdersState = useMemo(
    () => ({
      currentOrder: orders.length > 0 ? orders[0] : null, // Latest order
      orderHistory: orders.slice(1), // Rest of orders
      selectedOrder: null,
      isLoggedIn: false, // TODO: Get from auth context
      isLoading,
      error: null,
    }),
    [orders, isLoading]
  )

  // Actions
  const openOrderDetails = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const openTracking = (orderId: string) => {
    router.push(`/orders/${orderId}/tracking`)
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handlePayOrder = (orderId: string) => {
    router.push(`/payment/${orderId}`)
  }

  return {
    state,
    openOrderDetails,
    openTracking,
    handleLogin,
    handlePayOrder,
  }
}
