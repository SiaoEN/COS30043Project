import { getAuthUser } from './auth.js'

const CART_KEY_PREFIX = 'cart:'
const LEGACY_CART_KEY = 'cart'

export const getCartKey = (user = getAuthUser()) => {
  const identifier = user?.email?.trim().toLowerCase()
  return identifier ? `${CART_KEY_PREFIX}${identifier}` : LEGACY_CART_KEY
}

export const getCart = (user = getAuthUser()) => {
  if (!user) return []

  const userKey = getCartKey(user)
  const storedCart = localStorage.getItem(userKey)
  if (storedCart) return JSON.parse(storedCart)

  const legacyCart = localStorage.getItem(LEGACY_CART_KEY)
  if (legacyCart) {
    const parsedCart = JSON.parse(legacyCart)
    localStorage.setItem(userKey, JSON.stringify(parsedCart))
    localStorage.removeItem(LEGACY_CART_KEY)
    return parsedCart
  }

  return []
}

export const setCart = (cart, user = getAuthUser()) => {
  if (!user) return

  localStorage.setItem(getCartKey(user), JSON.stringify(cart))
}

export const clearCart = (user = getAuthUser()) => {
  if (!user) return

  localStorage.removeItem(getCartKey(user))
}

export const getCartCount = (user = getAuthUser()) => getCart(user).length

export const addCartItem = (item, user = getAuthUser()) => {
  if (!user) return []

  const cart = getCart(user)
  const existingItem = cart.find((cartItem) => cartItem.id === item.id)

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1)
  } else {
    cart.push({ ...item })
  }

  setCart(cart, user)
  return cart
}