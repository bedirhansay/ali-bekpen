import { VehicleAnalyticItem } from '../types';
import { Card, Row, Col, Statistic, Typography, Flex } from 'antd';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const { Text, Title } = Typography;

interface Props {
    data: VehicleAnalyticItem[];
}

export const VehiclePerformance = ({ data }: Props) => {
    return (
        <div style={{ marginTop: 32 }}>
            <Title level={4} style={{ marginBottom: 20 }}>Araç Performansı</Title>
            <Row gutter={[16, 16]}>
                {data.map((vehicle) => (
                    <Col xs={24} md={12} lg={12} key={vehicle.vehicleId}>
                        <Card className="glass-card" hoverable style={{ height: '100%' }}>
                            <Flex vertical gap={16}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{vehicle.vehiclePlate}</Text>
                                    <Title level={5} style={{ margin: 0 }}>{vehicle.vehicleName}</Title>
                                </div>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Gelir"
                                            value={vehicle.totalIncome}
                                            precision={2}
                                            suffix="₺"
                                            valueStyle={{ color: 'var(--income)', fontSize: 16 }}
                                            prefix={<ArrowUpRight size={14} />}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Gider"
                                            value={vehicle.totalExpense}
                                            precision={2}
                                            suffix="₺"
                                            valueStyle={{ color: 'var(--expense)', fontSize: 16 }}
                                            prefix={<ArrowDownRight size={14} />}
                                        />
                                    </Col>
                                </Row>

                                <div style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: vehicle.net >= 0 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                    border: `1px solid ${vehicle.net >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
                                }}>
                                    <Flex justify="space-between" align="center">
                                        <Text type="secondary">Net Kâr/Zarar</Text>
                                        <Flex align="center" gap={4}>
                                            {vehicle.net >= 0 ? <TrendingUp size={16} color="var(--income)" /> : <TrendingDown size={16} color="var(--expense)" />}
                                            <Text strong style={{ color: vehicle.net >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(vehicle.net)}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </div>
                            </Flex>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};
