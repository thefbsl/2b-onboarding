const express = require('express')
const Candidate = require('../models/Candidate')

const router = express.Router()

const getRole = (req) => {
  const headerRole = req.headers['x-role']
  return (req.query.role || headerRole || '').toString().toLowerCase()
}

const normalizeRole = (role) => {
  if (role === 'hr') return 'hr'
  if (role === 'it') return 'it'
  if (role === 'finance') return 'finance'
  if (role === 'admin') return 'admin'
  if (role === 'candidate') return 'candidate'
  return 'candidate'
}

const sanitizeCandidate = (candidate, role) => {
  const data = candidate.toObject ? candidate.toObject() : { ...candidate }

  delete data.passwordHash

  if (role === 'it') {
    delete data.bankDetails
  }

  return data
}

router.post('/', async (req, res) => {
  try {
    const { candidateId, fullName, email, phone, bankDetails, documents } = req.body

    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: 'Full name, email, and phone are required.' })
    }

    if (!bankDetails?.iban || !bankDetails?.bankName || !bankDetails?.bic) {
      return res.status(400).json({ message: 'Complete bank details are required.' })
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: 'At least one document is required.' })
    }

    const normalizedEmail = email.toLowerCase()
    let candidate = null

    if (candidateId) {
      candidate = await Candidate.findById(candidateId)
    }

    if (!candidate) {
      candidate = await Candidate.findOne({ email: normalizedEmail })
    }

    if (candidate) {
      candidate.fullName = fullName
      candidate.email = normalizedEmail
      candidate.phone = phone
      candidate.bankDetails = bankDetails
      candidate.documents = documents
      candidate.status = candidate.status === 'Rejected' ? 'Pending' : candidate.status
      await candidate.save()
    } else {
      return res.status(400).json({ message: 'Candidate account not found. Please login first.' })
    }

    return res.status(201).json(sanitizeCandidate(candidate, 'candidate'))
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create candidate.' })
  }
})

router.get('/', async (req, res) => {
  try {
    const role = normalizeRole(getRole(req))
    const candidateId = (req.query.id || '').toString()

    const query = {}
    if (role === 'candidate') {
      if (!candidateId) {
        return res.status(400).json({ message: 'Candidate id is required.' })
      }
      query._id = candidateId
    }

    if (role === 'hr') {
      query.status = 'Pending'
    }

    if (role === 'it' || role === 'finance') {
      query.status = 'In_Progress'
    }

    const candidates = await Candidate.find(query).sort({ createdAt: -1 })
    const sanitized = candidates.map((candidate) => sanitizeCandidate(candidate, role))

    if (role === 'candidate') {
      return res.json(sanitized[0] || null)
    }

    return res.json(sanitized)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch candidates.' })
  }
})

router.patch('/:id/approve', async (req, res) => {
  try {
    const role = normalizeRole(getRole(req))
    const candidate = await Candidate.findById(req.params.id)

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found.' })
    }

    if (!['hr', 'it', 'finance', 'admin'].includes(role)) {
      return res.status(403).json({ message: 'Not authorized to update candidate.' })
    }

    if (role === 'hr' || role === 'admin') {
      const { hrApproval } = req.body
      if (hrApproval) {
        const { approved, comment } = hrApproval
        if (typeof approved !== 'boolean') {
          return res.status(400).json({ message: 'HR approval flag is required.' })
        }
        if (!approved && !comment) {
          return res.status(400).json({ message: 'Rejection comment is required.' })
        }
        candidate.hrApproval.approved = approved
        candidate.hrApproval.comment = comment || ''
        candidate.status = approved ? 'In_Progress' : 'Rejected'
        if (!approved) {
          candidate.itApproval.accessCreated = false
          candidate.financeApproval.docsVerified = false
        }
      }
    }

    if (role === 'it' || role === 'admin') {
      if (!candidate.hrApproval.approved) {
        return res.status(400).json({ message: 'HR approval required before IT review.' })
      }
      const { itApproval } = req.body
      if (itApproval) {
        const { accessCreated, corporateEmail } = itApproval
        if (typeof accessCreated !== 'boolean') {
          return res.status(400).json({ message: 'IT approval flag is required.' })
        }
        if (accessCreated && !corporateEmail) {
          return res.status(400).json({ message: 'Corporate email is required.' })
        }
        candidate.itApproval.accessCreated = accessCreated
        candidate.itApproval.corporateEmail = corporateEmail || candidate.itApproval.corporateEmail
      }
    }

    if (role === 'finance' || role === 'admin') {
      if (!candidate.hrApproval.approved) {
        return res.status(400).json({ message: 'HR approval required before Finance review.' })
      }
      const { financeApproval } = req.body
      if (financeApproval) {
        const { docsVerified } = financeApproval
        if (typeof docsVerified !== 'boolean') {
          return res.status(400).json({ message: 'Finance approval flag is required.' })
        }
        candidate.financeApproval.docsVerified = docsVerified
      }
    }

    if (
      candidate.hrApproval.approved &&
      candidate.itApproval.accessCreated &&
      candidate.financeApproval.docsVerified
    ) {
      candidate.status = 'Accepted'
    }

    await candidate.save()

    const sanitized = sanitizeCandidate(candidate, role)
    return res.json(sanitized)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update candidate.' })
  }
})

module.exports = router
