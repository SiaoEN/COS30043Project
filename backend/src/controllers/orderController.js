import Order from '../models/Order.js'
import User from '../models/User.js'
import Product from '../models/Product.js'

export const uploadOrderPng = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PNG file is required' })
    }

    if (req.file.mimetype !== 'image/png') {
      return res.status(400).json({ message: 'Only PNG files are allowed' })
    }

    const publicBaseUrl = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`
    const url = `${publicBaseUrl}/uploads/${req.file.filename}`

    res.status(201).json({
      url,
      fileName: req.file.originalname,
      storedName: req.file.filename
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const enrichOrderItemsWithImages = async (items = []) => {
  const productIds = items
    .map((item) => item?.productId)
    .filter((productId) => productId && typeof productId === 'string')

  if (!productIds.length) return items

  const products = await Product.find({ _id: { $in: productIds } }).select('image images')
  const productMap = new Map(products.map((product) => [product._id.toString(), product]))

  return items.map((item) => {
    const product = item?.productId && productMap.get(item.productId.toString())
    const productImage = product?.image || product?.images?.[0] || ''

    return {
      ...item,
      image: item.image || productImage,
      productId: product && typeof item.productId === 'string' ? product : item.productId,
      customization: item.customization
        ? {
            ...item.customization,
            pngDesign: item.customization?.pngDesign || item.pngDesign || null
          }
        : item.customization,
      pngDesign: item.pngDesign || item.customization?.pngDesign || null
    }
  })
}

export const createOrder = async (req, res) => {
  try {
    const { items, total, address } = req.body
    if (!items || !items.length) return res.status(400).json({ message: 'No items in order' })

    const normalizedItems = items.map((item) => {
      const pngDesign = item.pngDesign || item.customization?.pngDesign || null
      const itemType = item.itemType || (item.customization ? 'custom' : 'product')
      return {
        ...item,
        itemType,
        image: item.image || item.productId?.image || item.productId?.images?.[0] || '',
        pngDesign,
        customization: item.customization
          ? {
              ...item.customization,
              pngDesign
            }
          : item.customization
      }
    })

    const order = new Order({
      user: req.user._id,
      items: normalizedItems,
      total,
      address
    })

    const saved = await order.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const status = req.query.status
    const search = req.query.search

    const filter = {}
    if (status && status !== 'All') filter.status = status
    if (search) {
      // search by user email (needs lookup)
      const users = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id')
      filter.user = { $in: users.map(u => u._id) }
    }

    const total = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate('user', 'email name')
      .populate('items.productId', 'name image images category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const plainOrder = order.toObject()
        plainOrder.items = await enrichOrderItemsWithImages(plainOrder.items)
        return plainOrder
      })
    )

    res.json({ orders: enrichedOrders, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.productId', 'name image images category')
      .sort({ createdAt: -1 })

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const plainOrder = order.toObject()
        plainOrder.items = await enrichOrderItemsWithImages(plainOrder.items)
        return plainOrder
      })
    )

    res.json(enrichedOrders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'email name')
      .populate('items.productId', 'name image images category')
    if (!order) return res.status(404).json({ message: 'Order not found' })

    // allow admin or owner
    const ownerId = order.user?._id ? order.user._id.toString() : order.user?.toString()
    if (req.user.role !== 'admin' && ownerId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const plainOrder = order.toObject()
    plainOrder.items = await enrichOrderItemsWithImages(plainOrder.items)

    res.json(plainOrder)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    order.status = status
    const updated = await order.save()
    await updated.populate('user', 'email name')
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
