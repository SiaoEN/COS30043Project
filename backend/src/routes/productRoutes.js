import { Router } from 'express'
import upload from '../middleware/upload.js'
import { adminOnly, protect } from '../middleware/auth.js'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from '../controllers/productController.js'

const router = Router()

router.route('/').get(getProducts).post(protect, adminOnly, upload.array('images', 8), createProduct)
router.route('/:id').get(getProductById).put(protect, adminOnly, upload.array('images', 8), updateProduct).delete(protect, adminOnly, deleteProduct)

export default router
