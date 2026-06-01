import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
})

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user'
  })

  res.status(201).json({
    token: createToken(user._id),
    user: formatUser(user)
  })
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  res.json({
    token: createToken(user._id),
    user: formatUser(user)
  })
}

export const getMe = async (req, res) => {
  res.json({
    user: formatUser(req.user)
  })
}
