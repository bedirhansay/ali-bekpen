import React from 'react';
import { DatePicker, Button, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface DateFilterProps {
    value: [Date, Date] | null | undefined;
    onChange: (dates: [Date, Date] | null) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ value, onChange }) => {
    const handleChange = (dates: any) => {
        if (dates && dates[0] && dates[1]) {
            onChange([dates[0].toDate(), dates[1].toDate()]);
        } else {
            onChange(null);
        }
    };

    const dayjsValue: [Dayjs, Dayjs] | null = value && value[0] && value[1] ? [dayjs(value[0]), dayjs(value[1])] : null;

    return (
        <Space
            className="mobile-w-full"
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '4px',
                borderRadius: 12,
                alignItems: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                justifyContent: 'space-between'
            }}
            wrap
        >
            <RangePicker
                value={dayjsValue}
                onChange={handleChange}
                format="DD.MM.YYYY"
                bordered={false}
                style={{
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    boxShadow: 'none',
                    width: '100%',
                    maxWidth: 260
                }}
                placeholder={['Başlangıç', 'Bitiş']}
                allowClear={false}
            />
            {value && (
                <Button
                    type="text"
                    size="small"
                    onClick={() => onChange(null)}
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: 12,
                        padding: '0 8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 6
                    }}
                >
                    Temizle
                </Button>
            )}
        </Space>
    );
};
