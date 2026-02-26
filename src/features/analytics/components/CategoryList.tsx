import { CategoryAnalyticItem } from '../types';
import { Card, Flex, Typography, Progress, Badge } from 'antd';

const { Text } = Typography;

interface Props {
    data: CategoryAnalyticItem[];
}

export const CategoryList = ({ data }: Props) => {
    return (
        <Card title="Kategori Detayları" className="glass-card">
            <Flex vertical gap={20}>
                {data.map((item) => (
                    <div key={item.id} style={{ width: '100%' }}>
                        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                            <Flex align="center" gap={8}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                                <Text strong>{item.name}</Text>
                            </Flex>
                            <Flex align="center" gap={12}>
                                <Text>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.total)}</Text>
                                <Badge
                                    count={`${item.percentage.toFixed(1)}%`}
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', border: 'none' }}
                                />
                            </Flex>
                        </Flex>
                        <Progress
                            percent={item.percentage}
                            showInfo={false}
                            strokeColor={item.color}
                            trailColor="rgba(255, 255, 255, 0.05)"
                            strokeWidth={6}
                        />
                    </div>
                ))}
            </Flex>
        </Card>
    );
};
