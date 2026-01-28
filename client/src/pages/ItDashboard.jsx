import { useEffect, useState } from 'react'
import { Button, Card, Input, Modal, Space, Table, Tag, Typography, message } from 'antd'
import api, { attachRole } from '../api'

const { Title, Text } = Typography

const ItDashboard = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalState, setModalState] = useState({ open: false, candidateId: null })
  const [corporateEmail, setCorporateEmail] = useState('')

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const response = await api.get('/candidates', {
        params: { role: 'it' },
        ...attachRole('it'),
      })
      setCandidates(response.data)
    } catch (error) {
      message.error('Failed to load IT review queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handleApprove = async () => {
    if (!corporateEmail) {
      message.error('Corporate email is required.')
      return
    }
    try {
      await api.patch(
        `/candidates/${modalState.candidateId}/approve`,
        { itApproval: { accessCreated: true, corporateEmail } },
        attachRole('it')
      )
      message.success('IT approval saved.')
      setModalState({ open: false, candidateId: null })
      setCorporateEmail('')
      fetchCandidates()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Approval failed.')
    }
  }

  const columns = [
    { title: 'Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Accepted' ? 'green' : 'blue'}>{status.replace('_', ' ')}</Tag>
      ),
    },
    {
      title: 'Documents',
      dataIndex: 'documents',
      key: 'documents',
      render: (docs = []) => <Text>{docs.join(', ') || '—'}</Text>,
    },
    {
      title: 'IT Approved',
      dataIndex: ['itApproval', 'accessCreated'],
      key: 'itApproved',
      render: (value) => (value ? <Tag color="green">Yes</Tag> : <Tag>Pending</Tag>),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => setModalState({ open: true, candidateId: record._id })}
          disabled={record.itApproval?.accessCreated}
        >
          Issue Corporate Email
        </Button>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <Title level={3}>IT Dashboard</Title>
        <Text type="secondary">Provide corporate credentials after HR approval.</Text>
      </div>
      <Card>
        <Table rowKey="_id" columns={columns} dataSource={candidates} loading={loading} />
      </Card>
      <Modal
        title="Issue Corporate Email"
        open={modalState.open}
        onOk={handleApprove}
        onCancel={() => {
          setModalState({ open: false, candidateId: null })
          setCorporateEmail('')
        }}
        okText="Approve"
      >
        <Space direction="vertical" className="w-100">
          <Text>Enter the corporate email to issue:</Text>
          <Input
            value={corporateEmail}
            placeholder="jane.doe@company.com"
            onChange={(event) => setCorporateEmail(event.target.value)}
          />
        </Space>
      </Modal>
    </div>
  )
}

export default ItDashboard
