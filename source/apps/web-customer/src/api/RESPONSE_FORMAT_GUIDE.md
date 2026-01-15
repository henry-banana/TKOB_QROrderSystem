/\*\*

- RESPONSE FORMAT GUIDE
-
- Backend wraps ALL responses via TransformInterceptor:
- {
- success: true,
- data: <actual data>,
- timestamp: string,
- path: string,
- method: string,
- }
-
- Axios returns response with response.data = wrapped response
- So response.data.data = actual data
-
- CORRECT PATTERN (all adapters should use this):
- const response = await apiClient.get<SuccessResponse<MenuData>>('/menu');
- const actualData = response.data.data; // ✅ CORRECT
-
- Adapters using response.data directly (returning wrapped object):
- const response = await apiClient.get<SuccessResponse<CartData>>('/cart');
- return response.data; // ❌ WRONG - returns { success, data, ... }
-
- CURRENT STATUS:
- - Menu adapter: ✅ Correct (response.data.data)
- - Orders adapter: ✅ Fixed (response.data.data)
- - Cart service: ❌ WRONG (response.data) - need to fix
- - Checkout service: ❌ WRONG (response.data) - need to fix
    \*/
