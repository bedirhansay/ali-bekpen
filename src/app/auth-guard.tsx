import { onAuthStateChanged, User } from 'firebase/auth';
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '@/shared/utils/firebase-config';

export const AuthGuard = ({ children, requireAuth = true }: { children: ReactNode, requireAuth?: boolean }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    if (requireAuth && !user) {
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    if (!requireAuth && user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
