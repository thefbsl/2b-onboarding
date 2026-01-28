import { useEffect, useState } from 'react'
import { Card, Checkbox, Space, Table, Tag, Typography, message } from 'antd'
import api, { attachRole } from '../api'

const { Title, Text } = Typography

const FinanceDashboard = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const response = await api.get('/candidates', {
        params: { role: 'finance' },
        ...attachRole('finance'),
      })
      setCandidates(response.data)
    } catch (error) {
      message.error('Failed to load Finance review queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handleApprove = async (candidateId) => {
    try {
      await api.patch(
        `/candidates/${candidateId}/approve`,
        { financeApproval: { docsVerified: true } },
        attachRole('finance')
      )
      message.success('Finance approval saved.')
      fetchCandidates()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Approval failed.')
    }
  }

  const columns = [
    { title: 'Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Bank Details',
      key: 'bankDetails',
      render: (_, record) => (
        <Space direction="vertical">
          <Text>{record.bankDetails?.bankName || '—'}</Text>
          <Text type="secondary">{record.bankDetails?.iban || ''}</Text>
          <Text type="secondary">{record.bankDetails?.bic || ''}</Text>
        </Space>
      ),
    },
    {
      title: 'Finance Approved',
      dataIndex: ['financeApproval', 'docsVerified'],
      key: 'financeApproved',
      render: (value) => (value ? <Tag color="green">Yes</Tag> : <Tag>Pending</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Checkbox
          checked={record.financeApproval?.docsVerified}
          disabled={record.financeApproval?.docsVerified}
          onChange={(event) => {
            if (event.target.checked) {
              handleApprove(record._id)
            }
          }}
        >
          Docs Verified
        </Checkbox>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <Title level={3}>Finance Dashboard</Title>
        <Text type="secondary">Verify bank details and tax documents.</Text>
      </div>
      <Card>
        <Table rowKey="_id" columns={columns} dataSource={candidates} loading={loading} />
      </Card>
    </div>
  )
}

export default FinanceDashboard
