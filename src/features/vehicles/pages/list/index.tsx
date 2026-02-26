import { Plus, Car, MoreVertical, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Modal, Row, Col, Typography, message, Dropdown, MenuProps } from 'antd';
import { Link } from 'react-router-dom';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../api';
import { CreateVehicleDTO, Vehicle } from '../../types';

const { Title, Text } = Typography;

const VehiclesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['vehicles'],
        queryFn: () => getVehicles({ pageSize: 100 }),
    });

    const createMutation = useMutation({
        mutationFn: createVehicle,
        onSuccess: () => {
            message.success('Araç başarıyla eklendi');
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            handleClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateVehicleDTO }) => updateVehicle(id, data),
        onSuccess: () => {
            message.success('Araç başarıyla güncellendi');
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            handleClose();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteVehicle,
        onSuccess: () => {
            message.success('Araç başarıyla silindi');
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
    });

    const handleOpen = (vehicle?: Vehicle) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            form.setFieldsValue(vehicle);
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

    const onFinish = (values: CreateVehicleDTO) => {
        if (editingVehicle) {
            updateMutation.mutate({ id: editingVehicle.id, data: values });
        } else {
            createMutation.mutate(values);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }} className="animated-list-item stagger-1">
                <div>
                    <Title level={2} style={{ color: 'var(--text-primary)', margin: 0 }}>Araç Filosu</Title>
                    <Text style={{ color: 'var(--text-secondary)' }}>Tüm araçlarınızı ve finansal özetlerini görüntüleyin.</Text>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                {isLoading ? (
                    <Text style={{ color: 'var(--text-secondary)' }}>Yükleniyor...</Text>
                ) : (
                    data?.items.map((vehicle, index) => (
                        <Col xs={24} sm={12} lg={8} key={vehicle.id}>
                            <div className={`glass-card animated-list-item stagger-${(index % 4) + 1}`} style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                                <div style={{ height: 4, width: '100%', background: 'var(--accent-gradient)', position: 'absolute', top: 0, left: 0 }} />

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

                                    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Text style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Gelir Özeti</Text>
                                            <div style={{ color: 'var(--income)', fontWeight: 600 }}>Tıklayıp Gör</div>
                                        </div>
                                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Text style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Gider Özeti</Text>
                                            <div style={{ color: 'var(--expense)', fontWeight: 600 }}>Tıklayıp Gör</div>
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
                    ))
                )}
            </Row>

            {/* Floating FAB */}
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
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default VehiclesPage;
