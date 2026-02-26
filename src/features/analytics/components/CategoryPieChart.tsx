import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryAnalyticItem } from '../types';
import { Empty, Card } from 'antd';

interface Props {
    data: CategoryAnalyticItem[];
    title: string;
    loading?: boolean;
}

export const CategoryPieChart = ({ data, title, loading }: Props) => {
    if (!loading && data.length === 0) {
        return (
            <Card title={title} className="glass-card" style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="Veri bulunamadı" />
            </Card>
        );
    }

    return (
        <Card title={title} className="glass-card" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="total"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};
