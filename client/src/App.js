import React, { useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import faIR from 'antd/locale/fa_IR';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewRequest from './pages/NewRequest';
import RequestDetails from './pages/RequestDetails';
import Report from './pages/Report';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import 'antd/dist/reset.css'; 
import './index.css';
import UserManagement from './pages/UserManagement';
import UserList from './pages/UserList';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole('');
    setName('');
    window.location.href = '/login';
  };

  const handleThemeChange = (value) => {
    setTheme(value);
    localStorage.setItem('theme', value);
    document.body.setAttribute('data-theme', value);
  };

  if (!token) return <Login setToken={setToken} setRole={setRole} setName={setName} />;

  return (
    <ConfigProvider
      direction="rtl"
      locale={faIR}
      theme={{
        token: {
          fontFamily: 'Vazir, Tahoma, Arial, sans-serif',
        },
        algorithm: theme === 'dark'
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          direction: 'rtl',
          height: '100vh',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <Sidebar theme={theme} onThemeChange={handleThemeChange} role={role} />
          <div style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            background: theme === 'dark' ? '#18181b' : '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Header onLogout={handleLogout} userName={name} role={role} theme={theme} />
            <div style={{
              flex: 1,
              minHeight: 0,
              padding: 24,
              overflow: 'auto'
            }}>
              <Routes>
                <Route path="/users" element={role === 'admin' ? <UserManagement role={role} /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard role={role} />} />
                <Route path="/requests/new" element={<NewRequest />} />
                <Route path="/requests/:id" element={<RequestDetails role={role} />} />
                <Route path="/report" element={<Report />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;