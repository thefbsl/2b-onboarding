import { Button, Card, Form, Input, Select, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useAuthStore from '../store/authStore'

const { Title, Text } = Typography

const roleOptions = [
  { value: 'candidate', label: 'Candidate' },
  { value: 'hr', label: 'HR' },
  { value: 'it', label: 'IT' },
  { value: 'finance', label: 'Finance' },
  { value: 'admin', label: 'Admin' },
]

const Login = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const setCandidateId = useAuthStore((state) => state.setCandidateId)
  const [form] = Form.useForm()

  const role = Form.useWatch('role', form)

  const handleFinish = async (values) => {
    if (values.role === 'candidate') {
      try {
        const response = await api.post('/auth/candidate', {
          email: values.email,
          password: values.password,
        })
        login({
          role: 'candidate',
          name: response.data.fullName || '',
          email: response.data.email,
        })
        setCandidateId(response.data.id || '')
        navigate('/candidate')
      } catch (error) {
        message.error(error?.response?.data?.message || 'Login failed.')
      }
      return
    }

    try {
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      })
      login({
        role: response.data.role,
        name: response.data.name,
        email: response.data.email,
        userId: response.data.id,
      })
      navigate(`/${response.data.role}`)
    } catch (error) {
      message.error(error?.response?.data?.message || 'Login failed.')
    }
  }

  return (
    <div className="center-page">
      <Card className="card-width">
        <Title level={3}>EQ-Onboarding</Title>
        <Text type="secondary">Select a role to continue.</Text>
        <Form layout="vertical" form={form} onFinish={handleFinish} className="form-gap">
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Select a role.' }]}
          >
            <Select options={roleOptions} placeholder="Choose your role" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!getFieldValue('role')) {
                    return Promise.resolve()
                  }
                  if (!value) {
                    return Promise.reject(new Error('Email is required.'))
                  }
                  return Promise.resolve()
                },
              }),
            ]}
          >
            <Input placeholder="jane@domain.com" />
          </Form.Item>
          {role && (
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Password is required.' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          <Button type="primary" htmlType="submit" block>
            Continue
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default Login
