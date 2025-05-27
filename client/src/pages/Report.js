import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import axios from 'axios';
import moment from 'moment-jalaali';
import 'moment/locale/fa';

const statusMap = {
  pending: 'در حال بررسی',
  approved: 'تایید شده',
  rejected: 'رد شده',
  incomplete: 'پرونده ناقص',
};

function Report() {
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
      title: 'وضعیت',
      dataIndex: 'status',
      render: (status) => statusMap[status] || status,
    },
    { title: 'ثبت‌کننده', dataIndex: ['createdBy', 'fullName'], render: (text) => text || '-' },
    // Add more columns as needed
  ];

  return (
    <div>
      <h2>گزارش‌گیری</h2>
      <Table columns={columns} dataSource={data} rowKey="_id" />
    </div>
  );
}

export default Report;