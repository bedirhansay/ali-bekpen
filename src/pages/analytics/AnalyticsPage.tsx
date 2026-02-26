import React, { useState, useMemo } from 'react';
import { Typography, Row, Col, Flex, Empty, Card } from 'antd';
import { BarChart3 } from 'lucide-react';
import { AnalyticsFiltersComp } from '@/features/analytics/components/AnalyticsFilters';
import { CategoryPieChart } from '@/features/analytics/components/CategoryPieChart';
import { CategoryList } from '@/features/analytics/components/CategoryList';
import { VehiclePerformance } from '@/features/analytics/components/VehiclePerformance';
import { AnalyticsFilters } from '@/features/analytics/types';
import { useCategoryAnalytics } from '@/features/analytics/hooks/useCategoryAnalytics';
import { useVehicleAnalytics } from '@/features/analytics/hooks/useVehicleAnalytics';
import { PageSkeleton } from '@/components/PageSkeleton';

const { Title, Text } = Typography;

const AnalyticsPage: React.FC = () => {
    const [filters, setFilters] = useState<AnalyticsFilters>({
        year: new Date().getFullYear(),
        type: 'ALL',
        month: new Date().getMonth() // Default to current month for more focused view
    });

    const { data: categoryData, isLoading: catLoading } = useCategoryAnalytics(filters);
    const { data: vehicleData, isLoading: vehLoading } = useVehicleAnalytics(filters);

    const expenseCategories = useMemo(() =>
        categoryData?.filter(c => c.type === 'EXPENSE') || [], [categoryData]);

    const incomeCategories = useMemo(() =>
        categoryData?.filter(c => c.type === 'INCOME') || [], [categoryData]);

    if (catLoading || vehLoading) return <PageSkeleton />;

    const hasData = (categoryData && categoryData.length > 0) || (vehicleData && vehicleData.length > 0);

    return (
        <div style={{ paddingBottom: 64, maxWidth: '100%' }}>
            <Flex vertical gap={4} style={{ marginBottom: 32 }}>
                <Flex align="center" gap={12}>
                    <div style={{
                        padding: 10,
                        borderRadius: 12,
                        background: 'var(--accent-gradient)',
                        boxShadow: 'var(--shadow-glow)'
                    }}>
                        <BarChart3 size={24} color="white" />
                    </div>
                    <Title level={2} style={{ margin: 0, fontWeight: 700 }}>Analiz & Raporlar</Title>
                </Flex>
                <Text type="secondary">İşletmenizin finansal performansını detaylı olarak inceleyin.</Text>
            </Flex>

            <AnalyticsFiltersComp filters={filters} onFilterChange={setFilters} />

            {!hasData ? (
                <Card className="glass-card" style={{ padding: '60px 0' }}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div style={{ textAlign: 'center' }}>
                                <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>
                                    Henüz analiz için yeterli veri yok
                                </Text>
                                <Text type="secondary">
                                    Seçili filtrelerle eşleşen işlem bulunamadı. Lütfen farklı tarihler veya araçlar deneyin.
                                </Text>
                            </div>
                        }
                    />
                </Card>
            ) : (
                <Flex vertical gap={32}>
                    {/* Distribution Section */}
                    <Row gutter={[24, 24]}>
                        {(filters.type === 'ALL' || filters.type === 'EXPENSE') && (
                            <Col xs={24} xl={filters.type === 'ALL' ? 12 : 24}>
                                <CategoryPieChart
                                    title="Gider Dağılımı"
                                    data={expenseCategories}
                                />
                            </Col>
                        )}
                        {(filters.type === 'ALL' || filters.type === 'INCOME') && (
                            <Col xs={24} xl={filters.type === 'ALL' ? 12 : 24}>
                                <CategoryPieChart
                                    title="Gelir Dağılımı"
                                    data={incomeCategories}
                                />
                            </Col>
                        )}
                    </Row>

                    {/* Details List */}
                    <div style={{ width: '100%' }}>
                        <CategoryList data={categoryData || []} />
                    </div>

                    {/* Vehicle Performance */}
                    <VehiclePerformance data={vehicleData || []} />
                </Flex>
            )}
        </div>
    );
};

export default AnalyticsPage;
