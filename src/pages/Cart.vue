<template>
  <div class="cart-page page-shell">
    <h1>Shopping Cart</h1>
    <div v-if="cartItems.length > 0" class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <img :src="getCartItemImage(item)" :alt="item.name" />
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p v-if="getItemSize(item)" class="size">Size: {{ getItemSize(item) }}</p>
            <p v-if="getCustomText(item)" class="custom-text">Text: {{ getCustomText(item) }}</p>
            <p v-if="getPngName(item)" class="custom-text">PNG: {{ getPngName(item) }}</p>
            <p class="price">{{ formatCurrency(item.price) }}</p>
          </div>
          <div class="quantity-control">
            <button @click="updateQuantity(item.id, item.quantity - 1)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
          </div>
          <p class="subtotal">{{ formatCurrency(item.price * item.quantity) }}</p>
          <button @click="removeItem(item.id)" class="remove-btn">✕</button>
        </div>
      </div>
      <div class="cart-summary">
        <h2>Order Summary</h2>
        <p>Subtotal: {{ formatCurrency(subtotal) }}</p>
        <p>Shipping: {{ formatCurrency(shipping) }}</p>
        <p>Tax: {{ formatCurrency(tax) }}</p>
        <h3>Total: {{ formatCurrency(total) }}</h3>
        <button @click="checkout" class="checkout-btn">Proceed to Checkout</button>
      </div>
    </div>
    <div v-else class="empty-cart">
      <p>Your cart is empty</p>
      <router-link to="/">Continue Shopping</router-link>
    </div>
  </div>
</template>

<script>
import { getCart, setCart } from '../utils/cart.js'

export default {
  name: 'Cart',
  data() {
    return {
      cartItems: [],
      shipping: 10,
      taxRate: 0.1
    }
  },
  computed: {
    subtotal() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    tax() {
      return this.subtotal * this.taxRate
    },
    total() {
      return this.subtotal + this.shipping + this.tax
    }
  },
  methods: {
    formatCurrency(value) {
      return `RM ${Number(value).toFixed(2)}`
    },
    getCartItemImage(item) {
      if (item?.image) return item.image

      const colorMap = {
        '#667eea': 'blue',
        '#FF6B9D': 'pink',
        '#FFC75F': 'yellow',
        '#00D9FF': 'cyan',
        '#000000': 'black',
        '#FFFFFF': 'white'
      }

      const productMap = {
        'T-Shirt': 'tshirt',
        Hoodie: 'hoodie',
        Sweater: 'sweater'
      }

      const customization = item?.customization || {}
      const colorName = colorMap[customization.color] || 'blue'
      const productKey = productMap[customization.productType] || 'tshirt'
      return new URL(`../assets/images/${colorName}-${productKey}.png`, import.meta.url).href
    },
    getItemSize(item) {
      return item?.size || item?.customization?.size || ''
    },
    getCustomText(item) {
      return item?.customization?.text || ''
    },
    getPngName(item) {
      return item?.customization?.pngDesign?.fileName || ''
    },
    updateQuantity(itemId, newQuantity) {
      if (newQuantity <= 0) {
        this.removeItem(itemId)
        return
      }
      const item = this.cartItems.find(i => i.id === itemId)
      if (item) {
        item.quantity = newQuantity
        this.saveCart()
      }
    },
    removeItem(itemId) {
      this.cartItems = this.cartItems.filter(i => i.id !== itemId)
      this.saveCart()
    },
    saveCart() {
      setCart(this.cartItems)
      window.dispatchEvent(new Event('cartchange'))
    },
    loadCart() {
      this.cartItems = getCart()
    },
    checkout() {
      this.$router.push('/checkout')
    }
  },
  mounted() {
    this.loadCart()
    this._onAuthChange = () => {
      this.loadCart()
    }
    window.addEventListener('authchange', this._onAuthChange)
  },
  beforeUnmount() {
    if (this._onAuthChange) window.removeEventListener('authchange', this._onAuthChange)
  }
}
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: calc(var(--header-height) + 24px) 20px 40px;
}

.cart-page h1 {
  margin: 0 0 30px 0;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  align-items: center;
}

.cart-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0 0 5px 0;
}

.size {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 13px;
}

.custom-text {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 13px;
}

.price {
  margin: 0;
  color: #667eea;
  font-weight: 600;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-control button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 3px;
}

.subtotal {
  min-width: 80px;
  text-align: right;
  font-weight: 600;
  margin: 0;
}

.remove-btn {
  background: #ff3838;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

.cart-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
}

.cart-summary h2 {
  margin: 0 0 15px 0;
}

.cart-summary p {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}

.cart-summary h3 {
  display: flex;
  justify-content: space-between;
  margin: 15px 0;
  padding-top: 15px;
  border-top: 2px solid #ddd;
  color: #667eea;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 15px;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
}

.empty-cart a {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 30px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}
</style>
