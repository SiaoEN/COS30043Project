const AUTH_KEY = 'authUser'
const LEGACY_AUTH_KEY = 'user'
const FAVORITES_KEY_PREFIX = 'favorites:'
const LEGACY_FAVORITES_KEY = 'favorites'

const emitAuthChange = () => {
  window.dispatchEvent(new Event('authchange'))
}

export const getAuthUser = () => {
  const storedUser = localStorage.getItem(AUTH_KEY) || localStorage.getItem(LEGACY_AUTH_KEY)
  return storedUser ? JSON.parse(storedUser) : null
}

export const setAuthUser = (user, token) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ ...user, token }))
  localStorage.removeItem(LEGACY_AUTH_KEY)
  emitAuthChange()
}

export const clearAuthUser = () => {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(LEGACY_AUTH_KEY)
  emitAuthChange()
}

export const isLoggedIn = () => Boolean(getAuthUser())

export const isRegisteredBuyer = () => {
  const user = getAuthUser()
  return user && user.role === 'user'
}

export const isAdmin = () => {
  const user = getAuthUser()
  return user && user.role === 'admin'
}

export const canAccessModiWear = () => {
  const user = getAuthUser()
  return user && (user.role === 'user' || user.role === 'admin')
}

export const getFavoritesKey = (user = getAuthUser()) => {
  const identifier = user?.email?.trim().toLowerCase()
  return identifier ? `${FAVORITES_KEY_PREFIX}${identifier}` : LEGACY_FAVORITES_KEY
}

export const getFavorites = (user = getAuthUser()) => {
  if (!user) return []

  const userKey = getFavoritesKey(user)
  const storedFavorites = localStorage.getItem(userKey)
  if (storedFavorites) return JSON.parse(storedFavorites)

  const legacyFavorites = localStorage.getItem(LEGACY_FAVORITES_KEY)
  if (legacyFavorites) {
    const parsedFavorites = JSON.parse(legacyFavorites)
    localStorage.setItem(userKey, JSON.stringify(parsedFavorites))
    localStorage.removeItem(LEGACY_FAVORITES_KEY)
    return parsedFavorites
  }

  return []
}

export const setFavorites = (favorites, user = getAuthUser()) => {
  if (!user) return
  localStorage.setItem(getFavoritesKey(user), JSON.stringify(favorites))
}
