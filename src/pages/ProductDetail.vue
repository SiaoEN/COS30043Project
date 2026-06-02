<template>
  <div class="product-detail-page page-shell">
    <div class="product-container" v-if="product">
      <div class="product-images">
        <button v-if="imageList.length > 1" class="carousel-btn left" @click="prevImage" aria-label="Previous image">&lt;</button>
        <img v-if="currentImage" :src="currentImage" :alt="product.name" class="main-image" />
        <div v-else class="main-image placeholder">No Image</div>
        <button v-if="imageList.length > 1" class="carousel-btn right" @click="nextImage" aria-label="Next image">&gt;</button>
      </div>
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p class="category">{{ product.category }}</p>

        <div class="price">
          <span class="current-price">RM {{ Number(product.price).toFixed(2) }}</span>
          <span v-if="product.originalPrice" class="original-price">
            RM {{ Number(product.originalPrice).toFixed(2) }}
          </span>
        </div>

        <div class="options">
          <div class="option-group">
            <label>Size</label>
            <select v-model="selectedSize">
              <option v-for="size in product.sizes" :key="size">{{ size }}</option>
            </select>
          </div>
          <div class="option-group">
            <label>Quantity</label>
            <input type="number" v-model.number="quantity" min="1" />
          </div>
        </div>

        <div class="actions">
          <button @click="addToCart" class="btn btn-primary">🛒 Add to Cart</button>
          <button @click="toggleFavorite" :class="{ liked: isFavorite }" class="btn btn-favorite">
            {{ isFavorite ? '❤️' : '🤍' }}
          </button>
          <button v-if="isAdmin()" @click="$router.push({ name: 'AdminProductEdit', params: { id: product.id } })" class="btn btn-outline">Edit Product</button>
        </div>

        <div class="description">
          <h3>Description</h3>
          <p>{{ product.description }}</p>
        </div>
      </div>
    </div>
    <div v-else-if="error" class="empty-state">Error: {{ error }}</div>
    <div v-else class="empty-state">Loading product...</div>
  </div>
</template>

<script>
import { getFavorites, isRegisteredBuyer, isAdmin as checkIsAdmin, setFavorites } from '../utils/auth.js'
import { addCartItem } from '../utils/cart.js'
import { apiBaseUrl } from '../utils/api.js'

const normalizeSizes = (rawSizes) => {
  if (Array.isArray(rawSizes)) {
    if (rawSizes.length === 1 && typeof rawSizes[0] === 'string') {
      const one = rawSizes[0].trim()
      try {
        const parsed = JSON.parse(one)
        if (Array.isArray(parsed)) return parsed.map((size) => String(size).trim()).filter(Boolean)
      } catch {
        return one
          .split(',')
          .map((size) => size.replace(/[\[\]"]+/g, '').trim())
          .filter(Boolean)
      }
    }
    return rawSizes.map((size) => String(size).trim()).filter(Boolean)
  }

  if (typeof rawSizes === 'string') {
    try {
      const parsed = JSON.parse(rawSizes)
      if (Array.isArray(parsed)) return parsed.map((size) => String(size).trim()).filter(Boolean)
    } catch {
      return rawSizes
        .split(',')
        .map((size) => size.replace(/[\[\]"]+/g, '').trim())
        .filter(Boolean)
    }
  }

  return []
}

export default {
  name: 'ProductDetail',
  data() {
    return {
      selectedSize: '',
      quantity: 1,
      isFavorite: false,
      product: null,
      imageIndex: 0,
      error: ''
    }
  },
  computed: {
    imageList() {
      if (!this.product) return []
      const imgs = Array.isArray(this.product.images) ? this.product.images.filter(Boolean) : []
      if (imgs.length) return imgs
      return this.product.image ? [this.product.image] : []
    },
    currentImage() {
      if (!this.imageList.length) return ''
      return this.imageList[this.imageIndex] || this.imageList[0]
    }
  },
  methods: {
    isAdmin() {
      return checkIsAdmin()
    },
    prevImage() {
      if (!this.imageList.length) return
      this.imageIndex = (this.imageIndex - 1 + this.imageList.length) % this.imageList.length
    },
    nextImage() {
      if (!this.imageList.length) return
      this.imageIndex = (this.imageIndex + 1) % this.imageList.length
    },
    async fetchProduct() {
      this.product = null
      this.error = ''
      try {
        const res = await fetch(`${apiBaseUrl}/products/${this.$route.params.id}`)
        if (!res.ok) throw new Error('Product not found')
        const data = await res.json()
        const parsedSizes = normalizeSizes(data.sizes)

        this.product = {
          ...data,
          id: data._id,
          sizes: Array.isArray(parsedSizes) ? (parsedSizes.length ? parsedSizes : ['Standard']) : ['Standard'],
          // Build GridFS image URLs
          image: data.imageFilename ? `${apiBaseUrl}/products/image/${data.imageFilename}` : '',
          images: data.imageFilenames ? data.imageFilenames.map(fn => `${apiBaseUrl}/products/image/${fn}`) : []
        }

        this.imageIndex = 0
        this.selectedSize = this.product.sizes[0]

        const favorites = getFavorites()
        this.isFavorite = favorites.some(i => i.id === this.product.id)
      } catch (err) {
        console.error(err)
        this.error = err.message || 'Failed to load product'
      }
    },
    addToCart() {
      if (!this.product) return
      if (!isRegisteredBuyer()) {
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }

      const item = { ...this.product, quantity: this.quantity, size: this.selectedSize, itemType: 'product' }
      addCartItem(item)
      window.dispatchEvent(new Event('cartchange'))
      this.$router.push('/cart')
    },
    toggleFavorite() {
      if (!this.product) return
      if (!isRegisteredBuyer()) {
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }

      let favorites = getFavorites()
      const index = favorites.findIndex(i => i.id === this.product.id)
      if (index > -1) {
        favorites.splice(index, 1)
      } else {
        favorites.push(this.product)
      }
      setFavorites(favorites)
      this.isFavorite = !this.isFavorite
    }
  },
  mounted() {
    this.fetchProduct()
  }

  ,
  watch: {
    '$route.params.id': function () {
      this.fetchProduct()
    }
  }
}
</script>

<style scoped>
.product-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: calc(var(--header-height) + 24px) 20px 40px;
}

.product-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.product-images {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #888;
  min-height: 500px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid #d5d5d5;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 20px;
  z-index: 2;
}

.carousel-btn.left {
  left: 10px;
}

.carousel-btn.right {
  right: 10px;
}

.product-info h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
}

.category {
  color: #666;
  margin: 0 0 15px 0;
}

.price {
  font-size: 24px;
  margin-bottom: 20px;
}

.current-price {
  font-weight: bold;
  color: #667eea;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  margin-left: 10px;
}

.options {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-group label {
  font-weight: 600;
}

.option-group select,
.option-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #764ba2;
}

.btn-favorite {
  background: #f0f0f0;
  color: #333;
  font-size: 18px;
  max-width: 50px;
}

.btn-favorite.liked {
  background: #ffebee;
}

.description {
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.description h3 {
  margin: 0 0 12px 0;
}

.description p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
  }
}
</style>
