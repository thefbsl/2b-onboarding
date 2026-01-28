import { useEffect, useState } from 'react'
import { Button, Card, Input, Modal, Space, Table, Tag, Typography, message } from 'antd'
import api, { attachRole } from '../api'

const { Title, Text } = Typography

const HrDashboard = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [rejectModal, setRejectModal] = useState({ open: false, candidateId: null })
  const [comment, setComment] = useState('')

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const response = await api.get('/candidates', {
        params: { role: 'hr' },
        ...attachRole('hr'),
      })
      setCandidates(response.data)
    } catch (error) {
      message.error('Failed to load applications.')
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
        { hrApproval: { approved: true } },
        attachRole('hr')
      )
      message.success('Candidate approved.')
      fetchCandidates()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Approval failed.')
    }
  }

  const handleReject = async () => {
    if (!comment) {
      message.error('Feedback comment is required.')
      return
    }
    try {
      await api.patch(
        `/candidates/${rejectModal.candidateId}/approve`,
        { hrApproval: { approved: false, comment } },
        attachRole('hr')
      )
      message.success('Candidate rejected.')
      setRejectModal({ open: false, candidateId: null })
      setComment('')
      fetchCandidates()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Rejection failed.')
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
        <Tag color={status === 'Accepted' ? 'green' : status === 'Rejected' ? 'red' : 'blue'}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Docs',
      dataIndex: 'documents',
      key: 'documents',
      render: (docs = []) => <Text>{docs.join(', ') || '—'}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleApprove(record._id)} disabled={record.status !== 'Pending'}>
            Approve
          </Button>
          <Button
            danger
            onClick={() => setRejectModal({ open: true, candidateId: record._id })}
            disabled={record.status !== 'Pending'}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <Title level={3}>HR Dashboard</Title>
        <Text type="secondary">Review new candidate submissions.</Text>
      </div>
      <Card>
        <Table rowKey="_id" columns={columns} dataSource={candidates} loading={loading} />
      </Card>
      <Modal
        title="Reject Candidate"
        open={rejectModal.open}
        onOk={handleReject}
        onCancel={() => {
          setRejectModal({ open: false, candidateId: null })
          setComment('')
        }}
        okText="Submit Rejection"
      >
        <Input.TextArea
          rows={4}
          placeholder="Provide feedback to the candidate..."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </Modal>
    </div>
  )
}

export default HrDashboard
