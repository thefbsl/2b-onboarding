import { useEffect, useState } from 'react'
import { Card, Table, Tag, Typography, message } from 'antd'
import api, { attachRole } from '../api'

const { Title, Text } = Typography

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const response = await api.get('/candidates', {
        params: { role: 'admin' },
        ...attachRole('admin'),
      })
      setCandidates(response.data)
    } catch (error) {
      message.error('Failed to load admin overview.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const columns = [
    { title: 'Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Accepted' ? 'green' : status === 'Rejected' ? 'red' : 'blue'}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'HR',
      dataIndex: ['hrApproval', 'approved'],
      key: 'hrApproved',
      render: (value) => (value ? <Tag color="green">Approved</Tag> : <Tag>Pending</Tag>),
    },
    {
      title: 'IT',
      dataIndex: ['itApproval', 'accessCreated'],
      key: 'itApproved',
      render: (value) => (value ? <Tag color="green">Approved</Tag> : <Tag>Pending</Tag>),
    },
    {
      title: 'Finance',
      dataIndex: ['financeApproval', 'docsVerified'],
      key: 'financeApproved',
      render: (value) => (value ? <Tag color="green">Approved</Tag> : <Tag>Pending</Tag>),
    },
    {
      title: 'Corporate Email',
      dataIndex: ['itApproval', 'corporateEmail'],
      key: 'corporateEmail',
      render: (value) => value || '—',
    },
    {
      title: 'Bank',
      key: 'bankDetails',
      render: (_, record) =>
        `${record.bankDetails?.bankName || ''} ${record.bankDetails?.iban || ''}`.trim() || '—',
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <Title level={3}>Admin Overview</Title>
        <Text type="secondary">Full visibility across all candidate stages.</Text>
      </div>
      <Card>
        <Table rowKey="_id" columns={columns} dataSource={candidates} loading={loading} />
      </Card>
    </div>
  )
}

export default AdminDashboard
