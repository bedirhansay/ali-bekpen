import { useState } from 'react';
import { Button, Form, Input, Typography, message, Spin } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/shared/utils/firebase-config';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Activity } from 'lucide-react';

const { Title, Text } = Typography;

const SignIn = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, values.email, values.password);
            message.success('Giriş başarılı');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            message.error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* Left Side - Brand & Abstract Art */}
            <div style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRight: '1px solid rgba(255,255,255,0.05)'
            }}
                className="auth-left-panel"
            >
                {/* Abstract Orbs */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '40vw',
                    height: '40vw',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 60%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'rotate 20s linear infinite',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '10%',
                    width: '30vw',
                    height: '30vw',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 60%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'rotate 15s linear infinite reverse',
                }} />

                <div style={{ position: 'relative', zIndex: 10, maxWidth: 480 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 20,
                            background: 'var(--accent-gradient)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-glow)'
                        }}>
                            <Activity size={32} color="white" />
                        </div>
                        <Title level={1} style={{ margin: 0, color: 'white', letterSpacing: '-1px', fontSize: '3rem' }}>
                            Bekpen<span style={{ fontWeight: 300, color: 'var(--text-secondary)' }}>Hesap</span>
                        </Title>
                    </div>

                    <Title level={2} style={{ color: 'white', marginBottom: 24, fontSize: '2.5rem', lineHeight: 1.2 }}>
                        Araç filonuzu modern bir şekilde yönetin.
                    </Title>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.6 }}>
                        Finansal verilerinizi tek bir merkezde toplayın, gelir ve giderlerinizi gerçek zamanlı kur takibiyle optimize edin.
                    </Text>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
                position: 'relative'
            }}>
                <div className="glass-card animated-list-item stagger-1" style={{ width: '100%', maxWidth: 420, padding: 48, position: 'relative', zIndex: 10, background: 'rgba(30, 41, 59, 0.4)' }}>
                    <div style={{ marginBottom: 40, textAlign: 'center' }}>
                        <Title level={3} style={{ color: 'white', margin: 0 }}>Hesabınıza Giriş Yapın</Title>
                        <Text style={{ color: 'var(--text-secondary)', marginTop: 8, display: 'block' }}>Devam etmek için bilgilerinizi girin</Text>
                    </div>

                    <Form
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                        size="large"
                        initialValues={{ email: 'ali@gmail.com', password: 'ali.bekpen' }}
                    >
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: 'E-posta zorunludur' }, { type: 'email', message: 'Geçerli bir e-posta giriniz' }]}
                            style={{ marginBottom: 24 }}
                        >
                            <Input
                                prefix={<Mail size={18} style={{ color: 'var(--text-secondary)', marginRight: 8 }} />}
                                placeholder="E-posta Adresi"
                                style={{
                                    height: 52,
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    borderRadius: 12
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Şifre zorunludur' }]}
                            style={{ marginBottom: 40 }}
                        >
                            <Input.Password
                                prefix={<Lock size={18} style={{ color: 'var(--text-secondary)', marginRight: 8 }} />}
                                placeholder="Şifreniz"
                                style={{
                                    height: 52,
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    borderRadius: 12
                                }}
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            disabled={loading}
                            style={{
                                height: 52,
                                borderRadius: 12,
                                fontSize: 16,
                                fontWeight: 600,
                                background: 'var(--accent-gradient)',
                                border: 'none',
                                boxShadow: 'var(--shadow-glow)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8
                            }}
                        >
                            {loading ? <Spin size="small" /> : 'Giriş Yap'}
                            {!loading && <ArrowRight size={18} />}
                        </Button>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                        <Text style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                            © {new Date().getFullYear()} Bekpen Hesap. Tüm hakları saklıdır.
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
