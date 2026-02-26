import { Plus, ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
    Button, Form, Input, InputNumber, Row, Col, Typography,
    Drawer, Select, DatePicker, Segmented, Skeleton, Spin, Alert
} from 'antd';
import dayjs from 'dayjs';
import { showSuccess, showError } from '@/lib/toast';

import { getSefer } from '@/features/sefers/api';
import {
    getSeferTransactions,
    getSeferSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
} from '@/features/transactions/api';
import { getLatestExchangeRates } from '@/features/exchangeRates/api';
import { useExchangeRates } from '@/features/exchangeRates/hooks/useExchangeRates';
import { Transaction, CreateTransactionDTO, TransactionFilters, CurrencyCode } from '@/features/transactions/types';
import { TransactionCard } from '@/features/transactions/components/TransactionCard';
import { EmptyState } from '@/features/transactions/components/EmptyState';
import { useCategories } from '@/features/categories/hooks';
import { formatCurrency } from '@/shared/utils/formatters';

const { Title, Text } = Typography;

type FilterTab = 'ALL' | 'INCOME' | 'EXPENSE' | 'PENDING';

const FILTER_LABELS: Record<FilterTab, string> = {
    ALL: 'Hepsi',
    INCOME: 'Gelir',
    EXPENSE: 'Gider',
    PENDING: 'Bekleyenler',
};

const SeferDetailPage = () => {
    const { vehicleId, seferId } = useParams<{ vehicleId: string; seferId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const isSaveAndNewRef = useRef(false);

    const [form] = Form.useForm();

    /* ── Exchange rates ── */
    const { data: rates, isError: ratesError } = useExchangeRates();
    const amount = Form.useWatch('amount', form);
    const currencyCode = Form.useWatch('currencyCode', form) as CurrencyCode | undefined;
    const selectedRate = Form.useWatch('tcmbExchangeRate', form);
    const txType = Form.useWatch('type', form);

    const amountTRY = useMemo(() => {
        if (amount && selectedRate) return amount * selectedRate;
        return 0;
    }, [amount, selectedRate]);

    /* ── Queries ── */
    const { data: sefer, isLoading: isLoadingSefer } = useQuery({
        queryKey: ['sefer', seferId],
        queryFn: () => getSefer(seferId!),
        enabled: !!seferId,
    });

    const filters: TransactionFilters = useMemo(() => {
        const f: TransactionFilters = {};
        if (activeTab === 'INCOME' || activeTab === 'EXPENSE') f.type = activeTab;
        if (activeTab === 'PENDING') f.status = 'PENDING';
        return f;
    }, [activeTab]);

    const {
        data: txInfiniteData,
        isLoading: isLoadingTx,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ['seferTransactions', seferId, filters],
        queryFn: ({ pageParam }: { pageParam: any }) =>
            getSeferTransactions(seferId!, { pageSize: 20, cursor: pageParam }, filters),
        initialPageParam: null as any,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        enabled: !!seferId,
        staleTime: 30 * 1000,
    });

    const transactions = useMemo(
        () => txInfiniteData?.pages.flatMap((p: any) => p.items) || [],
        [txInfiniteData]
    );

    const { data: seferSummary } = useQuery({
        queryKey: ['seferSummary', seferId],
        queryFn: () => getSeferSummary(seferId!),
        enabled: !!seferId,
        staleTime: 30 * 1000,
    });

    const summary = useMemo(() => {
        return {
            totalIncomeTRY: seferSummary?.totalIncomeTRY || 0,
            totalExpenseTRY: seferSummary?.totalExpenseTRY || 0,
            netTRY: (seferSummary?.totalIncomeTRY || 0) - (seferSummary?.totalExpenseTRY || 0),
        };
    }, [seferSummary]);

    /* ── Categories ── */
    const { data: categories, isLoading: isLoadingCategories } = useCategories();

    const categoriesMap = useMemo(() => {
        if (!categories) return {};
        return categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat }), {} as Record<string, any>);
    }, [categories]);

    const filteredCategories = useMemo(() => {
        const type = txType || 'INCOME';
        return categories?.filter(c => c.type === type) || [];
    }, [categories, txType]);

    /* ── Auto fill exchange rate ── */
    useEffect(() => {
        if (!currencyCode) return;
        if (currencyCode === 'TRY') {
            form.setFieldsValue({ tcmbExchangeRate: 1 });
        } else if (rates?.[currencyCode]) {
            form.setFieldsValue({ tcmbExchangeRate: rates[currencyCode] });
        }
    }, [currencyCode, rates, form]);

    /* ── Default category logic ── */
    useEffect(() => {
        if (editingTransaction) return;
        if (!categories?.length || !txType) return;
        if (txType === 'INCOME') {
            const navlun = categories.find(c => c.name === 'Navlun' && c.type === 'INCOME');
            form.setFieldsValue({ categoryId: navlun?.id ?? categories.find(c => c.type === 'INCOME')?.id ?? '' });
        }
        if (txType === 'EXPENSE') {
            const harcirah = categories.find(c => c.name === 'Harçrah' && c.type === 'EXPENSE');
            form.setFieldsValue({ categoryId: harcirah?.id ?? categories.find(c => c.type === 'EXPENSE')?.id ?? '' });
        }
    }, [txType, categories, editingTransaction, form]);

    /* ── Mutations ── */
    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['seferTransactions', seferId] });
        queryClient.invalidateQueries({ queryKey: ['seferSummary', seferId] });
        queryClient.invalidateQueries({ queryKey: ['sefers', vehicleId] });
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        queryClient.invalidateQueries({ queryKey: ['vehicles', 'analytics', 'last30days'] });
    };

    const createMutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            showSuccess('İşlem kaydedildi');
            invalidateAll();
            if (isSaveAndNewRef.current) {
                form.resetFields();
                form.setFieldsValue({
                    date: dayjs(),
                    currencyCode: 'TRY',
                    tcmbExchangeRate: 1,
                    type: 'INCOME',
                    status: 'PAID',
                    paymentMethod: 'CASH'
                });
                isSaveAndNewRef.current = false;
            } else {
                handleClose();
            }
        },
        onError: (err) => showError(err),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateTransactionDTO }) => updateTransaction(id, data),
        onSuccess: () => { showSuccess('İşlem güncellendi'); invalidateAll(); handleClose(); },
        onError: (err) => showError(err),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => { showSuccess('İşlem silindi'); invalidateAll(); },
        onError: (err) => showError(err),
    });

    /* ── Drawer ── */
    const handleOpen = (transaction?: Transaction) => {
        // Validation: sefer must be OPEN to add new transactions
        if (!transaction && sefer?.status === 'CLOSED') {
            showError('Bu sefer kapalı. Yeni işlem ekleyemezsiniz.');
            return;
        }

        if (transaction) {
            setEditingTransaction(transaction);
            form.setFieldsValue({
                ...transaction,
                date: dayjs((transaction.date as any).toDate ? (transaction.date as any).toDate() : transaction.date),
                status: transaction.status || 'PAID',
                paymentMethod: transaction.paymentMethod || (transaction.status === 'PAID' ? 'CASH' : undefined),
            });
        } else {
            setEditingTransaction(null);
            form.resetFields();
            form.setFieldsValue({
                date: dayjs(),
                currencyCode: 'TRY',
                tcmbExchangeRate: 1,
                type: 'INCOME',
                status: 'PAID',
                paymentMethod: 'CASH'
            });
        }
        setIsDrawerOpen(true);
    };

    const handleClose = () => {
        setIsDrawerOpen(false);
        setEditingTransaction(null);
        form.resetFields();
        setIsSaving(false);
    };

    const onFinish = async (values: any) => {
        // Validate sefer is still OPEN (server-side check will also catch this)
        if (!editingTransaction && sefer?.status === 'CLOSED') {
            showError('Bu sefer kapalı. Yeni işlem ekleyemezsiniz.');
            return;
        }

        const currency: CurrencyCode = values.currencyCode;
        setIsSaving(true);

        let frozenRate: number;
        if (currency === 'TRY') {
            frozenRate = 1;
        } else {
            const manualRate = values.tcmbExchangeRate;
            if (manualRate && manualRate > 0) {
                frozenRate = manualRate;
            } else {
                try {
                    const ratesResponse = await getLatestExchangeRates();
                    const fetchedRate = ratesResponse[currency] as number;
                    if (!fetchedRate) throw new Error(`${currency} için kur alınamadı`);
                    frozenRate = fetchedRate;
                } catch (err) {
                    showError(err || 'Kur bilgisi alınamadı');
                    setIsSaving(false);
                    return;
                }
            }
        }

        const now = dayjs();
        const dateWithTime = values.date
            .hour(now.hour())
            .minute(now.minute())
            .second(now.second())
            .toDate();

        const payload: CreateTransactionDTO = {
            vehicleId: vehicleId!,
            seferId: seferId!,
            categoryId: values.categoryId,
            type: values.type,
            date: dateWithTime,
            description: values.description ?? null,
            amount: values.amount,
            currencyCode: currency,
            tcmbExchangeRate: frozenRate,
            amountTRY: values.amount * frozenRate,
            status: values.status,
            paymentMethod: values.status === 'PAID' ? values.paymentMethod : null,
        };

        if (editingTransaction) {
            updateMutation.mutate({ id: editingTransaction.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }

        setIsSaving(false);
    };

    /* ── Render ── */
    if (isLoadingSefer) {
        return (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!sefer) {
        return (
            <div style={{ color: 'var(--text-primary)', textAlign: 'center', padding: 40 }}>
                Sefer bulunamadı.
            </div>
        );
    }

    const isOpen = sefer.status === 'OPEN';
    const net = summary.netTRY;
    const isPositiveNet = net >= 0;

    return (
        <div className="animated-list-item stagger-1">
            {/* Back nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Button
                    type="text"
                    icon={<ChevronLeft size={20} />}
                    onClick={() => navigate(`/vehicles/${vehicleId}`)}
                    style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', width: 40, height: 40, borderRadius: '50%' }}
                />
                <Text style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Araç Detayına Dön</Text>
            </div>

            {/* Sefer Hero */}
            <div style={{
                padding: '28px 28px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                borderRadius: 20,
                border: `1px solid ${isOpen ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.06)'}`,
                marginBottom: 28,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Gradient top strip */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: isOpen ? 'linear-gradient(90deg, #2563eb, #7c3aed)' : '#475569',
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>{sefer.title}</Title>
                                <span style={{
                                    padding: '4px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800,
                                    background: isOpen ? 'rgba(37,99,235,0.15)' : 'rgba(71,85,105,0.3)',
                                    color: isOpen ? '#60a5fa' : '#94a3b8',
                                    border: `1px solid ${isOpen ? 'rgba(37,99,235,0.3)' : 'rgba(71,85,105,0.3)'}`,
                                    letterSpacing: '0.05em'
                                }}>
                                    {isOpen ? 'AÇIK' : 'KAPALI'}
                                </span>
                            </div>
                            {sefer.description && (
                                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 500 }}>{sefer.description}</Text>
                            )}
                        </div>
                    </div>

                    {/* Financial Snapshot - Structured Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 16,
                    }}>
                        {/* Income */}
                        <div style={{
                            background: 'rgba(34,197,94,0.04)',
                            border: '1px solid rgba(34,197,94,0.12)',
                            padding: '16px 20px', borderRadius: 16,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Toplam Gelir</Text>
                                <Title level={4} style={{ color: 'var(--income)', margin: 0, fontWeight: 700 }}>
                                    {formatCurrency(summary.totalIncomeTRY, 'TRY')}
                                </Title>
                            </div>
                            <TrendingUp size={20} color="var(--income)" opacity={0.5} />
                        </div>

                        {/* Expense */}
                        <div style={{
                            background: 'rgba(239,68,68,0.04)',
                            border: '1px solid rgba(239,68,68,0.12)',
                            padding: '16px 20px', borderRadius: 16,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Toplam Gider</Text>
                                <Title level={4} style={{ color: 'var(--expense)', margin: 0, fontWeight: 700 }}>
                                    {formatCurrency(summary.totalExpenseTRY, 'TRY')}
                                </Title>
                            </div>
                            <TrendingDown size={20} color="var(--expense)" opacity={0.5} />
                        </div>

                        {/* Net Profit */}
                        <div style={{
                            background: isPositiveNet ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                            border: `1px solid ${isPositiveNet ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            padding: '16px 20px', borderRadius: 16,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: isPositiveNet ? '0 8px 24px -12px rgba(34,197,94,0.4)' : 'none'
                        }}>
                            <div>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Net Kar</Text>
                                <Title level={4} style={{ color: isPositiveNet ? '#4ade80' : '#f87171', margin: 0, fontWeight: 800 }}>
                                    {isPositiveNet ? '+' : ''}{formatCurrency(summary.netTRY, 'TRY')}
                                </Title>
                            </div>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isPositiveNet ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                color: isPositiveNet ? '#4ade80' : '#f87171'
                            }}>
                                {isPositiveNet ? <TrendingUp size={16} strokeWidth={3} /> : <TrendingDown size={16} strokeWidth={3} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction section */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                    <Title level={4} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>İşlem Geçmişi</Title>
                </div>

                {/* Filter pill bar + add button */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 12,
                        padding: 4,
                        gap: 2,
                        overflowX: 'auto',
                        flexWrap: 'nowrap',
                    }}>
                        {(Object.keys(FILTER_LABELS) as FilterTab[]).map((val) => {
                            const active = activeTab === val;
                            const activeColor =
                                val === 'INCOME' ? 'rgba(34,197,94,0.18)'
                                    : val === 'EXPENSE' ? 'rgba(239,68,68,0.18)'
                                        : val === 'PENDING' ? 'rgba(245,158,11,0.18)'
                                            : 'rgba(255,255,255,0.1)';
                            const activeTextColor =
                                val === 'INCOME' ? 'var(--income)'
                                    : val === 'EXPENSE' ? 'var(--expense)'
                                        : val === 'PENDING' ? '#f59e0b'
                                            : 'var(--text-primary)';
                            return (
                                <button
                                    key={val}
                                    onClick={() => setActiveTab(val)}
                                    style={{
                                        flex: '1 1 auto',
                                        minWidth: 64,
                                        height: 36,
                                        border: 'none',
                                        borderRadius: 9,
                                        cursor: 'pointer',
                                        fontWeight: active ? 700 : 500,
                                        fontSize: 12,
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.15s ease',
                                        background: active ? activeColor : 'transparent',
                                        color: active ? activeTextColor : 'var(--text-secondary)',
                                        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                                    }}
                                >
                                    {FILTER_LABELS[val]}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handleOpen()}
                        disabled={!isOpen}
                        style={{
                            height: 44,
                            paddingLeft: 20, paddingRight: 20,
                            borderRadius: 12, border: 'none',
                            background: isOpen ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                            color: isOpen ? 'white' : 'var(--text-secondary)',
                            fontWeight: 700, fontSize: 14,
                            cursor: isOpen ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', gap: 8,
                            whiteSpace: 'nowrap',
                            boxShadow: isOpen ? '0 4px 14px rgba(37,99,235,0.35)' : 'none',
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                            opacity: isOpen ? 1 : 0.5,
                        }}
                        onMouseEnter={(e) => {
                            if (!isOpen) return;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = isOpen ? '0 4px 14px rgba(37,99,235,0.35)' : 'none';
                        }}
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Yeni İşlem
                    </button>
                </div>

                {!isOpen && (
                    <div style={{
                        padding: '10px 16px', marginBottom: 12,
                        background: 'rgba(71,85,105,0.15)',
                        border: '1px solid rgba(71,85,105,0.3)',
                        borderRadius: 10,
                        display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                            ⚠️ Bu sefer kapalı — yeni işlem eklenemez.
                        </Text>
                    </div>
                )}
            </div>

            {/* Transaction list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {isLoadingTx ? (
                    <Skeleton active />
                ) : transactions.length === 0 ? (
                    <EmptyState onAdd={() => handleOpen()} />
                ) : (
                    <>
                        {transactions.map((tx, idx) => (
                            <TransactionCard
                                key={tx.id}
                                transaction={tx}
                                categoryName={categoriesMap[tx.categoryId]?.name}
                                index={idx}
                                onEdit={handleOpen}
                                onDelete={(id) => deleteMutation.mutate(id)}
                            />
                        ))}

                        {hasNextPage && (
                            <Button
                                onClick={() => fetchNextPage()}
                                loading={isFetchingNextPage}
                                style={{
                                    marginTop: 16, height: 44, borderRadius: 12,
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                {isFetchingNextPage ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* Transaction Drawer */}
            <Drawer
                title={editingTransaction ? 'İşlem Düzenle' : 'Yeni İşlem Ekle'}
                width={480}
                onClose={handleClose}
                open={isDrawerOpen}
                maskStyle={{ backdropFilter: 'blur(8px)' }}
            >
                {ratesError && !rates && (
                    <Alert
                        message="Döviz kuru bilgisi şu an alınamıyor. TRY dışı işlem ekleyemezsiniz."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 12, borderRadius: 10 }}
                        closable
                    />
                )}

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="type" rules={[{ required: true }]} style={{ marginBottom: 16 }}>
                        <Segmented
                            block
                            options={[
                                { label: 'Gelir (+)', value: 'INCOME' },
                                { label: 'Gider (-)', value: 'EXPENSE' },
                            ]}
                            style={{ padding: 4, background: 'rgba(255,255,255,0.05)' }}
                        />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="categoryId" label="Kategori" rules={[{ required: true, message: 'Kategori seçin' }]} style={{ marginBottom: 16 }}>
                                <Select
                                    placeholder="Kategori Seçin"
                                    disabled={isLoadingCategories || !filteredCategories?.length}
                                    loading={isLoadingCategories}
                                    options={filteredCategories?.map(cat => ({
                                        label: (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.color }} />
                                                <span style={{ fontSize: 13 }}>{cat.name}</span>
                                            </div>
                                        ),
                                        value: cat.id
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="date" label="İşlem Tarihi" rules={[{ required: true }]} style={{ marginBottom: 16 }}>
                                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={12}>
                        <Col span={10}>
                            <Form.Item name="currencyCode" label="Para Birimi" rules={[{ required: true }]} style={{ marginBottom: 16 }}>
                                <Select>
                                    <Select.Option value="TRY">TRY</Select.Option>
                                    <Select.Option value="USD" disabled={ratesError && !rates?.USD}>USD{ratesError && !rates?.USD ? ' (!)' : ''}</Select.Option>
                                    <Select.Option value="EUR" disabled={ratesError && !rates?.EUR}>EUR{ratesError && !rates?.EUR ? ' (!)' : ''}</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={14}>
                            <Form.Item name="amount" label="Tutar" rules={[{ required: true, type: 'number', min: 0.01 }]} style={{ marginBottom: 16 }}>
                                <InputNumber style={{ width: '100%' }} precision={2} placeholder="0.00" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Günlük Kur (TCMB)" style={{ marginBottom: 16 }}>
                        <Row gutter={8}>
                            <Col span={18}>
                                <Form.Item name="tcmbExchangeRate" noStyle rules={[{ required: true }]}>
                                    <InputNumber style={{ width: '100%' }} precision={4} disabled={currencyCode === 'TRY'} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Button
                                    block
                                    disabled={currencyCode === 'TRY' || !rates || ratesError}
                                    onClick={() => {
                                        if (rates && currencyCode && rates[currencyCode]) {
                                            form.setFieldsValue({ tcmbExchangeRate: rates[currencyCode] });
                                        }
                                    }}
                                >TCMB</Button>
                            </Col>
                        </Row>
                    </Form.Item>

                    <Form.Item name="description" label="Açıklama (isteğe bağlı)" style={{ marginBottom: 16 }}>
                        <Input.TextArea rows={2} placeholder="Kısa bir açıklama..." />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="status" label="Ödeme Durumu" rules={[{ required: true }]} style={{ marginBottom: 16 }}>
                                <Select>
                                    <Select.Option value="PAID">Ödendi ✅</Select.Option>
                                    <Select.Option value="PENDING">Bekliyor ⏳</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                noStyle
                                shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}
                            >
                                {({ getFieldValue }) =>
                                    getFieldValue('status') === 'PAID' ? (
                                        <Form.Item name="paymentMethod" label="Ödeme Yöntemi" rules={[{ required: true }]} style={{ marginBottom: 16 }}>
                                            <Select>
                                                <Select.Option value="CASH">Nakit</Select.Option>
                                                <Select.Option value="TRANSFER">Havale/EFT</Select.Option>
                                                <Select.Option value="CREDIT_CARD">Kredi Kartı</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    ) : null
                                }
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{
                        marginTop: 12, padding: '12px 16px', borderRadius: 10,
                        background: 'rgba(37, 99, 235, 0.08)',
                        border: '1px solid rgba(37, 99, 235, 0.15)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <Text style={{ color: 'var(--accent-blue)', fontSize: 13 }}>Hesaplanan Net TRY</Text>
                        <Title level={4} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                            {formatCurrency(amountTRY, 'TRY')}
                        </Title>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                        <Button
                            type="primary"
                            block
                            onClick={() => {
                                isSaveAndNewRef.current = false;
                                form.submit();
                            }}
                            loading={isSaving || createMutation.isPending || updateMutation.isPending}
                            style={{
                                height: 44, borderRadius: 10,
                                background: 'var(--accent-gradient)',
                                border: 'none', fontWeight: 700, fontSize: 15,
                            }}
                        >
                            Kaydet
                        </Button>
                        {!editingTransaction && (
                            <Button
                                block
                                onClick={async () => {
                                    try {
                                        await form.validateFields();
                                        isSaveAndNewRef.current = true;
                                        form.submit();
                                    } catch (_) { }
                                }}
                                loading={isSaving || createMutation.isPending}
                                style={{
                                    height: 44, borderRadius: 10,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600, fontSize: 14,
                                }}
                            >
                                Kaydet & Yeni
                            </Button>
                        )}
                    </div>
                </Form>
            </Drawer>
        </div>
    );
};

export default SeferDetailPage;
