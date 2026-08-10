import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoginScreen } from '@/screens/LoginScreen'
import { OrdersScreen } from '@/screens/OrdersScreen'
import { ProductEditScreen } from '@/screens/ProductEditScreen'
import { ProductsScreen } from '@/screens/ProductsScreen'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/orders" replace />} />
          <Route path="orders" element={<OrdersScreen />} />
          <Route path="products" element={<ProductsScreen />} />
          <Route path="products/:productId" element={<ProductEditScreen />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/orders" replace />} />
    </Routes>
  )
}
