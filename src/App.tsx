import { Route, Routes, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from '@/app/layout';

const SignIn = lazy(() => import('@/features/auth/sign-in'));
const SignUp = lazy(() => import('@/features/auth/sign-up'));
const ForgotPassword = lazy(() => import('@/features/auth/forgot-password'));
const VehiclesPage = lazy(() => import('@/features/vehicles/pages/list'));
const VehicleDetailPage = lazy(() => import('@/features/vehicles/pages/detail'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));

function App() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Yükleniyor...</div>}>
            <Routes>
                {/* Auth Routes */}
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Main App Routes */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="vehicles" element={<VehiclesPage />} />
                    <Route path="vehicles/:vehicleId" element={<VehicleDetailPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}

export default App;
