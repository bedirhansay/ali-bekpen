import { Plus, Car, MoreVertical, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Row, Col, Typography, Dropdown, MenuProps, DatePicker, Flex, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../api';
import { Vehicle } from '../../types';
import { getExpiryStatus } from '../../utils/statusUtils';
import { showSuccess, showError, showLoading } from '../../../../lib/toast';
import { PageSkeleton } from '@/components/PageSkeleton';
import { useVehiclesLast30DaysAnalytics } from '../../api/useVehiclesLast30DaysAnalytics';
import { formatCurrency } from '@/shared/utils/formatters';

const { Title, Text } = Typography;

const VehiclesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: vehiclesData, isLoading: isVehiclesLoading } = useQuery({
        queryKey: ['vehicles'],
        queryFn: () => getVehicles({ pageSize: 100 }),
    });

    const { data: analyticsData, isLoading: isAnalyticsLoading } = useVehiclesLast30DaysAnalytics();

    const createMutation = useMutation({
        mutationFn: createVehicle,
        onMutate: () => {
            return { toastId: showLoading("Kaydediliyor...") };
        },
        onSuccess: (_, __, context) => {
            showSuccess('Araç başarıyla eklendi', { id: context?.toastId });
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            handleClose();
        },
        onError: (error: any, _, context) => {
            showError(error, { id: context?.toastId });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateVehicle(id, data),
        onMutate: () => {
            return { toastId: showLoading("Kaydediliyor...") };
        },
        onSuccess: (_, __, context) => {
            showSuccess('Araç başarıyla güncellendi', { id: context?.toastId });
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            handleClose();
        },
        onError: (error: any, _, context) => {
            showError(error, { id: context?.toastId });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteVehicle,
        onSuccess: () => {
            showSuccess('Araç başarıyla silindi');
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
        onError: (error: any) => {
            showError(error);
        }
    });

    if (isVehiclesLoading) {
        return <PageSkeleton />;
    }

    const handleOpen = (vehicle?: Vehicle) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            form.setFieldsValue({
                ...vehicle,
                insuranceExpiryDate: vehicle.insuranceExpiryDate ? dayjs(vehicle.insuranceExpiryDate.toDate()) : null,
                inspectionExpiryDate: vehicle.inspectionExpiryDate ? dayjs(vehicle.inspectionExpiryDate.toDate()) : null,
            });
        } else {
            setEditingVehicle(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
        form.resetFields();
    };

    const onFinish = (values: any) => {
        const payload = {
            ...values,
            insuranceExpiryDate: values.insuranceExpiryDate ? values.insuranceExpiryDate.toDate() : null,
            inspectionExpiryDate: values.inspectionExpiryDate ? values.inspectionExpiryDate.toDate() : null,
        };

        if (editingVehicle) {
            updateMutation.mutate({ id: editingVehicle.id, data: payload });
        } else {
            createMutation.mutate(payload as any);
        }
    };

    const getMenuProps = (record: Vehicle): MenuProps => ({
        items: [
            {
                key: 'edit',
                label: 'Düzenle',
                icon: <Edit2 size={16} />,
                onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleOpen(record);
                }
            },
            {
                type: 'divider',
            },
            {
                key: 'delete',
                label: 'Sil',
                danger: true,
                icon: <Trash2 size={16} />,
                onClick: (e) => {
                    e.domEvent.stopPropagation();
                    Modal.confirm({
                        title: 'Aracı Sil',
                        content: 'Bu aracı silmek istediğinizden emin misiniz? İşlemler kalıcı olarak etkilenebilir.',
                        okText: 'Evet, Sil',
                        okButtonProps: { danger: true },
                        cancelText: 'İptal',
                        onOk: () => deleteMutation.mutate(record.id),
                    });
                }
            },
        ],
    });

    return (
        <div style={{ position: 'relative', minHeight: 'calc(100vh - 120px)' }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: 32 }} className="animated-list-item stagger-1">
                <div>
                    <Title level={2} style={{ color: 'var(--text-primary)', margin: 0 }}>Araç Filosu</Title>
                    <Text style={{ color: 'var(--text-secondary)' }}>Tüm araçlarınızı ve finansal özetlerini görüntüleyin.</Text>
                </div>
            </Flex>

            <Row gutter={[24, 24]}>
                {vehiclesData?.items.map((vehicle, index) => {
                    const insurance = getExpiryStatus(vehicle.insuranceExpiryDate);
                    const inspection = getExpiryStatus(vehicle.inspectionExpiryDate);
                    const isCritical = insurance.status === 'danger' || inspection.status === 'danger' || insurance.status === 'expired' || inspection.status === 'expired';

                    const stats = analyticsData?.[vehicle.id];
                    const hasTransactions = stats?.txCount && stats.txCount > 0;

                    return (
                        <Col xs={24} sm={12} lg={8} xl={8} key={vehicle.id}>
                            <div className={`glass-card animated-list-item stagger-` + ((index % 4) + 1)}
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    padding: 0,
                                    border: isCritical ? `1px solid ${insurance.status === 'expired' || inspection.status === 'expired' ? '#991b1b' : 'rgba(239, 68, 68, 0.3)'}` : '1px solid rgba(255,255,255,0.06)',
                                    boxShadow: isCritical ? `0 0 20px -5px ${insurance.status === 'expired' || inspection.status === 'expired' ? 'rgba(153, 27, 27, 0.4)' : 'rgba(239, 68, 68, 0.4)'}` : undefined
                                }}
                            >
                                <div style={{
                                    height: 4,
                                    width: '100%',
                                    background: isCritical ? '#ef4444' : 'var(--accent-gradient)',
                                    position: 'absolute', top: 0, left: 0
                                }} />

                                <div style={{ padding: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 12,
                                                background: 'rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                <Car size={24} color="var(--accent-blue)" />
                                            </div>
                                            <div>
                                                <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>{vehicle.name}</Title>
                                                <span style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    padding: '2px 8px',
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: 'var(--text-secondary)',
                                                    display: 'inline-block',
                                                    marginTop: 4
                                                }}>
                                                    {vehicle.plate}
                                                </span>
                                            </div>
                                        </div>
                                        <Dropdown menu={getMenuProps(vehicle)} trigger={['click']} placement="bottomRight">
                                            <Button type="text" icon={<MoreVertical color="var(--text-secondary)" />} style={{ width: 32, height: 32, padding: 0 }} />
                                        </Dropdown>
                                    </div>

                                    {/* 30 Days Analytics Section */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                                        {isAnalyticsLoading ? (
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <Skeleton.Button active style={{ flex: 1, height: 60, borderRadius: 8 }} />
                                                <Skeleton.Button active style={{ flex: 1, height: 60, borderRadius: 8 }} />
                                                <Skeleton.Button active style={{ flex: 1, height: 60, borderRadius: 8 }} />
                                            </div>
                                        ) : !hasTransactions ? (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '16px 0',
                                                background: 'rgba(0,0,0,0.1)',
                                                borderRadius: 8,
                                                border: '1px dashed rgba(255,255,255,0.1)'
                                            }}>
                                                <Text style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: 13 }}>
                                                    Son 30 günde hareket yok
                                                </Text>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>Gelir</Text>
                                                    <div style={{ color: 'var(--income)', fontWeight: 600, fontSize: 13 }}>
                                                        {formatCurrency(stats.incomeTry, 'TRY')}
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>Gider</Text>
                                                    <div style={{ color: 'var(--expense)', fontWeight: 600, fontSize: 13 }}>
                                                        {formatCurrency(stats.expenseTry, 'TRY')}
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>Net</Text>
                                                    <div style={{ color: stats.netTry >= 0 ? 'var(--income)' : 'var(--expense)', fontWeight: 700, fontSize: 13 }}>
                                                        {formatCurrency(stats.netTry, 'TRY')}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div style={{ alignSelf: 'center' }}>
                                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 10 }}>Son 30 gün</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <div style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 4,
                                            padding: '8px 12px',
                                            borderRadius: 10,
                                            background: 'rgba(255,255,255,0.03)',
                                            border: insurance.status === 'expired' ? '1px solid rgba(153, 27, 27, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <span style={{ fontSize: 10, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                📅 Sigorta
                                            </span>
                                            <span style={{ fontWeight: 600, fontSize: 13, color: insurance.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {(insurance.status === 'danger' || insurance.status === 'expired') && <div className="pulse-dot-red" />}
                                                {insurance.label}
                                            </span>
                                        </div>
                                        <div style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 4,
                                            padding: '8px 12px',
                                            borderRadius: 10,
                                            background: 'rgba(255,255,255,0.03)',
                                            border: inspection.status === 'expired' ? '1px solid rgba(153, 27, 27, 0.3)' : '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <span style={{ fontSize: 10, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                🔧 Muayene
                                            </span>
                                            <span style={{ fontWeight: 600, fontSize: 13, color: inspection.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {(inspection.status === 'danger' || inspection.status === 'expired') && <div className="pulse-dot-red" />}
                                                {inspection.label}
                                            </span>
                                        </div>
                                    </div>

                                    <Link to={`/vehicles/${vehicle.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 8,
                                            transition: 'var(--transition)',
                                            color: 'var(--text-primary)'
                                        }}
                                            className="hover:bg-white/10 hover:text-white"
                                        >
                                            <span style={{ fontSize: 14, fontWeight: 500 }}>Detaylara Git</span>
                                            <ArrowRight size={16} />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </Col>
                    );
                })}
            </Row>

            <Button
                type="primary"
                shape="circle"
                icon={<Plus size={24} />}
                size="large"
                onClick={() => handleOpen()}
                style={{
                    position: 'fixed',
                    bottom: 40,
                    right: 40,
                    width: 64,
                    height: 64,
                    background: 'var(--accent-gradient)',
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)',
                    zIndex: 90
                }}
            />

            <Modal
                title={editingVehicle ? 'Aracı Düzenle' : 'Yeni Araç Ekle'}
                open={isModalOpen}
                onCancel={handleClose}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                destroyOnClose
                centered
                maskStyle={{ backdropFilter: 'blur(8px)' }}
                okButtonProps={{ style: { background: 'var(--accent-gradient)', border: 'none' } }}
            >
                <div style={{ marginTop: 24 }}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{ name: '', plate: '' }}
                    >
                        <Form.Item
                            name="plate"
                            label="Araç Plakası"
                            rules={[{ required: true, message: 'Lütfen plaka giriniz' }]}
                        >
                            <Input placeholder="34 ABC 123" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="name"
                            label="Marka / Model (Açıklama)"
                            rules={[{ required: true, message: 'Lütfen araç adı giriniz' }]}
                        >
                            <Input placeholder="Örn: Renault Megane" size="large" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="insuranceExpiryDate"
                                    label="Sigorta Bitiş Tarihi"
                                    rules={[{ required: true, message: 'Sigorta tarihi zorunludur' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} size="large" format="DD.MM.YYYY" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="inspectionExpiryDate"
                                    label="Muayene Bitiş Tarihi"
                                    rules={[{ required: true, message: 'Muayene tarihi zorunludur' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} size="large" format="DD.MM.YYYY" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default VehiclesPage;
