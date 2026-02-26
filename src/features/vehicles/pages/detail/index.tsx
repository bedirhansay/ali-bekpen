import { Plus, ChevronLeft, Edit, Trash2, ArrowRight, MapPin, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useMemo, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Button, Form, Input, Row, Col, Typography, Popconfirm,
    Drawer, DatePicker, Spin, Modal, Select, Skeleton
} from 'antd';
import dayjs from 'dayjs';
import { showSuccess, showError } from '@/lib/toast';

import { getVehicle, deleteVehicle, updateVehicle } from '../../api';
import { getSefersByVehicle, createSefer, updateSefer, deleteSefer } from '@/features/sefers/api';
import { getSeferSummary } from '@/features/transactions/api';
import { Sefer } from '@/features/sefers/types';
import { formatCurrency } from '@/shared/utils/formatters';

const { Title, Text } = Typography;

/* ─── Sefer Card ─────────────────────────────────────────────────────────── */

interface SeferCardProps {
    sefer: Sefer;
    vehicleId: string;
    onEdit: (s: Sefer) => void;
    onDelete: (id: string) => void;
    index: number;
}

const SeferCard = memo(({ sefer, vehicleId, onEdit, onDelete, index }: SeferCardProps) => {
    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['seferSummary', sefer.id],
        queryFn: () => getSeferSummary(sefer.id),
        staleTime: 60 * 1000,
    });

    const net = summary?.netTRY ?? 0;
    const isPositive = net >= 0;
    const isOpen = sefer.status === 'OPEN';

    const startDate = sefer.startDate?.toDate ? dayjs(sefer.startDate.toDate()).format('DD.MM.YYYY') : '—';
    const endDate = sefer.endDate?.toDate ? dayjs((sefer.endDate as any).toDate()).format('DD.MM.YYYY') : null;

    return (
        <div
            className={`sefer-card animated-list-item stagger-${(index % 4) + 1}`}
            style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${isOpen ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 16,
                padding: 0,
                overflow: 'hidden',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isOpen ? '0 4px 20px rgba(37,99,235,0.12)' : '0 4px 14px rgba(0,0,0,0.3)',
            }}
        >
            {/* Top accent bar */}
            <div style={{
                height: 3,
                background: isOpen
                    ? 'linear-gradient(90deg, #2563eb, #7c3aed)'
                    : 'linear-gradient(90deg, #475569, #334155)',
            }} />

            <div style={{ padding: '20px 20px 16px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <MapPin size={14} color="var(--accent-blue)" strokeWidth={2.5} />
                            <Text strong style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.3 }}>
                                {sefer.title}
                            </Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Calendar size={12} color="var(--text-secondary)" />
                            <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                                {startDate}{endDate ? ` → ${endDate}` : ' → devam ediyor'}
                            </Text>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{
                            padding: '2px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.3,
                            background: isOpen ? 'rgba(37,99,235,0.15)' : 'rgba(71,85,105,0.3)',
                            color: isOpen ? '#60a5fa' : '#94a3b8',
                            border: `1px solid ${isOpen ? 'rgba(37,99,235,0.3)' : 'rgba(71,85,105,0.3)'}`,
                        }}>
                            {isOpen ? 'AÇIK' : 'KAPALI'}
                        </span>
                    </div>
                </div>

                {/* Stats row - Stacked vertically for better readability and responsiveness */}
                {isSummaryLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        <Skeleton.Button active style={{ width: '100%', height: 44, borderRadius: 10 }} />
                        <Skeleton.Button active style={{ width: '100%', height: 44, borderRadius: 10 }} />
                        <Skeleton.Button active style={{ width: '100%', height: 44, borderRadius: 10 }} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        {/* Income line */}
                        <div style={{
                            padding: '10px 14px',
                            background: 'rgba(34,197,94,0.06)',
                            border: '1px solid rgba(34,197,94,0.12)',
                            borderRadius: 12,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUp size={14} color="var(--income)" strokeWidth={2.5} />
                                </div>
                                <Text style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Toplam Gelir</Text>
                            </div>
                            <Text strong style={{ fontSize: 14, color: 'var(--income)' }}>
                                {formatCurrency(summary?.totalIncomeTRY ?? 0, 'TRY')}
                            </Text>
                        </div>

                        {/* Expense line */}
                        <div style={{
                            padding: '10px 14px',
                            background: 'rgba(239,68,68,0.06)',
                            border: '1px solid rgba(239,68,68,0.12)',
                            borderRadius: 12,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingDown size={14} color="var(--expense)" strokeWidth={2.5} />
                                </div>
                                <Text style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Toplam Gider</Text>
                            </div>
                            <Text strong style={{ fontSize: 14, color: 'var(--expense)' }}>
                                {formatCurrency(summary?.totalExpenseTRY ?? 0, 'TRY')}
                            </Text>
                        </div>

                        {/* Net Profit line */}
                        <div style={{
                            padding: '12px 14px',
                            background: isPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                            border: `1px solid ${isPositive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`,
                            borderRadius: 12,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: isPositive ? '0 4px 12px rgba(34,197,94,0.1)' : 'none'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: isPositive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {isPositive ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
                                </div>
                                <Text strong style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700 }}>Net Kar</Text>
                            </div>
                            <Text strong style={{ fontSize: 15, color: isPositive ? 'var(--income)' : 'var(--expense)', fontWeight: 800 }}>
                                {isPositive ? '+' : ''}{formatCurrency(net, 'TRY')}
                            </Text>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={() => onEdit(sefer)}
                        style={{
                            flex: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 36, height: 36,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 8,
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        onClick={() => {
                            Modal.confirm({
                                title: 'Seferi Sil',
                                content: 'Bu seferi silmek istediğinize emin misiniz? İşlem verileri etkilenebilir.',
                                okText: 'Evet, Sil',
                                okButtonProps: { danger: true },
                                cancelText: 'İptal',
                                onOk: () => onDelete(sefer.id),
                            });
                        }}
                        style={{
                            flex: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 36, height: 36,
                            background: 'rgba(239,68,68,0.05)',
                            border: '1px solid rgba(239,68,68,0.1)',
                            borderRadius: 8,
                            cursor: 'pointer',
                            color: 'rgba(239,68,68,0.7)',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; }}
                    >
                        <Trash2 size={14} />
                    </button>
                    <Link
                        to={`/vehicles/${vehicleId}/sefer/${sefer.id}`}
                        style={{ flex: 1, textDecoration: 'none' }}
                    >
                        <button
                            style={{
                                width: '100%', height: 36,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))',
                                border: '1px solid rgba(37,99,235,0.25)',
                                borderRadius: 8,
                                cursor: 'pointer',
                                color: '#93c5fd',
                                fontWeight: 600,
                                fontSize: 13,
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.25))';
                                e.currentTarget.style.borderColor = 'rgba(37,99,235,0.45)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))';
                                e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)';
                            }}
                        >
                            Seferi Gör <ArrowRight size={13} />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
});

/* ─── Main Page ───────────────────────────────────────────────────────────── */

const VehicleDetailPage = () => {
    const { vehicleId } = useParams<{ vehicleId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isVehicleEditOpen, setIsVehicleEditOpen] = useState(false);
    const [isSeferDrawerOpen, setIsSeferDrawerOpen] = useState(false);
    const [editingSefer, setEditingSefer] = useState<Sefer | null>(null);

    const [vehicleForm] = Form.useForm();
    const [seferForm] = Form.useForm();

    /* ── Queries ── */
    const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
        queryKey: ['vehicle', vehicleId],
        queryFn: () => getVehicle(vehicleId!),
        enabled: !!vehicleId,
    });

    const { data: sefers = [], isLoading: isLoadingSefers } = useQuery({
        queryKey: ['sefers', vehicleId],
        queryFn: () => getSefersByVehicle(vehicleId!),
        enabled: !!vehicleId,
        staleTime: 30 * 1000,
    });

    const openSefers = useMemo(() => sefers.filter((s) => s.status === 'OPEN'), [sefers]);
    const closedSefers = useMemo(() => sefers.filter((s) => s.status === 'CLOSED'), [sefers]);

    /* ── Mutations ── */
    const deleteVehicleMutation = useMutation({
        mutationFn: deleteVehicle,
        onSuccess: () => {
            showSuccess('Araç silindi');
            navigate('/vehicles');
        },
        onError: (err) => showError(err),
    });

    const updateVehicleMutation = useMutation({
        mutationFn: (values: any) => {
            const payload = {
                ...values,
                insuranceExpiryDate: values.insuranceExpiryDate?.toDate() ?? null,
                inspectionExpiryDate: values.inspectionExpiryDate?.toDate() ?? null,
            };
            return updateVehicle(vehicleId!, payload);
        },
        onSuccess: () => {
            showSuccess('Araç başarıyla güncellendi');
            queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
            setIsVehicleEditOpen(false);
        },
        onError: (err) => showError(err),
    });

    const createSeferMutation = useMutation({
        mutationFn: createSefer,
        onSuccess: () => {
            showSuccess('Sefer oluşturuldu');
            queryClient.invalidateQueries({ queryKey: ['sefers', vehicleId] });
            closeSeferDrawer();
        },
        onError: (err) => showError(err),
    });

    const updateSeferMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateSefer(id, data),
        onSuccess: () => {
            showSuccess('Sefer güncellendi');
            queryClient.invalidateQueries({ queryKey: ['sefers', vehicleId] });
            closeSeferDrawer();
        },
        onError: (err) => showError(err),
    });

    const deleteSeferMutation = useMutation({
        mutationFn: deleteSefer,
        onSuccess: () => {
            showSuccess('Sefer silindi');
            queryClient.invalidateQueries({ queryKey: ['sefers', vehicleId] });
        },
        onError: (err) => showError(err),
    });

    /* ── Sefer Drawer ── */
    const openSeferDrawer = (sefer?: Sefer) => {
        if (sefer) {
            setEditingSefer(sefer);
            seferForm.setFieldsValue({
                title: sefer.title,
                description: sefer.description,
                status: sefer.status,
                startDate: sefer.startDate?.toDate ? dayjs(sefer.startDate.toDate()) : null,
                endDate: sefer.endDate?.toDate ? dayjs((sefer.endDate as any).toDate()) : null,
            });
        } else {
            setEditingSefer(null);
            seferForm.resetFields();
            seferForm.setFieldsValue({ status: 'OPEN', startDate: dayjs() });
        }
        setIsSeferDrawerOpen(true);
    };

    const closeSeferDrawer = () => {
        setIsSeferDrawerOpen(false);
        setEditingSefer(null);
        seferForm.resetFields();
    };

    const onSeferFinish = (values: any) => {
        // Build payload without any `undefined` values - Firestore rejects them
        const payload: any = {
            vehicleId: vehicleId!,
            title: values.title as string,
            status: values.status,
            startDate: values.startDate.toDate(),
            endDate: values.endDate ? values.endDate.toDate() : null,
        };
        // Only include description if provided (avoids Firestore "undefined" error)
        if (values.description?.trim()) {
            payload.description = values.description.trim();
        }

        if (editingSefer) {
            updateSeferMutation.mutate({ id: editingSefer.id, data: payload });
        } else {
            createSeferMutation.mutate(payload);
        }
    };

    /* ── Render ── */
    if (isLoadingVehicle) {
        return (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div style={{ color: 'var(--text-primary)', textAlign: 'center', padding: 40 }}>
                Araç bulunamadı.
            </div>
        );
    }

    return (
        <div className="animated-list-item stagger-1">
            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Button
                    type="text"
                    icon={<ChevronLeft size={20} />}
                    onClick={() => navigate('/vehicles')}
                    style={{
                        color: 'var(--text-secondary)',
                        background: 'rgba(255,255,255,0.05)',
                        width: 40, height: 40, borderRadius: '50%'
                    }}
                />
                <Text style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Geri Dön</Text>
            </div>

            {/* Vehicle Hero */}
            <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))',
                borderRadius: 20,
                border: '1px solid var(--border-light)',
                marginBottom: 32,
                position: 'relative',
            }}>
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
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
                        style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                            style={{ color: 'rgba(239, 68, 68, 0.6)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        />
                    </Popconfirm>
                </div>

                <Title level={3} style={{ color: 'white', margin: '0 0 4px 0', fontWeight: 700 }}>{vehicle.plate}</Title>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{vehicle.name}</Text>

                <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: 10 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block' }}>Toplam Sefer</Text>
                        <Text strong style={{ color: '#fff', fontSize: 18 }}>{sefers.length}</Text>
                    </div>
                    <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', padding: '8px 16px', borderRadius: 10 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, display: 'block' }}>Aktif Sefer</Text>
                        <Text strong style={{ color: '#60a5fa', fontSize: 18 }}>{openSefers.length}</Text>
                    </div>
                </div>
            </div>

            {/* Sefer Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <Title level={4} style={{ color: 'var(--text-primary)', margin: 0 }}>Seferler</Title>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Her seferin gelir/gider ve net kar bilgisini görün</Text>
                </div>
                <button
                    onClick={() => openSeferDrawer()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '0 20px', height: 42,
                        background: 'var(--accent-gradient)',
                        border: 'none', borderRadius: 10,
                        color: 'white', fontWeight: 700, fontSize: 14,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                        transition: 'all 0.15s',
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.5)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)'; }}
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Yeni Sefer
                </button>
            </div>

            {/* Sefer Grid */}
            {isLoadingSefers ? (
                <Row gutter={[20, 20]}>
                    {[1, 2, 3].map((i) => (
                        <Col xs={24} sm={12} lg={8} key={i}>
                            <Skeleton active paragraph={{ rows: 4 }} style={{ padding: 20, background: 'rgba(30,41,59,0.5)', borderRadius: 16 }} />
                        </Col>
                    ))}
                </Row>
            ) : sefers.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 24px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: 16,
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
                    <Title level={5} style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Henüz sefer eklenmemiş
                    </Title>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        İlk seferi ekleyerek finansal takibe başlayın
                    </Text>
                    <div style={{ marginTop: 20 }}>
                        <Button type="primary" icon={<Plus size={14} />} onClick={() => openSeferDrawer()}
                            style={{ background: 'var(--accent-gradient)', border: 'none' }}>
                            Sefer Ekle
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Open sefers */}
                    {openSefers.length > 0 && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa' }} />
                                <Text style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Aktif Seferler ({openSefers.length})
                                </Text>
                            </div>
                            <Row gutter={[20, 20]} style={{ marginBottom: closedSefers.length > 0 ? 32 : 0 }}>
                                {openSefers.map((sefer, i) => (
                                    <Col xs={24} sm={12} lg={8} key={sefer.id}>
                                        <SeferCard
                                            sefer={sefer}
                                            vehicleId={vehicleId!}
                                            onEdit={openSeferDrawer}
                                            onDelete={(id) => deleteSeferMutation.mutate(id)}
                                            index={i}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}

                    {/* Closed sefers */}
                    {closedSefers.length > 0 && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#475569' }} />
                                <Text style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Geçmiş Seferler ({closedSefers.length})
                                </Text>
                            </div>
                            <Row gutter={[20, 20]}>
                                {closedSefers.map((sefer, i) => (
                                    <Col xs={24} sm={12} lg={8} key={sefer.id}>
                                        <SeferCard
                                            sefer={sefer}
                                            vehicleId={vehicleId!}
                                            onEdit={openSeferDrawer}
                                            onDelete={(id) => deleteSeferMutation.mutate(id)}
                                            index={i}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </>
            )}

            {/* Vehicle Edit Drawer */}
            <Drawer
                title="Araç Bilgilerini Düzenle"
                placement="right"
                onClose={() => setIsVehicleEditOpen(false)}
                open={isVehicleEditOpen}
                width={window.innerWidth > 500 ? 500 : '100%'}
                maskStyle={{ backdropFilter: 'blur(8px)' }}
            >
                <Form form={vehicleForm} layout="vertical" onFinish={(v) => updateVehicleMutation.mutate(v)} size="large">
                    <Form.Item name="name" label="Araç Takma Adı" rules={[{ required: true }]}>
                        <Input placeholder="Örn: 2024 Model Corolla" />
                    </Form.Item>
                    <Form.Item name="plate" label="Araç Plakası" rules={[{ required: true }]}>
                        <Input placeholder="34 ABC 123" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="insuranceExpiryDate" label="Sigorta Bitiş">
                                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="inspectionExpiryDate" label="Muayene Bitiş">
                                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20, display: 'flex', gap: 12 }}>
                    <Button onClick={() => setIsVehicleEditOpen(false)} style={{ flex: 1, height: 50, borderRadius: 12 }}>Vazgeç</Button>
                    <Button
                        type="primary"
                        onClick={() => vehicleForm.submit()}
                        loading={updateVehicleMutation.isPending}
                        style={{ flex: 2, height: 50, borderRadius: 12, background: 'var(--accent-gradient)', border: 'none' }}
                    >Güncelle</Button>
                </div>
            </Drawer>

            {/* Sefer Create/Edit Drawer */}
            <Drawer
                title={editingSefer ? 'Seferi Düzenle' : 'Yeni Sefer Ekle'}
                placement="right"
                onClose={closeSeferDrawer}
                open={isSeferDrawerOpen}
                width={window.innerWidth > 500 ? 480 : '100%'}
                maskStyle={{ backdropFilter: 'blur(8px)' }}
            >
                <Form form={seferForm} layout="vertical" onFinish={onSeferFinish} size="large">
                    <Form.Item name="title" label="Sefer Başlığı" rules={[{ required: true, message: 'Başlık zorunludur' }]}>
                        <Input placeholder="Örn: İstanbul - Ankara" />
                    </Form.Item>
                    <Form.Item name="description" label="Açıklama (isteğe bağlı)">
                        <Input.TextArea rows={2} placeholder="Kısa bir açıklama..." />
                    </Form.Item>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="startDate" label="Başlangıç Tarihi" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="endDate" label="Bitiş Tarihi">
                                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="status" label="Durum" rules={[{ required: true }]}>
                        <Select size="large">
                            <Select.Option value="OPEN">
                                <span style={{ color: '#60a5fa', fontWeight: 600 }}>● AÇIK</span>
                            </Select.Option>
                            <Select.Option value="CLOSED">
                                <span style={{ color: '#94a3b8', fontWeight: 600 }}>● KAPALI</span>
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20, display: 'flex', gap: 12 }}>
                    <Button onClick={closeSeferDrawer} style={{ flex: 1, height: 50, borderRadius: 12 }}>Vazgeç</Button>
                    <Button
                        type="primary"
                        onClick={() => seferForm.submit()}
                        loading={createSeferMutation.isPending || updateSeferMutation.isPending}
                        style={{ flex: 2, height: 50, borderRadius: 12, background: 'var(--accent-gradient)', border: 'none' }}
                    >
                        {editingSefer ? 'Güncelle' : 'Sefer Oluştur'}
                    </Button>
                </div>
            </Drawer>
        </div>
    );
};

export default VehicleDetailPage;
