import { Button, Card, Form, Input, Layout, Typography, message } from 'antd';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '@/shared/utils/firebase-config';

const { Content } = Layout;
const { Title, Text } = Typography;

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, values.email);
            message.success('Şifre sıfırlama e-postası gönderildi');
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
                        <Title level={3} style={{ margin: 0 }}>Şifremi Unuttum</Title>
                        <Text type="secondary">E-posta adresinizi girin, sıfırlama linki gönderelim.</Text>
                    </div>
                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            name="email"
                            label="E-posta"
                            rules={[{ required: true, type: 'email', message: 'Geçerli bir e-posta girin' }]}
                        >
                            <Input placeholder="ornek@mail.com" size="large" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                                Sıfırlama Linki Gönder
                            </Button>
                        </Form.Item>
                    </Form>
                    <div style={{ textAlign: 'center' }}>
                        <Link to="/sign-in">Giriş ekranına dön</Link>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default ForgotPassword;
