<template>
  <div class="register-page page-shell">
    <div class="register-container">
      <h1>Register</h1>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" v-model="fullName" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" required />
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" v-model="confirmPassword" required />
        </div>
        <button type="submit" class="register-btn">Register</button>
      </form>
      <p>Already have an account? <router-link to="/login">Login here</router-link></p>
    </div>
  </div>
</template>

<script>
import { apiRequest } from '../utils/api.js'
import { setAuthUser } from '../utils/auth.js'

export default {
  name: 'Register',
  data() {
    return {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: ''
    }
  },
  methods: {
    async handleRegister() {
      this.errorMessage = ''

      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match!'
        return
      }

      try {
        const response = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: this.fullName,
            email: this.email,
            password: this.password
          })
        })

        setAuthUser(response.user, response.token)
        this.$router.push('/')
      } catch (error) {
        this.errorMessage = error.message
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: calc(var(--header-height) + 24px) 20px 20px;
}

.register-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-container h1 {
  text-align: center;
  margin-bottom: 30px;
}

.error-message {
  margin-bottom: 16px;
  color: #b24a4a;
  background: #fdf1f1;
  border: 1px solid #f3c8c8;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-group label {
  font-weight: 600;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
}

.register-container p {
  text-align: center;
  margin-top: 20px;
}

.register-container a {
  color: #667eea;
  text-decoration: none;
}
</style>
