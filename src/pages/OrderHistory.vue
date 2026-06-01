<template>
  <div class="order-history-page page-shell">
    <h1>Order History</h1>
    <div class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <h3>Order #{{ order.id }}</h3>
          <span :class="'status ' + order.status.toLowerCase()">{{ order.status }}</span>
        </div>
        <div class="order-details">
          <p><strong>Date:</strong> {{ order.date }}</p>
          <p><strong>Total:</strong> ${{ order.total }}</p>
          <p><strong>Items:</strong> {{ order.itemsSummary }}</p>
        </div>
        <button @click="viewOrder(order.id)" class="view-btn">View Details</button>
      </div>
    </div>
    <div v-if="orders.length === 0" class="no-orders">
      <p>No orders yet</p>
      <router-link to="/">Start Shopping</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderHistory',
  data() {
    return {
      orders: [],
      loading: false,
      message: ''
    }
  },
  methods: {
    async loadOrders() {
      this.loading = true
      this.message = ''
      try {
        const auth = JSON.parse(localStorage.getItem('authUser') || '{}')
        if (!auth?.token) {
          this.message = 'Please log in to view your orders.'
          this.loading = false
          return
        }

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/orders/my`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })

        if (!res.ok) throw new Error('Failed to load orders')
        const data = await res.json()
        // data is an array of orders
        this.orders = data.map((o) => ({
          id: o._id,
          date: new Date(o.createdAt).toLocaleDateString(),
          total: o.total.toFixed(2),
          itemsSummary: this.formatItemsSummary(o.items),
          status: o.status
        }))
      } catch (err) {
        console.error(err)
        this.message = err.message || 'Error loading orders'
      } finally {
        this.loading = false
      }
    },

    formatItemsSummary(items = []) {
      if (!Array.isArray(items) || items.length === 0) return '—'

      return items
        .map((item) => `${item?.name || 'Item'} x${item?.quantity || 1}`)
        .join(', ')
    },

    viewOrder(orderId) {
      this.$router.push({ name: 'OrderDetails', params: { id: orderId } })
    }
  }
  ,
  mounted() {
    this.loadOrders()
  }
}
</script>

<style scoped>
.order-history-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: calc(var(--header-height) + 24px) 20px 40px;
}

.order-history-page h1 {
  margin: 0 0 30px 0;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.order-header h3 {
  margin: 0;
}

.status {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status.delivered {
  background: #d4edda;
  color: #155724;
}

.status.in_transit {
  background: #d1ecf1;
  color: #0c5460;
}

.order-details p {
  margin: 8px 0;
}

.view-btn {
  margin-top: 12px;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.no-orders {
  text-align: center;
  padding: 60px 20px;
}

.no-orders a {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 30px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}
</style>
