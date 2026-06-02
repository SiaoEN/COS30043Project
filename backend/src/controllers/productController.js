// import Product from '../models/Product.js'

// const getPublicBaseUrl = (req) => process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`

// const buildImagePath = (req, file) => `${getPublicBaseUrl(req)}/uploads/${file.filename}`

// const buildImagePaths = (req) => {
//   if (!Array.isArray(req.files) || !req.files.length) {
//     return []
//   }

//   return req.files.map((file) => buildImagePath(req, file))
// }

// const normalizeProductPayload = (body) => {
//   const normalized = { ...body }

//   if (typeof normalized.price === 'string' && normalized.price.trim() !== '') {
//     normalized.price = Number(normalized.price)
//   }

//   if (typeof normalized.originalPrice === 'string') {
//     normalized.originalPrice = normalized.originalPrice.trim() === '' ? undefined : Number(normalized.originalPrice)
//   }

//   if (typeof normalized.featured === 'string') {
//     normalized.featured = normalized.featured === 'true'
//   }

//   if (typeof normalized.sizes === 'string') {
//     try {
//       const parsedSizes = JSON.parse(normalized.sizes)
//       normalized.sizes = Array.isArray(parsedSizes) ? parsedSizes : []
//     } catch {
//       normalized.sizes = normalized.sizes
//         .split(',')
//         .map((size) => size.trim())
//         .filter(Boolean)
//     }
//   } else if (Array.isArray(normalized.sizes)) {
//     // Handles multipart arrays like ['["S","M","L"]']
//     if (normalized.sizes.length === 1 && typeof normalized.sizes[0] === 'string') {
//       const onlyValue = normalized.sizes[0].trim()
//       try {
//         const parsedSizes = JSON.parse(onlyValue)
//         normalized.sizes = Array.isArray(parsedSizes) ? parsedSizes : normalized.sizes
//       } catch {
//         normalized.sizes = onlyValue
//           .split(',')
//           .map((size) => size.replace(/[\[\]"]+/g, '').trim())
//           .filter(Boolean)
//       }
//     }
//   }

//   return normalized
// }

// export const getProducts = async (req, res) => {
//   const products = await Product.find().sort({ createdAt: -1 })
//   res.json(products)
// }

// export const getProductById = async (req, res) => {
//   const product = await Product.findById(req.params.id)

//   if (!product) {
//     return res.status(404).json({ message: 'Product not found' })
//   }

//   res.json(product)
// }

// export const createProduct = async (req, res) => {
//   const imagePaths = buildImagePaths(req)
//   const product = await Product.create({
//     ...normalizeProductPayload(req.body),
//     image: imagePaths[0] || req.body.image || '',
//     images: imagePaths
//   })
//   res.status(201).json(product)
// }

// export const updateProduct = async (req, res) => {
//   const updateData = normalizeProductPayload(req.body)
//   const imagePaths = buildImagePaths(req)

//   if (imagePaths.length) {
//     updateData.image = imagePaths[0]
//     updateData.images = imagePaths
//   }

//   const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
//     new: true,
//     runValidators: true
//   })

//   if (!product) {
//     return res.status(404).json({ message: 'Product not found' })
//   }

//   res.json(product)
// }

// export const deleteProduct = async (req, res) => {
//   const product = await Product.findByIdAndDelete(req.params.id)

//   if (!product) {
//     return res.status(404).json({ message: 'Product not found' })
//   }

//   res.json({ message: 'Product deleted' })
// }
import Product from '../models/Product.js';
import { uploadToGridFS } from '../utils/gridfsUpload.js'; // utility to handle GridFS uploads

// Normalize payload (keep your existing logic for price, sizes, etc.)
const normalizeProductPayload = (body) => {
  const normalized = { ...body };

  if (typeof normalized.price === 'string' && normalized.price.trim() !== '') {
    normalized.price = Number(normalized.price);
  }

  if (typeof normalized.originalPrice === 'string') {
    normalized.originalPrice =
      normalized.originalPrice.trim() === '' ? undefined : Number(normalized.originalPrice);
  }

  if (typeof normalized.featured === 'string') {
    normalized.featured = normalized.featured === 'true';
  }

  if (typeof normalized.sizes === 'string') {
    try {
      const parsedSizes = JSON.parse(normalized.sizes);
      normalized.sizes = Array.isArray(parsedSizes) ? parsedSizes : [];
    } catch {
      normalized.sizes = normalized.sizes
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean);
    }
  } else if (Array.isArray(normalized.sizes)) {
    if (normalized.sizes.length === 1 && typeof normalized.sizes[0] === 'string') {
      const onlyValue = normalized.sizes[0].trim();
      try {
        const parsedSizes = JSON.parse(onlyValue);
        normalized.sizes = Array.isArray(parsedSizes) ? parsedSizes : normalized.sizes;
      } catch {
        normalized.sizes = onlyValue
          .split(',')
          .map((size) => size.replace(/[\[\]"]+/g, '').trim())
          .filter(Boolean);
      }
    }
  }

  return normalized;
};

// Get all products
export const getProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

// Get product by ID
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
};

// Create product with GridFS images
export const createProduct = async (req, res) => {
  try {
    const uploadedFiles = []

      for (const file of req.files || []) {

        const result =
          await uploadToGridFS(file)

        uploadedFiles.push(result.filename)
      }

    const product = await Product.create({
      ...normalizeProductPayload(req.body),
      imageFilename: uploadedFiles[0] || '',       // main image
      imageFilenames: uploadedFiles.slice(1) || [] // additional images
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product with new GridFS images
export const updateProduct = async (req, res) => {
  try {
    const updateData = normalizeProductPayload(req.body);
    const uploadedFiles = [];

    for (const file of req.files || []) {
      const result = await uploadToGridFS(file);
      uploadedFiles.push(result.filename);
    }

    if (uploadedFiles.length) {
      updateData.imageFilename = uploadedFiles[0];
      updateData.imageFilenames = uploadedFiles.slice(1);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json({ message: 'Product deleted' });
};
