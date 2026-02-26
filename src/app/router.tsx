import { Navigate, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './layout';

const DashboardPage = lazy(() => import('@/features/dashboard/pages/index'));
const VehiclesPage = lazy(() => import('@/features/vehicles/pages/list'));
const VehicleDetailPage = lazy(() => import('@/features/vehicles/pages/detail'));
const SignInPage = lazy(() => import('@/features/auth/sign-in/index'));

export const Router = () => {
    return (
        <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Yükleniyor...</div>}>
            <Routes>
                {/* Auth Routes */}
                <Route path="/sign-in" element={<SignInPage />} />

                {/* Main App Routes */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="vehicles" element={<VehiclesPage />} />
                    <Route path="vehicles/:vehicleId" element={<VehicleDetailPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Suspense>
    );
};
