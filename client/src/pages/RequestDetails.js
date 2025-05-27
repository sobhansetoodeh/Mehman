import React, { useEffect, useState } from 'react';
import { Descriptions, Button, message, Modal, Input, Form } from 'antd';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import moment from 'moment-jalaali';
import { CheckCircleTwoTone, CloseCircleTwoTone, ExclamationCircleTwoTone, EditOutlined } from '@ant-design/icons';

function RequestDetails({ role }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [note, setNote] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/requests/tracking/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      form.setFieldsValue(res.data);
    };
    fetchData();
  }, [id, form]);

  const handleStatus = async (status) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:5000/api/requests/${data._id}`, {
      status,
      statusNote: status === 'incomplete' ? note : '',
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    message.success('وضعیت به‌روزرسانی شد');
    window.location.reload();
  };

  const handleEdit = async (values) => {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:5000/api/requests/${data._id}`, values, {
      headers: { Authorization: `Bearer ${token}` }
    });
    message.success('درخواست ویرایش و ارسال شد');
    setEditMode(false);
    window.location.reload();
  };

  if (!data) return null;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      {!editMode ? (
        <>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="کد پیگیری">{data.trackingCode}</Descriptions.Item>
            <Descriptions.Item label="نام مهمان">{data.guestName}</Descriptions.Item>
            <Descriptions.Item label="شماره ملی">{data.guestNationalId}</Descriptions.Item>
            <Descriptions.Item label="شماره تماس">{data.guestPhone}</Descriptions.Item>
            <Descriptions.Item label="واحد هماهنگ کننده">{data.coordinatorUnit}</Descriptions.Item>
            <Descriptions.Item label="نام هماهنگ کننده">{data.coordinatorName}</Descriptions.Item>
            <Descriptions.Item label="شماره نامه هماهنگی">{data.coordinationLetterNo}</Descriptions.Item>
            <Descriptions.Item label="مدت اقامت">
              {moment(data.stayFrom).locale('fa').format('jYYYY/jMM/jDD')} تا {moment(data.stayTo).locale('fa').format('jYYYY/jMM/jDD')}
            </Descriptions.Item>
            <Descriptions.Item label="دلیل سفر">{data.reason}</Descriptions.Item>
            <Descriptions.Item label="شماره ویلا">{data.villaNo}</Descriptions.Item>
            <Descriptions.Item label="نام تکمیل کننده فرم">{data.formFillerName}</Descriptions.Item>
            <Descriptions.Item label="ثبت‌کننده">{data.createdBy?.fullName || '-'}</Descriptions.Item>
            <Descriptions.Item label="وضعیت">
              {data.status === 'pending'
                ? 'در حال بررسی'
                : data.status === 'approved'
                ? 'تایید شده'
                : data.status === 'rejected'
                ? 'رد شده'
                : data.status === 'incomplete'
                ? 'پرونده ناقص'
                : data.status}
            </Descriptions.Item>
            {data.statusNote && <Descriptions.Item label="توضیح نقص">{data.statusNote}</Descriptions.Item>}
          </Descriptions>
          {role === 'herasat' && (
            <div style={{
              marginTop: 24,
              display: 'flex',
              justifyContent: 'center',
              gap: 16
            }}>
              <Button
                type="primary"
                icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handleStatus('approved')}
              >
                تایید
              </Button>
              <Button
                danger
                icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />}
                style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
                onClick={() => handleStatus('rejected')}
              >
                عدم تایید
              </Button>
              <Button
                icon={<ExclamationCircleTwoTone twoToneColor="#faad14" />}
                style={{ background: '#faad14', borderColor: '#faad14', color: '#fff' }}
                onClick={() => setModalOpen(true)}
              >
                ناقص
              </Button>
              <Modal
                title="توضیح نقص پرونده"
                open={modalOpen}
                onOk={() => { handleStatus('incomplete'); setModalOpen(false); }}
                onCancel={() => setModalOpen(false)}
              >
                <Input.TextArea value={note} onChange={e => setNote(e.target.value)} rows={4} />
              </Modal>
            </div>
          )}
          {role === 'tashrifat' && data.status === 'incomplete' && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditMode(true)}
              style={{ marginTop: 24 }}
            >
              ویرایش و ارسال مجدد
            </Button>
          )}
        </>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={data}
          onFinish={handleEdit}
        >
          <Form.Item label="نام مهمان" name="guestName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="شماره ملی" name="guestNationalId" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="شماره تماس مهمان" name="guestPhone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="واحد هماهنگ کننده" name="coordinatorUnit" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="نام هماهنگ کننده" name="coordinatorName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="شماره نامه هماهنگی" name="coordinationLetterNo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="دلیل سفر" name="reason" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="شماره ویلا" name="villaNo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="نام تکمیل کننده فرم" name="formFillerName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              ارسال مجدد
            </Button>
            <Button style={{ marginRight: 8 }} onClick={() => setEditMode(false)}>
              انصراف
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
}

export default RequestDetails;