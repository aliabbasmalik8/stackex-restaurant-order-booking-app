import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BusinessSettingsScreen } from '@/screens/BusinessSettingsScreen'
import { CategoriesScreen } from '@/screens/CategoriesScreen'
import { CategoryEditScreen } from '@/screens/CategoryEditScreen'
import { LoginScreen } from '@/screens/LoginScreen'
import { OperationsSettingsScreen } from '@/screens/OperationsSettingsScreen'
import { OrdersScreen } from '@/screens/OrdersScreen'
import { ProductEditScreen } from '@/screens/ProductEditScreen'
import { ProductSectionEditScreen } from '@/screens/ProductSectionEditScreen'
import { ProductsScreen } from '@/screens/ProductsScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/orders" replace />} />
          <Route path="orders" element={<OrdersScreen />} />
          <Route path="products" element={<ProductsScreen />} />
          <Route
            path="products/:productId/:section"
            element={<ProductSectionEditScreen />}
          />
          <Route path="products/:productId" element={<ProductEditScreen />} />
          <Route path="categories" element={<CategoriesScreen />} />
          <Route
            path="categories/:categoryId"
            element={<CategoryEditScreen />}
          />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="settings/business" element={<BusinessSettingsScreen />} />
          <Route
            path="settings/operations"
            element={<OperationsSettingsScreen />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/orders" replace />} />
    </Routes>
  )
}
