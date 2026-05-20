import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './data/store'
import { useRole, RoleProvider } from './hooks/useRole'
import { CartProvider } from './hooks/useCart'
import ToastContainer from './components/Toast'
import Chat from './pages/Chat'

const OwnerHome = lazy(() => import('./pages/owner/Home'))
const OwnerOrders = lazy(() => import('./pages/owner/Orders'))
const OwnerPets = lazy(() => import('./pages/owner/Pets'))
const OwnerProfile = lazy(() => import('./pages/owner/Profile'))
const NewOrder = lazy(() => import('./pages/owner/NewOrder'))
const OrderDetail = lazy(() => import('./pages/owner/OrderDetail'))
const CloudMonitor = lazy(() => import('./pages/owner/CloudMonitor'))
const ServiceReport = lazy(() => import('./pages/owner/ServiceReport'))
const Shop = lazy(() => import('./pages/owner/Shop'))
const ProductDetail = lazy(() => import('./pages/owner/ProductDetail'))
const Cart = lazy(() => import('./pages/owner/Cart'))
const Checkout = lazy(() => import('./pages/owner/Checkout'))
const AddressManage = lazy(() => import('./pages/owner/AddressManage'))
const CaretakerDashboard = lazy(() => import('./pages/caretaker/Dashboard'))
const CaretakerOrderDetail = lazy(() => import('./pages/caretaker/OrderDetail'))
const CaretakerHistory = lazy(() => import('./pages/caretaker/History'))
const CaretakerProfile = lazy(() => import('./pages/caretaker/Profile'))
const ServiceExecution = lazy(() => import('./pages/caretaker/ServiceExecution'))
const LiveStream = lazy(() => import('./pages/caretaker/LiveStream'))
const SubmitReport = lazy(() => import('./pages/caretaker/SubmitReport'))
const OperatorDashboard = lazy(() => import('./pages/operator/Dashboard'))
const OperatorProfile = lazy(() => import('./pages/operator/Profile'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppRoutes() {
  const { role } = useRole()

  return (
    <Routes>
      {/* Owner Routes */}
      <Route path="/owner" element={<OwnerHome />} />
      <Route path="/owner/orders" element={<OwnerOrders />} />
      <Route path="/owner/pets" element={<OwnerPets />} />
      <Route path="/owner/profile" element={<OwnerProfile />} />
      <Route path="/owner/order/new" element={<NewOrder />} />
      <Route path="/owner/order/:id" element={<OrderDetail />} />
      <Route path="/owner/orders/:id/chat" element={<Chat />} />
      <Route path="/owner/monitor/:id" element={<CloudMonitor />} />
      <Route path="/owner/report/:id" element={<ServiceReport />} />
      <Route path="/owner/shop" element={<Shop />} />
      <Route path="/owner/product/:id" element={<ProductDetail />} />
      <Route path="/owner/cart" element={<Cart />} />
      <Route path="/owner/checkout" element={<Checkout />} />
      <Route path="/owner/addresses" element={<AddressManage />} />

      {/* Caretaker Routes */}
      <Route path="/caretaker" element={<CaretakerDashboard />} />
      <Route path="/caretaker/history" element={<CaretakerHistory />} />
      <Route path="/caretaker/profile" element={<CaretakerProfile />} />
      <Route path="/caretaker/order/:id" element={<CaretakerOrderDetail />} />
      <Route path="/caretaker/orders/:id/chat" element={<Chat />} />
      <Route path="/caretaker/execute/:id" element={<ServiceExecution />} />
      <Route path="/caretaker/stream/:id" element={<LiveStream />} />
      <Route path="/caretaker/report/:id" element={<SubmitReport />} />

      {/* Operator Routes */}
      <Route path="/operator" element={<OperatorDashboard />} />
      <Route path="/operator/profile" element={<OperatorProfile />} />

      {/* Default redirect based on role */}
      <Route path="/" element={<Navigate to={`/${role}`} replace />} />
      <Route path="*" element={<Navigate to={`/${role}`} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <RoleProvider>
          <CartProvider>
            <Suspense fallback={<LoadingFallback />}>
              <AppRoutes />
            </Suspense>
            <ToastContainer />
          </CartProvider>
        </RoleProvider>
      </StoreProvider>
    </BrowserRouter>
  )
}