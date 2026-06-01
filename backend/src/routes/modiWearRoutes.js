import { Router } from 'express'
import {
  deleteDesign,
  getDesignCollections,
  publishSampleDesign,
  saveDesign
} from '../controllers/modiWearController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.get('/designs', protect, getDesignCollections)
router.post('/designs', protect, saveDesign)
router.post('/designs/sample', protect, publishSampleDesign)
router.delete('/designs/:id', protect, deleteDesign)

export default router