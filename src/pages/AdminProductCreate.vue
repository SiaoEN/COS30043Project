<template>
  <div class="admin-product-page page-shell">
    <section class="admin-hero">
      <div>
        <p class="eyebrow">Admin Studio</p>
        <h1>Add a New Product</h1>
        <p>Create catalog items, upload a photo, and set pricing in RM.</p>
      </div>
      <div class="admin-chip">{{ currentUser?.name || 'Admin' }}</div>
    </section>

    <section class="admin-form-grid">
      <form class="admin-form" @submit.prevent="submitProduct">
        <div class="field-row">
          <label>
            Product Name
            <input v-model.trim="form.name" type="text" placeholder="e.g. Satin Midi Dress" required />
          </label>

          <label>
            Category
            <select v-model="form.category" required>
              <option>Clothes</option>
              <option>Accessories</option>
              <option>Press-on Nails</option>
            </select>
          </label>
        </div>

        <div class="field-row">
          <label>
            Price (RM)
            <input v-model.number="form.price" type="number" min="0" step="0.01" required />
          </label>

          <label>
            Original Price (RM)
            <input v-model.number="form.originalPrice" type="number" min="0" step="0.01" placeholder="Optional" />
          </label>
        </div>

        <label>
          Description
          <textarea v-model.trim="form.description" rows="4" placeholder="Short product description"></textarea>
        </label>

        <div class="field-row">
          <label>
            Sizes
            <div class="size-grid">
              <label v-for="size in sizeOptions" :key="size" class="size-pill">
                <input v-model="form.sizes" type="checkbox" :value="size" />
                <span>{{ size }}</span>
              </label>
            </div>
          </label>

          <label>
            Featured
            <div class="toggle-row">
              <input v-model="form.featured" type="checkbox" />
              <span>Show as featured product</span>
            </div>
          </label>
        </div>

        <label>
          Product Photos
          <input type="file" accept="image/*" multiple @change="handleFileChange" />
        </label>

        <div v-if="imagePreviews.length" class="image-preview-grid">
          <div v-for="(preview, index) in imagePreviews" :key="preview" class="image-preview">
            <img :src="preview" :alt="`Preview ${index + 1}`" />
          </div>
        </div>

        <div class="actions">
          <button class="submit-btn" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Product' }}
          </button>
          <p v-if="message" class="message" :class="messageType">{{ message }}</p>
        </div>
      </form>

      <aside class="tips-card">
        <h2>What gets saved</h2>
        <ul>
          <li>Name, category, description</li>
          <li>Price and optional original price</li>
          <li>Sizes, featured flag and photo upload</li>
        </ul>
      </aside>
    </section>
  </div>
</template>

<script>
import { apiBaseUrl } from '../utils/api.js'
import { getAuthUser } from '../utils/auth.js'

export default {
  name: 'AdminProductCreate',
  data() {
    return {
      currentUser: getAuthUser(),
      isSaving: false,
      message: '',
      messageType: 'success',
      imagePreviews: [],
      imageFiles: [],
      sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      form: {
        name: '',
        category: 'Clothes',
        price: '',
        originalPrice: '',
        description: '',
        sizes: ['S', 'M', 'L'],
        featured: false
      }
    }
  },
  methods: {
    handleFileChange(event) {
      const files = Array.from(event.target.files || [])

      this.imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      this.imageFiles = files
      this.imagePreviews = files.map((file) => URL.createObjectURL(file))
    },
    async submitProduct() {
      this.isSaving = true
      this.message = ''

      try {
        const authUser = getAuthUser()
        const token = authUser?.token

        if (!token) {
          throw new Error('Admin session not found. Please log in again.')
        }

        const payload = new FormData()
        payload.append('name', this.form.name)
        payload.append('category', this.form.category)
        payload.append('price', String(this.form.price))
        payload.append('originalPrice', this.form.originalPrice === '' ? '' : String(this.form.originalPrice))
        payload.append('description', this.form.description)
        payload.append('featured', String(this.form.featured))
        payload.append('sizes', JSON.stringify(this.form.sizes))
        this.imageFiles.forEach((file) => payload.append('images', file))

        const response = await fetch(`${apiBaseUrl}/products`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: payload
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data.message || 'Failed to save product')
        }

        this.messageType = 'success'
        this.message = `Product saved: ${data.name}`
        this.form.name = ''
        this.form.price = ''
        this.form.originalPrice = ''
        this.form.description = ''
        this.form.sizes = ['S', 'M', 'L']
        this.form.featured = false
        this.imageFiles = []
        this.imagePreviews.forEach((url) => URL.revokeObjectURL(url))
        this.imagePreviews = []
      } catch (error) {
        this.messageType = 'error'
        this.message = error.message
      } finally {
        this.isSaving = false
      }
    }
  },
  beforeUnmount() {
    this.imagePreviews.forEach((url) => URL.revokeObjectURL(url))
  }
}
</script>

<style scoped>
.admin-product-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: calc(var(--header-height) + 28px) 20px 40px;
}

.admin-hero {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  padding: 28px;
  border-radius: var(--radius2);
  background: linear-gradient(135deg, #1f1a17, #3a2418 60%, #c8956c);
  color: #fff;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);
}

.eyebrow {
  margin: 0 0 10px 0;
  color: #f2d3ba;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
}

.admin-hero h1 {
  margin: 0 0 10px 0;
  font-family: var(--font-display);
  font-size: clamp(30px, 4vw, 46px);
}

.admin-hero p {
  margin: 0;
  max-width: 620px;
  color: rgba(255, 255, 255, 0.82);
}

.admin-chip {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 600;
}

.admin-form-grid {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 24px;
  margin-top: 24px;
}

.admin-form,
.tips-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius2);
  padding: 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.05);
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text2);
  font-size: 14px;
}

input[type='text'],
input[type='number'],
input[type='file'],
select,
textarea {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  font: inherit;
  background: #fff;
  color: var(--text);
}

textarea {
  resize: vertical;
}

.size-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.size-pill {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #fff;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 2px;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.image-preview {
  border-radius: var(--radius2);
  overflow: hidden;
  border: 1px solid var(--border);
}

.image-preview img {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.submit-btn {
  border: none;
  border-radius: 999px;
  padding: 13px 20px;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.message {
  margin: 0;
  font-size: 14px;
}

.message.success {
  color: #2d7b48;
}

.message.error {
  color: #b24a4a;
}

.tips-card h2 {
  margin-top: 0;
  font-family: var(--font-display);
}

.tips-card ul {
  padding-left: 18px;
  color: var(--text2);
}

.tips-card li + li {
  margin-top: 8px;
}

@media (max-width: 920px) {
  .admin-form-grid,
  .field-row {
    grid-template-columns: 1fr;
  }

  .admin-hero {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
