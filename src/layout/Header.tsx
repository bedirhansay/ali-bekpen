import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Typography, Space, Avatar, Button, Drawer, Divider } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    AppstoreOutlined,
    CarOutlined,
    GlobalOutlined,
    CaretDownOutlined,
    SettingOutlined,
    MenuOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '@/shared/utils/firebase-config';
import { signOut } from 'firebase/auth';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

export const Header: React.FC = () => {
    const screens = useBreakpoint();
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);

    // Desktop: lg and above, Tablet: md, Mobile: sm and below
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/sign-in');
    };

    const menuItems = [
        {
            key: '/dashboard',
            icon: <AppstoreOutlined />,
            label: 'Özet',
        },
        {
            key: '/vehicles',
            icon: <CarOutlined />,
            label: 'Araçlarım',
        },
        {
            key: '/categories',
            icon: <SettingOutlined />,
            label: 'Kategoriler',
        },
        {
            key: '/analytics',
            icon: <BarChartOutlined />,
            label: 'Analiz',
        },
    ];

    const userMenuItems = {
        items: [
            {
                key: 'profile',
                label: (
                    <div style={{ padding: '4px 8px' }}>
                        <Text strong style={{ display: 'block' }}>{auth.currentUser?.email?.split('@')[0] || 'User'}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Admin</Text>
                    </div>
                ),
            },
            {
                type: 'divider' as const,
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Çıkış Yap',
                onClick: handleLogout,
            }
        ]
    };

    const languageMenuItems = {
        items: [
            { key: 'tr', label: 'Türkçe' },
            { key: 'en', label: 'English' },
        ]
    };

    return (
        <>
            <AntHeader className="app-header">
                <div className="header-container" style={{ padding: isMobile ? '0 16px' : '0' }}>
                    {/* Left Section: Logo + Mobile Menu */}
                    <div className="header-left" style={{ gap: isMobile ? '12px' : '16px' }}>
                        {isMobile && (
                            <Button
                                type="text"
                                icon={<MenuOutlined style={{ fontSize: '20px', color: 'var(--text-primary)' }} />}
                                onClick={() => setDrawerVisible(true)}
                                style={{ padding: 0, height: '40px', width: '40px' }}
                            />
                        )}
                        <div className="logo-section" onClick={() => navigate('/dashboard')} style={{ gap: isMobile ? '8px' : '12px' }}>
                            <div className="logo-box">BH</div>
                            <Title level={4} className="logo-text">
                                Bekpen{(!isMobile || !screens.xs) && <span>Hesap</span>}
                            </Title>
                        </div>
                    </div>

                    {/* Middle Section: Navigation - Hidden on Mobile */}
                    {!isMobile && (
                        <div className="header-center" style={{ padding: '0 24px', flex: 1 }}>
                            <Menu
                                mode="horizontal"
                                selectedKeys={[location.pathname]}
                                items={menuItems}
                                onClick={({ key }) => navigate(key)}
                                className="desktop-nav"
                                style={{ gap: '8px' }}
                            />
                        </div>
                    )}

                    {/* Right Section: Language + Avatar */}
                    <div className="header-right">
                        <Space size={isMobile ? 8 : 16}>
                            {/* Language Switcher - Hidden on Mobile */}
                            {!isMobile && (
                                <Dropdown menu={languageMenuItems} placement="bottomRight" trigger={['click']}>
                                    <div className="lang-btn" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <Space size={4}>
                                            <GlobalOutlined />
                                            {!isTablet && <span>TR</span>}
                                            <CaretDownOutlined style={{ fontSize: '10px', opacity: 0.5 }} />
                                        </Space>
                                    </div>
                                </Dropdown>
                            )}

                            {/* User Avatar */}
                            <Dropdown menu={userMenuItems} placement="bottomRight" trigger={['click']}>
                                <div className="user-profile-trigger" style={{ padding: isMobile ? '4px' : '4px 6px 4px 12px' }}>
                                    {!isMobile && (
                                        <div className="user-info">
                                            <Text className="user-name">
                                                {auth.currentUser?.email?.split('@')[0] || 'User'}
                                            </Text>
                                            <Text className="user-role">Admin</Text>
                                        </div>
                                    )}
                                    <Avatar
                                        icon={<UserOutlined />}
                                        className="user-avatar"
                                        style={{
                                            width: isMobile ? 32 : 32,
                                            height: isMobile ? 32 : 32,
                                            background: isMobile ? 'var(--accent-gradient)' : undefined
                                        }}
                                    />
                                </div>
                            </Dropdown>
                        </Space>
                    </div>
                </div>
            </AntHeader>

            {/* Mobile Navigation Drawer */}
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="logo-box" style={{ width: 32, height: 32, fontSize: 14 }}>BH</div>
                        <Text strong style={{ color: 'var(--text-primary)', fontSize: 18 }}>Bekpen Hesap</Text>
                    </div>
                }
                placement="left"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={280}
                className="mobile-drawer"
                styles={{
                    body: { padding: '12px 0' },
                    header: { borderBottom: '1px solid var(--border-light)', padding: '16px 20px' }
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div>
                        <Menu
                            mode="inline"
                            selectedKeys={[location.pathname]}
                            items={menuItems}
                            onClick={({ key }) => {
                                navigate(key);
                                setDrawerVisible(false);
                            }}
                            style={{ borderRight: 'none', background: 'transparent' }}
                        />
                    </div>

                    <div style={{ padding: '20px' }}>
                        <Divider style={{ margin: '0 0 20px 0', borderColor: 'var(--border-light)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <Avatar size={40} icon={<UserOutlined />} style={{ background: 'var(--accent-gradient)' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Text strong style={{ color: 'var(--text-primary)' }}>
                                    {auth.currentUser?.email?.split('@')[0] || 'User'}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>Yönetici</Text>
                            </div>
                        </div>
                        <Button
                            block
                            danger
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            style={{
                                height: '44px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            Çıkış Yap
                        </Button>
                    </div>
                </div>
            </Drawer>
        </>
    );
};
