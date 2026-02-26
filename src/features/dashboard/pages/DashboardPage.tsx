import { useYearlySummary } from '@/features/dashboard/useYearlySummary';
import { useYearState } from '@/features/dashboard/yearState';
import { useCategoryBreakdown } from '@/features/categories/useCategoryBreakdown';
import { Alert, Button, Card, Col, Flex, Row, Select, Spin, Typography } from 'antd';
import { RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/shared/utils/formatters';

const { Title, Text } = Typography;

const MONTH_NAMES_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const formatMoney = (val: number) => formatCurrency(val, 'TRY');

const CardStyle = {
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(16px)',
    transition: 'all 0.3s ease'
};

export default function DashboardPage() {
    const { year, setYear, currentYear } = useYearState();
    const { data, isLoading, isFetching, error, refetch } = useYearlySummary(year);
    const { data: categoryData } = useCategoryBreakdown(year);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 600);
    };

    // Generate a list of years for the dropdown (e.g., from 5 years ago to next year)
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).reverse();

    if (error) {
        return (
            <Alert
                message="Hata"
                description="Veriler yüklenirken bir hata oluştu."
                type="error"
                showIcon
                className="m-4"
            />
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">

            <Flex justify="space-between" align="center" className="mb-6">
                <Title level={2} className="!m-0">Yıllık Özet</Title>
                <Flex gap={12} align="center">
                    <Button
                        type="text"
                        icon={<RefreshCcw size={18} className={isRefreshing || isFetching ? 'animate-spin' : ''} />}
                        onClick={handleRefresh}
                        loading={isRefreshing}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            height: '40px',
                            width: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-secondary)'
                        }}
                    />
                    <Select
                        value={year}
                        onChange={(val) => setYear(val)}
                        options={years.map(y => ({ label: `${y} Yılı`, value: y }))}
                        style={{ width: 140 }}
                        size="large"
                        className="custom-select"
                    />
                </Flex>
            </Flex>

            {isLoading || !data ? (
                <Flex justify="center" align="center" className="h-64">
                    <Spin size="large" />
                </Flex>
            ) : (
                <>
                    {/* Totals Header Row */}
                    <Row gutter={[24, 24]} className="mb-10">
                        <Col xs={24} sm={8}>
                            <Card
                                style={{
                                    ...CardStyle,
                                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.2)'
                                }}
                                className="glass-card"
                            >
                                <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam Gelir</Text>
                                <Title level={2} style={{ margin: 0, fontWeight: 700, color: 'var(--income)' }}>
                                    {formatMoney(data.totals.incomeTRY)}
                                </Title>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card
                                style={{
                                    ...CardStyle,
                                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}
                                className="glass-card"
                            >
                                <Text style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam Gider</Text>
                                <Title level={2} style={{ margin: 0, fontWeight: 700, color: 'var(--expense)' }}>
                                    {formatMoney(data.totals.expenseTRY)}
                                </Title>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card
                                style={{
                                    ...CardStyle,
                                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                                    boxShadow: '0 0 30px rgba(37, 99, 235, 0.2)',
                                    border: '1px solid rgba(37, 99, 235, 0.3)'
                                }}
                                className="glass-card"
                            >
                                <Text style={{ color: '#93c5fd', display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Durum</Text>
                                <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#fff', textShadow: '0 0 10px rgba(37, 99, 235, 0.3)' }}>
                                    {formatMoney(data.totals.netTRY)}
                                </Title>
                            </Card>
                        </Col>
                    </Row>

                    {/* Category Breakdown */}
                    {categoryData && (categoryData.expenseByCategory.length > 0 || categoryData.incomeByCategory.length > 0) && (
                        <div className="mb-10">
                            <Title level={4} className="!mb-4">Kategori Dağılımı</Title>
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={12}>
                                    <Card style={CardStyle} className="glass-card" bordered={false} title={<span style={{ color: 'var(--expense)' }}>En Çok Gider (Top 3)</span>}>
                                        <Flex vertical gap={12}>
                                            {categoryData.expenseByCategory.slice(0, 3).map(cat => {
                                                const max = categoryData.expenseByCategory[0]?.totalTRY || 1;
                                                const percent = (cat.totalTRY / max) * 100;
                                                return (
                                                    <div key={cat.categoryId}>
                                                        <Flex justify="space-between" align="center" className="mb-1">
                                                            <Text style={{ color: 'var(--text-secondary)' }}>{cat.categoryName}</Text>
                                                            <Text style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatMoney(cat.totalTRY)}</Text>
                                                        </Flex>
                                                        <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${percent}%`, background: cat.color || 'var(--expense)' }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {categoryData.expenseByCategory.length === 0 && <Text style={{ color: 'var(--text-secondary)' }}>Veri yok</Text>}
                                        </Flex>
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card style={CardStyle} className="glass-card" bordered={false} title={<span style={{ color: 'var(--income)' }}>En Çok Gelir (Top 3)</span>}>
                                        <Flex vertical gap={12}>
                                            {categoryData.incomeByCategory.slice(0, 3).map(cat => {
                                                const max = categoryData.incomeByCategory[0]?.totalTRY || 1;
                                                const percent = (cat.totalTRY / max) * 100;
                                                return (
                                                    <div key={cat.categoryId}>
                                                        <Flex justify="space-between" align="center" className="mb-1">
                                                            <Text style={{ color: 'var(--text-secondary)' }}>{cat.categoryName}</Text>
                                                            <Text style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatMoney(cat.totalTRY)}</Text>
                                                        </Flex>
                                                        <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${percent}%`, background: cat.color || 'var(--income)' }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {categoryData.incomeByCategory.length === 0 && <Text style={{ color: 'var(--text-secondary)' }}>Veri yok</Text>}
                                        </Flex>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}

                    <Title level={2} className="!m-0">Aylık Özet</Title>
                    {/* Monthly Cards Grid */}
                    <Row gutter={[20, 20]}>
                        {data.monthly.map((monthData) => {
                            const net = monthData.incomeTRY - monthData.expenseTRY;
                            const hasData = monthData.incomeTRY > 0 || monthData.expenseTRY > 0;
                            return (
                                <Col xs={24} sm={12} md={8} lg={6} key={monthData.month}>
                                    <Card
                                        title={MONTH_NAMES_TR[monthData.month - 1]}
                                        style={{
                                            ...CardStyle,
                                            opacity: hasData ? 1 : 0.6,
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        className="glass-card"
                                        bordered={false}
                                    >
                                        <Flex vertical gap={14}>
                                            <Flex justify="space-between" align="center">
                                                <Text style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Gelir:</Text>
                                                <Text style={{ color: 'var(--income)', fontWeight: 600 }}>{formatMoney(monthData.incomeTRY)}</Text>
                                            </Flex>
                                            <Flex justify="space-between" align="center">
                                                <Text style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Gider:</Text>
                                                <Text style={{ color: 'var(--expense)', fontWeight: 600 }}>{formatMoney(monthData.expenseTRY)}</Text>
                                            </Flex>
                                            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', width: '100%', margin: '4px 0' }} />
                                            <Flex justify="space-between" align="center">
                                                <Text style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>Net:</Text>
                                                <Title level={5} style={{ margin: 0, color: net >= 0 ? 'var(--income)' : 'var(--expense)', fontWeight: 700 }}>
                                                    {formatMoney(net)}
                                                </Title>
                                            </Flex>
                                        </Flex>

                                        {/* Activity Indicator Bar */}
                                        {hasData && (
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', display: 'flex' }}>
                                                <div style={{ width: `${(monthData.incomeTRY / (monthData.incomeTRY + monthData.expenseTRY)) * 100}%`, background: 'var(--income)', opacity: 0.6 }} />
                                                <div style={{ width: `${(monthData.expenseTRY / (monthData.incomeTRY + monthData.expenseTRY)) * 100}%`, background: 'var(--expense)', opacity: 0.6 }} />
                                            </div>
                                        )}
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </>
            )}
        </div>
    );
}
