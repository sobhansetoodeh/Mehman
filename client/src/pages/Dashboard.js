import React, { useEffect, useState } from 'react';
import { Table, Button } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import moment from 'moment-jalaali';
import 'moment/locale/fa';

const statusMap = {
  pending: 'در حال بررسی',
  approved: 'تایید شده',
  rejected: 'رد شده',
  incomplete: 'پرونده ناقص',
};

function Dashboard({ role }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    };
    fetchRequests();
  }, []);

  const columns = [
    { title: 'کد پیگیری', dataIndex: 'trackingCode' },
    { title: 'نام مهمان', dataIndex: 'guestName' },
    { title: 'شماره تماس', dataIndex: 'guestPhone' },
    {
      title: 'تاریخ ورود',
      dataIndex: 'stayFrom',
      render: d => d ? moment(d).locale('fa').format('jYYYY/jMM/jDD') : '-'
    },
    {
      title: 'تاریخ خروج',
      dataIndex: 'stayTo',
      render: d => d ? moment(d).locale('fa').format('jYYYY/jMM/jDD') : '-'
    },
    {
      title: 'نوع درخواست',
      render: (text, record) => {
        const fullName = record.lastActionBy?.fullName || '-';

        if (record.status === 'pending' && (!record.updatedAt || record.updatedAt === record.createdAt)) {
          return 'جدید';
        }

        if (record.status === 'pending' && record.updatedAt > record.createdAt) {
          return 'ویرایش شده';
        }

        if (record.status === 'approved') {
          return `تایید شده توسط ${fullName}`;
        }

        if (record.status === 'rejected') {
          return `رد شده توسط ${fullName}`;
        }

        if (record.status === 'incomplete') {
          return `ناقص اعلام شده توسط ${fullName}`;
        }

        return '';
      }
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      render: (status) => statusMap[status] || status,
    },
    { title: 'ثبت‌کننده', dataIndex: ['createdBy', 'fullName'], render: (text) => text || '-' },
    {
      title: 'جزئیات',
      render: (text, record) => (
        <Link to={`/requests/${record.trackingCode}`}>مشاهده</Link>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {role === 'tashrifat' && (
        <Button type="primary" style={{ marginBottom: 16 }}>
          <Link to="/requests/new">ثبت درخواست جدید</Link>
        </Button>
      )}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        rowClassName={record => {
          if (record.status === 'pending' && (!record.updatedAt || record.updatedAt === record.createdAt)) return 'row-new';
          if (record.status === 'pending' && record.updatedAt > record.createdAt) return 'row-updated';
          if (record.status !== 'pending') return 'row-opened';
          return '';
        }}
      />
    </div>
  );
}

export default Dashboard;