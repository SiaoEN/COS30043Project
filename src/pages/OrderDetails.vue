<template>
  <div class="order-details page-shell">
    <div class="details-hero">
      <div>
        <p class="eyebrow">Order Summary</p>
        <h1>Order Details</h1>
        <p class="hero-copy">Review the shipping information, purchased items, and delivery status for this order.</p>
      </div>
      <div v-if="order" class="hero-chip">#{{ shortOrderId }}</div>
    </div>

    <div v-if="loading" class="state-card">Loading order details...</div>
    <div v-else-if="errorMessage" class="state-card error-box">{{ errorMessage }}</div>
    <div v-else-if="order" class="details-grid">
      <section class="panel main-panel">
        <div class="panel-header">
          <div>
            <p class="panel-label">Status</p>
            <div class="status-badge" :class="statusClass(order.status)">{{ order.status }}</div>
          </div>
          <div class="panel-meta">
            <span>Placed on</span>
            <strong>{{ formatDate(order.createdAt) }}</strong>
          </div>
        </div>

        <div class="info-grid top-row">
          <div class="info-card">
            <span class="info-label">Order ID</span>
            <strong>{{ order._id }}</strong>
          </div>
          <div class="info-card">
            <span class="info-label">Customer Email</span>
            <strong>{{ formatCustomerEmail(order.user) }}</strong>
          </div>
        </div>

        <div class="info-grid shipping-row">
          <div class="info-card narrow">
            <span class="info-label">Recipient Name</span>
            <strong>{{ formatAddressField(order.address, 'name') }}</strong>
          </div>
          <div class="info-card narrow">
            <span class="info-label">Phone Number</span>
            <strong>{{ formatAddressField(order.address, 'phone') }}</strong>
          </div>
          <div class="info-card wide">
            <span class="info-label">Shipping Address</span>
            <strong>{{ formatAddressField(order.address, 'address') }}</strong>
          </div>
        </div>

        <div class="items-header">
          <div>
            <p class="panel-label">Items</p>
            <h2>Purchased Products</h2>
          </div>
          <div class="item-count">{{ order.items.length }} item(s)</div>
        </div>

        <div class="item-list">
          <article v-for="(it, index) in order.items" :key="it.productId || `${it.name}-${index}`" class="item-row">
            <div class="item-preview">
              <img :src="getItemPreviewImage(it)" :alt="it.name" class="item-preview-base" />
              <img
                v-if="getPngDesign(it)"
                :src="getPngSrc(it)"
                :alt="getPngDesign(it).fileName || 'Uploaded design'"
                class="item-preview-overlay"
                :style="getPngPreviewStyle(it)"
              />
              <span v-if="it.text" class="item-preview-text" :style="getItemTextStyle(it)">{{ it.text }}</span>
            </div>
            <div class="item-body">
              <h3>{{ it.name }}</h3>
              <p>Quantity: {{ it.quantity }}</p>
              <p v-if="it.text">Text: {{ it.text }}</p>
              <div v-if="getPngDesign(it)" class="item-png-block">
                <p>PNG: {{ getPngDesign(it).fileName || 'Uploaded design' }}</p>
                <a
                  v-if="isAdmin"
                  :href="getPngSrc(it)"
                  :download="getPngDesign(it).fileName || `${it.name}.png`"
                  class="download-link"
                >
                  Download PNG
                </a>
              </div>
            </div>
            <div class="item-price">{{ formatCurrency(it.price * it.quantity) }}</div>
          </article>
        </div>
      </section>

      <aside class="panel side-panel">
        <div class="summary-card">
          <p class="panel-label">Payment</p>
          <h2>Order Total</h2>
          <div class="total-amount">{{ formatCurrency(order.total) }}</div>
          <div class="summary-line">
            <span>Items</span>
            <strong>{{ order.items.length }}</strong>
          </div>
          <div class="summary-line">
            <span>Status</span>
            <strong>{{ order.status }}</strong>
          </div>
        </div>

        <div v-if="isAdmin" class="summary-card">
          <p class="panel-label">Actions</p>
          <h2>Update Status</h2>
          <select v-model="order.status" class="status-select">
            <option>Not Yet Shipped</option>
            <option>In Transit</option>
            <option>Delivered</option>
          </select>
          <button @click="saveStatus" class="save-btn">Save Status</button>
        </div>
      </aside>
    </div>

    <div v-else class="state-card">No order found</div>
  </div>
</template>

<script>
import { apiBaseUrl } from '../utils/api.js'
import { getAuthUser, isAdmin } from '../utils/auth.js'

export default {
  name: 'OrderDetails',
  data() {
    return { order: null, loading: true, errorMessage: '' }
  },
  computed: {
    isAdmin() { return isAdmin() },
    shortOrderId() {
      return this.order?._id ? this.order._id.slice(-8).toUpperCase() : ''
    }
  },
  methods: {
    formatCurrency(v) { return `RM ${Number(v).toFixed(2)}` },
    formatDate(d) { return new Date(d).toLocaleString() },
    formatCustomerEmail(user) {
      if (!user || typeof user === 'string') return '—'
      return user.email || user.name || '—'
    },
    statusClass(status) {
      return {
        'status-delivered': status === 'Delivered',
        'status-transit': status === 'In Transit',
        'status-pending': status === 'Not Yet Shipped'
      }
    },
    formatAddressField(address, field) {
      if (!address) return '—'
      if (typeof address === 'string') return address

      return address[field] || '—'
    },
    isCustomItem(item) {
      return item?.itemType === 'custom' || item?.category === 'Custom ModiWear'
    },
    getItemPreviewImage(item) {
      if (!this.isCustomItem(item)) {
        if (item?.image) return item.image

        const productImage = item?.productId?.image || item?.productId?.images?.[0]
        if (productImage) return productImage

        return new URL('../assets/images/white-tshirt.png', import.meta.url).href
      }

      const customization = item?.customization || {}
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
      const colorName = colorMap[customization.color] || 'blue'
      const productKey = productMap[customization.productType] || 'tshirt'
      return new URL(`../assets/images/${colorName}-${productKey}.png`, import.meta.url).href
    },
    getPngDesign(item) {
      return item?.customization?.pngDesign || item?.pngDesign || null
    },
    getPngSrc(item) {
      const pngDesign = this.getPngDesign(item)
      return pngDesign?.url || pngDesign?.dataUrl || ''
    },
    getPngPreviewStyle(item) {
      const pngDesign = this.getPngDesign(item) || {}
      const previewScale = 0.9
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
    async fetchOrder() {
      try {
        this.loading = true
        this.errorMessage = ''
        const user = getAuthUser()
        const res = await fetch(`${apiBaseUrl}/orders/${this.$route.params.id}`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Failed to load order')
        this.order = data
      } catch (err) {
        console.error(err)
        this.errorMessage = err.message || 'Error loading order'
      } finally {
        this.loading = false
      }
    },
    async saveStatus() {
      try {
        const user = getAuthUser()
        const res = await fetch(`${apiBaseUrl}/orders/${this.order._id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
          body: JSON.stringify({ status: this.order.status })
        })
        if (!res.ok) throw new Error('Failed to update status')
        this.order = await res.json()
        alert('Status updated')
      } catch (err) {
        console.error(err)
        alert(err.message || 'Error updating status')
      }
    }
  },
  mounted() { this.fetchOrder() }
}
</script>

<style scoped>
.order-details {
  max-width: 1100px;
  margin: 0 auto;
  padding: calc(var(--header-height) + 24px) 20px 40px;
}

.details-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.eyebrow,
.panel-label {
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
}

.details-hero h1 {
  margin: 0 0 8px 0;
  font-size: clamp(30px, 4vw, 44px);
}

.hero-copy,
.muted {
  margin: 0;
  color: var(--text3);
}

.hero-chip {
  align-self: center;
  background: rgba(200, 149, 108, 0.12);
  color: var(--accent);
  border: 1px solid rgba(200, 149, 108, 0.25);
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.details-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr);
  gap: 20px;
}

.panel,
.state-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
}

.panel {
  padding: 22px;
}

.state-card {
  padding: 18px 20px;
  color: var(--text2);
}

.panel-header,
.items-header,
.summary-line,
.item-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.panel-header {
  align-items: flex-start;
  margin-bottom: 18px;
}

.panel-meta {
  text-align: right;
  color: var(--text3);
  display: grid;
  gap: 4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  width: fit-content;
}

.status-pending {
  background: rgba(248, 180, 95, 0.14);
  color: #b26a13;
}

.status-transit {
  background: rgba(97, 170, 255, 0.14);
  color: #0f67b1;
}

.status-delivered {
  background: rgba(74, 175, 96, 0.14);
  color: #21763c;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}

.top-row {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.shipping-row {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.info-card,
.summary-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.75));
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}

.info-card.wide {
  grid-column: 1 / -1;
}

.info-card.narrow {
  grid-column: span 1;
}

.info-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.items-header {
  align-items: flex-end;
  margin-bottom: 14px;
}

.items-header h2,
.summary-card h2 {
  margin: 0;
  font-size: 22px;
}

.item-count {
  color: var(--text3);
  font-size: 14px;
}

.item-list {
  display: grid;
  gap: 12px;
}

.item-row {
  align-items: center;
  padding: 14px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid var(--border);
}

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
  padding: 20%;
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

.item-body {
  flex: 1;
  min-width: 0;
}

.item-body h3 {
  margin: 0 0 6px 0;
  font-size: 16px;
}

.item-body p {
  margin: 0;
  color: var(--text3);
  font-size: 13px;
}

.item-png-block {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.item-png-block p {
  margin: 0;
  color: var(--text2);
  font-size: 13px;
  font-weight: 600;
}

.download-link {
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.download-link:hover {
  text-decoration: underline;
}

.item-price {
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

.side-panel {
  display: grid;
  gap: 16px;
  align-content: start;
}

.total-amount {
  font-size: 34px;
  font-weight: 800;
  color: var(--accent);
  margin: 10px 0 16px;
}

.summary-line {
  padding: 8px 0;
  color: var(--text2);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.summary-line:first-of-type {
  border-top: none;
}

.status-select {
  width: 100%;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #fff;
}

.save-btn {
  width: 100%;
  margin-top: 10px;
  padding: 12px 14px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.save-btn:hover {
  background: var(--accent2);
}

.error-box {
  padding: 14px 16px;
  border: 1px solid #f0c6c6;
  background: #fdf2f2;
  color: #b24a4a;
  border-radius: 12px;
}

@media (max-width: 900px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .details-hero {
    flex-direction: column;
  }

  .hero-chip {
    align-self: flex-start;
  }
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .top-row,
  .shipping-row {
    grid-template-columns: 1fr;
  }

  .panel-header,
  .items-header,
  .item-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .panel-meta {
    text-align: left;
  }
}
</style>
