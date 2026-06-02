// import express from 'express'
// import cors from 'cors'
// import dotenv from 'dotenv'
// import path from 'path'
// import { fileURLToPath } from 'url'
// import { connectDB } from './config/db.js'
// import authRoutes from './routes/authRoutes.js'
// import productRoutes from './routes/productRoutes.js'
// import orderRoutes from './routes/orderRoutes.js'
// import modiWearRoutes from './routes/modiWearRoutes.js'

// dotenv.config()

// const app = express()
// const port = process.env.PORT || 5000
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
//   .split(',')
//   .map((origin) => origin.trim())
//   .filter(Boolean)

// connectDB()

// app.set('trust proxy', 1)
// // app.use(
// //   cors({
// //     origin: allowedOrigins.length ? allowedOrigins : true
// //   })
// // )
// // app.use(cors({
// //   origin: (origin, callback) => {
// //     if (!origin || allowedOrigins.includes(origin)) {
// //       callback(null, true)
// //     } else {
// //       callback(new Error('Not allowed by CORS'))
// //     }
// //   },
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }))
// // app.options('/\/api\/.*/', (req, res) => {
// //   res.header('Access-Control-Allow-Origin', req.headers.origin)
// //   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
// //   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
// //   res.sendStatus(200)
// // })
// // const corsOptions = {
// //   origin: function (origin, callback) {
// //     if (!origin || allowedOrigins.includes(origin)) {
// //       callback(null, true)
// //     } else {
// //       callback(new Error('Not allowed by CORS'))
// //     }
// //   },
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }
// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log('Origin:', origin)
//     console.log('Allowed:', allowedOrigins)

//     callback(null, true)
//   },
//   credentials: true
// }

// app.use(cors())

// app.use((req, res, next) => {
//   console.log("Incoming Origin:", req.headers.origin)
//   next()
// })

// app.use(express.json({ limit: '15mb' }))
// app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', message: 'ShayneStyles API is running' })
// })

// app.use('/api/auth', authRoutes)
// app.use('/api/products', productRoutes)
// app.use('/api/orders', orderRoutes)
// app.use('/api/modiwear', modiWearRoutes)

// app.use((req, res) => {
//   res.status(404).json({ message: 'Route not found' })
// })

// app.listen(port, () => {
//   console.log(`API server running on http://localhost:${port}`)
// })
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import { connectDB } from './config/db.js'
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

app.set('trust proxy', 1)

// ===== DEBUGGING MIDDLEWARE =====

// Allow ALL origins temporarily
app.use(cors())

// Log every request
app.use((req, res, next) => {
  console.log('--------------------------------')
  console.log('Method:', req.method)
  console.log('URL:', req.originalUrl)
  console.log('Origin:', req.headers.origin)
  console.log('Content-Type:', req.headers['content-type'])
  console.log('--------------------------------')
  next()
})

// ===== BODY PARSERS =====

app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// ===== STATIC FILES =====

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

// ===== HEALTH CHECK =====

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ShayneStyles API is running'
  })
})

// ===== ROUTES =====

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/modiwear', modiWearRoutes)

// ===== 404 =====

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  })
})

// ===== ERROR HANDLER =====

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:')
  console.error(err)

  res.status(500).json({
    message: err.message || 'Internal Server Error'
  })
})

// ===== START SERVER =====

app.listen(port, () => {
  console.log(`API server running on port ${port}`)
})