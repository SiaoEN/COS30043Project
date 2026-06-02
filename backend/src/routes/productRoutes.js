// import { Router } from 'express'
// import upload from '../middleware/upload.js'
// import { adminOnly, protect } from '../middleware/auth.js'
// import {
//   createProduct,
//   deleteProduct,
//   getProductById,
//   getProducts,
//   updateProduct
// } from '../controllers/productController.js'

// const router = Router()

// router.route('/').get(getProducts).post(protect, adminOnly, upload.array('images', 8), createProduct)
// router.route('/:id').get(getProductById).put(protect, adminOnly, upload.array('images', 8), updateProduct).delete(protect, adminOnly, deleteProduct)

// export default router
import { Router } from 'express';
import upload from '../middleware/upload.js'; // now GridFS-based
import { adminOnly, protect } from '../middleware/auth.js';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from '../controllers/productController.js';
import { getBucket } from '../config/db.js'; // GridFS bucket for streaming images

const router = Router();

// Product CRUD routes
router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, upload.array('images', 8), createProduct);

// router.route('/:id')
//   .get(getProductById)
//   .put(protect, adminOnly, upload.array('images', 8), updateProduct)
//   .delete(protect, adminOnly, deleteProduct);

router.route('/:id')
  .get(getProductById)
  .put(
    protect,
    adminOnly,
    (req, res, next) => {
      console.log('PUT ROUTE HIT')
      next()
    },
    upload.array('images', 8),
    (req, res, next) => {
      console.log('UPLOAD SUCCESS')
      console.log(req.files) // Log uploaded files info
      next()
    },
    updateProduct
  )
  .delete(protect, adminOnly, deleteProduct)

router.get(
  '/image/:filename',
  async (req, res) => {

    try {
      const bucket = getBucket()
      const files = await bucket.find({
      filename: req.params.filename
    }).toArray()

    if (!files.length) {
      return res.status(404).json({
        message: 'Image not found'
      })
    }

    res.set('Content-Type', files[0].contentType || 'image/png')

    bucket
      .openDownloadStreamByName(req.params.filename)
      .pipe(res)

  } catch (err) {
    console.error(err)

    res.status(500).json({
      message: err.message
    })
  }
});

export default router;
