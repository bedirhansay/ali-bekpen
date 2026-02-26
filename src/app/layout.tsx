import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import { AuthGuard } from './auth-guard';
import { Header } from '@/layout/Header';

const { Content } = AntLayout;

export const Layout = () => {
    return (
        <AuthGuard>
            <AntLayout style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
                <Header />

                <Content style={{
                    margin: 0,
                    padding: 32,
                    minHeight: 280,
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Background subtle glow effect */}
                    <div style={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 500,
                        height: 500,
                        borderRadius: '50%',
                        background: 'var(--accent-purple)',
                        opacity: 0.15,
                        filter: 'blur(100px)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                        <Outlet />
                    </div>
                </Content>
            </AntLayout>
        </AuthGuard>
    );
};
