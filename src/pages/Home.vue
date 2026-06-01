<template>
  <div class="page-shell">
    <div class="banner">✦ Free shipping over RM150 · Use code SHAYNE04 for 15% off first order ✦</div>

    <section class="hero container">
      <div class="hero-content">
        <p class="hero-tag">New Collection 2026</p>
        <h1>Wear Your <em>Story</em></h1>
        <p>
          Discover curated fashion, accessories, and press-on nails crafted for elegant everyday expression.
        </p>
        <div class="hero-buttons">
          <button class="btn-primary" @click="scrollToProducts">Shop Now</button>
          <router-link to="/modiwear" class="btn-outline">Customize with ModiWear</router-link>
        </div>
      </div>
      <div class="hero-image" aria-hidden="true">✦</div>
    </section>

    <section class="container section-block featured-section" v-if="featuredProducts.length">
      <div class="section-header">
        <div>
          <h2 class="section-title">Featured <em>Products</em></h2>
          <p class="section-sub">Shop our highlighted picks</p>
        </div>
      </div>

      <div class="featured-grid">
        <article v-for="product in featuredProducts" :key="product.id" class="featured-card" @click="viewProduct(product)">
          <div class="featured-media">
            <img v-if="product.image" :src="product.image" :alt="product.name" />
            <div v-else class="no-image">✦</div>
          </div>
          <div class="featured-meta">
            <h3>{{ product.name }}</h3>
            <div class="price">RM {{ product.price }}</div>
          </div>
        </article>
      </div>
    </section>

    <section class="container section-block">
      <div class="section-header">
        <div>
          <h2 class="section-title">Shop by <em>Category</em></h2>
          <p class="section-sub">Explore your style lane in one tap.</p>
        </div>
      </div>

      <div class="category-grid">
        <button
          v-for="category in categories"
          :key="category"
          class="category-card"
          @click="selectedCategory = category"
        >
          <div class="emoji">{{ categoryEmoji[category] }}</div>
          <p>{{ category }}</p>
        </button>
      </div>
    </section>

    <section class="container section-block products-layout" ref="productsSection">
      <Sidebar @filter-change="handleFilterChange" />

      <main class="products-main">
        <div class="section-header">
          <div>
            <h2 class="section-title"><em>ShayneStyles</em> Products</h2>
            <p class="section-sub">Handpicked favorites this season.</p>
          </div>
        </div>

        <div class="tabs">
          <button
            v-for="category in categories"
            :key="category + '-tab'"
            class="tab-btn"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <div class="product-grid" v-if="filteredProducts.length">
          <article v-for="product in filteredProducts" :key="product.id" class="product-card">
            <div class="product-media" :style="{ background: product.bg }" @click="viewProduct(product)">
              <img v-if="product.image" :src="product.image" :alt="product.name" class="product-image" />
              <span v-else class="product-emoji">{{ product.emoji }}</span>
              <span class="product-badge" v-if="product.badge">{{ product.badge }}</span>
              <div class="product-actions">
                <button class="action-btn" @click.stop="toggleFavorite(product)">
                  {{ isFavorite(product.id) ? '❤️' : '🤍' }}
                </button>
                <button class="action-btn" @click.stop="addToCart(product)">🛒</button>
              </div>
            </div>

            <div class="product-info">
              <p class="product-brand">ShayneStyles</p>
              <h3>{{ product.name }}</h3>
              <div class="price-row">
                <span class="price">RM {{ product.price }}</span>
                <span class="old-price" v-if="product.originalPrice">RM {{ product.originalPrice }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty">No products found matching your criteria.</div>
      </main>
    </section>

    <section class="container modiwear-cta">
      <div>
        <p class="chip">Exclusive Feature</p>
        <h2>Personalize with <em>ModiWear</em></h2>
        <p>Create custom pieces with dynamic previews and elegant type treatments.</p>
      </div>
      <router-link to="/modiwear" class="btn-primary">Explore ModiWear</router-link>
    </section>
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar.vue'
import { getFavorites, isRegisteredBuyer, setFavorites } from '../utils/auth.js'
import { addCartItem } from '../utils/cart.js'
import { apiBaseUrl } from '../utils/api.js'

export default {
  name: 'Home',
  components: {
    Sidebar
  },
  data() {
    return {
      selectedCategory: 'All',
      categories: ['All', 'Clothes', 'Accessories', 'Press-on Nails'],
      categoryEmoji: {
        All: '✨',
        Clothes: '👕',
        Accessories: '🕶️',
        'Press-on Nails': '💅🏻'
      },
      filters: {
        categories: [],
        priceRange: [0, 500],
        ratings: []
      },
      products: [],
      featuredProducts: []
    }
  },
  computed: {
    filteredProducts() {
      return this.products.filter((product) => {
        if (this.selectedCategory !== 'All' && product.category !== this.selectedCategory) return false
        if (this.filters.categories.length > 0 && !this.filters.categories.includes(product.category)) return false
        if (product.price < this.filters.priceRange[0] || product.price > this.filters.priceRange[1]) return false
        if (this.filters.ratings.length > 0 && !this.filters.ratings.includes(Math.floor(product.rating))) return false
        return true
      })
    }
  },
  methods: {
    categoryVisual(category) {
      if (category === 'Clothes') return { emoji: '👕', bg: 'linear-gradient(135deg,#f0e6d8,#e8d0b8)' }
      if (category === 'Accessories') return { emoji: '👜', bg: 'linear-gradient(135deg,#e8d4c0,#d4b898)' }
      if (category === 'Press-on Nails') return { emoji: '💅', bg: 'linear-gradient(135deg,#fce8f0,#f8d0e0)' }
      return { emoji: '✨', bg: 'linear-gradient(135deg,#f8f8f8,#ececec)' }
    },
    normalizeProduct(raw) {
      const visual = this.categoryVisual(raw.category)
      return {
        ...raw,
        id: raw._id,
        image: raw.image || '',
        rating: raw.rating || 0,
        reviews: raw.reviews || 0,
        emoji: visual.emoji,
        bg: visual.bg,
        badge: raw.featured ? 'FEATURED' : ''
      }
    },
    async fetchProducts() {
      try {
        const res = await fetch(`${apiBaseUrl}/products`)
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        const all = data.map(this.normalizeProduct)
        this.products = all
        this.featuredProducts = all.filter(p => p.featured)
      } catch (error) {
        console.error(error)
      }
    },
    handleFilterChange(filters) {
      this.filters = filters
      if (filters.categories.length === 1) this.selectedCategory = filters.categories[0]
      if (filters.categories.length === 0) this.selectedCategory = 'All'
    },
    addToCart(product) {
      if (!isRegisteredBuyer()) {
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }

      addCartItem({ ...product, quantity: 1, itemType: 'product' })
      window.dispatchEvent(new Event('cartchange'))
      this.$router.push('/cart')
    },
    toggleFavorite(product) {
      if (!isRegisteredBuyer()) {
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }

      const favorites = getFavorites()
      const index = favorites.findIndex((item) => item.id === product.id)

      if (index > -1) {
        favorites.splice(index, 1)
      } else {
        favorites.push(product)
      }

      setFavorites(favorites)
    },
    isFavorite(productId) {
      const favorites = getFavorites()
      return favorites.some((item) => item.id === productId)
    },
    viewProduct(product) {
      this.$router.push({ name: 'ProductDetail', params: { id: product.id } })
    },
    scrollToProducts() {
      this.$refs.productsSection?.scrollIntoView({ behavior: 'smooth' })
    }
  },
  mounted() {
    this.fetchProducts()
  }
}
</script>

<style scoped>
.banner {
  background: var(--accent);
  color: #fff;
  text-align: center;
  padding: 10px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.section-block {
  margin-top: 36px;
}

.hero {
  background: linear-gradient(135deg, #1a1410 0%, #2d2018 55%, #3d2515 100%);
  border-radius: var(--radius2);
  padding: clamp(32px, 8vw, 64px);
  margin-top: 28px;
  min-height: 400px;
  display: grid;
  grid-template-columns: 1fr 0.55fr;
  gap: 24px;
  align-items: center;
}

.hero-tag {
  color: var(--accent);
  border: 1px solid rgba(200, 149, 108, 0.3);
  background: rgba(200, 149, 108, 0.14);
  width: fit-content;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  margin-bottom: 18px;
}

.hero h1 {
  font-family: var(--font-display);
  color: #fff;
  font-size: clamp(40px, 8vw, 70px);
  font-weight: 300;
  line-height: 1.05;
  margin-bottom: 14px;
}

.hero h1 em {
  color: var(--accent);
  font-style: italic;
}

.hero p {
  color: rgba(255, 255, 255, 0.68);
  max-width: 460px;
}

.hero-buttons {
  margin-top: 24px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-outline {
  border-radius: var(--radius);
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  border: none;
  background: var(--accent);
  color: #fff;
  padding: 12px 22px;
  font-weight: 600;
}

.btn-primary:hover {
  background: var(--accent2);
}

.btn-outline {
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 11px 20px;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hero-image {
  color: rgba(255, 255, 255, 0.14);
  font-size: clamp(90px, 14vw, 180px);
  text-align: center;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 18px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.category-card {
  border: 1px solid var(--border);
  border-radius: var(--radius2);
  background: var(--bg3);
  min-height: 150px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.category-card:hover {
  transform: translateY(-3px);
}

.category-card .emoji {
  font-size: 44px;
}

.category-card p {
  color: var(--text2);
  font-size: 14px;
}

.products-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  align-items: start;
}

.products-main {
  min-width: 0;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text2);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
}

.featured-section { margin-top: 18px }
.featured-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px }
.featured-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; cursor: pointer; display:flex; flex-direction:column }
.featured-media { height: 160px; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg,#fff,#fafafa) }
.featured-media img { width:100%; height:100%; object-fit:cover }
.featured-meta { padding: 12px }
.featured-meta h3 { margin: 0 0 6px 0; font-size: 16px }
.featured-meta .price { color: var(--accent); font-weight:700 }

@media (max-width: 700px) {
  .featured-media { height: 140px }
}

.tab-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 14px;
}

.product-card {
  border: 1px solid var(--border);
  border-radius: var(--radius2);
  background: var(--bg3);
  overflow: hidden;
}

.product-media {
  aspect-ratio: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-emoji {
  font-size: 62px;
}

.product-badge {
  position: absolute;
  left: 10px;
  top: 10px;
  background: var(--accent);
  color: #fff;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 10px;
  font-weight: 600;
}

.product-actions {
  position: absolute;
  right: 10px;
  top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
}

.product-info {
  padding: 14px;
}

.product-brand {
  font-size: 10px;
  letter-spacing: 1.2px;
  color: var(--text3);
  text-transform: uppercase;
}

.product-info h3 {
  font-size: 15px;
  font-weight: 500;
  margin: 4px 0 6px;
}

.rating {
  font-size: 12px;
  color: var(--text3);
}

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
}

.price {
  color: var(--accent2);
  font-size: 17px;
  font-weight: 600;
}

.old-price {
  color: var(--text3);
  text-decoration: line-through;
  font-size: 12px;
}

.empty {
  border: 1px dashed var(--border);
  padding: 24px;
  border-radius: var(--radius);
  color: var(--text3);
}

.modiwear-cta {
  margin-top: 36px;
  margin-bottom: 24px;
  border-radius: var(--radius2);
  background: linear-gradient(135deg, #1a0a2e, #3d1b6e, #1a0a2e);
  color: #fff;
  padding: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.modiwear-cta h2 {
  font-family: var(--font-display);
  font-size: clamp(30px, 5vw, 46px);
  font-weight: 300;
  margin-bottom: 6px;
}

.modiwear-cta h2 em {
  color: #c39bd3;
  font-style: italic;
}

.modiwear-cta p {
  color: rgba(255, 255, 255, 0.7);
}

.chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(180, 100, 220, 0.2);
  border: 1px solid rgba(180, 100, 220, 0.3);
  color: #d8b6e4;
  margin-bottom: 8px;
}

@media (max-width: 1100px) {
  .products-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-image {
    display: none;
  }

  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .modiwear-cta {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
