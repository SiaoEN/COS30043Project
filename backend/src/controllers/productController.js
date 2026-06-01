import Product from '../models/Product.js'

const buildImagePath = (req, file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`

const buildImagePaths = (req) => {
  if (!Array.isArray(req.files) || !req.files.length) {
    return []
  }

  return req.files.map((file) => buildImagePath(req, file))
}

const normalizeProductPayload = (body) => {
  const normalized = { ...body }

  if (typeof normalized.price === 'string' && normalized.price.trim() !== '') {
    normalized.price = Number(normalized.price)
  }

  if (typeof normalized.originalPrice === 'string') {
    normalized.originalPrice = normalized.originalPrice.trim() === '' ? undefined : Number(normalized.originalPrice)
  }

  if (typeof normalized.featured === 'string') {
    normalized.featured = normalized.featured === 'true'
  }

  if (typeof normalized.sizes === 'string') {
    try {
      const parsedSizes = JSON.parse(normalized.sizes)
      normalized.sizes = Array.isArray(parsedSizes) ? parsedSizes : []
    } catch {
      normalized.sizes = normalized.sizes
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean)
    }
  } else if (Array.isArray(normalized.sizes)) {
    // Handles multipart arrays like ['["S","M","L"]']
    if (normalized.sizes.length === 1 && typeof normalized.sizes[0] === 'string') {
      const onlyValue = normalized.sizes[0].trim()
      try {
        const parsedSizes = JSON.parse(onlyValue)
        normalized.sizes = Array.isArray(parsedSizes) ? parsedSizes : normalized.sizes
      } catch {
        normalized.sizes = onlyValue
          .split(',')
          .map((size) => size.replace(/[\[\]"]+/g, '').trim())
          .filter(Boolean)
      }
    }
  }

  return normalized
}

export const getProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 })
  res.json(products)
}

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  res.json(product)
}

export const createProduct = async (req, res) => {
  const imagePaths = buildImagePaths(req)
  const product = await Product.create({
    ...normalizeProductPayload(req.body),
    image: imagePaths[0] || req.body.image || '',
    images: imagePaths
  })
  res.status(201).json(product)
}

export const updateProduct = async (req, res) => {
  const updateData = normalizeProductPayload(req.body)
  const imagePaths = buildImagePaths(req)

  if (imagePaths.length) {
    updateData.image = imagePaths[0]
    updateData.images = imagePaths
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  })

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  res.json(product)
}

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)

  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  res.json({ message: 'Product deleted' })
}
