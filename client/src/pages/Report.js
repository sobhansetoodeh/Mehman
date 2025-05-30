import React, { useEffect, useState } from 'react';
import { Table, Form, Input, Button, Select, Row, Col, Space, Tag, message } from 'antd';
import axios from 'axios';
import moment from 'moment-jalaali';
import { SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const { Option } = Select;

const statusMap = {
  pending: { text: 'در حال بررسی', color: 'gold' },
  approved: { text: 'تایید شده', color: 'green' },
  rejected: { text: 'رد شده', color: 'red' },
  incomplete: { text: 'پرونده ناقص', color: 'orange' },
};

function Report() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stayRange, setStayRange] = useState([]);
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dateSearchType, setDateSearchType] = useState("stayRange"); // stayRange | stayFrom | stayTo

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setData(res.data);
    setFiltered(res.data);
    setLoading(false);
  };

  const onSearch = (values) => {
    let filteredData = [...data];

    if (values.trackingCode)
      filteredData = filteredData.filter(r => r.trackingCode?.includes(values.trackingCode));
    if (values.guestName)
      filteredData = filteredData.filter(r => r.guestName?.includes(values.guestName));
    if (values.guestNationalId)
      filteredData = filteredData.filter(r => r.guestNationalId?.includes(values.guestNationalId));
    if (values.guestPhone)
      filteredData = filteredData.filter(r => r.guestPhone?.includes(values.guestPhone));
    if (values.status)
      filteredData = filteredData.filter(r => r.status === values.status);

    // منطق جدید جستجو بر اساس نوع انتخاب شده
    if (stayRange && stayRange.length > 0) {
      if (dateSearchType === "stayRange" && stayRange.length === 2) {
        // هر کسی که هر بخشی از اقامتش در این بازه باشه
        const [from, to] = stayRange;
        filteredData = filteredData.filter(r => {
          const stayFrom = moment(r.stayFrom);
          const stayTo = moment(r.stayTo);
          // اگر بازه اقامت با بازه انتخابی تداخل داشته باشد
          return (
            stayFrom.isSameOrBefore(to.toDate(), 'day') &&
            stayTo.isSameOrAfter(from.toDate(), 'day')
          );
        });
      } else if (dateSearchType === "stayFrom" && stayRange.length === 1) {
        // فقط کسانی که تاریخ ورودشان برابر با تاریخ انتخابی است
        const selected = stayRange[0];
        filteredData = filteredData.filter(r => {
          const stayFrom = moment(r.stayFrom);
          return stayFrom.isSame(selected.toDate(), 'day');
        });
      } else if (dateSearchType === "stayTo" && stayRange.length === 1) {
        // فقط کسانی که تاریخ خروجشان برابر با تاریخ انتخابی است
        const selected = stayRange[0];
        filteredData = filteredData.filter(r => {
          const stayTo = moment(r.stayTo);
          return stayTo.isSame(selected.toDate(), 'day');
        });
      }
    }

    setFiltered(filteredData);
  };

  const onReset = () => {
    form.resetFields();
    setStayRange([]);
    setDateSearchType("stayRange");
    setFiltered(data);
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  // Export selected rows as Excel (RTL, Vazir font)
  const exportSelected = () => {
    if (!selectedRows.length) {
      message.warning('هیچ ردیفی انتخاب نشده است.');
      return;
    }

    // Prepare data for Excel
    const headers = [
      'کد پیگیری', 'نام مهمان', 'کد ملی', 'شماره تماس', 'تاریخ ورود', 'تاریخ خروج', 'وضعیت', 'ثبت‌کننده', 'تاریخ ثبت', 'آخرین تغییر'
    ];
    const rows = selectedRows.map(record => [
      record.trackingCode,
      record.guestName,
      record.guestNationalId,
      record.guestPhone,
      record.stayFrom ? moment(record.stayFrom).locale('fa').format('jYYYY/jMM/jDD') : '-',
      record.stayTo ? moment(record.stayTo).locale('fa').format('jYYYY/jMM/jDD') : '-',
      statusMap[record.status]?.text || record.status,
      record.createdBy?.fullName || '-',
      record.createdAt ? moment(record.createdAt).locale('fa').format('jYYYY/jMM/jDD HH:mm') : '-',
      record.updatedAt ? moment(record.updatedAt).locale('fa').format('jYYYY/jMM/jDD HH:mm') : '-'
    ]);

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set RTL and font (Vazir) for all cells
    Object.keys(ws).forEach(cell => {
      if (cell[0] === '!') return;
      ws[cell].s = {
        alignment: { horizontal: "right", vertical: "center", readingOrder: 2 },
        font: { name: "Vazir", sz: 12 }
      };
    });

    // Set column widths
    ws['!cols'] = headers.map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "گزارش");

    // Add workbook styles (RTL)
    wb.Workbook = {
      Views: [{ RTL: true }]
    };

    // Write and save
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "گزارش.xlsx");
  };

  const columns = [
    { title: 'کد پیگیری', dataIndex: 'trackingCode' },
    { title: 'نام مهمان', dataIndex: 'guestName' },
    { title: 'کد ملی', dataIndex: 'guestNationalId' },
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
      render: (status) => {
        const s = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    { title: 'ثبت‌کننده', dataIndex: ['createdBy', 'fullName'], render: (text) => text || '-' },
    {
      title: 'تاریخ ثبت',
      dataIndex: 'createdAt',
      render: d => d ? moment(d).locale('fa').format('jYYYY/jMM/jDD HH:mm') : '-'
    },
    {
      title: 'آخرین تغییر',
      dataIndex: 'updatedAt',
      render: d => d ? moment(d).locale('fa').format('jYYYY/jMM/jDD HH:mm') : '-'
    },
    {
      title: 'جزئیات',
      render: (text, record) => (
        <Link to={`/requests/${record.trackingCode}`}>مشاهده</Link>
      ),
    },
  ];

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedRows(selectedRows);
    },
    selections: true,
  };

  return (
    <div style={{
      padding: 16,
      minHeight: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSearch}
        style={{ marginBottom: 8 }}
      >
        <Row gutter={[8, 8]} wrap>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="trackingCode" label="کد پیگیری" style={{ marginBottom: 8 }}>
              <Input allowClear size="small" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="guestName" label="نام مهمان" style={{ marginBottom: 8 }}>
              <Input allowClear size="small" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="guestNationalId" label="کد ملی" style={{ marginBottom: 8 }}>
              <Input allowClear size="small" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="guestPhone" label="شماره تماس" style={{ marginBottom: 8 }}>
              <Input allowClear size="small" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="status" label="وضعیت" style={{ marginBottom: 8 }}>
              <Select allowClear size="small">
                <Option value="pending">در حال بررسی</Option>
                <Option value="approved">تایید شده</Option>
                <Option value="rejected">رد شده</Option>
                <Option value="incomplete">پرونده ناقص</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={4}>
            <Form.Item label="نوع جستجو تاریخ" style={{ marginBottom: 8 }}>
              <Select
                value={dateSearchType}
                onChange={setDateSearchType}
                size="small"
                style={{ width: "100%" }}
              >
                <Option value="stayRange">بازه اقامت</Option>
                <Option value="stayFrom">تاریخ ورود</Option>
                <Option value="stayTo">تاریخ خروج</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Form.Item label={
              dateSearchType === "stayRange"
                ? "بازه اقامت"
                : dateSearchType === "stayFrom"
                ? "تاریخ ورود"
                : "تاریخ خروج"
            } style={{ marginBottom: 8 }}>
              <DatePicker
                value={stayRange}
                onChange={setStayRange}
                calendar={persian}
                locale={persian_fa}
                range={dateSearchType === "stayRange"}
                format="YYYY/MM/DD"
                style={{ width: "100%" }}
                inputClass="ant-input ant-input-sm"
                containerClassName="ant-picker"
                placeholder={
                  dateSearchType === "stayRange"
                    ? "انتخاب بازه اقامت"
                    : "انتخاب تاریخ"
                }
                editable={false}
                portal
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={4} style={{ display: 'flex', alignItems: 'end' }}>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="small">
                جستجو
              </Button>
              <Button onClick={onReset} icon={<ReloadOutlined />} size="small">
                ریست
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
      <div style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={exportSelected}
          disabled={selectedRowKeys.length === 0}
        >
          گرفتن خروجی از انتخاب شده ها
        </Button>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filtered}
        rowKey="_id"
        loading={loading}
        bordered
        size="middle"
        sticky
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} از ${total} مورد`,
          onShowSizeChange: (current, size) => setPageSize(size),
        }}
        scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
        style={{
          borderRadius: 12,
          width: '100%',
          background: 'transparent'
        }}
      />
    </div>
  );
}

export default Report;