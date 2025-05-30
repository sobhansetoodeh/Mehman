import React, { useEffect, useState } from 'react';
import { Menu, Badge } from 'antd';
import { HomeOutlined, FileTextOutlined, BarChartOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function Sidebar({ role }) {
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

  // تعیین آیتم انتخاب شده
  let selectedKey = 'dashboard';
  if (location.pathname.startsWith('/requests/new')) selectedKey = 'new';
  else if (location.pathname.startsWith('/report')) selectedKey = 'report';
  else if (location.pathname.startsWith('/users')) selectedKey = 'users';

  // رنگ navy اداری
  const navy = '#1a237e';

  // نقش را تمیز کن
  const cleanRole = role ? role.trim().toLowerCase() : '';

  // آیتم‌های منو
  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined style={{ color: '#fff' }} />,
      label: (
        <Link to="/dashboard" style={{ color: '#fff' }}>
          داشبورد
          {newCount > 0 && (
            <Badge count={newCount} style={{ marginRight: 8, backgroundColor: '#fff', color: navy }} />
          )}
        </Link>
      ),
    },
    // فقط برای tashrifat و ادمین
    ...(['tashrifat', 'admin'].includes(cleanRole)
      ? [{
          key: 'new',
          icon: <FileTextOutlined style={{ color: '#fff' }} />,
          label: <Link to="/requests/new" style={{ color: '#fff' }}>ثبت درخواست</Link>,
        }]
      : []),
    {
      key: 'report',
      icon: <BarChartOutlined style={{ color: '#fff' }} />,
      label: <Link to="/report" style={{ color: '#fff' }}>گزارش‌گیری</Link>,
    },
    // فقط برای ادمین
    ...(cleanRole === 'admin'
      ? [{
          key: 'users',
          icon: <UserOutlined style={{ color: '#fff' }} />,
          label: <Link to="/users" style={{ color: '#fff' }}>مدیریت کاربران</Link>,
        }]
      : []),
  ];

  return (
    <div style={{
      width: 200,
      height: '100vh',
      background: navy,
      borderLeft: '1px solid #0d1333',
      boxShadow: '0 0 8px #0d1333',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Menu
          mode="inline"
          defaultSelectedKeys={[selectedKey]}
          selectedKeys={[selectedKey]}
          style={{
            borderLeft: 0,
            borderRight: 0,
            background: navy,
            color: '#fff',
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            fontWeight: 500,
            fontSize: 15,
          }}
          items={menuItems}
          theme="dark"
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 0',
        textAlign: 'center',
        borderTop: '1px solid #0d1333',
        background: navy,
        color: '#fff',
        fontSize: 12,
        flexShrink: 0
      }}>
        <div style={{ marginTop: 8 }}>
          {'دفتر مرکزی حراست - ستوده'}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;