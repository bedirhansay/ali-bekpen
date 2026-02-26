import React, { useState } from 'react';
import {
    Typography,
    Row,
    Col,
    Button,
    Segmented,
    Card,
    Space,
    Modal,
    Form,
    Input,
    ColorPicker,
    Select,
    Popconfirm,
    Flex,
    Tooltip,
    Empty,
    Grid
} from 'antd';
import {
    Plus,
    Edit2,
    Trash2,
    Ship,
    Wallet,
    Users,
    Fuel,
    Wrench,
    Hammer,
    Disc,
    ShieldCheck,
    FileText,
    ParkingCircle,
    AlertTriangle,
    Search,
    Package,
    Tag,
    Briefcase,
    Zap,
    MapPin,
    Calendar,
    Settings,
    LayoutGrid,
    RotateCcw
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useResetCategories } from '../hooks';
import { CategoryType, CreateCategoryDTO, ICategory } from '../types';
import { PageSkeleton } from '@/components/PageSkeleton';
import { toast } from 'react-hot-toast';

const { Title, Text } = Typography;

const ICON_LIST = [
    { label: 'Gemi', value: 'Ship', icon: Ship },
    { label: 'Cüzdan', value: 'Wallet', icon: Wallet },
    { label: 'Kullanıcılar', value: 'Users', icon: Users },
    { label: 'Yakıt', value: 'Fuel', icon: Fuel },
    { label: 'Alet', value: 'Wrench', icon: Wrench },
    { label: 'Çekiç', value: 'Hammer', icon: Hammer },
    { label: 'Disk', value: 'Disc', icon: Disc },
    { label: 'Kalkan', value: 'ShieldCheck', icon: ShieldCheck },
    { label: 'Dosya', value: 'FileText', icon: FileText },
    { label: 'Otopark', value: 'ParkingCircle', icon: ParkingCircle },
    { label: 'Uyarı', value: 'AlertTriangle', icon: AlertTriangle },
    { label: 'Arama', value: 'Search', icon: Search },
    { label: 'Paket', value: 'Package', icon: Package },
    { label: 'Etiket', value: 'Tag', icon: Tag },
    { label: 'Çanta', value: 'Briefcase', icon: Briefcase },
    { label: 'Enerji', value: 'Zap', icon: Zap },
    { label: 'Konum', value: 'MapPin', icon: MapPin },
    { label: 'Takvim', value: 'Calendar', icon: Calendar },
    { label: 'Ayarlar', value: 'Settings', icon: Settings },
];

const CategoryIcon = ({ name, color, size = 20 }: { name: string, color: string, size?: number }) => {
    const IconComponent = ICON_LIST.find(i => i.value === name)?.icon || LayoutGrid;
    return <IconComponent size={size} color={color} />;
};

const CategoryManagementPage: React.FC = () => {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    const [filterType, setFilterType] = useState<CategoryType>('EXPENSE');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

    const { data: categories, isLoading } = useCategories();
    const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
    const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
    const { mutate: deleteCategory } = useDeleteCategory();
    const { mutate: resetCategories, isPending: isResetting } = useResetCategories();

    const { control, handleSubmit, reset } = useForm<CreateCategoryDTO>({
        defaultValues: {
            name: '',
            type: 'EXPENSE',
            color: '#2563eb',
            icon: 'Tag'
        }
    });

    const filteredCategories = categories?.filter(c => c.type === filterType) || [];

    const handleOpenModal = (category?: ICategory) => {
        if (category) {
            setEditingCategory(category);
            reset({
                name: category.name,
                type: category.type,
                color: category.color,
                icon: category.icon
            });
        } else {
            setEditingCategory(null);
            reset({
                name: '',
                type: filterType,
                color: '#2563eb',
                icon: 'Tag'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        reset();
    };

    const onSubmit = (data: CreateCategoryDTO) => {
        const isDuplicate = categories?.some(c =>
            c.type === data.type &&
            c.name.toLowerCase() === data.name.trim().toLowerCase() &&
            c.id !== editingCategory?.id
        );

        if (isDuplicate) {
            toast.error(`'${data.name}' adında bir ${data.type === 'INCOME' ? 'gelir' : 'gider'} kategorisi zaten mevcut.`);
            return;
        }

        if (editingCategory) {
            updateCategory({ id: editingCategory.id, data: { ...data, name: data.name.trim() } }, {
                onSuccess: handleCloseModal
            });
        } else {
            createCategory({ ...data, name: data.name.trim() }, {
                onSuccess: handleCloseModal
            });
        }
    };

    if (isLoading) return <PageSkeleton />;

    return (
        <div className="animated-list-item stagger-1" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
            {/* Header Area */}
            <Flex vertical={isMobile} gap={isMobile ? 16 : 0} justify="space-between" align={isMobile ? "stretch" : "center"} style={{ marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 700 }}>Kategori Yönetimi</Title>
                    <Text type="secondary">İşlemlerinizde kullanacağınız gelir ve gider türlerini yönetin.</Text>
                </div>
                <Space size={12} direction={isMobile ? "vertical" : "horizontal"}>
                    <Popconfirm
                        title="Tüm kategorileri sıfırla"
                        description="Mevcut kategorileriniz silinecek ve varsayılanlar geri yüklenecek. Emin misiniz?"
                        onConfirm={() => resetCategories()}
                        okText="Sıfırla"
                        cancelText="Vazgeç"
                        okButtonProps={{ danger: true, loading: isResetting }}
                    >
                        <Button
                            icon={<RotateCcw size={18} />}
                            size="large"
                            block={isMobile}
                            style={{
                                borderRadius: 12,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            Sıfırla
                        </Button>
                    </Popconfirm>
                    <Button
                        type="primary"
                        icon={<Plus size={18} />}
                        size="large"
                        block={isMobile}
                        onClick={() => handleOpenModal()}
                        style={{
                            borderRadius: 12,
                            height: 48,
                            padding: '0 24px',
                            background: 'var(--accent-gradient)',
                            border: 'none',
                            boxShadow: 'var(--shadow-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        Yeni Kategori
                    </Button>
                </Space>
            </Flex>

            {/* Filter Toggle */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 4,
                borderRadius: 12,
                display: 'inline-block',
                marginBottom: 32,
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <Segmented
                    value={filterType}
                    onChange={(val) => setFilterType(val as CategoryType)}
                    options={[
                        { label: 'Giderler', value: 'EXPENSE' },
                        { label: 'Gelirler', value: 'INCOME' },
                    ]}
                    style={{ background: 'transparent' }}
                />
            </div>

            {/* Category Grid */}
            {filteredCategories.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {filteredCategories.map((category) => (
                        <Col xs={12} sm={12} md={8} lg={6} xl={4} key={category.id}>
                            <Card
                                className="glass-card"
                                onClick={() => handleOpenModal(category)}
                                style={{
                                    borderRadius: 16,
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    backdropFilter: 'blur(12px)',
                                    transition: 'all 0.2s ease',
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                                bodyStyle={{ padding: '16px 12px' }}
                            >
                                <Flex vertical gap={12} align="center">
                                    <div
                                        style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 2, zIndex: 10 }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<Edit2 size={12} />}
                                            onClick={() => handleOpenModal(category)}
                                            style={{
                                                color: 'var(--text-secondary)',
                                                width: 22,
                                                height: 22,
                                                padding: 0,
                                                borderRadius: 6
                                            }}
                                        />
                                        {!category.isSystem ? (
                                            <Popconfirm
                                                title="Siliyoruz!"
                                                onConfirm={() => deleteCategory(category.id)}
                                                okText="Sil"
                                                cancelText="İptal"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    icon={<Trash2 size={12} />}
                                                    style={{
                                                        width: 22,
                                                        height: 22,
                                                        padding: 0,
                                                        borderRadius: 6
                                                    }}
                                                />
                                            </Popconfirm>
                                        ) : (
                                            <div style={{ opacity: 0.1, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Trash2 size={12} />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{
                                        padding: 12,
                                        borderRadius: 14,
                                        background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}10 100%)`,
                                        border: `1px solid ${category.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: 4
                                    }}>
                                        <CategoryIcon name={category.icon} color={category.color} size={24} />
                                    </div>

                                    <Tooltip title={category.name}>
                                        <Text
                                            strong
                                            style={{
                                                fontSize: 13,
                                                textAlign: 'center',
                                                width: '100%',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                padding: '0 2px'
                                            }}
                                        >
                                            {category.name}
                                        </Text>
                                    </Tooltip>
                                </Flex>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Flex
                    vertical
                    align="center"
                    justify="center"
                    style={{
                        padding: '100px 0',
                        background: 'rgba(30, 41, 59, 0.3)',
                        borderRadius: 32,
                        border: '1px dashed rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <Empty
                        description={
                            <Text type="secondary" style={{ fontSize: 16 }}>
                                Henüz {filterType === 'INCOME' ? 'gelir' : 'gider'} kategorisi bulunmuyor.
                            </Text>
                        }
                    />
                    <Button
                        type="primary"
                        icon={<Plus size={18} />}
                        onClick={() => handleOpenModal()}
                        style={{ marginTop: 16 }}
                    >
                        İlk Kategoriyi Ekle
                    </Button>
                </Flex>
            )}

            {/* Add/Edit Modal */}
            <Modal
                title={editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                width={400}
                centered
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)} style={{ marginTop: 24 }}>
                    <Form.Item label="Kategori Adı" required>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'Kategori adı gereklidir' }}
                            render={({ field, fieldState }: { field: any, fieldState: any }) => (
                                <>
                                    <Input {...field} placeholder="Örn: Yemek, Yakıt..." size="large" />
                                    {fieldState.error && <Text type="danger" style={{ fontSize: 12 }}>{fieldState.error.message}</Text>}
                                </>
                            )}
                        />
                    </Form.Item>

                    <Form.Item label="Tür">
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }: { field: any }) => (
                                <Segmented
                                    {...field}
                                    block
                                    options={[
                                        { label: 'Gider', value: 'EXPENSE', disabled: editingCategory?.isSystem },
                                        { label: 'Gelir', value: 'INCOME', disabled: editingCategory?.isSystem },
                                    ]}
                                />
                            )}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Renk">
                                <Controller
                                    name="color"
                                    control={control}
                                    render={({ field }: { field: any }) => (
                                        <ColorPicker
                                            value={field.value}
                                            onChange={(color) => field.onChange(color.toHexString())}
                                            showText
                                            style={{ width: '100%' }}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="İkon">
                                <Controller
                                    name="icon"
                                    control={control}
                                    render={({ field }: { field: any }) => (
                                        <Select {...field} size="large" style={{ width: '100%' }}>
                                            {ICON_LIST.map(item => (
                                                <Select.Option key={item.value} value={item.value}>
                                                    <Flex align="center" gap={8}>
                                                        <item.icon size={16} />
                                                        <span>{item.label}</span>
                                                    </Flex>
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{ marginTop: 32 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={isCreating || isUpdating}
                            style={{
                                borderRadius: 12,
                                height: 48,
                                background: 'var(--accent-gradient)',
                                border: 'none'
                            }}
                        >
                            {editingCategory ? 'Güncelle' : 'Oluştur'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManagementPage;
