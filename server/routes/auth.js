const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Candidate = require('../models/Candidate')

const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.' })
  }
})

router.post('/candidate', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const normalizedEmail = email.toLowerCase()
    const existing = await Candidate.findOne({ email: normalizedEmail })
    if (existing) {
      const match = await bcrypt.compare(password, existing.passwordHash)
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials.' })
      }
      return res.json({
        id: existing._id,
        email: existing.email,
        fullName: existing.fullName,
        status: existing.status,
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const candidate = await Candidate.create({
      email: normalizedEmail,
      passwordHash,
      status: 'Pending',
    })

    return res.status(201).json({
      id: candidate._id,
      email: candidate.email,
      fullName: candidate.fullName,
      status: candidate.status,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Candidate login failed.' })
  }
})

module.exports = router
