import React from 'react';
import { Drawer, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppstoreOutlined,
    CarOutlined,
    CloseOutlined
} from '@ant-design/icons';

const { Title } = Typography;

interface MobileDrawerProps {
    open: boolean;
    onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

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

    const handleMenuClick = (key: string) => {
        navigate(key);
        onClose();
    };

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        background: 'var(--accent-gradient)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '14px'
                    }}>
                        BH
                    </div>
                    <Title level={5} style={{ margin: 0, color: 'white' }}>
                        Bekpen<span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>Hesap</span>
                    </Title>
                </div>
            }
            placement="left"
            onClose={onClose}
            open={open}
            width={280}
            closeIcon={<CloseOutlined style={{ color: 'white' }} />}
            styles={{
                body: { padding: '12px 0' },
                header: { borderBottom: '1px solid rgba(255,255,255,0.06)' }
            }}
        >
            <Menu
                theme="dark"
                mode="vertical"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={({ key }) => handleMenuClick(key)}
                style={{ background: 'transparent', border: 'none' }}
                className="mobile-drawer-menu"
            />
        </Drawer>
    );
};
