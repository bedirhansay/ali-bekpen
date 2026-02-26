import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
        },
    },
});

export const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ConfigProvider
                    locale={trTR}
                    theme={{
                        algorithm: theme.darkAlgorithm,
                        token: {
                            colorPrimary: '#2563eb', // Accent blue
                            colorInfo: '#2563eb',
                            colorSuccess: '#22c55e', // Income
                            colorError: '#ef4444',   // Expense
                            borderRadius: 8,
                            fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, sans-serif",
                            colorTextBase: '#f8fafc',
                            colorBgBase: '#0f172a',
                            colorBgContainer: 'rgba(30, 41, 59, 0.7)',
                            colorBgElevated: '#1e293b',
                            colorBorder: 'rgba(255, 255, 255, 0.08)',
                            controlHeight: 40,
                        },
                        components: {
                            Button: {
                                borderRadius: 8,
                                controlHeight: 40,
                                fontWeight: 500,
                            },
                            Card: {
                                colorBgContainer: 'rgba(30, 41, 59, 0.7)',
                                borderRadiusLG: 16,
                                paddingLG: 24,
                            },
                            Menu: {
                                colorBgContainer: 'transparent',
                                itemHoverBg: 'rgba(255, 255, 255, 0.05)',
                                itemSelectedBg: '#2563eb',
                            },
                            Modal: {
                                contentBg: '#1e293b',
                                headerBg: 'transparent',
                            },
                            Table: {
                                colorBgContainer: 'transparent',
                                headerBg: 'rgba(255, 255, 255, 0.02)',
                                borderColor: 'rgba(255, 255, 255, 0.08)',
                                rowHoverBg: 'rgba(255, 255, 255, 0.04)',
                            }
                        }
                    }}
                >
                    <AntApp>
                        {children}
                        <Toaster position="top-right" toastOptions={{
                            style: {
                                background: '#1e293b',
                                color: '#f8fafc',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(12px)',
                            }
                        }} />
                    </AntApp>
                </ConfigProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};
