import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String },
  price: { type: Number },
  quantity: { type: Number },
  size: { type: String },
  text: { type: String },
  image: { type: String },
  itemType: { type: String, enum: ['product', 'custom'], default: 'product' },
  customization: { type: mongoose.Schema.Types.Mixed },
  pngDesign: { type: mongoose.Schema.Types.Mixed }
})

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    address: {
      name: { type: String },
      address: { type: String },
      phone: { type: String }
    },
    status: {
      type: String,
      enum: ['Not Yet Shipped', 'In Transit', 'Delivered'],
      default: 'Not Yet Shipped'
    }
  },
  { timestamps: true, collection: 'Order' }
)

const Order = mongoose.model('Order', orderSchema)

export default Order
