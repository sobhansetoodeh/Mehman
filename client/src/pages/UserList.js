import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Popconfirm, message, Space, Tag } from 'antd';
import axios from 'axios';

const { Option } = Select;

const roleMap = {
  admin: { text: 'ادمین', color: 'magenta' },
  herasat: { text: 'حراست', color: 'blue' },
  tashrifat: { text: 'تشریفات', color: 'green' },
};

function UserList({ role }) {
  const [users, setUsers] = useState([]);
  const [editingRows, setEditingRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (role !== 'admin') return;
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setEditingRows({});
      setChanged(false);
    } catch (err) {
      message.error('خطا در دریافت کاربران');
    }
    setLoading(false);
  };

  // ویرایش سلول
  const handleEdit = (id, field, value) => {
    setEditingRows(prev => {
      const updated = { ...prev, [id]: { ...prev[id], [field]: value } };
      setChanged(true);
      return updated;
    });
  };

  // حذف کاربر
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('کاربر حذف شد');
      fetchUsers();
    } catch (err) {
      message.error('خطا در حذف کاربر');
    }
  };

  // ثبت تغییرات
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    let hasError = false;
    for (const id in editingRows) {
      try {
        await axios.put(`http://localhost:5000/api/users/${id}`, editingRows[id], {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        hasError = true;
      }
    }
    if (hasError) {
      message.error('برخی تغییرات ذخیره نشد');
    } else {
      message.success('تغییرات با موفقیت ثبت شد');
    }
    fetchUsers();
  };

  const columns = [
    { title: 'نام کاربری', dataIndex: 'username', key: 'username' },
    {
      title: 'نقش',
      dataIndex: 'role',
      key: 'role',
      render: (text, record) =>
        record._id in editingRows ? (
          <Select
            value={editingRows[record._id]?.role ?? record.role}
            onChange={val => handleEdit(record._id, 'role', val)}
            style={{ width: 100 }}
          >
            <Option value="admin">ادمین</Option>
            <Option value="herasat">حراست</Option>
            <Option value="tashrifat">تشریفات</Option>
          </Select>
        ) : (
          <Tag color={roleMap[record.role]?.color}>{roleMap[record.role]?.text || record.role}</Tag>
        )
    },
    {
      title: 'نام و نام خانوادگی',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) =>
        record._id in editingRows ? (
          <Input
            value={editingRows[record._id]?.fullName ?? record.fullName}
            onChange={e => handleEdit(record._id, 'fullName', e.target.value)}
          />
        ) : (
          text
        )
    },
    {
      title: 'شماره ملی',
      dataIndex: 'nationalId',
      key: 'nationalId',
      render: (text, record) =>
        record._id in editingRows ? (
          <Input
            value={editingRows[record._id]?.nationalId ?? record.nationalId}
            onChange={e => handleEdit(record._id, 'nationalId', e.target.value)}
          />
        ) : (
          text
        )
    },
    {
      title: 'سمت',
      dataIndex: 'position',
      key: 'position',
      render: (text, record) =>
        record._id in editingRows ? (
          <Input
            value={editingRows[record._id]?.position ?? record.position}
            onChange={e => handleEdit(record._id, 'position', e.target.value)}
          />
        ) : (
          text
        )
    },
    {
      title: 'کد پرسنلی',
      dataIndex: 'personnelCode',
      key: 'personnelCode',
      render: (text, record) =>
        record._id in editingRows ? (
          <Input
            value={editingRows[record._id]?.personnelCode ?? record.personnelCode}
            onChange={e => handleEdit(record._id, 'personnelCode', e.target.value)}
          />
        ) : (
          text
        )
    },
    {
      title: 'شماره تماس',
      dataIndex: 'phone',
      key: 'phone',
      render: (text, record) =>
        record._id in editingRows ? (
          <Input
            value={editingRows[record._id]?.phone ?? record.phone}
            onChange={e => handleEdit(record._id, 'phone', e.target.value)}
          />
        ) : (
          text
        )
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (text, record) => (
        <Space>
          {record._id in editingRows ? (
            <Button
              size="small"
              onClick={() => {
                // لغو ویرایش
                setEditingRows(prev => {
                  const updated = { ...prev };
                  delete updated[record._id];
                  if (Object.keys(updated).length === 0) setChanged(false);
                  return updated;
                });
              }}
            >
              لغو
            </Button>
          ) : (
            <Button
              size="small"
              onClick={() => setEditingRows(prev => ({ ...prev, [record._id]: {} }))}
            >
              ویرایش
            </Button>
          )}
          <Popconfirm
            title="آیا مطمئن هستید؟"
            onConfirm={() => handleDelete(record._id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button danger size="small">حذف</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (role !== 'admin') {
    return <div style={{ textAlign: 'center', marginTop: 48, color: '#888' }}>دسترسی غیرمجاز</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={false}
        style={{ borderRadius: 12, background: '#fff' }}
      />
      {changed && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" onClick={handleSave}>
            ثبت تغییرات
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserList;