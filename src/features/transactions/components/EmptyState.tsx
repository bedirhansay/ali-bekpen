import React from 'react';
import { Button, Typography } from 'antd';
import { Plus } from 'lucide-react';

const { Title, Text } = Typography;

interface EmptyStateProps {
    onAdd: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAdd }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 24px',
            background: 'var(--bg-card, rgba(255, 255, 255, 0.02))',
            borderRadius: 20,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.5s ease-out',
        }}>
            <div style={{
                width: 64,
                height: 64,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                color: 'var(--text-secondary)'
            }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                    <line x1="8" y1="14" x2="16" y2="14" />
                </svg>
            </div>
            <Title level={4} style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontWeight: 600 }}>
                Henüz hareket yok
            </Title>
            <Text style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 300, fontSize: 14 }}>
                Bu araç için henüz gelir veya gider kaydı bulunmuyor.
            </Text>
            <Button
                type="primary"
                icon={<Plus size={18} />}
                onClick={onAdd}
                style={{
                    background: 'var(--accent-blue)',
                    height: 40,
                    borderRadius: 10,
                    border: 'none',
                    padding: '0 24px',
                    fontWeight: 500
                }}
            >
                Yeni İşlem Ekle
            </Button>
        </div>
    );
};
