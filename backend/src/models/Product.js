import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    images: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    sizes: [{ type: String }],
    featured: { type: Boolean, default: false }
  },
  { timestamps: true, collection: 'Product' }
)

const Product = mongoose.model('Product', productSchema)

export default Product
