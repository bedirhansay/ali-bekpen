import React from 'react';
import { RefreshCw, Download, Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '@/lib/pwa/usePWA';

interface PWAUpdateBannerProps {
    needRefresh: boolean;
    updateSW: () => Promise<void>;
}

export const PWAUpdateBanner: React.FC<PWAUpdateBannerProps> = ({ needRefresh, updateSW }) => {
    if (!needRefresh) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: 'max-content',
            maxWidth: '90vw',
        }}>
            <div style={{
                background: 'rgba(30, 41, 59, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 20,
                padding: '12px 16px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 20px rgba(37, 99, 235, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 16
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}>
                    <RefreshCw size={20} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>Güncelleme Hazır</span>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>Yeni özellikleri görmek için uygulamayı yenileyin.</span>
                </div>

                <button
                    onClick={() => updateSW()}
                    style={{
                        background: 'white',
                        color: 'black',
                        border: 'none',
                        borderRadius: 10,
                        padding: '8px 16px',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    Güncelle
                </button>
            </div>
        </div>
    );
};

export const PWAInstallButton: React.FC = () => {
    const { showInstallPrompt, promptToInstall } = usePWAInstall();

    if (!showInstallPrompt) return null;

    return (
        <button
            onClick={promptToInstall}
            style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9998,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: '10px 16px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s'
            }}
        >
            <Download size={16} />
            Yükle
        </button>
    );
};

export const OnlineStatusIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isOnline ? (
                <Wifi size={16} color="#22c55e" />
            ) : (
                <WifiOff size={16} color="#ef4444" />
            )}
        </div>
    );
};
