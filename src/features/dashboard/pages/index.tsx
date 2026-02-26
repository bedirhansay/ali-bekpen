import { Typography, Row, Col, Select, Spin } from 'antd';
import { ArrowUpRight, ArrowDownLeft, Wallet, CalendarDays, TrendingUp } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

import { useYearlySummary } from '../hooks/useYearlySummary';
import { useState } from 'react';

const DashboardPage = () => {
    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const { data: summaryData, isLoading } = useYearlySummary(selectedYear);

    if (isLoading) {
        return (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Default empty data
    const summary = summaryData || {
        totalIncomeTRY: 0,
        totalExpenseTRY: 0,
        netTRY: 0
    };

    const months = summaryData?.months || [
        { name: 'Ocak', income: 0, expense: 0 },
        { name: 'Şubat', income: 0, expense: 0 },
        { name: 'Mart', income: 0, expense: 0 },
        { name: 'Nisan', income: 0, expense: 0 },
        { name: 'Mayıs', income: 0, expense: 0 },
        { name: 'Haziran', income: 0, expense: 0 },
        { name: 'Temmuz', income: 0, expense: 0 },
        { name: 'Ağustos', income: 0, expense: 0 },
        { name: 'Eylül', income: 0, expense: 0 },
        { name: 'Ekim', income: 0, expense: 0 },
        { name: 'Kasım', income: 0, expense: 0 },
        { name: 'Aralık', income: 0, expense: 0 },
    ];

    const formatMoney = (val: number) => `₺${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const CardBaseStyle = {
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: 20,
        padding: 32,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
    };

    return (
        <div className="animated-list-item stagger-1" style={{ paddingBottom: 64, maxWidth: 1400, margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                <div>
                    <Title level={2} style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontWeight: 600, fontSize: 32 }}>Yıllık Özet</Title>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: 16 }}>2026 yılına ait genel finansal durumunuz.</Text>
                </div>
                <Select
                    value={selectedYear.toString()}
                    onChange={(val) => setSelectedYear(parseInt(val))}
                    size="large"
                    variant="filled"
                    dropdownStyle={{ background: 'rgba(30,30,40,0.9)', backdropFilter: 'blur(10px)' }}
                    style={{
                        width: 140,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12
                    }}
                    options={[{ value: '2026', label: '2026 Yılı' }]}
                />
            </div>


            {/* Top KPIs (Spaced & Premium) */}
            <Row gutter={[32, 32]} style={{ marginBottom: 56 }}>
                <Col xs={24} md={8}>
                    <div style={{ ...CardBaseStyle, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'var(--income)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.7 }}>
                                    <div style={{ background: 'var(--income-bg)', padding: 6, borderRadius: '50%' }}>
                                        <ArrowUpRight size={16} color="var(--income)" />
                                    </div>
                                    <Text style={{ color: 'var(--text-primary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>Toplam Gelir</Text>
                                </div>
                                <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 36, letterSpacing: '-1px' }}>{formatMoney(summary.totalIncomeTRY)}</Title>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xs={24} md={8}>
                    <div style={{ ...CardBaseStyle, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'var(--expense)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.7 }}>
                                    <div style={{ background: 'var(--expense-bg)', padding: 6, borderRadius: '50%' }}>
                                        <ArrowDownLeft size={16} color="var(--expense)" />
                                    </div>
                                    <Text style={{ color: 'var(--text-primary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>Toplam Gider</Text>
                                </div>
                                <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 36, letterSpacing: '-1px' }}>{formatMoney(summary.totalExpenseTRY)}</Title>
                            </div>
                        </div>
                    </div>
                </Col>
                asldjksahkjsk

                <Col xs={24} md={8}>
                    <div style={{ ...CardBaseStyle, background: 'linear-gradient(145deg, rgba(37,99,235,0.1) 0%, rgba(124,58,237,0.05) 100%)', border: '1px solid rgba(89, 131, 252, 0.15)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -100, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 60%)', filter: 'blur(30px)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.9 }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: 6, borderRadius: '50%' }}>
                                        <Wallet size={16} color="var(--accent-blue)" />
                                    </div>
                                    <Text style={{ color: 'var(--accent-blue)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Net Durum</Text>
                                </div>
                                <Title level={2} style={{ margin: 0, fontWeight: 700, fontSize: 36, letterSpacing: '-1px', color: '#fff' }}>{formatMoney(summary.netTRY)}</Title>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 10 }}>
                    <CalendarDays size={20} color="var(--text-secondary)" />
                </div>
                <Title level={4} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>Aylık Kırılım</Title>
            </div>

            {/* Monthly Rows (Minimalist, spacious approach rather than heavy cards) */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                <Row wrap={true} style={{ display: 'flex' }}>
                    {months.map((month, idx) => {
                        const hasData = month.income > 0 || month.expense > 0;
                        const net = month.income - month.expense;
                        const marginPercent = month.income > 0 ? (net / month.income) * 100 : 0;
                        const isBorderRight = (idx + 1) % 4 !== 0; // if 4 cols desktop
                        const isBorderBottom = idx < 8; // if 3 rows desktop

                        return (
                            <Col xs={24} sm={12} xl={6} key={month.name} style={{
                                borderRight: isBorderRight ? '1px solid rgba(255,255,255,0.03)' : 'none',
                                borderBottom: isBorderBottom ? '1px solid rgba(255,255,255,0.03)' : 'none',
                            }}>
                                <div style={{ padding: '32px 24px', opacity: hasData ? 1 : 0.4, transition: 'var(--transition)', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                                        <Text style={{ fontSize: 18, color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.3px' }}>{month.name}</Text>
                                        {hasData && (
                                            <div style={{
                                                background: marginPercent >= 0 ? 'var(--income-bg)' : 'var(--expense-bg)',
                                                color: marginPercent >= 0 ? 'var(--income)' : 'var(--expense)',
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4
                                            }}>
                                                <TrendingUp size={12} />
                                                {marginPercent >= 0 ? '+' : ''}{marginPercent.toFixed(0)}%
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>Gelir</Text>
                                            <Text style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 14 }}>
                                                {formatMoney(month.income)}
                                            </Text>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>Gider</Text>
                                            <Text style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 14 }}>
                                                {formatMoney(month.expense)}
                                            </Text>
                                        </div>

                                        <div style={{ width: '100%', height: 1, borderBottom: '1px dashed rgba(255,255,255,0.06)', margin: '4px 0' }} />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Net Durum</Text>
                                            <Text style={{
                                                color: net >= 0 ? 'var(--income)' : 'var(--expense)',
                                                fontWeight: 700,
                                                fontSize: 16,
                                                letterSpacing: '-0.3px'
                                            }}>
                                                {formatMoney(net)}
                                            </Text>
                                        </div>
                                    </div>

                                    {/* Subtitle ratio indicator */}
                                    {hasData && (
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, display: 'flex' }}>
                                            <div style={{ width: `${(month.income / (month.income + month.expense)) * 100}%`, background: 'var(--income)' }} />
                                            <div style={{ width: `${(month.expense / (month.income + month.expense)) * 100}%`, background: 'var(--expense)' }} />
                                        </div>
                                    )}
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        </div>
    );
};

export default DashboardPage;
