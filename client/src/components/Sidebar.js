import React, { useEffect, useState } from 'react';
import { Menu, Badge } from 'antd';
import { HomeOutlined, FileTextOutlined, BarChartOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function Sidebar({ theme, onThemeChange }) {
  const location = useLocation();
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/requests/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewCount(res.data.count);
    };
    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, []);

  let selectedKey = 'dashboard';
  if (location.pathname.startsWith('/requests/new')) selectedKey = 'new';
  if (location.pathname.startsWith('/report')) selectedKey = 'report';

  return (
    <div style={{
      width: 200,
      minHeight: '100vh',
      background: theme === 'dark' ? '#18181b' : '#fff',
      borderLeft: '1px solid #eee',
      boxShadow: '0 0 8px #eee',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={[selectedKey]}
        selectedKeys={[selectedKey]}
        style={{
          borderLeft: 0,
          borderRight: 0,
          background: theme === 'dark' ? '#18181b' : '#fff',
          color: theme === 'dark' ? '#fff' : '#000'
        }}
        items={[
          {
            key: 'dashboard',
            icon: <HomeOutlined />,
            label: (
              <Link to="/dashboard">
                داشبورد
                {newCount > 0 && (
                  <Badge count={newCount} style={{ marginRight: 8, backgroundColor: '#52c41a' }} />
                )}
              </Link>
            ),
          },
          {
            key: 'new',
            icon: <FileTextOutlined />,
            label: <Link to="/requests/new">ثبت درخواست</Link>,
          },
          {
            key: 'report',
            icon: <BarChartOutlined />,
            label: <Link to="/report">گزارش‌گیری</Link>,
          },
        ]}
        theme={theme}
      />
    </div>
  );
}

export default Sidebar;