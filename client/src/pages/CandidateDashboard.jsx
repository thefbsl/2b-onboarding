import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Form, Input, Upload, message, Typography, Space } from 'antd'
import api, { attachRole } from '../api'
import useAuthStore from '../store/authStore'
import StatusStepper from '../components/StatusStepper'

const { Title, Text } = Typography

const CandidateDashboard = () => {
  const email = useAuthStore((state) => state.email)
  const candidateId = useAuthStore((state) => state.candidateId)
  const setCandidateId = useAuthStore((state) => state.setCandidateId)
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState([])
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchCandidate = async () => {
    if (!candidateId) {
      return
    }
    setLoading(true)
    try {
      const response = await api.get('/candidates', {
        params: { role: 'candidate', id: candidateId },
        ...attachRole('candidate'),
      })
      setCandidate(response.data || null)
    } catch (error) {
      message.error('Unable to load your application.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidate()
  }, [candidateId])

  useEffect(() => {
    if (!candidate) {
      setFileList([])
      return
    }
    form.setFieldsValue({
      fullName: candidate.fullName || '',
      email: candidate.email || email,
      phone: candidate.phone || '',
      iban: candidate.bankDetails?.iban || '',
      bankName: candidate.bankDetails?.bankName || '',
      bic: candidate.bankDetails?.bic || '',
    })
    if (Array.isArray(candidate.documents) && candidate.documents.length > 0) {
      setFileList(
        candidate.documents.map((name, index) => ({
          uid: `${candidate._id}-${index}`,
          name,
          status: 'done',
        }))
      )
    } else {
      setFileList([])
    }
  }, [candidate, email, form])

  const hasSubmission = useMemo(
    () => Boolean(candidate?.documents?.length) && candidate?.status !== 'Rejected',
    [candidate]
  )

  const handleSubmit = async (values) => {
    if (fileList.length === 0) {
      message.error('Please attach at least one document.')
      return
    }
    setSubmitting(true)
    try {
      const response = await api.post(
        '/candidates',
        {
          candidateId,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          bankDetails: {
            iban: values.iban,
            bankName: values.bankName,
            bic: values.bic,
          },
          documents: fileList.map((file) => file.name),
        },
        attachRole('candidate')
      )
      setCandidateId(response.data?._id || '')
      message.success('Application submitted.')
      setFileList([])
      form.resetFields()
      fetchCandidate()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <Title level={3}>Candidate Portal</Title>
        <Text type="secondary">Submit your onboarding details and track progress.</Text>
      </div>
      <div className="grid-two">
        <Card title="Application Form" loading={loading}>
          <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{ email }}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: 'Full name is required.' }]}
            >
              <Input placeholder="Jane Doe" disabled={hasSubmission} />
            </Form.Item>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: 'Phone number is required.' }]}
            >
              <Input placeholder="+1 555 123 4567" disabled={hasSubmission} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Email is required.' }]}
            >
              <Input placeholder="jane@domain.com" disabled={hasSubmission} />
            </Form.Item>
            <Form.Item
              label="IBAN"
              name="iban"
              rules={[{ required: true, message: 'IBAN is required.' }]}
            >
              <Input placeholder="IBAN" disabled={hasSubmission} />
            </Form.Item>
            <Form.Item
              label="Bank Name"
              name="bankName"
              rules={[{ required: true, message: 'Bank name is required.' }]}
            >
              <Input placeholder="Bank Name" disabled={hasSubmission} />
            </Form.Item>
            <Form.Item
              label="BIC"
              name="bic"
              rules={[{ required: true, message: 'BIC is required.' }]}
            >
              <Input placeholder="BIC / SWIFT" disabled={hasSubmission} />
            </Form.Item>
            <Form.Item
              label="Documents"
              required
              help="Upload required ID, tax or certification documents."
            >
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={({ fileList: files }) => setFileList(files)}
                disabled={hasSubmission}
              >
                <Button disabled={hasSubmission}>Select Files</Button>
              </Upload>
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting} disabled={hasSubmission}>
                Submit Application
              </Button>
              {hasSubmission && (
                <Text type="secondary">Your application is on file.</Text>
              )}
            </Space>
          </Form>
        </Card>
        <Card title="Status Tracker" loading={loading}>
          {candidate ? (
            <div className="stack">
              <StatusStepper candidate={candidate} />
              {candidate.hrApproval?.comment && candidate.status === 'Rejected' && (
                <Card size="small" className="rejection-card">
                  <Text type="danger">HR Feedback: {candidate.hrApproval.comment}</Text>
                </Card>
              )}
            </div>
          ) : (
            <Text type="secondary">No application found yet.</Text>
          )}
        </Card>
      </div>
    </div>
  )
}

export default CandidateDashboard
