import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import ModiWear from '../pages/ModiWear.vue'
import Cart from '../pages/Cart.vue'
import Favorites from '../pages/Favorites.vue'
import OrderHistory from '../pages/OrderHistory.vue'
import ProductDetail from '../pages/ProductDetail.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import AdminProductCreate from '../pages/AdminProductCreate.vue'
import AdminOrders from '../pages/AdminOrders.vue'
import AdminProductEdit from '../pages/AdminProductEdit.vue'
import Checkout from '../pages/Checkout.vue'
import OrderDetails from '../pages/OrderDetails.vue'
import { canAccessModiWear, isAdmin } from '../utils/auth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/modiwear',
    name: 'ModiWear',
    component: ModiWear,
    meta: { requiresModiWearAccess: true }
  },
  {
    path: '/admin/products/new',
    name: 'AdminProductCreate',
    component: AdminProductCreate,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/products/:id/edit',
    name: 'AdminProductEdit',
    component: AdminProductEdit,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: AdminOrders,
    meta: { requiresAdmin: true }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { requiresBuyer: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: { requiresBuyer: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { requiresBuyer: true }
  },
  {
    path: '/order-history',
    name: 'OrderHistory',
    component: OrderHistory,
    meta: { requiresBuyer: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetails',
    component: OrderDetails
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !isAdmin()) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath }
    }
  }

  if (to.meta.requiresModiWearAccess && !canAccessModiWear()) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath }
    }
  }
})

export default router
