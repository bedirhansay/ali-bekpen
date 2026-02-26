import React from 'react';
import { Popconfirm } from 'antd';
import { ArrowUpRight, ArrowDownLeft, Calendar, Trash2, Tag } from 'lucide-react';
import dayjs from 'dayjs';
import { Transaction } from '../types';
import { useCategories } from '@/features/categories/hooks';
import { formatCurrency } from '@/shared/utils/formatters';

interface TransactionCardProps {
    transaction: Transaction;
    onEdit: (tx: Transaction) => void;
    onDelete: (id: string) => void;
    index: number;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction: tx, onEdit, onDelete, index }) => {
    const isIncome = tx.type === 'INCOME';
    const date = dayjs((tx.date as any).toDate ? (tx.date as any).toDate() : tx.date).format('DD.MM.YYYY HH:mm');

    const { data: categories } = useCategories();
    const categoryName = categories?.find(c => c.id === tx.categoryId)?.name || 'Kategori Yok';

    return (
        <div
            className={`animated-list-item stagger-${(index % 4) + 1}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px 12px 18px',
                borderRadius: 14,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.15s ease',
            }}
            onClick={() => onEdit(tx)}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Left accent stripe */}
            <div style={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: 3,
                background: isIncome ? 'var(--income)' : 'var(--expense)',
            }} />

            {/* Icon */}
            <div style={{
                width: 38, height: 38,
                borderRadius: 11,
                background: isIncome ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isIncome ? 'var(--income)' : 'var(--expense)',
                flexShrink: 0,
            }}>
                {isIncome ? <ArrowUpRight size={18} strokeWidth={2.5} /> : <ArrowDownLeft size={18} strokeWidth={2.5} />}
            </div>

            {/* Title + meta — grows to fill space */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {tx.description || categoryName}
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 3,
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 500 }}>
                        <Tag size={12} />
                        {categoryName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 500 }}>
                        <Calendar size={12} />
                        {date}
                    </span>
                    {tx.currencyCode !== 'TRY' && (
                        <span>Kur: {tx.tcmbExchangeRate.toFixed(2)}</span>
                    )}
                </div>
            </div>

            {/* Amount — right aligned, shrink-proof */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                    color: isIncome ? 'var(--income)' : '#f1f5f9',
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap',
                }}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount, tx.currencyCode)}
                </div>
                {tx.currencyCode !== 'TRY' && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 2, whiteSpace: 'nowrap' }}>
                        {formatCurrency(tx.amountTRY, 'TRY')}
                    </div>
                )}
            </div>

            {/* Delete — always last, vertically centered */}
            <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                <Popconfirm
                    title="Bu işlemi silmek istediğinize emin misiniz?"
                    onConfirm={() => onDelete(tx.id)}
                    okText="Sil"
                    cancelText="İptal"
                    placement="left"
                >
                    <button
                        style={{
                            width: 30, height: 30,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(239,68,68,0.07)',
                            color: 'rgba(239,68,68,0.45)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
                            e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.07)';
                            e.currentTarget.style.color = 'rgba(239,68,68,0.45)';
                        }}
                    >
                        <Trash2 size={14} />
                    </button>
                </Popconfirm>
            </div>
        </div>
    );
};
