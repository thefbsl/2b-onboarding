const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const candidatesRouter = require('./routes/candidates')
const authRouter = require('./routes/auth')
const User = require('./models/User')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5050
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://mongodb:mongodb@cluster0.jxo80gt.mongodb.net/eq_onboarding'
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'demo123!'

app.use(cors({
  origin: ['http://localhost:5173', 'https://2b-onboarding.netlify.app/'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-role'],
}))

app.options(/.*/, cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '5mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/candidates', candidatesRouter)
app.use('/api/auth', authRouter)


const ensureUsers = async () => {
  const existing = await User.countDocuments()
  if (existing > 0) {
    return
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  await User.insertMany([
    { name: 'HR User', email: 'hr@eq.kz', role: 'hr', passwordHash },
    { name: 'IT User', email: 'it@eq.kz', role: 'it', passwordHash },
    { name: 'Finance User', email: 'finance@eq.kz', role: 'finance', passwordHash },
    { name: 'Admin User', email: 'admin@eq.kz', role: 'admin', passwordHash },
  ])
}

const ensureCollections = async () => {
  const db = mongoose.connection.db
  const collections = await db.listCollections().toArray()
  const names = collections.map((collection) => collection.name)

  if (!names.includes('candidates')) {
    await db.createCollection('candidates')
  }

  if (!names.includes('users')) {
    await db.createCollection('users')
  }
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    await ensureCollections()
    await ensureUsers()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Mongo connection error:', error)
    process.exit(1)
  })
