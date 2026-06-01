<template>
  <header class="header">
    <div class="container header-row">
      <router-link to="/" class="header-logo" aria-label="ShayneStyles home">
        <img src="../assets/images/ShayneStyles-Logo.png" alt="ShayneStyles" class="logo-mark" />
        <span class="logo-text">Shayne<span>Styles</span></span>
      </router-link>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          @keyup.enter="handleSearch"
        />
      </div>

      <nav class="header-nav">
        <router-link to="/" class="nav-link" active-class="active">Home</router-link>
        <router-link to="/modiwear" class="nav-link" active-class="active">ModiWear</router-link>
        <router-link v-if="isAdminUser()" to="/admin/products/new" class="nav-link" active-class="active">Admin Products</router-link>
        <router-link v-if="isAdminUser()" to="/admin/orders" class="nav-link" active-class="active">Admin Orders</router-link>
        <router-link v-if="!isAdminUser()" to="/favorites" class="nav-link" active-class="active">Favorites</router-link>
      </nav>

      <div class="header-icons">
        <button v-if="!isAdminUser()" class="icon-btn" @click="goCart" title="Cart" aria-label="Open cart">
          🛒
          <span class="badge" v-if="cartCount > 0">{{ cartCount }}</span>
        </button>
        <div class="profile-menu-wrap" ref="profileMenuWrap">
          <button class="icon-btn" @click="toggleProfileMenu" title="Profile" aria-label="Open profile menu">👤</button>

          <div class="profile-dropdown" v-if="showProfileMenu">
            <div v-if="currentUser" class="signed-in-as">Signed in as: {{ currentUser.email }}</div>
            <template v-if="currentUser">
              <router-link v-if="!isAdminUser()" to="/order-history" class="dropdown-item">My Orders</router-link>
              <button class="dropdown-item logout-btn" @click="logout">Logout</button>
            </template>
            <template v-else>
              <router-link to="/login" class="dropdown-item">Login</router-link>
              <router-link to="/register" class="dropdown-item">Register</router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { clearAuthUser, getAuthUser, isAdmin, isRegisteredBuyer } from '../utils/auth.js'
import { getCartCount } from '../utils/cart.js'

export default {
  name: 'Header',
  data() {
    return {
      searchQuery: '',
      showProfileMenu: false,
      cartCount: 0,
      currentUser: getAuthUser(),
      _onStorage: null,
      _onCartChange: null
    }
  },
  methods: {
    isAdmin,
    isAdminUser() {
      return this.currentUser?.role === 'admin'
    },
    isRegisteredUser() {
      return this.currentUser?.role === 'user'
    },
    handleSearch() {
      this.$router.push({
        name: 'Home',
        query: { search: this.searchQuery }
      })
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu
    },
    updateCurrentUser() {
      this.currentUser = getAuthUser()
    },
    goCart() {
      this.$router.push('/cart')
    },
    logout() {
      clearAuthUser()
      this.showProfileMenu = false
      this.currentUser = null
      this.updateCartCount()
      this.$router.push('/login')
    },
    updateCartCount() {
      this.cartCount = getCartCount()
    },
    handleDocumentClick(event) {
      const menuWrap = this.$refs.profileMenuWrap
      if (this.showProfileMenu && menuWrap && !menuWrap.contains(event.target)) {
        this.showProfileMenu = false
      }
    }
  },
  mounted() {
    this.updateCartCount()
    this._onStorage = (e) => {
      this.updateCartCount()
      // update currentUser if auth changed in another tab
      this.updateCurrentUser()
    }
    this._onCartChange = () => {
      this.updateCartCount()
    }
    window.addEventListener('storage', this._onStorage)
    window.addEventListener('cartchange', this._onCartChange)
    window.addEventListener('authchange', this.updateCurrentUser)
    window.addEventListener('authchange', this.updateCartCount)
    document.addEventListener('mousedown', this.handleDocumentClick)
  },
  beforeUnmount() {
    if (this._onStorage) window.removeEventListener('storage', this._onStorage)
    if (this._onCartChange) window.removeEventListener('cartchange', this._onCartChange)
    window.removeEventListener('authchange', this.updateCurrentUser)
    window.removeEventListener('authchange', this.updateCartCount)
    document.removeEventListener('mousedown', this.handleDocumentClick)
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  height: var(--header-height);
  background: rgba(250, 248, 245, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.header-row {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-mark {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  background: #fff;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 22px;
  letter-spacing: 0.4px;
  color: var(--text);
}

.logo-text span {
  color: var(--accent);
  font-style: italic;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 360px;
  margin-left: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 14px;
  background: var(--bg2);
}

.search-icon {
  color: var(--text3);
}

.search-bar input {
  width: 100%;
  padding: 10px 0;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text);
}

.search-bar input::placeholder {
  color: var(--text3);
}

.header-nav {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-left: auto;
}

.nav-link,
.icon-btn {
  color: var(--text2);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-link {
  font-size: 13px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: var(--radius);
}

.nav-link:hover {
  background: var(--bg2);
  color: var(--text);
}

.nav-link.active {
  color: var(--accent);
  background: rgba(200, 149, 108, 0.08);
}

.header-icons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.profile-menu-wrap {
  position: relative;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  position: absolute;
  position: relative;
}

.icon-btn:hover {
  background: var(--bg2);
  color: var(--text);
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border-radius: 50%;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg3);
  color: var(--text);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 15px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text2);
  text-decoration: none;
  transition: background 0.2s;
  font-size: 14px;
}

.signed-in-as {
  padding: 12px 15px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text3);
  border-bottom: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.02);
}

.dropdown-item:hover {
  background: var(--bg2);
  color: var(--text);
}

.logout-btn {
  color: #b24a4a;
}

@media (max-width: 768px) {
  .header-nav {
    display: none;
  }

  .search-bar {
    max-width: none;
  }

  .logo-text {
    display: none;
  }
}
</style>
