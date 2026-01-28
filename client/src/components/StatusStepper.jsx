import { Steps, Tag } from 'antd'

const getStatusMeta = (candidate) => {
  if (!candidate) {
    return { current: 0, status: 'Draft', color: 'default' }
  }

  if (candidate.status === 'Rejected') {
    return { current: 1, status: 'Rejected', color: 'red' }
  }

  if (candidate.status === 'Accepted') {
    return { current: 3, status: 'Accepted', color: 'green' }
  }

  if (candidate.status === 'In_Progress') {
    return { current: 2, status: 'In Progress', color: 'blue' }
  }

  return { current: 1, status: 'HR Review', color: 'gold' }
}

const StatusStepper = ({ candidate }) => {
  const { current, status, color } = getStatusMeta(candidate)
  const hrApproved = candidate?.hrApproval?.approved
  const itApproved = candidate?.itApproval?.accessCreated
  const financeApproved = candidate?.financeApproval?.docsVerified

  return (
    <div>
      <Tag color={color} className="status-tag">
        {status}
      </Tag>
      <Steps
        current={current}
        items={[
          { title: 'Submitted' },
          {
            title: 'HR Review',
            description: hrApproved ? 'Approved' : candidate?.status === 'Rejected' ? 'Rejected' : 'Pending',
          },
          {
            title: 'IT / Finance Setup',
            description: `${itApproved ? 'IT ok' : 'IT pending'} • ${
              financeApproved ? 'Finance ok' : 'Finance pending'
            }`,
          },
          { title: 'Finalized' },
        ]}
      />
    </div>
  )
}

export default StatusStepper
