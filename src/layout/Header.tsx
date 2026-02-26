import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Typography, Grid, Button, Space, Avatar } from 'antd';
import {
    MenuOutlined,
    UserOutlined,
    LogoutOutlined,
    AppstoreOutlined,
    CarOutlined,
    GlobalOutlined,
    CaretDownOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '@/shared/utils/firebase-config';
import { signOut } from 'firebase/auth';
import { MobileDrawer } from './MobileDrawer';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export const Header: React.FC = () => {
    const screens = useBreakpoint();
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Desktop: lg and above, Tablet: md, Mobile: sm and below
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;
    const isDesktop = screens.lg;

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
                <div className="header-container">
                    {/* Left Section: Mobile Menu + Logo */}
                    <div className="header-left">
                        {isMobile && (
                            <Button
                                type="text"
                                icon={<MenuOutlined style={{ color: 'white', fontSize: '20px' }} />}
                                onClick={() => setDrawerOpen(true)}
                                className="mobile-menu-btn"
                            />
                        )}

                        <div className="logo-section" onClick={() => navigate('/dashboard')}>
                            <div className="logo-box">BH</div>
                            {!isMobile && (
                                <Title level={4} className="logo-text">
                                    Bekpen<span>Hesap</span>
                                </Title>
                            )}
                        </div>
                    </div>

                    {/* Middle Section: Desktop Navigation */}
                    {(isDesktop || isTablet) && (
                        <div className="header-center">
                            <Menu
                                mode="horizontal"
                                selectedKeys={[location.pathname]}
                                items={menuItems}
                                onClick={({ key }) => navigate(key)}
                                className="desktop-nav"
                            />
                        </div>
                    )}

                    {/* Right Section: Language + Avatar */}
                    <div className="header-right">
                        <Space size={isMobile ? 8 : 16}>
                            {/* Language Switcher */}
                            {!isMobile && (
                                <Dropdown menu={languageMenuItems} placement="bottomRight" trigger={['click']}>
                                    <Button type="text" className="lang-btn">
                                        <Space size={4}>
                                            <GlobalOutlined />
                                            {!isTablet && <span>TR</span>}
                                            <CaretDownOutlined style={{ fontSize: '10px', opacity: 0.5 }} />
                                        </Space>
                                    </Button>
                                </Dropdown>
                            )}

                            {/* User Avatar */}
                            <Dropdown menu={userMenuItems} placement="bottomRight" trigger={['click']}>
                                <div className="user-profile-trigger">
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
                                    />
                                </div>
                            </Dropdown>
                        </Space>
                    </div>
                </div>
            </AntHeader>

            <MobileDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </>
    );
};
