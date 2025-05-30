import React from 'react';
import { Avatar, Dropdown, Menu, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Text } = Typography;

function Header({ onLogout, userName, role }) {
  // رنگ navy و سفید
  const navy = '#1a237e';
  const white = '#fff';

  // Fallbacks
  const displayName = userName && userName.trim() !== '' ? userName : 'کاربر';
  const displayRole =
      role === 'herasat'
      ? 'حراست'
      : role === 'tashrifat'
      ? 'تشریفات'
      : role === 'admin'
      ? 'مدیر سیستم'
      : '---';

  const menu = (
    <Menu
      style={{
        minWidth: 180,
        fontFamily: 'Vazir, Tahoma, Arial, sans-serif',
        direction: 'rtl',
        textAlign: 'right',
        background: navy,
        color: white,
        border: 'none'
      }}
    >
      <Menu.Item key="profile" disabled style={{ cursor: 'default', background: navy, color: white }}>
        <div>
          <Text strong style={{ color: white }}>{displayName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12, color: '#b0bec5' }}>{displayRole}</Text>
        </div>
      </Menu.Item>
      <Menu.Divider style={{ background: '#3949ab' }} />
      <Menu.Item key="logout" onClick={onLogout} icon={<LogoutOutlined style={{ color: '#f5222d' }} />}>
        <span style={{ color: white }}>خروج</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: navy,
        borderBottom: '1px solid #0d1333',
        marginBottom: 24,
        color: white,
        fontFamily: 'Vazir, Tahoma, Arial, sans-serif',
        transition: 'background 0.3s, color 0.3s',
        direction: 'rtl'
      }}
    >
      <div>
        <b>سازمان منطقه آزاد چابهار - سامانه مدیریت مهمانسرای ۶۳ واحدی</b>
      </div>
      <Dropdown overlay={menu} placement="bottomLeft" trigger={['click']}>
        <Avatar
          style={{
            backgroundColor: '#3949ab',
            cursor: 'pointer',
            marginLeft: 8,
            color: white
          }}
          icon={<UserOutlined />}
          size="large"
        />
      </Dropdown>
    </div>
  );
}

export default Header;