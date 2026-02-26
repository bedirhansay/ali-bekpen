import { Card, Select, Row, Col, Typography, Spin, Alert, Flex } from 'antd';
import { useYearlySummary } from '@/features/dashboard/useYearlySummary';
import { useYearState } from '@/features/dashboard/yearState';

const { Title, Text } = Typography;

const MONTH_NAMES_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const formatMoney = (val: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);
};

export default function DashboardPage() {
    const { year, setYear, currentYear } = useYearState();
    const { data, isLoading, error } = useYearlySummary(year);

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
                <Select
                    value={year}
                    onChange={(val) => setYear(val)}
                    options={years.map(y => ({ label: `${y} Yılı`, value: y }))}
                    style={{ width: 150 }}
                    size="large"
                />
            </Flex>

            {isLoading || !data ? (
                <Flex justify="center" align="center" className="h-64">
                    <Spin size="large" />
                </Flex>
            ) : (
                <>
                    {/* Totals Header Row */}
                    <Row gutter={[16, 16]} className="mb-8">
                        <Col xs={24} sm={8}>
                            <Card className="shadow-sm bg-green-50 border-green-200">
                                <Text type="secondary" className="block mb-2">Toplam Gelir</Text>
                                <Title level={3} className="!m-0 !text-green-700">
                                    {formatMoney(data.totals.incomeTRY)}
                                </Title>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card className="shadow-sm bg-red-50 border-red-200">
                                <Text type="secondary" className="block mb-2">Toplam Gider</Text>
                                <Title level={3} className="!m-0 !text-red-700">
                                    {formatMoney(data.totals.expenseTRY)}
                                </Title>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card className={`shadow-sm ${data.totals.netTRY >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                                <Text type="secondary" className="block mb-2">Net Durum</Text>
                                <Title level={3} className={`!m-0 ${data.totals.netTRY >= 0 ? '!text-blue-700' : '!text-orange-700'}`}>
                                    {formatMoney(data.totals.netTRY)}
                                </Title>
                            </Card>
                        </Col>
                    </Row>

                    {/* Monthly Cards Grid */}
                    <Row gutter={[16, 16]}>
                        {data.monthly.map((monthData) => {
                            const net = monthData.incomeTRY - monthData.expenseTRY;
                            return (
                                <Col xs={24} sm={12} md={8} lg={6} key={monthData.month}>
                                    <Card
                                        title={MONTH_NAMES_TR[monthData.month - 1]}
                                        className="shadow-sm hover:shadow-md transition-shadow"
                                        bordered={false}
                                    >
                                        <Flex vertical gap={12}>
                                            <Flex justify="space-between" align="center">
                                                <Text type="secondary">Gelir:</Text>
                                                <Text type="success" strong>{formatMoney(monthData.incomeTRY)}</Text>
                                            </Flex>
                                            <Flex justify="space-between" align="center">
                                                <Text type="secondary">Gider:</Text>
                                                <Text type="danger" strong>{formatMoney(monthData.expenseTRY)}</Text>
                                            </Flex>
                                            <div className="h-px bg-gray-100 w-full my-1" />
                                            <Flex justify="space-between" align="center">
                                                <Text type="secondary">Net:</Text>
                                                <Text strong className={net >= 0 ? 'text-blue-600' : 'text-orange-600'}>
                                                    {formatMoney(net)}
                                                </Text>
                                            </Flex>
                                        </Flex>
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
