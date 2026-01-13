'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function QRScanError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[QR Error]', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
        <div className="text-6xl">❌</div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Mã QR không hợp lệ
          </h2>
          <p className="text-sm text-gray-600">
            Không thể xác thực mã QR. Vui lòng thử lại hoặc liên hệ nhân viên.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            Thử lại
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}
