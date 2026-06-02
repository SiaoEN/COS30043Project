<template>
  <div class="checkout page-shell">
    <h1>Checkout</h1>

    <div v-if="cartItems.length === 0" class="empty">Your cart is empty</div>

    <div v-else class="checkout-grid">
      <main class="checkout-left">
        <section class="card">
          <h2>Shipping</h2>
          <label class="field">
            <div class="label">Full name</div>
            <input v-model="name" placeholder="Recipient name" />
          </label>
          <label class="field">
            <div class="label">Shipping address</div>
            <input v-model="address" placeholder="Enter shipping address" />
          </label>
          <label class="field">
            <div class="label">Phone</div>
            <input v-model="phone" placeholder="Phone number" />
          </label>
        </section>

        <section class="card">
          <h2>Payment</h2>
          <p class="muted">Payment integration not configured — this demo records orders without processing payments.</p>
          <label class="field">
            <div class="label">Card number</div>
            <input
              v-model.trim="cardNumber"
              inputmode="numeric"
              maxlength="19"
              placeholder="1234 5678 9012 3456"
              @input="normalizeCardNumber"
            />
          </label>
          <button
            type="button"
            class="pay-btn"
            :disabled="!canOpenPayment"
            @click="openPaymentModal"
          >
            Pay
          </button>
        </section>
      </main>

      <aside class="checkout-right">
        <section class="summary card sticky">
          <h3>Order Summary</h3>
          <div v-for="item in cartItems" :key="item.id" class="summary-item">
            <div class="item-preview">
              <img :src="getItemPreviewImage(item)" :alt="item.name" class="item-preview-base" />
              <img
                v-if="getItemPngSrc(item)"
                :src="getItemPngSrc(item)"
                :alt="getItemPngName(item) || item.name"
                class="item-preview-overlay"
                :style="getItemPngStyle(item)"
              />
              <span v-if="getItemText(item)" class="item-preview-text" :style="getItemTextStyle(item)">{{ getItemText(item) }}</span>
            </div>
            <div class="meta">
              <div class="name">{{ item.name }}</div>
              <div v-if="getItemSize(item)" class="size">Size: {{ getItemSize(item) }}</div>
              <div v-if="getItemText(item)" class="text">Text: {{ getItemText(item) }}</div>
              <div v-if="getItemPngName(item)" class="text">PNG: {{ getItemPngName(item) }}</div>
            </div>
            <div class="summary-right">
              <div class="qty">x{{ item.quantity }}</div>
              <div class="price">{{ formatCurrency(item.price * item.quantity) }}</div>
            </div>
          </div>

          <div class="divider"></div>
          <div class="totals">
            <div><span>Subtotal</span><span>{{ formatCurrency(subtotal) }}</span></div>
            <div><span>Shipping</span><span>{{ formatCurrency(shipping) }}</span></div>
            <div><span>Tax</span><span>{{ formatCurrency(tax) }}</span></div>
            <div class="total-row"><strong>Total</strong><strong>{{ formatCurrency(total) }}</strong></div>
          </div>

          <button @click="openPaymentModal" :disabled="!canOpenPayment || isPlacing" class="place-order">
            {{ isPlacing ? 'Placing order...' : 'Pay & Place Order' }}
          </button>
        </section>
      </aside>
    </div>

    <teleport to="body">
      <div v-if="showPaymentModal" class="modal-backdrop" @click.self="closePaymentModal">
        <div class="modal-card">
          <p class="modal-eyebrow">Demo Payment</p>
          <h2>Confirm payment</h2>
          <p class="modal-copy">
            This is a test checkout only. No real payment will be charged.
          </p>

          <div class="modal-summary">
            <div><span>Card</span><strong>•••• {{ maskedCard }}</strong></div>
            <div><span>Total</span><strong>{{ formatCurrency(total) }}</strong></div>
          </div>

          <div class="modal-actions">
            <button type="button" class="modal-btn secondary" @click="closePaymentModal">Cancel</button>
            <button type="button" class="modal-btn primary" :disabled="isPlacing" @click="confirmPayment">
              {{ isPlacing ? 'Processing...' : 'Pay Now' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { getAuthUser } from '../utils/auth.js'
import { apiBaseUrl } from '../utils/api.js'
import { clearCart, getCart } from '../utils/cart.js'

export default {
  name: 'Checkout',
  data() {
    return {
      cartItems: [],
      name: '',
      address: '',
      phone: '',
      cardNumber: '',
      shipping: 10,
      taxRate: 0.1,
      isPlacing: false,
      showPaymentModal: false
    }
  },
  computed: {
    subtotal() {
      return this.cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
    },
    tax() {
      return this.subtotal * this.taxRate
    },
    total() {
      return this.subtotal + this.shipping + this.tax
    },
    maskedCard() {
      const digits = this.cardNumber.replace(/\D/g, '')
      return digits.slice(-4).padStart(4, '•')
    },
    canOpenPayment() {
      return Boolean(this.name && this.address && this.cardNumber.replace(/\D/g, '').length >= 12)
    }
  },
  methods: {
    formatCurrency(v) { return `RM ${Number(v).toFixed(2)}` },
    getItemPreviewImage(item) {
      const isCustom = item?.itemType === 'custom' || Boolean(item?.customization && !item?.productId)
      if (!isCustom) {
        // Use GridFS filenames if available
        if (item?.imageFilename) {
          return `${apiBaseUrl}/products/image/${item.imageFilename}`
        }
        if (item?.imageFilenames && item.imageFilenames.length > 0) {
          return `${apiBaseUrl}/products/image/${item.imageFilenames[0]}`
        }
        const productImage = item?.productId?.image || item?.productId?.images?.[0] || item?.image
        if (productImage) return productImage
      }

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
    getItemText(item) {
      return item?.customization?.text || ''
    },
    getItemPngName(item) {
      return item?.customization?.pngDesign?.fileName || ''
    },
    getItemPngSrc(item) {
      const pngDesign = item?.customization?.pngDesign || null
      return pngDesign?.url || pngDesign?.dataUrl || ''
    },
    getItemPngStyle(item) {
      const pngDesign = item?.customization?.pngDesign || {}
      const previewScale = 0.35
      return {
        left: `${pngDesign.posX ?? 50}%`,
        top: `${pngDesign.posY ?? 38}%`,
        width: `${(pngDesign.width || 160) * previewScale}px`,
        height: `${(pngDesign.height || 160) * previewScale}px`,
        transform: `translate(-50%, -50%) rotate(${pngDesign.rotate || 0}deg)`
      }
    },
    getItemTextStyle(item) {
      const customization = item?.customization || {}
      const previewScale = 0.35
      return {
        color: customization.textColor || '#ffffff',
        fontSize: `${(customization.textSize || 18) * previewScale}px`,
        fontFamily: customization.textFontFamily || "'Inter', sans-serif",
        left: `${customization.textPosX ?? 50}%`,
        top: `${customization.textPosY ?? 50}%`,
        width: `${(customization.textBoxWidth || 160) * previewScale}px`,
        height: `${(customization.textBoxHeight || 70) * previewScale}px`,
        transform: `translate(-50%, -50%) rotate(${customization.textRotate || 0}deg)`
      }
    },
    normalizeCardNumber() {
      const digits = this.cardNumber.replace(/\D/g, '').slice(0, 16)
      this.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim()
    },
    openPaymentModal() {
      if (!this.name || !this.address) {
        alert('Please fill in your name and shipping address first.')
        return
      }

      const digits = this.cardNumber.replace(/\D/g, '')
      if (digits.length < 12) {
        alert('Please enter a valid card number for the demo payment.')
        return
      }

      this.showPaymentModal = true
    },
    closePaymentModal() {
      if (this.isPlacing) return
      this.showPaymentModal = false
    },
    async confirmPayment() {
      this.showPaymentModal = false
      await this.placeOrder()
    },
    async placeOrder() {
      try {
        this.isPlacing = true
        const user = getAuthUser()
        if (!user) {
          this.$router.push({ name: 'Login', query: { redirect: '/checkout' } })
          return
        }

        const payload = {
          items: this.cartItems.map((i) => {
            const itemType = i.itemType || (i.customization ? 'custom' : 'product')
            const item = {
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              size: this.getItemSize(i),
              text: this.getItemText(i),
              // image: i.image || '',
              itemType,
              customization: i.customization || null
            }
            if (i.imageFilename) {
              item.imageFilename = i.imageFilename
            }
            if (i.imageFilenames && i.imageFilenames.length > 0) {
              item.imageFilenames = i.imageFilenames
            }

            if (itemType === 'product') {
              item.productId = i.id
            }

            return item
          }),
          total: this.total,
          address: { name: this.name, address: this.address, phone: this.phone }
        }

        const res = await fetch(`${apiBaseUrl}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(payload)
        })

        if (!res.ok) throw new Error('Failed to place order')
        const order = await res.json()

        // clear cart and navigate to order details
        clearCart()
        window.dispatchEvent(new Event('cartchange'))
        this.$router.push(`/order/${order._id}`)
      } catch (err) {
        console.error(err)
        alert(err.message || 'Error placing order')
      } finally {
        this.isPlacing = false
      }
    }
  },
  mounted() {
    this.cartItems = getCart()
    this._onAuthChange = () => {
      this.cartItems = getCart()
    }
    window.addEventListener('authchange', this._onAuthChange)
  },
  beforeUnmount() {
    if (this._onAuthChange) window.removeEventListener('authchange', this._onAuthChange)
  }
}
</script>

<style scoped>
.checkout { max-width: 1100px; margin: 0 auto; padding: calc(var(--header-height) + 24px) 20px 40px; }
.checkout-grid { display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 20px }
.checkout-left { display: grid; gap: 20px }
.card { background: #fff; padding: 18px; border-radius: 12px; border:1px solid var(--border) }
.field { margin-bottom: 12px }
.label { font-size: 13px; color:var(--text3); margin-bottom:6px }
input { width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:transparent }
.muted { color:var(--text3); font-size:13px }
.summary { display:flex; flex-direction:column; gap:10px }
.summary-item { display:grid; grid-template-columns: 110px minmax(0, 1fr) auto; gap: 12px; align-items:start }
.item-preview {
  position: relative;
  width: 110px;
  height: 110px;
  flex: 0 0 auto;
  border-radius: 16px;
  background: #f7f7fb;
  border: 1px solid var(--border);
  overflow: hidden;
}

.item-preview-base,
.item-preview-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-preview-overlay {
  object-fit: contain;
}

.item-preview-text {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  text-align: center;
  font-weight: 700;
  line-height: 1.1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
  pointer-events: none;
}
.summary-item .meta { min-width: 0 }
.name { font-weight: 600 }
.size { color: var(--text3); font-size: 13px; margin-top: 3px }
.text { color: var(--text3); font-size: 13px; margin-top: 3px }
.summary-right { display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0 }
.qty { white-space: nowrap; line-height: 1 }
.price { white-space: nowrap; text-align: right; line-height: 1 }
.divider { height:1px; background:var(--border); margin:6px 0 }
.totals div { display:flex; justify-content:space-between; padding:6px 0 }
.total-row { margin-top:6px; font-size:16px }
.place-order { margin-top:8px; width:100%; padding:12px; background:#667eea; color:#fff; border:none; border-radius:8px; cursor:pointer }
.place-order:disabled { opacity:0.6; cursor:default }
.pay-btn { width:100%; padding:12px; margin-top:6px; border:none; border-radius:8px; background:#1f2937; color:#fff; cursor:pointer }
.pay-btn:disabled { opacity:0.5; cursor:default }
.sticky { position: sticky; top: calc(var(--header-height) + 16px) }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-card {
  width: min(100%, 460px);
  background: #fff;
  border-radius: 18px;
  border: 1px solid var(--border);
  padding: 22px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.modal-eyebrow {
  margin: 0 0 8px 0;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.modal-copy { color: var(--text3); margin-bottom: 16px; }
.modal-summary { background: var(--bg2); border-radius: 12px; padding: 14px; display: grid; gap: 10px; margin-bottom: 16px }
.modal-summary div { display:flex; justify-content:space-between; gap: 12px }
.modal-actions { display:flex; gap: 10px; justify-content:flex-end }
.modal-btn { border:none; border-radius:10px; padding:11px 16px; cursor:pointer; font-weight:600 }
.modal-btn.secondary { background: var(--bg2); color: var(--text) }
.modal-btn.primary { background: var(--accent); color:#fff }
.modal-btn.primary:disabled { opacity:0.7; cursor:default }

@media (max-width: 900px) {
  .checkout-grid { grid-template-columns: 1fr }

  .checkout-left { gap: 16px }
}
</style>
