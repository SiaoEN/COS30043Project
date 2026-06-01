import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import modiWearRoutes from './routes/modiWearRoutes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

connectDB()

app.use(cors())
app.use(express.json({ limit: '15mb' }))
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ShayneStyles API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/modiwear', modiWearRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
