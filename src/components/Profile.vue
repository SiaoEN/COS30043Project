<template>
  <div class="profile-section">
    <div class="profile-header">
      <img :src="user.avatar" :alt="user.name" class="profile-avatar" />
      <div class="profile-info">
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
        <p class="member-since">Member since {{ user.memberSince }}</p>
      </div>
      <button class="edit-profile-btn" @click="editProfile">Edit Profile</button>
    </div>

    <div class="profile-stats">
      <div class="stat">
        <span class="stat-number">{{ user.totalOrders }}</span>
        <span class="stat-label">Orders</span>
      </div>
      <div class="stat">
        <span class="stat-number">{{ user.totalSpent }}</span>
        <span class="stat-label">Total Spent</span>
      </div>
      <div class="stat">
        <span class="stat-number">{{ user.loyaltyPoints }}</span>
        <span class="stat-label">Loyalty Points</span>
      </div>
      <div class="stat">
        <span class="stat-number">{{ user.favoritesCount }}</span>
        <span class="stat-label">Favorites</span>
      </div>
    </div>

    <div class="profile-actions">
      <router-link to="/order-history" class="action-btn">
        📋 View Order History
      </router-link>
      <router-link to="/favorites" class="action-btn">
        ❤️ My Favorites
      </router-link>
      <router-link to="/cart" class="action-btn">
        🛒 Shopping Cart
      </router-link>
      <button class="action-btn logout-btn" @click="handleLogout">
        🚪 Logout
      </button>
    </div>
  </div>
</template>

<script>
import { clearAuthUser } from '../utils/auth.js'

export default {
  name: 'Profile',
  data() {
    return {
      user: {
        name: 'Guest User',
        email: 'guest@shaynestyles.com',
        avatar: 'https://via.placeholder.com/100',
        memberSince: 'January 2024',
        totalOrders: 0,
        totalSpent: '$0',
        loyaltyPoints: 0,
        favoritesCount: 0
      }
    }
  },
  methods: {
    editProfile() {
      this.$router.push('/profile/edit')
    },
    handleLogout() {
      clearAuthUser()
      this.$router.push('/login')
    }
  },
  mounted() {
    const userData = localStorage.getItem('user')
    if (userData) {
      this.user = JSON.parse(userData)
    }
  }
}
</script>

<style scoped>
.profile-section {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #667eea;
}

.profile-info {
  flex: 1;
}

.profile-info h3 {
  margin: 0 0 5px 0;
  font-size: 20px;
  color: #333;
}

.profile-info p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.member-since {
  color: #999;
  font-size: 12px !important;
}

.edit-profile-btn {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
  white-space: nowrap;
}

.edit-profile-btn:hover {
  background: #764ba2;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}

.profile-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.action-btn {
  padding: 12px 20px;
  background: #f0f0f0;
  color: #333;
  border: 2px solid #ddd;
  border-radius: 5px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  transition: 0.3s;
  cursor: pointer;
  font-size: 14px;
}

.action-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.logout-btn {
  border: none;
  background: #ff3838;
  color: white;
}

.logout-btn:hover {
  background: #cc0000;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-section {
    padding: 20px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .profile-actions {
    grid-template-columns: 1fr;
  }
}
</style>
