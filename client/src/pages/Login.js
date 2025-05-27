import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // For Ant Design v5+
const { Title } = Typography;

function Login({ setToken, setRole, setName }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setRole(data.role);
        setName(data.fullName);
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.fullName);
        window.location.href = '/dashboard';
      } else {
        notification.error({
          message: 'خطا در ورود',
          description: 'نام کاربری یا رمز عبور اشتباه است',
          placement: 'top',
          duration: 3
        });
      }
    } catch (err) {
      notification.error({
        message: 'خطا در ارتباط با سرور',
        description: 'لطفاً بعداً دوباره تلاش کنید.',
        placement: 'top',
        duration: 3
      });
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        direction: 'rtl',
      }}
    >
      <Card
        style={{
          width: 350,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          borderRadius: 16,
          textAlign: 'center',
        }}
      >
        <img
          src="/logo192.png"
          alt="لوگو"
          style={{ width: 64, marginBottom: 16 }}
        />
        <Title level={3} style={{ marginBottom: 24, color: '#1e293b' }}>
          ورود به سامانه مهمانسرا
        </Title>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          style={{ textAlign: 'right' }}
        >
          <Form.Item
            name="username"
            label="نام کاربری"
            rules={[{ required: true, message: 'نام کاربری را وارد کنید' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="نام کاربری"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="رمز عبور"
            rules={[{ required: true, message: 'رمز عبور را وارد کنید' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="رمز عبور"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{
                background: 'linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%)',
                border: 'none',
                fontWeight: 'bold',
              }}
            >
              ورود
            </Button>
          </Form.Item>
        </Form>
        <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
          <span>سامانه ورود و خروج مهمانان سازمانی</span>
        </div>
      </Card>
    </div>
  );
}
 
export default Login;