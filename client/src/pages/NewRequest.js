import React, { useState } from 'react';
import { Form, Input, Button, Modal } from 'antd';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import axios from 'axios';

function NewRequest() {
  const [modalOpen, setModalOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [stay, setStay] = useState([]);

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/requests', {
        ...values,
        stayFrom: stay[0]?.toDate?.().toISOString(),
        stayTo: stay[1]?.toDate?.().toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setTrackingCode(res.data.trackingCode);
        setModalOpen(true);
      });
    } catch (err) {
      Modal.error({
        title: 'خطا',
        content: 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.',
      });
    }
  };

  return (
    <>
      <Form
        onFinish={onFinish}
        layout="vertical"
        style={{ maxWidth: 600, margin: '40px auto', direction: 'rtl' }}
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
        <Form.Item label="مدت اقامت" required>
          <DatePicker
            value={stay}
            onChange={setStay}
            calendar={persian}
            locale={persian_fa}
            range
            format="YYYY/MM/DD"
            style={{ width: "100%" }}
            inputClass="ant-input"
            containerClassName="ant-picker"
            placeholder="انتخاب بازه تاریخ"
          />
        </Form.Item>
        <Form.Item label="دلیل سفر" name="reason" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="شماره ویلا" name="villaNo" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            ارسال درخواست
          </Button>
        </Form.Item>
      </Form>
      <Modal
        open={modalOpen}
        onOk={() => { setModalOpen(false); window.location.href = '/dashboard'; }}
        onCancel={() => { setModalOpen(false); window.location.href = '/dashboard'; }}
        footer={null}
        centered
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h2 style={{ color: '#52c41a' }}>درخواست با موفقیت ثبت شد!</h2>
          <p>شماره پیگیری شما:</p>
          <div style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: '#1890ff',
            margin: '16px 0'
          }}>{trackingCode}</div>
          <Button type="primary" onClick={() => { setModalOpen(false); window.location.href = '/dashboard'; }}>
            بازگشت به داشبورد
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default NewRequest;