<template>
  <div class="admin-orders page-shell">
    <h1>All Orders</h1>
      <div class="controls">
        <label class="control-group">
          <span class="label">Status</span>
          <select v-model="statusFilter" @change="fetchOrders" class="select">
            <option>All</option>
            <option>Not Yet Shipped</option>
            <option>In Transit</option>
            <option>Delivered</option>
          </select>
        </label>

        <label class="control-group search-group">
          <span class="label sr-only">Search by user email</span>
          <input v-model="search" placeholder="Search by user email" class="search-input" @keyup.enter="runSearch" />
        </label>

        <div class="control-actions">
          <button @click="runSearch" class="btn primary">Search</button>
          <button @click="() => { statusFilter = 'All'; search = ''; page = 1; fetchOrders() }" class="btn muted">Reset</button>
        </div>
      </div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div class="table-wrapper">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order._id">
            <td>{{ order._id }}</td>
            <td>{{ order.user?.email || '—' }}</td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>{{ order.items.length }}</td>
            <td>{{ formatCurrency(order.total) }}</td>
            <td>
              <select v-model="order.status" class="status-select">
                <option>Not Yet Shipped</option>
                <option>In Transit</option>
                <option>Delivered</option>
              </select>
            </td>
            <td class="actions-cell">
              <div class="actions-buttons">
                <button @click="saveStatus(order)" class="save-btn">Save</button>
                <button @click="viewOrder(order._id)" class="view-btn">View</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      <div class="pagination">
        <button @click="changePage('prev')" :disabled="page <= 1" class="page-btn">◀ Prev</button>
        <div class="page-indicator">Page <strong>{{ page }}</strong> of <strong>{{ pages }}</strong></div>
        <button @click="changePage('next')" :disabled="page >= pages" class="page-btn">Next ▶</button>
      </div>
      <div v-if="orders.length === 0" class="no-orders">No orders found</div>
    </div>
  </div>
</template>

<script>
import { apiBaseUrl } from '../utils/api.js'
import { getAuthUser } from '../utils/auth.js'

export default {
  name: 'AdminOrders',
  data() {
    return {
      orders: [],
      loading: true,
      page: 1,
      pages: 1,
      limit: 10,
      statusFilter: 'All',
      search: ''
    }
  },
  methods: {
    formatCurrency(value) {
      return `RM ${Number(value).toFixed(2)}`
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString()
    },
    getOrderPreviewItem(order) {
      return order?.items?.[0] || null
    },
    getOrderPreviewImage(order) {
      const item = this.getOrderPreviewItem(order)
      if (!item) return ''

      const directImage = item?.image || item?.productId?.image || item?.productId?.images?.[0]
      if (directImage) return directImage

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
    getOrderPreviewPng(order) {
      const item = this.getOrderPreviewItem(order)
      const pngDesign = item?.customization?.pngDesign || item?.pngDesign || null
      return pngDesign?.url || pngDesign?.dataUrl || ''
    },
    getOrderPreviewPngName(order) {
      const item = this.getOrderPreviewItem(order)
      const pngDesign = item?.customization?.pngDesign || item?.pngDesign || null
      return pngDesign?.fileName || item?.name || 'PNG design'
    },
    getOrderPreviewText(order) {
      const item = this.getOrderPreviewItem(order)
      return item?.text || item?.customization?.text || ''
    },
    getOrderPreviewTextStyle(order) {
      const item = this.getOrderPreviewItem(order)
      const customization = item?.customization || {}
      return {
        color: customization.textColor || '#ffffff',
        fontSize: `${customization.textSize || 14}px`,
        fontFamily: customization.textFontFamily || "'Inter', sans-serif",
        left: `${customization.textPosX ?? 50}%`,
        top: `${customization.textPosY ?? 50}%`,
        width: `${customization.textBoxWidth || 120}px`,
        height: `${customization.textBoxHeight || 52}px`,
        transform: `translate(-50%, -50%) rotate(${customization.textRotate || 0}deg)`
      }
    },
    async fetchOrders() {
      try {
        this.loading = true
        const user = getAuthUser()
        const params = new URLSearchParams()
        params.set('page', this.page)
        params.set('limit', this.limit)
        if (this.statusFilter && this.statusFilter !== 'All') params.set('status', this.statusFilter)
        if (this.search) params.set('search', this.search)

        const res = await fetch(`${apiBaseUrl}/orders?${params.toString()}`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch orders')
        const data = await res.json()
        this.orders = data.orders
        this.pages = data.pages || 1
      } catch (err) {
        console.error(err)
        alert(err.message || 'Error loading orders')
      } finally {
        this.loading = false
      }
    },
    async saveStatus(order) {
      try {
        const user = getAuthUser()
        const res = await fetch(`${apiBaseUrl}/orders/${order._id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ status: order.status })
        })
        if (!res.ok) throw new Error('Failed to save status')
        const updated = await res.json()
        const idx = this.orders.findIndex(o => o._id === updated._id)
        if (idx !== -1) this.orders.splice(idx, 1, updated)
        alert('Status updated')
      } catch (err) {
        console.error(err)
        alert(err.message || 'Error updating status')
      }
    },
    async changePage(dir) {
      if (dir === 'next' && this.page < this.pages) this.page += 1
      if (dir === 'prev' && this.page > 1) this.page -= 1
      await this.fetchOrders()
    },
    async runSearch() {
      this.page = 1
      await this.fetchOrders()
    },
    viewOrder(id) {
      this.$router.push(`/order/${id}`)
    }
  },
  mounted() {
    this.fetchOrders()
  }
}
</script>

<style scoped>
.admin-orders {
  max-width: 1360px;
  margin: 0 auto;
  padding: calc(var(--header-height) + 24px) 20px 40px;
}
.controls {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  color: var(--text3);
}

.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.search-group { flex: 1; min-width: 220px }

.select,
.search-input {
  min-width: 160px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text);
  box-shadow: none;
  outline: none;
}

.search-input { width: 100%; }

.status-select {
  min-width: 150px;
  padding: 9px 34px 9px 12px;
  border-radius: 10px;
  border: 1px solid rgba(102, 126, 234, 0.28);
  background: linear-gradient(180deg, #ffffff 0%, #f7f8ff 100%);
  color: var(--text);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--accent) 50%),
    linear-gradient(135deg, var(--accent) 50%, transparent 50%),
    linear-gradient(180deg, #ffffff 0%, #f7f8ff 100%);
  background-position:
    calc(100% - 18px) calc(50% - 3px),
    calc(100% - 12px) calc(50% - 3px),
    0 0;
  background-size: 6px 6px, 6px 6px, 100% 100%;
  background-repeat: no-repeat;
}

.status-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.14);
}

.status-select option {
  background: white;
  color: var(--text);
}

.actions-cell {
  min-width: 170px;
  white-space: nowrap;
}

.actions-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 12px;
  align-items: center;
  width: max-content;
}

.control-actions { display:flex; gap:8px; align-items:center }

.btn { padding: 8px 12px; border-radius: 8px; border: 1px solid transparent; cursor: pointer }
.btn.primary { background: var(--accent); color: #fff }
.btn.muted { background: transparent; color: var(--text2); border: 1px solid var(--border) }

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-width: 900px;
}
.orders-table th,
.orders-table td {
  padding: 16px 14px;
  border-bottom: 1px solid var(--border);
  text-align: left;
}

.orders-table th {
  font-size: 15px;
}

.orders-table td {
  vertical-align: middle;
  word-break: break-word;
}

.order-preview {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 14px;
  background: #f7f7fb;
  border: 1px solid var(--border);
  overflow: hidden;
}

.order-preview-base,
.order-preview-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.order-preview-overlay {
  padding: 20%;
}

.order-preview-text {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 6px;
  text-align: center;
  font-weight: 700;
  line-height: 1.05;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
  pointer-events: none;
}
.pagination {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 12px;
}

.page-btn {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
}

.page-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  background: var(--bg2);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--text3);
}

.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.no-orders {
  padding: 20px;
  text-align: center;
}

@media (max-width: 900px) {
  .controls {
    flex-wrap: wrap;
    align-items: center;
  }

@media (max-width: 768px) {
  .orders-table,
  .orders-table thead,
  .orders-table tbody,
  .orders-table th,
  .orders-table td,
  .orders-table tr {
    display: block;
  }

  .orders-table thead {
    display: none;
  }

  .orders-table tr {
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 16px;
    padding: 12px;
  }

  .orders-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: none;
    padding: 8px 0;
    text-align: right;
    gap: 12px;
  }

  .orders-table td::before {
    font-weight: 600;
    text-align: left;
  }

  .orders-table td:nth-child(1)::before {
    content: "Order ID";
  }

  .orders-table td:nth-child(2)::before {
    content: "User";
  }

  .orders-table td:nth-child(3)::before {
    content: "Date";
  }

  .orders-table td:nth-child(4)::before {
    content: "Items";
  }

  .orders-table td:nth-child(5)::before {
    content: "Total";
  }

  .orders-table td:nth-child(6)::before {
    content: "Status";
  }

  .orders-table td:nth-child(7)::before {
    content: "Actions";
  }

  .actions-buttons {
    width: 100%;
    justify-content: flex-end;
  }

  .status-select {
    width: 100%;
    min-width: 0;
  }
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-group,
  .control-group,
  .control-actions {
    width: 100%;
  }

  .control-actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    flex: 1;
  }

  .select,
  .search-input {
    width: 100%;
    min-width: 0;
  }
}
}
</style>
