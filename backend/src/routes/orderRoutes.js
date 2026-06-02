import express from 'express'
import upload from '../middleware/upload.js'
import { createOrder, getOrders, getMyOrders, getOrderById, getPng, updateOrderStatus, uploadOrderPng } from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.post('/upload-png', protect, upload.single('png'), uploadOrderPng)
router.post('/', protect, createOrder)
router.get('/my', protect, getMyOrders)
router.get('/', protect, adminOnly, getOrders)
router.get('/:id', protect, getOrderById)
router.get('/png/:id', getPng)
router.put('/:id/status', protect, adminOnly, updateOrderStatus)

export default router
