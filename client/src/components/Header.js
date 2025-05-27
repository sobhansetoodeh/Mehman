import React from 'react';
import { Avatar, Dropdown, Menu, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Text } = Typography;

function Header({ onLogout, userName, role, theme }) {
  // Fallbacks
  const displayName = userName && userName.trim() !== '' ? userName : 'کاربر';
  const displayRole =
    role === 'herasat'
      ? 'حراست'
      : role === 'tashrifat'
      ? 'تشریفات'
      : '---';

  const menu = (
    <Menu
      style={{
        minWidth: 180,
        fontFamily: 'Vazir, Tahoma, Arial, sans-serif',
        direction: 'rtl',
        textAlign: 'right',
      }}
    >
      <Menu.Item key="profile" disabled style={{ cursor: 'default', background: theme === 'dark' ? '#23272f' : '#fff' }}>
        <div>
          <Text strong>{displayName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{displayRole}</Text>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={onLogout} icon={<LogoutOutlined style={{ color: '#f5222d' }} />}>
        خروج
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
        background: theme === 'dark' ? '#23272f' : '#f0f2f5',
        borderBottom: '1px solid #e8e8e8',
        marginBottom: 24,
        color: theme === 'dark' ? '#fff' : '#222',
        fontFamily: 'Vazir, Tahoma, Arial, sans-serif',
        transition: 'background 0.3s, color 0.3s',
        direction: 'rtl'
      }}
    >
      <div>
        <b>سامانه مدیریت مهمانسرا</b>
      </div>
      <Dropdown overlay={menu} placement="bottomLeft" trigger={['click']}>
        <Avatar
          style={{
            backgroundColor: theme === 'dark' ? '#444' : '#1890ff',
            cursor: 'pointer',
            marginLeft: 8,
          }}
          icon={<UserOutlined />}
          size="large"
        />
      </Dropdown>
    </div>
  );
}

export default Header;