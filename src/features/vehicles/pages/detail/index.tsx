import { Plus, Edit, Trash2, ChevronLeft } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Button, Form, Input, InputNumber, Row, Col, Typography, Popconfirm, Drawer, Select, DatePicker, Segmented, Skeleton, Spin, Alert } from 'antd';
import dayjs from 'dayjs';
import { showSuccess, showError } from '@/lib/toast';

import { getVehicle, deleteVehicle, updateVehicle } from '../../api';
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getVehicleSummary
} from '@/features/transactions/api';
import { useExchangeRates } from '@/features/exchangeRates/hooks/useExchangeRates';
import { getLatestExchangeRates } from '@/features/exchangeRates/api';
import { Transaction, CreateTransactionDTO, TransactionFilters, CurrencyCode } from '@/features/transactions/types';
import { EmptyState } from '@/features/transactions/components/EmptyState';
import { TransactionCard } from '@/features/transactions/components/TransactionCard';
import { DateFilter } from '@/features/transactions/components/DateFilter';
import { useCategories } from '@/features/categories/hooks';
import { formatCurrency } from '@/shared/utils/formatters';

const { Title, Text } = Typography;

const VehicleDetailPage = () => {
    const { vehicleId } = useParams<{ vehicleId: string }>();
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isVehicleEditOpen, setIsVehicleEditOpen] = useState(false);
    const [vehicleForm] = Form.useForm();
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [filters, setFilters] = useState<TransactionFilters>({ type: 'ALL', dateRange: null });
    const [isSaving, setIsSaving] = useState(false);

    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Live rate map for the form's currency auto-fill
    const { data: rates, isError: ratesError } = useExchangeRates();

    const amount = Form.useWatch('amount', form);
    const currencyCode = Form.useWatch('currencyCode', form) as CurrencyCode | undefined;
    const selectedRate = Form.useWatch('tcmbExchangeRate', form);

    const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
        queryKey: ['vehicle', vehicleId],
        queryFn: () => getVehicle(vehicleId!),
        enabled: !!vehicleId,
    });

    const { data: summary } = useQuery({
        queryKey: ['vehicleSummary', vehicleId],
        queryFn: () => getVehicleSummary(vehicleId!),
        enabled: !!vehicleId,
    });

    const {
        data: transactionsInfiniteData,
        isLoading: isLoadingTransactions,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useInfiniteQuery({
        queryKey: ['transactions', vehicleId, filters],
        queryFn: ({ pageParam }: { pageParam: any }) => getTransactions(vehicleId!, { pageSize: 20, cursor: pageParam }, filters),
        initialPageParam: null as any,
        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
        enabled: !!vehicleId,
        staleTime: 30 * 1000,
    });

    const transactions = useMemo(() =>
        transactionsInfiniteData?.pages.flatMap((page: any) => page.items) || [],
        [transactionsInfiniteData]);

    const txType = Form.useWatch('type', form);
    const { data: categories, isLoading: isLoadingCategories } = useCategories();

    const categoriesMap = useMemo(() => {
        if (!categories) return {};
        return categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat }), {} as Record<string, any>);
    }, [categories]);

    const filteredCategories = useMemo(() => {
        const currentType = txType || form.getFieldValue('type') || 'INCOME';
        return categories?.filter(c => c.type === currentType) || [];
    }, [categories, txType, form]);

    const topExpenseCategory = useMemo(() => {
        if (!transactions || !categories) return null;
        const expenses = transactions.filter(t => t.type === 'EXPENSE');
        const map: Record<string, number> = {};
        expenses.forEach(t => {
            if (t.categoryId) map[t.categoryId] = (map[t.categoryId] || 0) + (t.amountTRY || 0);
        });
        const arr = Object.entries(map).sort((a, b) => b[1] - a[1]);
        if (arr.length === 0) return null;
        const bestCatId = arr[0][0];
        const bestAmount = arr[0][1];
        const cat = categoriesMap[bestCatId];
        if (!cat) return null;
        return { name: cat.name, amount: bestAmount, color: cat.color };
    }, [transactions, categoriesMap, categories]);

    // Auto-fill exchange rate when currency changes
    useEffect(() => {
        if (!currencyCode) return;
        if (currencyCode === 'TRY') {
            form.setFieldsValue({ tcmbExchangeRate: 1 });
        } else if (rates && rates[currencyCode]) {
            form.setFieldsValue({ tcmbExchangeRate: rates[currencyCode] });
        }
    }, [currencyCode, rates, form]);
    // Task 1: Default Category Logic (Create Mode Only)
    useEffect(() => {
        const isEditMode = !!editingTransaction;
        if (isEditMode) return;
        if (!categories?.length || !txType) return;

        if (txType === 'INCOME') {
            const navlun = categories.find(c => c.name === 'Navlun' && c.type === 'INCOME');
            form.setFieldsValue({
                categoryId: navlun?.id ?? categories.find(c => c.type === 'INCOME')?.id ?? ''
            });
        }

        if (txType === 'EXPENSE') {
            const harcirah = categories.find(c => c.name === 'Harçrah' && c.type === 'EXPENSE');
            form.setFieldsValue({
                categoryId: harcirah?.id ?? categories.find(c => c.type === 'EXPENSE')?.id ?? ''
            });
        }
    }, [txType, categories, editingTransaction, form]);

    const amountTRY = useMemo(() => {
        if (amount && selectedRate) return amount * selectedRate;
        return 0;
    }, [amount, selectedRate]);

    // ── Mutations ─────────────────────────────────────────────────────────────

    const createMutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            showSuccess('İşlem başarıyla kaydedildi');
            invalidateAll();
            handleClose();
        },
        onError: (err) => {
            showError(err || 'İşlem sırasında hata oluştu');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateTransactionDTO }) => updateTransaction(id, data),
        onSuccess: () => {
            showSuccess('İşlem güncellendi');
            invalidateAll();
            handleClose();
        },
        onError: (err) => {
            showError(err || 'İşlem güncellenirken hata oluştu');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            showSuccess('İşlem silindi');
            invalidateAll();
        },
        onError: (err) => {
            showError(err);
        }
    });

    const deleteVehicleMutation = useMutation({
        mutationFn: deleteVehicle,
        onSuccess: () => {
            showSuccess('Araç silindi');
            navigate('/vehicles');
        },
        onError: (err) => {
            showError(err);
        }
    });

    const updateVehicleMutation = useMutation({
        mutationFn: (values: any) => {
            const payload = {
                ...values,
                insuranceExpiryDate: values.insuranceExpiryDate ? values.insuranceExpiryDate.toDate() : null,
                inspectionExpiryDate: values.inspectionExpiryDate ? values.inspectionExpiryDate.toDate() : null,
            };
            return updateVehicle(vehicleId!, payload);
        },
        onSuccess: () => {
            showSuccess('Araç başarıyla güncellendi');
            queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
            setIsVehicleEditOpen(false);
        },
        onError: (err) => {
            showError(err || 'Araç güncellenirken hata oluştu');
        }
    });

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['vehicleSummary', vehicleId] });
        queryClient.invalidateQueries({ queryKey: ['transactions', vehicleId] });
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // backward compatibility if any
    };

    // ── Drawer open/close ─────────────────────────────────────────────────────

    const handleOpen = (transaction?: Transaction) => {
        if (transaction) {
            setEditingTransaction(transaction);
            form.setFieldsValue({
                ...transaction,
                date: dayjs((transaction.date as any).toDate ? (transaction.date as any).toDate() : transaction.date),
            });
        } else {
            setEditingTransaction(null);
            form.resetFields();
            form.setFieldsValue({ date: dayjs(), currencyCode: 'TRY', tcmbExchangeRate: 1, type: 'INCOME' });
        }
        setIsDrawerOpen(true);
    };

    const handleClose = () => {
        setIsDrawerOpen(false);
        setEditingTransaction(null);
        form.resetFields();
        setIsSaving(false);
    };

    // ── Form submit — exchange rate frozen at save time ───────────────────────

    const onFinish = async (values: any) => {
        const currency: CurrencyCode = values.currencyCode;

        setIsSaving(true);

        // Determine frozen exchange rate
        let frozenRate: number;
        if (currency === 'TRY') {
            frozenRate = 1;
        } else {
            // If user has manually entered a value, prefer that.
            // Otherwise, fetch a fresh rate from the Cloud Function at save time
            // to ensure it is frozen at the moment of the transaction.
            const manualRate = values.tcmbExchangeRate;
            if (manualRate && manualRate > 0) {
                frozenRate = manualRate;
            } else {
                try {
                    const ratesResponse = await getLatestExchangeRates();
                    const fetchedRate = ratesResponse[currency] as number;
                    if (!fetchedRate) {
                        throw new Error(`${currency} için kur alınamadı`);
                    }
                    frozenRate = fetchedRate;
                } catch (err) {
                    showError(err || 'Kur bilgisi alınamadı');
                    setIsSaving(false);
                    return; // Prevent save if currency is not TRY and rate is unavailable
                }
            }
        }

        // Use the selected date but append current time to ensure proper ordering for same-day transactions
        const now = dayjs();
        const dateWithTime = values.date
            .hour(now.hour())
            .minute(now.minute())
            .second(now.second())
            .toDate();

        const payload: CreateTransactionDTO = {
            vehicleId: vehicleId!,
            categoryId: values.categoryId,
            type: values.type,
            date: dateWithTime,
            description: values.description ?? null,
            amount: values.amount,
            currencyCode: currency,
            tcmbExchangeRate: frozenRate,
            amountTRY: values.amount * frozenRate,
        };

        if (editingTransaction) {
            updateMutation.mutate({ id: editingTransaction.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }

        setIsSaving(false);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (isLoadingVehicle) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
        </div>
    );
    if (!vehicle) return (
        <div style={{ color: 'var(--text-primary)', textAlign: 'center', padding: 40 }}>
            Araç bulunamadı.
        </div>
    );

    const netValue = summary?.netTRY || 0;
    const isPositive = netValue >= 0;

    return (
        <div className="space-y-6 animated-list-item stagger-1">
            {/* Header Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Button
                    type="text"
                    icon={<ChevronLeft size={20} />}
                    onClick={() => navigate('/vehicles')}
                    style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', width: 40, height: 40, borderRadius: '50%' }}
                />
                <Text style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Geri Dön</Text>
            </div>

            {/* Minimal Header Section */}
            <div className="hero-card" style={{
                padding: '24px 24px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))',
                borderRadius: 20,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--border-light)'
            }}>
                {/* Actions */}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8, zIndex: 10 }}>
                    <Button
                        type="text"
                        icon={<Edit size={16} />}
                        onClick={() => {
                            vehicleForm.setFieldsValue({
                                name: vehicle.name,
                                plate: vehicle.plate,
                                insuranceExpiryDate: vehicle.insuranceExpiryDate ? dayjs(vehicle.insuranceExpiryDate.toDate()) : null,
                                inspectionExpiryDate: vehicle.inspectionExpiryDate ? dayjs(vehicle.inspectionExpiryDate.toDate()) : null,
                            });
                            setIsVehicleEditOpen(true);
                        }}
                        style={{
                            color: 'rgba(255,255,255,0.6)',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '50%',
                            width: 32, height: 32,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    />
                    <Popconfirm
                        title="Bu aracı silmek istediğinize emin misiniz?"
                        onConfirm={() => deleteVehicleMutation.mutate(vehicleId!)}
                        okText="Sil"
                        cancelText="İptal"
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<Trash2 size={16} />}
                            style={{
                                color: 'rgba(239, 68, 68, 0.6)',
                                background: 'rgba(239, 68, 68, 0.05)',
                                borderRadius: '50%',
                                width: 32, height: 32,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        />
                    </Popconfirm>
                </div>

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                        <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700 }}>{vehicle.plate}</Title>
                        <div style={{
                            background: isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isPositive ? '#4ade80' : '#f87171',
                            padding: '2px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: 12,
                            border: `1px solid ${isPositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            NET: {isPositive ? '+' : '-'}{formatCurrency(Math.abs(netValue), 'TRY')}
                        </div>
                    </div>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{vehicle.name}</Text>

                    <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '10px 16px',
                            borderRadius: 12,
                            flex: '1 1 140px'
                        }}>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Gelir</Text>
                            <Title level={5} style={{ color: 'var(--income)', margin: 0, fontWeight: 700 }}>+{formatCurrency(summary?.totalIncomeTRY || 0, 'TRY')}</Title>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '10px 16px',
                            borderRadius: 12,
                            flex: '1 1 140px'
                        }}>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Gider</Text>
                            <Title level={5} style={{ color: 'var(--expense)', margin: 0, fontWeight: 700 }}>-{formatCurrency(summary?.totalExpenseTRY || 0, 'TRY')}</Title>
                        </div>
                        {topExpenseCategory && (
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                padding: '10px 16px',
                                borderRadius: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                flex: '1 1 140px'
                            }}>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>En Çok Gider</Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: topExpenseCategory.color }} />
                                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topExpenseCategory.name}</Text>
                                </div>
                                <Text style={{ color: 'var(--expense)', fontSize: 15, fontWeight: 700, marginTop: 4 }}>
                                    {formatCurrency(topExpenseCategory.amount, 'TRY')}
                                </Text>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div style={{ margin: '32px 0 16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                    <Title level={4} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>İşlem Geçmişi</Title>
                    <DateFilter
                        value={filters.dateRange}
                        onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                    />
                </div>

                {/* Exchange rate error banner */}
                {ratesError && !rates && (
                    <Alert
                        message="Döviz kuru bilgisi şu an alınamıyor. TRY dışı işlem ekleyemezsiniz."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 12, borderRadius: 10 }}
                        closable
                    />
                )}

                {/* Full-width pill filter + CTA row */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    {/* Pill tab bar */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 12,
                        padding: 4,
                        gap: 0,
                    }}>
                        {(['ALL', 'INCOME', 'EXPENSE'] as const).map((val) => {
                            const labels: Record<string, string> = { ALL: 'Hepsi', INCOME: 'Gelir', EXPENSE: 'Gider' };
                            const active = filters.type === val;
                            return (
                                <button
                                    key={val}
                                    onClick={() => setFilters(prev => ({ ...prev, type: val as any }))}
                                    style={{
                                        flex: 1,
                                        height: 36,
                                        border: 'none',
                                        borderRadius: 9,
                                        cursor: 'pointer',
                                        fontWeight: active ? 700 : 500,
                                        fontSize: 13,
                                        transition: 'all 0.15s ease',
                                        background: active
                                            ? val === 'INCOME'
                                                ? 'rgba(34,197,94,0.18)'
                                                : val === 'EXPENSE'
                                                    ? 'rgba(239,68,68,0.18)'
                                                    : 'rgba(255,255,255,0.1)'
                                            : 'transparent',
                                        color: active
                                            ? val === 'INCOME'
                                                ? 'var(--income)'
                                                : val === 'EXPENSE'
                                                    ? 'var(--expense)'
                                                    : 'var(--text-primary)'
                                            : 'var(--text-secondary)',
                                        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                                    }}
                                >
                                    {labels[val]}
                                </button>
                            );
                        })}
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={() => handleOpen()}
                        style={{
                            height: 44,
                            paddingLeft: 20,
                            paddingRight: 20,
                            borderRadius: 12,
                            border: 'none',
                            background: 'var(--accent-gradient)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)';
                        }}
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Yeni İşlem
                    </button>
                </div>
            </div>

            {/* Transaction Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {isLoadingTransactions ? (
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
                                    marginTop: 16,
                                    height: 44,
                                    borderRadius: 12,
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

            {/* Vehicle Edit Drawer */}
            <Drawer
                title="Araç Bilgilerini Düzenle"
                placement="right"
                onClose={() => setIsVehicleEditOpen(false)}
                open={isVehicleEditOpen}
                width={window.innerWidth > 500 ? 500 : '100%'}
                maskStyle={{ backdropFilter: 'blur(8px)' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
                    <div style={{ flex: 1 }}>
                        <Form
                            form={vehicleForm}
                            layout="vertical"
                            onFinish={(values) => updateVehicleMutation.mutate(values)}
                            size="large"
                        >
                            <Form.Item name="name" label="Araç Takma Adı" rules={[{ required: true, message: 'Araç adı zorunludur' }]}>
                                <Input placeholder="Örn: 2024 Model Corolla" />
                            </Form.Item>
                            <Form.Item name="plate" label="Araç Plakası" rules={[{ required: true, message: 'Plaka zorunludur' }]}>
                                <Input placeholder="Örn: 34 ABC 123" />
                            </Form.Item>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="insuranceExpiryDate" label="Sigorta Bitiş" rules={[{ required: true }]}>
                                        <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="inspectionExpiryDate" label="Muayene Bitiş" rules={[{ required: true }]}>
                                        <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20, display: 'flex', gap: 12 }}>
                        <Button onClick={() => setIsVehicleEditOpen(false)} style={{ flex: 1, height: 50, borderRadius: 12 }}>Vazgeç</Button>
                        <Button
                            type="primary"
                            onClick={() => vehicleForm.submit()}
                            loading={updateVehicleMutation.isPending}
                            style={{ flex: 2, height: 50, borderRadius: 12, background: 'var(--accent-gradient)', border: 'none' }}
                        >
                            Güncelle
                        </Button>
                    </div>
                </div>
            </Drawer>

            {/* Transaction Drawer */}
            <Drawer
                title={editingTransaction ? 'İşlem Detayı Düzenle' : 'Yeni İşlem Ekle'}
                width={480}
                onClose={handleClose}
                open={isDrawerOpen}
                maskStyle={{ backdropFilter: 'blur(8px)' }}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                    <Form.Item name="type" label="İşlem Yönü" rules={[{ required: true }]}>
                        <Segmented
                            block
                            options={[
                                { label: 'Gelir (+)', value: 'INCOME' },
                                { label: 'Gider (-)', value: 'EXPENSE' },
                            ]}
                            style={{ padding: 4, background: 'rgba(255,255,255,0.05)' }}
                        />
                    </Form.Item>

                    <Form.Item name="categoryId" label="Kategori" rules={[{ required: true, message: 'Category is required' }]}>
                        <Select
                            placeholder="Kategori Seçin"
                            disabled={isLoadingCategories || !filteredCategories?.length}
                            loading={isLoadingCategories}
                            options={filteredCategories?.map(cat => ({
                                label: (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: cat.color }} />
                                        <span>{cat.name}</span>
                                    </div>
                                ),
                                value: cat.id
                            }))}
                        />
                    </Form.Item>

                    <Form.Item name="date" label="İşlem Tarihi" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                    </Form.Item>

                    <Form.Item name="description" label="Açıklama (isteğe bağlı)">
                        <Input.TextArea rows={3} placeholder="Açıklama girilmedi" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={10}>
                            <Form.Item name="currencyCode" label="Para Birimi" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="TRY">TRY — Türk Lirası</Select.Option>
                                    <Select.Option value="USD" disabled={ratesError && !rates?.USD}>
                                        USD — Amerikan Doları{ratesError && !rates?.USD ? ' (kur yok)' : ''}
                                    </Select.Option>
                                    <Select.Option value="EUR" disabled={ratesError && !rates?.EUR}>
                                        EUR — Euro{ratesError && !rates?.EUR ? ' (kur yok)' : ''}
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={14}>
                            <Form.Item name="amount" label="Tutar" rules={[{ required: true, type: 'number', min: 0.01 }]}>
                                <InputNumber style={{ width: '100%' }} precision={2} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Günlük Kur (TCMB — ForexSelling)">
                        <Row gutter={8}>
                            <Col span={18}>
                                <Form.Item name="tcmbExchangeRate" noStyle rules={[{ required: true }]}>
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        precision={4}
                                        disabled={currencyCode === 'TRY'}
                                    />
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
                                >
                                    TCMB
                                </Button>
                            </Col>
                        </Row>
                    </Form.Item>

                    <div style={{
                        marginTop: 32,
                        padding: 24,
                        borderRadius: 12,
                        background: 'rgba(37, 99, 235, 0.1)',
                        border: '1px solid rgba(37, 99, 235, 0.2)'
                    }}>
                        <Text style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: 4 }}>Hesaplanan TRY Karşılığı</Text>
                        <Title level={2} style={{ color: 'var(--text-primary)', margin: 0 }}>
                            {formatCurrency(amountTRY, 'TRY')}
                        </Title>
                    </div>

                    <Button
                        type="primary"
                        block
                        onClick={() => form.submit()}
                        loading={isSaving || createMutation.isPending || updateMutation.isPending}
                        style={{
                            marginTop: 24,
                            height: 48,
                            borderRadius: 12,
                            background: 'var(--accent-gradient)',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: 16,
                        }}
                    >
                        Kaydet
                    </Button>
                </Form>
            </Drawer>
        </div>
    );
};

export default VehicleDetailPage;
