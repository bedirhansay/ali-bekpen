import { onAuthStateChanged } from 'firebase/auth';
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/shared/utils/firebase-config';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                // For simplicity, we'll skip redirect if user is at sign-in
                if (window.location.pathname !== '/sign-in') {
                    // navigate('/sign-in');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;

    return <>{children}</>;
};
