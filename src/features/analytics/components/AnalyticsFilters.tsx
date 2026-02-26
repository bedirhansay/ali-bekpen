import { Select, Segmented, Flex, Space, Typography, Card } from 'antd';
import { AnalyticsFilters } from '../types';
import { useVehicles } from '../../vehicles/hooks';

const { Text } = Typography;

interface Props {
    filters: AnalyticsFilters;
    onFilterChange: (filters: AnalyticsFilters) => void;
}

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = [
    { label: 'Ocak', value: 0 },
    { label: 'Şubat', value: 1 },
    { label: 'Mart', value: 2 },
    { label: 'Nisan', value: 3 },
    { label: 'Mayıs', value: 4 },
    { label: 'Haziran', value: 5 },
    { label: 'Temmuz', value: 6 },
    { label: 'Ağustos', value: 7 },
    { label: 'Eylül', value: 8 },
    { label: 'Ekim', value: 9 },
    { label: 'Kasım', value: 10 },
    { label: 'Aralık', value: 11 },
];

export const AnalyticsFiltersComp = ({ filters, onFilterChange }: Props) => {
    const { data: vehicles } = useVehicles();

    return (
        <Card className="glass-card" style={{ marginBottom: 32 }}>
            <Flex wrap="wrap" gap={24} align="center" justify="space-between">
                <Space size={16} wrap>
                    <div style={{ minWidth: 100 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>Yıl</Text>
                        <Select
                            value={filters.year}
                            onChange={(year) => onFilterChange({ ...filters, year })}
                            style={{ width: '100%' }}
                            options={YEARS.map(y => ({ label: y, value: y }))}
                        />
                    </div>
                    <div style={{ minWidth: 140 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>Ay (Opsiyonel)</Text>
                        <Select
                            value={filters.month}
                            onChange={(month) => onFilterChange({ ...filters, month })}
                            style={{ width: '100%' }}
                            allowClear
                            placeholder="Tüm Yıl"
                            options={MONTHS}
                        />
                    </div>
                    <div style={{ minWidth: 200 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>Araç (Opsiyonel)</Text>
                        <Select
                            value={filters.vehicleId}
                            onChange={(vehicleId) => onFilterChange({ ...filters, vehicleId })}
                            style={{ width: '100%' }}
                            allowClear
                            placeholder="Tüm Araçlar"
                            options={vehicles?.items.map(v => ({ label: `${v.plate} - ${v.name}`, value: v.id }))}
                        />
                    </div>
                </Space>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: 4,
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <Segmented
                        value={filters.type}
                        onChange={(type) => onFilterChange({ ...filters, type: type as any })}
                        options={[
                            { label: 'Hepsi', value: 'ALL' },
                            { label: 'Giderler', value: 'EXPENSE' },
                            { label: 'Gelirler', value: 'INCOME' },
                        ]}
                    />
                </div>
            </Flex>
        </Card>
    );
};
