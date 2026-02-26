import { Button, Card, Form, Input, Layout, Typography, message } from 'antd';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/shared/utils/firebase-config';

const { Content } = Layout;
const { Title, Text } = Typography;

const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, values.email, values.password);
            message.success('Kayıt başarılı');
            navigate('/vehicles');
        } catch (error: any) {
            message.error('Hata: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f7f9' }}>
            <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Title level={3} style={{ margin: 0 }}>Bekpen Hesap</Title>
                        <Text type="secondary">Yeni bir hesap oluşturun.</Text>
                    </div>
                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            name="email"
                            label="E-posta"
                            rules={[{ required: true, type: 'email', message: 'Geçerli bir e-posta girin' }]}
                        >
                            <Input placeholder="ornek@mail.com" size="large" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label="Şifre"
                            rules={[
                                { required: true, message: 'Şifrenizi girin' },
                                { min: 6, message: 'Şifre en az 6 karakter olmalı' }
                            ]}
                        >
                            <Input.Password placeholder="******" size="large" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                                Kayıt Ol
                            </Button>
                        </Form.Item>
                    </Form>
                    <div style={{ textAlign: 'center' }}>
                        <Link to="/sign-in">Zaten hesabınız var mı? Giriş yapın</Link>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default SignUp;
