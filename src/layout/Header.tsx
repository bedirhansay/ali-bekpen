import React from 'react';
import { Layout, Menu, Dropdown, Typography, Space, Avatar } from 'antd';
import {
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
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

export const Header: React.FC = () => {
    const screens = useBreakpoint();
    const navigate = useNavigate();
    const location = useLocation();

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
        <AntHeader className="app-header">
            <div className="header-container" style={{ padding: isMobile ? '0 8px' : '0' }}>
                {/* Left Section: Logo */}
                <div className="header-left" style={{ gap: isMobile ? '8px' : '16px' }}>
                    <div className="logo-section" onClick={() => navigate('/dashboard')} style={{ gap: isMobile ? '8px' : '12px' }}>
                        <div className="logo-box">BH</div>
                        {!isMobile && (
                            <Title level={4} className="logo-text">
                                Bekpen<span>Hesap</span>
                            </Title>
                        )}
                    </div>
                </div>

                {/* Middle Section: Navigation always visible */}
                <div className="header-center" style={{ padding: isMobile ? '0 4px' : '0 24px', flex: isMobile ? 'none' : 1 }}>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={({ key }) => navigate(key)}
                        className="desktop-nav"
                        style={{ gap: isMobile ? '2px' : '8px' }}
                    />
                </div>

                {/* Right Section: Language + Avatar */}
                <div className="header-right">
                    <Space size={isMobile ? 4 : 16}>
                        {/* Language Switcher */}
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
                                    style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32 }}
                                />
                            </div>
                        </Dropdown>
                    </Space>
                </div>
            </div>
        </AntHeader>
    );
};
