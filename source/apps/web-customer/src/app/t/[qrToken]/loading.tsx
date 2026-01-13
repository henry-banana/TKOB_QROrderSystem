export default function QRScanLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-orange-50 to-gray-50">
      <div className="text-center space-y-6 p-8">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-orange-500 mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl animate-pulse">🍽️</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Đang xử lý mã QR...
          </h2>
          <p className="text-sm text-gray-600">
            Vui lòng đợi trong giây lát
          </p>
        </div>

        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
