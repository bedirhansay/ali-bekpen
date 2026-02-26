import { Skeleton, Row, Col } from 'antd';

export const PageSkeleton = () => {
    return (
        <div style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: 32 }}>
                <Skeleton.Input active size="large" style={{ width: 250, marginBottom: 8 }} />
                <br />
                <Skeleton.Input active size="small" style={{ width: 400 }} />
            </div>

            <Row gutter={[24, 24]}>
                {[1, 2, 3].map((key) => (
                    <Col xs={24} md={8} key={key}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            borderRadius: 20,
                            padding: 32,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            backdropFilter: 'blur(10px)',
                        }}>
                            <Skeleton active paragraph={{ rows: 2 }} />
                        </div>
                    </Col>
                ))}
            </Row>

            <div style={{ marginTop: 48 }}>
                <Skeleton active paragraph={{ rows: 6 }} />
            </div>
        </div>
    );
};
