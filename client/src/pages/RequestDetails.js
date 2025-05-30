import React, { useEffect, useState } from 'react';
import { Button, message, Modal, Input, Form, ConfigProvider } from 'antd';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import moment from 'moment-jalaali';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from '../assets/sazman.png';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  ExclamationCircleTwoTone,
  EditOutlined
} from '@ant-design/icons';

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

function toPersianDigits(str) {
  return String(str).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

const getRequestStatusText = (data) => {
  const fullName = data.approvedBy?.fullName || data.lastActionBy?.fullName || '-';

  if (data.status === 'pending' && (!data.updatedAt || data.updatedAt === data.createdAt)) {
    return 'جدید';
  }
  if (data.status === 'pending' && data.updatedAt > data.createdAt) {
    return 'ویرایش شده';
  }
  if (data.status === 'approved') {
    return `تایید شده توسط ${fullName}`;
  }
  if (data.status === 'rejected') {
    return `رد شده توسط ${fullName}`;
  }
  if (data.status === 'incomplete') {
    return `ناقص اعلام شده توسط ${fullName}`;
  }
  return '';
};

function RequestDetails({ role }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [note, setNote] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [stay, setStay] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/requests/tracking/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      form.setFieldsValue(res.data);

      // مقداردهی اولیه بازه تاریخ
      if (res.data.stayFrom && res.data.stayTo) {
        setStay([
          new Date(res.data.stayFrom),
          new Date(res.data.stayTo)
        ]);
      }
    };
    fetchData();
  }, [id, form]);

  const handleStatus = async (status) => {
    const token = localStorage.getItem('token');
    await axios.put(
      `http://localhost:5000/api/requests/${data._id}`,
      {
        status,
        statusNote: status === 'incomplete' ? note : '',
        lastActionBy: {
          fullName: localStorage.getItem('fullName'),
          role: role,
          userId: localStorage.getItem('userId')
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    message.success('وضعیت به‌روزرسانی شد');
    window.location.reload();
  };

  const handleEdit = async (values) => {
    const token = localStorage.getItem('token');
    await axios.put(
      `http://localhost:5000/api/requests/${data._id}`,
      {
        ...values,
        stayFrom: stay[0]?.toDate?.().toISOString(),
        stayTo: stay[1]?.toDate?.().toISOString(),
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    message.success('درخواست ویرایش و ارسال شد');
    setEditMode(false);
    window.location.reload();
  };

  const exportToPDF = async () => {
    const input = document.getElementById('letter-content');
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 3 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);

    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let y = 0;
    if (pdfHeight < pageHeight) {
      y = (pageHeight - pdfHeight) / 2;
    }

    pdf.addImage(imgData, 'PNG', 0, y, pdfWidth, pdfHeight);
    pdf.save(`نامه-${data ? toPersianDigits(data.trackingCode) : ''}.pdf`);
  };

  if (!data) return null;

  const detailedStatusText = getRequestStatusText(data);

  return (
    <ConfigProvider direction="rtl">
      <div style={{ maxWidth: 700, margin: '40px auto' }}>
        <Button type="primary" style={{ marginBottom: 24 }} onClick={exportToPDF}>
          دریافت نامه
        </Button>

        {/* نامه اداری */}
        <div
          id="letter-content"
          style={{
            background: "#fff",
            padding: 32,
            borderRadius: 12,
            color: "#222",
            direction: "rtl",
            textAlign: "justify",
            fontFamily: "Vazir, Tahoma, Arial, sans-serif",
            minHeight: 600,
            width: 520,
            maxWidth: '100%',
            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
            margin: '0 auto',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
            position: 'relative'
          }}>
            <div style={{ flex: '0 0 80px', textAlign: 'left' }}>
              <img src={logo} alt="logo" style={{ width: 80 }} />
            </div>

            <div style={{ flex: 1, textAlign: 'center', alignSelf: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 'bold' }}>سازمان منطقه آزاد چابهار</div>
              <div style={{ fontSize: 16, marginTop: 4 }}>اداره تشریفات</div>

              {data.status && (
                <div style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  marginTop: 8,
                  color:
                    data.status === 'approved' ? '#388e3c' :
                      data.status === 'rejected' ? '#d32f2f' :
                        data.status === 'incomplete' ? '#fbc02d' :
                          '#333'
                }}>
                  وضعیت: {detailedStatusText}
                </div>
              )}
            </div>

            <div style={{ width: 80 }} />
          </div>

          <div style={{ fontSize: 16, lineHeight: 2 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
              به: دفتر مرکزی حراست - معاون محترم حفاظت فیزیکی
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: 16 }}>
              موضوع: درخواست ورود مهمان
            </div>
            <div style={{ marginBottom: 16 }}>
              احتراما، به استحضار می‌رساند مهمان محترم آقای/خانم <b>{data.guestName}</b> با شماره ملی <b>{toPersianDigits(data.guestNationalId)}</b> و شماره تماس <b>{toPersianDigits(data.guestPhone)}</b>، به دعوت واحد <b>{data.coordinatorUnit}</b> (به درخواست <b>{data.coordinatorName}</b>) و با شماره نامه هماهنگی <b>{toPersianDigits(data.coordinationLetterNo)}</b>، از تاریخ <b>{data.stayFrom ? toPersianDigits(moment(data.stayFrom).locale('fa').format('jYYYY/jMM/jDD')) : '-'}</b> تا تاریخ <b>{data.stayTo ? toPersianDigits(moment(data.stayTo).locale('fa').format('jYYYY/jMM/jDD')) : '-'}</b> به منظور <b>{data.reason}</b> در ویلای شماره <b>{toPersianDigits(data.villaNo)}</b> اقامت خواهد داشت.
            </div>
            <div style={{ marginBottom: 16 }}>
              خواهشمند است دستور فرمایید هماهنگی لازم جهت ورود ایشان به مجموعه صورت پذیرد.
            </div>
            <div style={{ marginBottom: 32 }}>
              با تشکر
              <br />
              ثبت‌کننده: <b>{data.createdBy?.fullName || '-'}</b>
              {data.statusNote && data.statusNote.trim() !== "" && (
                <>
                  <br />
                  توضیح نقص: <b>{data.statusNote}</b>
                </>
              )}
              <br />
              کد پیگیری: <b>{toPersianDigits(data.trackingCode)}</b>
            </div>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <div style={{ fontWeight: 'bold' }}>علی کیخا</div>
              <div>رئیس اداره تشریفات سازمان</div>
            </div>
            <div style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: 8 }}>
              آدرس: چابهار، میدان امام خمینی (ره) ساختمان شهید جمهور | تلفن: ۰۵۴۳۵۳۱۲۲۲۷
            </div>
          </div>
        </div>

        {/* دکمه‌های پایین نامه */}
        {!editMode && (
          <>
            {/* فقط برای کاربر حراست و وقتی درخواست در حال بررسی است */}
            {(role === 'herasat' || role === 'admin') && data.status === 'pending' && (
              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 16
                }}
              >
                <Button
                  type="primary"
                  icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                  onClick={() => handleStatus('approved')}
                >
                  تایید
                </Button>
                <Button
                  danger
                  icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />}
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
              </div>
            )}

            {/* فقط برای کاربر تشریفات و فقط وقتی درخواست ناقص شده */}
            {(role === 'tashrifat' || role === 'admin') && data.status === 'incomplete' && (
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
        )}

        {/* فرم ویرایش فقط برای تشریفات و فقط وقتی دکمه ویرایش زده میشه */}
        {editMode && (role === 'tashrifat' || role === 'admin') && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEdit}
            style={{ marginTop: 24 }}
          >
            <Form.Item
              label="نام مهمان"
              name="guestName"
              rules={[{ required: true, message: 'لطفا نام مهمان را وارد کنید' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="شماره ملی مهمان"
              name="guestNationalId"
              rules={[{ required: true, message: 'لطفا شماره ملی مهمان را وارد کنید' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="شماره تماس مهمان"
              name="guestPhone"
              rules={[{ required: true, message: 'لطفا شماره تماس مهمان را وارد کنید' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="واحد هماهنگ‌کننده"
              name="coordinatorUnit"
              rules={[{ required: true, message: 'لطفا واحد هماهنگ‌کننده را وارد کنید' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="نام هماهنگ‌کننده"
              name="coordinatorName"
              rules={[{ required: true, message: 'لطفا نام هماهنگ‌کننده را وارد کنید' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="شماره نامه هماهنگی"
              name="coordinationLetterNo"
              rules={[{ required: true, message: 'لطفا شماره نامه هماهنگی را وارد کنید' }]}
            >
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
            <Form.Item
              label="دلیل اقامت"
              name="reason"
              rules={[{ required: true, message: 'لطفا دلیل اقامت را وارد کنید' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="شماره ویلا"
              name="villaNo"
              rules={[{ required: true, message: 'لطفا شماره ویلا را وارد کنید' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                ارسال ویرایش
              </Button>
              <Button onClick={() => setEditMode(false)}>لغو</Button>
            </Form.Item>
          </Form>
        )}

        {/* Modal علت نقص فقط برای حراست */}
        <Modal
          title="علت نقص فرم"
          open={modalOpen}
          onOk={() => {
            if (note.trim() === '') {
              message.error('لطفا علت نقص را وارد کنید');
              return;
            }
            handleStatus('incomplete');
            setModalOpen(false);
            setNote('');
          }}
          onCancel={() => setModalOpen(false)}
          okText="ثبت"
          cancelText="انصراف"
        >
          <Input.TextArea
            rows={4}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="علت نقص فرم را وارد کنید"
          />
        </Modal>
      </div>
    </ConfigProvider>
  );
}

export default RequestDetails;