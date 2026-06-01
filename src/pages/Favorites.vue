<template>
  <div class="favorites-page page-shell">
    <h1>My Favorites</h1>
    <div v-if="favorites.length > 0" class="favorites-grid">
      <div v-for="item in favorites" :key="item.id" class="favorite-card">
        <div class="card-image">
          <img :src="item.image" :alt="item.name" />
          <button @click="removeFavorite(item.id)" class="remove-btn">✕</button>
        </div>
        <h3>{{ item.name }}</h3>
        <p class="price">${{ item.price }}</p>
        <button @click="addToCart(item)" class="add-btn">Add to Cart</button>
      </div>
    </div>
    <div v-else class="empty-favorites">
      <p>No favorites yet</p>
      <router-link to="/">Start Shopping</router-link>
    </div>
  </div>
</template>

<script>
import { getAuthUser, getFavorites, setFavorites } from '../utils/auth.js'
import { addCartItem } from '../utils/cart.js'

export default {
  name: 'Favorites',
  data() {
    return {
      favorites: []
    }
  },
  methods: {
    removeFavorite(itemId) {
      this.favorites = this.favorites.filter(i => i.id !== itemId)
      setFavorites(this.favorites)
    },
    addToCart(item) {
      addCartItem({ ...item, quantity: 1, itemType: item.itemType || 'product' })
      window.dispatchEvent(new Event('cartchange'))
      this.$router.push('/cart')
    }
  },
  mounted() {
    const user = getAuthUser()
    this.favorites = getFavorites(user)
  }
}
</script>

<style scoped>
.favorites-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: calc(var(--header-height) + 24px) 20px 40px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.favorite-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: #ff3838;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.favorite-card h3 {
  padding: 12px;
  margin: 0;
  font-size: 15px;
}

.price {
  padding: 0 12px;
  color: #667eea;
  font-weight: 600;
  margin: 5px 0;
}

.add-btn {
  width: calc(100% - 24px);
  margin: 12px;
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.empty-favorites {
  text-align: center;
  padding: 60px 20px;
}

.empty-favorites a {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 30px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}
</style>
