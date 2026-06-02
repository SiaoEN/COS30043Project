<template>
  <div class="admin-product-page page-shell">
    <section class="admin-hero">
      <div>
        <p class="eyebrow">Admin Studio</p>
        <h1>Edit Product</h1>
        <p>Update catalog items, replace photos, or adjust sizes and pricing.</p>
      </div>
      <div class="admin-chip">{{ currentUser?.name || 'Admin' }}</div>
    </section>

    <section class="admin-form-grid">
      <form class="admin-form" @submit.prevent="submitProduct">
        <div class="field-row">
          <label class="form-field">
            <span class="label-title">Product Name</span>
            <input class="input" v-model.trim="form.name" type="text" placeholder="e.g. Satin Midi Dress" required />
          </label>

          <label class="form-field">
            <span class="label-title">Category</span>
            <select class="input" v-model="form.category" required>
              <option>Clothes</option>
              <option>Accessories</option>
              <option>Press-on Nails</option>
            </select>
          </label>
        </div>

        <div class="field-row">
          <label class="form-field">
            <span class="label-title">Price (RM)</span>
            <input class="input" v-model.number="form.price" type="number" min="0" step="0.01" required />
          </label>

          <label class="form-field">
            <span class="label-title">Original Price (RM)</span>
            <input class="input" v-model.number="form.originalPrice" type="number" min="0" step="0.01" placeholder="Optional" />
          </label>
        </div>

        <label class="form-field full-width">
          <span class="label-title">Description</span>
          <textarea class="input textarea" v-model.trim="form.description" rows="4" placeholder="Short product description"></textarea>
        </label>

        <div class="field-row">
          <label class="form-field">
            <span class="label-title">Sizes</span>
            <div class="size-grid">
              <label v-for="size in sizeOptions" :key="size" class="size-pill">
                <input v-model="form.sizes" type="checkbox" :value="size" />
                <span>{{ size }}</span>
              </label>
            </div>
          </label>

          <label class="form-field">
            <span class="label-title">Featured</span>
            <div class="toggle-row">
              <input v-model="form.featured" type="checkbox" />
              <span>Show as featured product</span>
            </div>
          </label>
        </div>

        <label class="form-field">
          <span class="label-title">Product Photos</span>
          <div class="file-input">
            <input class="file-input-control" type="file" accept="image/*" multiple @change="handleFileChange" />
            <div class="file-hint">Select one or more images to upload (optional)</div>
          </div>
        </label>

        <div class="existing-images" v-if="existingImages.length">
          <h4>Existing images</h4>
          <div class="image-grid">
            <div v-for="(img, idx) in existingImages" :key="img" class="image-thumb existing">
              <img :src="img" :alt="`Image ${idx + 1}`" />
            </div>
          </div>
        </div>

        <div v-if="imagePreviews.length" class="image-preview-grid">
          <div v-for="(preview, index) in imagePreviews" :key="preview" class="image-preview">
            <img :src="preview" :alt="`Preview ${index + 1}`" />
            <button type="button" class="remove-btn" @click="removePreview(index)" aria-label="Remove preview">✕</button>
          </div>
        </div>

        <div class="actions">
          <button class="submit-btn" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
          <button type="button" class="delete-btn" @click="confirmDelete" :disabled="isDeleting">
            {{ isDeleting ? 'Deleting...' : 'Delete Product' }}
          </button>
          <p v-if="message" class="message" :class="messageType">{{ message }}</p>
        </div>
      </form>

      <aside class="tips-card">
        <h2>Edit notes</h2>
        <ul>
          <li>Upload new photos to replace the product images; leave empty to keep existing.</li>
          <li>Sizes are saved as an array; check the sizes you want to enable.</li>
        </ul>
      </aside>
    </section>
  </div>
</template>

<script>
import { apiBaseUrl } from '../utils/api.js'
import { getAuthUser } from '../utils/auth.js'

export default {
  name: 'AdminProductEdit',
  data() {
    return {
      currentUser: getAuthUser(),
      isSaving: false,
      isDeleting: false,
      message: '',
      messageType: 'success',
      imagePreviews: [],
      imageFiles: [],
      existingImages: [],
      sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      form: {
        name: '',
        category: 'Clothes',
        price: '',
        originalPrice: '',
        description: '',
        sizes: [],
        featured: false
      }
    }
  },
  methods: {
    confirmDelete() {
      if (!confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) return
      this.deleteProduct()
    },

    async deleteProduct() {
      this.isDeleting = true
      this.message = ''
      try {
        const auth = getAuthUser()
        if (!auth?.token) throw new Error('Admin session missing')

        const res = await fetch(`${apiBaseUrl}/products/${this.$route.params.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${auth.token}` }
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Failed to delete product')

        this.messageType = 'success'
        this.message = 'Product deleted'
        // redirect to home after deletion
        setTimeout(() => this.$router.push({ name: 'Home' }), 700)
      } catch (err) {
        console.error(err)
        this.messageType = 'error'
        this.message = err.message || 'Delete failed'
      } finally {
        this.isDeleting = false
      }
    },
    removePreview(index) {
      if (index < 0 || index >= this.imagePreviews.length) return
      // revoke URL
      URL.revokeObjectURL(this.imagePreviews[index])
      this.imagePreviews.splice(index, 1)
      this.imageFiles.splice(index, 1)
    },
    handleFileChange(event) {
      const files = Array.from(event.target.files || [])
      this.imageFiles = files
      this.imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      this.imagePreviews = files.map((file) => URL.createObjectURL(file))
    },
    async loadProduct() {
      try {
        const res = await fetch(`${apiBaseUrl}/products/${this.$route.params.id}`)
        if (!res.ok) throw new Error('Failed to load product')
        const data = await res.json()
        this.form.name = data.name || ''
        this.form.category = data.category || 'Clothes'
        this.form.price = data.price || ''
        this.form.originalPrice = data.originalPrice || ''
        this.form.description = data.description || ''
        this.form.sizes = Array.isArray(data.sizes) ? data.sizes : []
        this.form.featured = Boolean(data.featured)
        //this.existingImages = Array.isArray(data.images) && data.images.length ? data.images : (data.image ? [data.image] : [])
        this.existingImages = []
        if (data.imageFilename) {
          this.existingImages.push(`${apiBaseUrl}/products/image/${data.imageFilename}`)
        }
        if (Array.isArray(data.imageFilenames)) {
          this.existingImages.push(...data.imageFilenames.map(fn => `${apiBaseUrl}/products/image/${fn}`))
        }
      } catch (err) {
        console.error(err)
        this.messageType = 'error'
        this.message = err.message || 'Error loading product'
      }
    },
    async submitProduct() {
      this.isSaving = true
      this.message = ''
      try {
        const auth = getAuthUser()
        if (!auth?.token) throw new Error('Admin session missing')

        const payload = new FormData()
        payload.append('name', this.form.name)
        payload.append('category', this.form.category)
        payload.append('price', String(this.form.price))
        payload.append('originalPrice', this.form.originalPrice === '' ? '' : String(this.form.originalPrice))
        payload.append('description', this.form.description)
        payload.append('featured', String(this.form.featured))
        payload.append('sizes', JSON.stringify(this.form.sizes))
        this.imageFiles.forEach((f) => payload.append('images', f))

        const res = await fetch(`${apiBaseUrl}/products/${this.$route.params.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${auth.token}` },
          body: payload
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Failed to save product')

        this.messageType = 'success'
        this.message = 'Product updated'
        this.imageFiles = []
        this.imagePreviews.forEach((u) => URL.revokeObjectURL(u))
        this.imagePreviews = []
        await this.loadProduct()
      } catch (err) {
        console.error(err)
        this.messageType = 'error'
        this.message = err.message || 'Save failed'
      } finally {
        this.isSaving = false
      }
    }
  },
  mounted() {
    this.loadProduct()
  },
  beforeUnmount() {
    this.imagePreviews.forEach((u) => URL.revokeObjectURL(u))
  }
}
</script>

<style scoped>
/* reuse styles from AdminProductCreate */
.admin-product-page { max-width: 1100px; margin: 0 auto; padding: calc(var(--header-height) + 28px) 20px 40px }
.admin-form-grid { display: grid; grid-template-columns: 1fr 360px; gap: 28px; margin-top: 20px }
.admin-form, .tips-card { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius2); padding: 22px }
.admin-hero { display:flex; justify-content:space-between; align-items:flex-start; gap:12px }
.admin-hero .eyebrow { color:var(--text3); font-weight:700; margin:0 0 6px 0 }
.admin-chip { background:var(--bg2); padding:8px 12px; border-radius:999px; color:var(--text2); font-weight:600 }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px }
.form-field { display:block }
.label-title { display:block; font-size:13px; color:var(--text3); margin-bottom:8px; font-weight:700 }
.input { width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:transparent; color:var(--text) }
.textarea { min-height:100px; resize:vertical }
.full-width { grid-column: 1 / -1 }
.size-grid { display:flex; gap:8px; flex-wrap:wrap }
.size-pill { display:inline-flex; align-items:center; gap:8px; border:1px solid var(--border); padding:6px 8px; border-radius:999px; cursor:pointer; background:transparent }
.size-pill input { width:16px; height:16px }
.toggle-row { display:flex; align-items:center; gap:10px }
.file-input { display:flex; flex-direction:column; gap:8px }
.file-input-control { border:1px dashed var(--border); padding:14px; border-radius:10px; cursor:pointer; background:transparent }
.file-hint { font-size:12px; color:var(--text3) }
.existing-images h4 { margin: 0 0 8px 0 }
.image-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:10px }
.image-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px }
.image-preview img, .image-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius:8px }
.image-thumb { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; position:relative }
.image-thumb.existing { box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02) }
.image-preview { position:relative }
.remove-btn { position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.6); color:#fff; border:none; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer }
.actions { display:flex; align-items:center; gap:12px; margin-top:14px }
.submit-btn { border: none; border-radius: 999px; padding: 12px 20px; background: var(--accent); color: #fff; font-weight: 700; cursor: pointer }
.message { margin:0 }
.message.success { color: var(--accent) }
.message.error { color: #b24a4a }

.delete-btn { background: #fff; border: 1px solid #e1a1a1; color: #b24a4a; padding: 10px 14px; border-radius: 8px; cursor: pointer }
.delete-btn:disabled { opacity: 0.6; cursor: default }

@media (max-width: 900px) {
  .admin-form-grid { grid-template-columns: 1fr; }
  .field-row { grid-template-columns: 1fr }
}
</style>