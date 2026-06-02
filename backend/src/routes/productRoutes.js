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
import { gfs } from '../config/db.js'; // import GridFS instance

const router = Router();

// Product CRUD routes
router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, upload.array('images', 8), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, upload.array('images', 8), updateProduct)
  .delete(protect, adminOnly, deleteProduct);

// Extra route: stream image from GridFS
router.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file exists' });
    }
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
});

export default router;
