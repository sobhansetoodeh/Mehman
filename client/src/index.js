import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider } from 'antd';
import faIR from 'antd/locale/fa_IR';
import 'antd/dist/reset.css'; // For Ant Design v5+
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider direction="rtl" locale={faIR}>
    <App />
  </ConfigProvider>
);