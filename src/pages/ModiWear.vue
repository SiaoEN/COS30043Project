<template>
  <div class="modiwear-page page-shell">
    <section class="page-header">
      <div class="page-header-brand">
        <img src="../assets/images/ModiWear-Logo.png" alt="ModiWear" class="page-header-logo" />
      </div>
      <div class="page-header-copy">
        <h1>ModiWear - Custom Design Studio</h1>
        <p>Create your own unique clothing and accessories</p>
      </div>
    </section>
    <div class="modiwear-container">
      <div class="design-section">
        <div class="canvas-area">
          <h2>Design Preview</h2>
          <p class="preview-hint">Drag the text or PNG to move it. Use the handles to rotate or resize it.</p>
          <div class="preview-box">
            <div
              ref="previewStage"
              class="garment-preview"
              @pointermove="handlePreviewPointerMove"
              @pointerup="endPreviewInteraction"
              @pointerleave="endPreviewInteraction"
            >
              <img :src="previewImageUrl" :alt="`${productType} preview`" class="garment-image" />
              <div
                v-if="uploadedPngDataUrl"
                class="garment-png-wrap"
                :class="{ selected: isPngSelected }"
                :style="previewPngWrapperStyle"
                @pointerdown.stop="startPngDrag"
              >
                <button
                  v-if="isPngSelected"
                  type="button"
                  class="rotate-handle png-rotate-handle"
                  @pointerdown.stop="startPngRotate"
                  aria-label="Rotate PNG design"
                  title="Rotate PNG design"
                >
                  ⟳
                </button>
                <img :src="uploadedPngDataUrl" :alt="uploadedPngName || 'Uploaded PNG design'" class="garment-png" />
                <button
                  v-if="isPngSelected"
                  type="button"
                  class="resize-handle png-resize-handle"
                  @pointerdown.stop="startPngResize"
                  aria-label="Resize PNG design"
                  title="Resize PNG design"
                >
                  ↘
                </button>
              </div>
              <div
                class="garment-text-wrap"
                :class="{ selected: isTextSelected }"
                :style="previewTextWrapperStyle"
                @pointerdown.stop="startTextDrag"
              >
                <button
                  v-if="isTextSelected"
                  type="button"
                  class="rotate-handle"
                  @pointerdown.stop="startTextRotate"
                  aria-label="Rotate text"
                  title="Rotate text"
                >
                  ⟳
                </button>
                <p class="garment-text" :style="previewTextStyle">
                  {{ designText || 'Your Design Here' }}
                </p>
                <button
                  v-if="isTextSelected"
                  type="button"
                  class="resize-handle"
                  @pointerdown.stop="startTextResize"
                  aria-label="Resize text box"
                  title="Resize text box"
                >
                  ↘
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="controls-panel">
          <h3>Customize Your Design</h3>

          <div class="control-group">
            <label>Product Type</label>
            <select v-model="productType">
              <option>T-Shirt</option>
              <option>Hoodie</option>
              <option>Sweater</option>
            </select>
          </div>

          <div class="control-group">
            <label>Base Color</label>
            <div class="color-picker">
              <button
                v-for="color in colorOptions"
                :key="color"
                @click="selectedColor = color"
                :style="{ backgroundColor: color, borderColor: color === '#FFFFFF' ? '#ddd' : 'transparent' }"
                :class="{ selected: selectedColor === color }"
                class="color-option"
              ></button>
            </div>
          </div>

          <div class="control-group">
            <label>PNG Design</label>
            <input type="file" accept=".png,image/png" @change="handlePngUpload" />
            <p class="upload-hint">PNG only, max 5 MB.</p>
            <button v-if="uploadedPngDataUrl" type="button" class="remove-png-btn" @click="removePngDesign">Remove PNG</button>
          </div>

          <div class="control-group">
            <label>Add Text</label>
            <textarea
              v-model="designText"
              placeholder="Enter text for your design"
              rows="3"
            ></textarea>
          </div>

          <div class="control-group">
            <label>Text Color</label>
            <div class="color-picker">
              <button
                v-for="color in textColorOptions"
                :key="color"
                @click="textColor = color"
                :style="{ backgroundColor: color, borderColor: color === '#ffffff' ? '#ddd' : 'transparent' }"
                :class="{ selected: textColor === color }"
                class="color-option"
              ></button>
            </div>
          </div>

          <div class="control-group">
            <label>Text Size: {{ textSize }}px</label>
            <input v-model.number="textSize" type="number" min="12" max="48" step="1" />
          </div>

          <div class="control-group">
            <label>Font</label>
            <select v-model="textFontFamily">
              <option value="'Inter', sans-serif">Inter</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
              <option value="Impact, sans-serif">Impact</option>
            </select>
          </div>

          <div class="control-group">
            <label>Rotate Text: {{ textRotate }}°</label>
            <input v-model.number="textRotate" type="number" min="-180" max="180" step="1" />
          </div>

          <div class="control-group">
            <label>Size</label>
            <select v-model="selectedSize">
              <option>XS</option>
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
              <option>XXL</option>
            </select>
          </div>

          <div class="control-group">
            <label>Quantity</label>
            <input type="number" v-model.number="quantity" min="1" />
          </div>

          <div v-if="!isAdminUser" class="price-display">
            <span>Unit Price: {{ formatCurrency(customPrice) }}</span>
            <span>Total: {{ formatCurrency(customPrice * quantity) }}</span>
          </div>

          <div class="action-buttons">
            <button @click="addToCart" class="btn btn-primary">
              🛒 Add to Cart
            </button>
            <button @click="saveDesign" class="btn btn-secondary">
              {{ isAdminUser ? '📣 Publish Sample' : '💾 Save Design' }}
            </button>
            <button @click="resetDesign" class="btn btn-secondary">
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      <section class="templates-section">
        <h2>Text Style Templates</h2>
        <div class="templates-grid">
          <div
            v-for="template in templates"
            :key="template.id"
            @click="applyTemplate(template)"
            class="template-card"
          >
            <div class="template-preview template-text-preview" :style="templatePreviewStyle(template)">
              <span>{{ template.sample }}</span>
            </div>
            <p>{{ template.name }}</p>
          </div>
        </div>
      </section>

      <section v-if="!isAdminUser" class="templates-section">
        <h2>My Saved Designs</h2>
        <div v-if="savedDesigns.length" class="templates-grid">
          <div v-for="design in savedDesigns" :key="design.id" class="template-card saved-design-card">
            <div class="template-preview saved-design-preview">
              <img :src="getPreviewImage(design.productType, design.color)" :alt="design.name" />
              <div v-if="getDesignPngSrc(design)" class="saved-design-overlay" :style="getDesignPngStyle(design)">
                <img :src="getDesignPngSrc(design)" :alt="design.name" class="saved-design-overlay-image" />
              </div>
              <div v-if="design.text" class="saved-design-text" :style="getDesignTextStyle(design)">{{ design.text }}</div>
            </div>
            <p class="saved-design-meta">{{ design.name }}</p>
            <p class="saved-design-specs">{{ design.productType }} · {{ design.size }}</p>
            <div class="saved-design-actions">
              <button class="saved-design-btn" @click="loadSavedDesign(design)">Load</button>
              <button class="saved-design-btn danger" @click="deleteSavedDesign(design.id)">Delete</button>
            </div>
          </div>
        </div>
        <p v-else class="saved-design-empty">No saved designs yet. Save one from the editor to see it here.</p>
      </section>

      <section class="templates-section sample-design-section">
        <div class="section-header">
          <div>
            <h2>Sample Design</h2>
            <p class="section-subtitle">
              {{ isAdminUser ? 'Publish reference designs for users to browse and reuse.' : 'Browse admin-published sample designs for inspiration.' }}
            </p>
          </div>
        </div>
        <div v-if="sampleDesigns.length" class="templates-grid">
          <div v-for="design in sampleDesigns" :key="design.id" class="template-card saved-design-card">
            <div class="template-preview saved-design-preview">
              <img :src="getPreviewImage(design.productType, design.color)" :alt="design.name" />
              <div v-if="getDesignPngSrc(design)" class="saved-design-overlay" :style="getDesignPngStyle(design)">
                <img :src="getDesignPngSrc(design)" :alt="design.name" class="saved-design-overlay-image" />
              </div>
              <div v-if="design.text" class="saved-design-text" :style="getDesignTextStyle(design)">{{ design.text }}</div>
            </div>
            <p class="saved-design-meta">{{ design.name }}</p>
            <p class="saved-design-specs">{{ design.productType }} · {{ design.size }}<br />Sample design</p>
            <div class="saved-design-actions">
              <button class="saved-design-btn" @click="loadSavedDesign(design)">Load</button>
              <button v-if="isAdminUser" class="saved-design-btn danger" @click="deleteSampleDesign(design.id)">Delete</button>
            </div>
          </div>
        </div>
        <p v-else class="saved-design-empty">No sample designs yet. Admins can publish one from the editor.</p>
      </section>

    </div>
  </div>
</template>

<script>
import { apiBaseUrl } from '../utils/api.js'
import { canAccessModiWear, getAuthUser, isAdmin } from '../utils/auth.js'
import { addCartItem } from '../utils/cart.js'

const previewImages = import.meta.glob('../assets/images/*.png', {
  eager: true,
  import: 'default'
})

const COLOR_NAME_BY_HEX = {
  '#667eea': 'blue',
  '#FF6B9D': 'pink',
  '#FFC75F': 'yellow',
  '#00D9FF': 'cyan',
  '#000000': 'black',
  '#FFFFFF': 'white'
}

const PRODUCT_KEY_BY_TYPE = {
  'T-Shirt': 'tshirt',
  Hoodie: 'hoodie',
  Sweater: 'sweater'
}

const getPreviewImage = (productType, color) => {
  const colorName = COLOR_NAME_BY_HEX[color] || 'blue'
  const productKey = PRODUCT_KEY_BY_TYPE[productType] || 'tshirt'
  const imagePath = `../assets/images/${colorName}-${productKey}.png`
  return previewImages[imagePath] || previewImages['../assets/images/blue-tshirt.png']
}

export default {
  name: 'ModiWear',
  data() {
    return {
      productType: 'T-Shirt',
      selectedColor: '#667eea',
      designText: '',
      textColor: '#ffffff',
      textSize: 18,
      textPosX: 50,
      textPosY: 50,
      textRotate: 0,
      textBoxWidth: 180,
      textBoxHeight: 70,
      textFontFamily: "'Inter', sans-serif",
      isTextSelected: false,
      isPngSelected: false,
      uploadedPngDataUrl: '',
      uploadedPngUrl: '',
      uploadedPngName: '',
      uploadedPngType: '',
      pngPosX: 50,
      pngPosY: 38,
      pngRotate: 0,
      pngBoxWidth: 160,
      pngBoxHeight: 160,
      dragMode: '',
      rotationCenter: null,
      rotationStartAngle: 0,
      rotationStartValue: 0,
      resizeStartWidth: 0,
      resizeStartHeight: 0,
      resizeStartX: 0,
      resizeStartY: 0,
      savedDesigns: [],
      sampleDesigns: [],
      selectedSize: 'M',
      quantity: 1,
      customPrice: 49.99,
      colorOptions: ['#667eea', '#FF6B9D', '#FFC75F', '#00D9FF', '#000000', '#FFFFFF'],
      textColorOptions: ['#ffffff', '#000000', '#667eea', '#FF6B9D', '#FFC75F', '#00D9FF'],
      templates: [
        { id: 1, name: 'Bold Contrast', sample: 'MODI', color: '#FFFFFF', fontFamily: 'Impact, sans-serif', baseColor: '#00D9FF' },
        { id: 2, name: 'Royal Serif', sample: 'STYLE', color: '#667eea', fontFamily: 'Georgia, serif', baseColor: '#FFC75F' },
        { id: 3, name: 'Neon Pop', sample: 'VIBE', color: '#FF6B9D', fontFamily: "'Trebuchet MS', sans-serif", baseColor: '#000000' },
        { id: 4, name: 'Mono Edge', sample: 'CODE', color: '#00D9FF', fontFamily: "'Courier New', monospace", baseColor: '#FFFFFF' },
        { id: 5, name: 'Classic Bold', sample: 'LOOK', color: '#000000', fontFamily: 'Arial, sans-serif', baseColor: '#667eea' },
        { id: 6, name: 'Soft Clean', sample: 'FRESH', color: '#FFC75F', fontFamily: "'Inter', sans-serif", baseColor: '#FF6B9D' }
      ]
    }
  },
  computed: {
    previewImageUrl() {
      return getPreviewImage(this.productType, this.selectedColor)
    },
    previewTextStyle() {
      return {
        color: this.textColor,
        fontSize: `${this.textSize}px`,
        fontFamily: this.textFontFamily,
        width: '100%',
        height: '100%'
      }
    },
    previewTextWrapperStyle() {
      return {
        left: `${this.textPosX}%`,
        top: `${this.textPosY}%`,
        width: `${this.textBoxWidth}px`,
        height: `${this.textBoxHeight}px`,
        transform: `translate(-50%, -50%) rotate(${this.textRotate}deg)`,
        transformOrigin: 'center center'
      }
    },
    previewPngWrapperStyle() {
      return {
        left: `${this.pngPosX}%`,
        top: `${this.pngPosY}%`,
        width: `${this.pngBoxWidth}px`,
        height: `${this.pngBoxHeight}px`,
        transform: `translate(-50%, -50%) rotate(${this.pngRotate}deg)`,
        transformOrigin: 'center center'
      }
    },
    isAdminUser() {
      return isAdmin()
    },
  },
  methods: {
    formatCurrency(value) {
      return `RM ${Number(value).toFixed(2)}`
    },
    getPreviewImage,
    templatePreviewStyle(template) {
      return {
        color: template.color,
        fontFamily: template.fontFamily,
        backgroundColor: template.baseColor || '#fff',
        background: template.baseColor || '#fff',
        textShadow: '0 2px 6px rgba(0, 0, 0, 0.18)'
      }
    },
    handlePngUpload(event) {
      const file = event.target.files?.[0]
      if (!file) return

      if (file.type !== 'image/png' || !file.name.toLowerCase().endsWith('.png')) {
        alert('Please upload a PNG file only.')
        event.target.value = ''
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('PNG files must be 5 MB or smaller.')
        event.target.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        this.uploadedPngDataUrl = reader.result
        this.uploadedPngName = file.name
        this.uploadedPngType = file.type
        this.pngPosX = 50
        this.pngPosY = 38
        this.pngRotate = 0
        this.pngBoxWidth = 160
        this.pngBoxHeight = 160
        this.isPngSelected = true
        this.isTextSelected = false
      }
      reader.readAsDataURL(file)

      this.uploadPngToServer(file)
    },
    async uploadPngToServer(file) {
      try {
        const auth = getAuthUser()
        const formData = new FormData()
        formData.append('png', file)

        const response = await fetch(`${apiBaseUrl}/orders/upload-png`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth?.token}`
          },
          body: formData
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Failed to upload PNG')

        this.uploadedPngUrl = data.url
        this.uploadedPngName = data.fileName || file.name
      } catch (err) {
        console.error(err)
        this.uploadedPngUrl = ''
        alert(err.message || 'PNG upload failed')
      }
    },
    removePngDesign() {
      this.uploadedPngDataUrl = ''
      this.uploadedPngUrl = ''
      this.uploadedPngName = ''
      this.uploadedPngType = ''
      this.isPngSelected = false
    },
    setPngPositionFromPointer(event) {
      const stage = this.$refs.previewStage
      if (!stage) return

      const rect = stage.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      this.pngPosX = Math.max(0, Math.min(100, x))
      this.pngPosY = Math.max(0, Math.min(100, y))
    },
    setTextPositionFromPointer(event) {
      const stage = this.$refs.previewStage
      if (!stage) return

      const rect = stage.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      this.textPosX = Math.max(0, Math.min(100, x))
      this.textPosY = Math.max(0, Math.min(100, y))
    },
    startTextDrag(event) {
      event.preventDefault()
      this.isTextSelected = true
      this.isPngSelected = false
      this.dragMode = 'move-text'
      this.setTextPositionFromPointer(event)
      window.addEventListener('pointermove', this.onWindowPointerMove)
      window.addEventListener('pointerup', this.endPreviewInteraction)
      window.addEventListener('pointercancel', this.endPreviewInteraction)
    },
    selectTextBox() {
      this.isTextSelected = true
    },
    startTextRotate(event) {
      event.preventDefault()
      const stage = this.$refs.previewStage
      if (!stage) return

      const rect = stage.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      this.rotationCenter = { x: centerX, y: centerY }
      this.rotationStartAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX)
      this.rotationStartValue = this.textRotate
      this.dragMode = 'rotate-text'
      window.addEventListener('pointermove', this.onWindowPointerMove)
      window.addEventListener('pointerup', this.endPreviewInteraction)
      window.addEventListener('pointercancel', this.endPreviewInteraction)
    },
    startTextResize(event) {
      event.preventDefault()
      event.stopPropagation()
      this.dragMode = 'resize-text'
      this.resizeStartWidth = this.textBoxWidth
      this.resizeStartHeight = this.textBoxHeight
      this.resizeStartX = event.clientX
      this.resizeStartY = event.clientY
      window.addEventListener('pointermove', this.onWindowPointerMove)
      window.addEventListener('pointerup', this.endPreviewInteraction)
      window.addEventListener('pointercancel', this.endPreviewInteraction)
    },
    startPngDrag(event) {
      event.preventDefault()
      this.isPngSelected = true
      this.isTextSelected = false
      this.dragMode = 'move-png'
      this.setPngPositionFromPointer(event)
      window.addEventListener('pointermove', this.onWindowPointerMove)
      window.addEventListener('pointerup', this.endPreviewInteraction)
      window.addEventListener('pointercancel', this.endPreviewInteraction)
    },
    startPngRotate(event) {
      event.preventDefault()
      const stage = this.$refs.previewStage
      if (!stage) return

      const rect = stage.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      this.rotationCenter = { x: centerX, y: centerY }
      this.rotationStartAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX)
      this.rotationStartValue = this.pngRotate
      this.dragMode = 'rotate-png'
      window.addEventListener('pointermove', this.onWindowPointerMove)
      window.addEventListener('pointerup', this.endPreviewInteraction)
      window.addEventListener('pointercancel', this.endPreviewInteraction)
    },
    startPngResize(event) {
      event.preventDefault()
      event.stopPropagation()
      this.dragMode = 'resize-png'
      this.resizeStartWidth = this.pngBoxWidth
      this.resizeStartHeight = this.pngBoxHeight
      this.resizeStartX = event.clientX
      this.resizeStartY = event.clientY
      window.addEventListener('pointermove', this.onWindowPointerMove)
      window.addEventListener('pointerup', this.endPreviewInteraction)
      window.addEventListener('pointercancel', this.endPreviewInteraction)
    },
    onWindowPointerMove(event) {
      if (this.dragMode === 'move-text') {
        this.setTextPositionFromPointer(event)
        return
      }

      if (this.dragMode === 'move-png') {
        this.setPngPositionFromPointer(event)
        return
      }

      if (this.dragMode === 'rotate-text' && this.rotationCenter) {
        const currentAngle = Math.atan2(event.clientY - this.rotationCenter.y, event.clientX - this.rotationCenter.x)
        const deltaDegrees = (currentAngle - this.rotationStartAngle) * (180 / Math.PI)
        this.textRotate = Math.round(this.rotationStartValue + deltaDegrees)
        return
      }

      if (this.dragMode === 'rotate-png' && this.rotationCenter) {
        const currentAngle = Math.atan2(event.clientY - this.rotationCenter.y, event.clientX - this.rotationCenter.x)
        const deltaDegrees = (currentAngle - this.rotationStartAngle) * (180 / Math.PI)
        this.pngRotate = Math.round(this.rotationStartValue + deltaDegrees)
        return
      }

      if (this.dragMode === 'resize-text') {
        const deltaX = event.clientX - this.resizeStartX
        const deltaY = event.clientY - this.resizeStartY
        this.textBoxWidth = Math.max(120, Math.round(this.resizeStartWidth + deltaX))
        this.textBoxHeight = Math.max(40, Math.round(this.resizeStartHeight + deltaY))
        return
      }

      if (this.dragMode === 'resize-png') {
        const deltaX = event.clientX - this.resizeStartX
        const deltaY = event.clientY - this.resizeStartY
        this.pngBoxWidth = Math.max(80, Math.round(this.resizeStartWidth + deltaX))
        this.pngBoxHeight = Math.max(80, Math.round(this.resizeStartHeight + deltaY))
      }
    },
    handlePreviewPointerMove(event) {
      if (this.dragMode === 'move-text') {
        this.setTextPositionFromPointer(event)
        return
      }

      if (this.dragMode === 'move-png') {
        this.setPngPositionFromPointer(event)
      }
    },
    endPreviewInteraction() {
      this.dragMode = ''
      this.rotationCenter = null
      window.removeEventListener('pointermove', this.onWindowPointerMove)
      window.removeEventListener('pointerup', this.endPreviewInteraction)
      window.removeEventListener('pointercancel', this.endPreviewInteraction)
    },
    handleDocumentPointerDown(event) {
      const stage = this.$refs.previewStage
      if (!stage) return

      if (!stage.contains(event.target)) {
        this.isTextSelected = false
        this.isPngSelected = false
        return
      }

      if (!event.target.closest('.garment-text-wrap') && !event.target.closest('.garment-png-wrap')) {
        this.isTextSelected = false
        this.isPngSelected = false
      }
    },
    addToCart() {
      if (!canAccessModiWear()) {
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }

      const customItem = {
        id: Date.now(),
        name: `Custom ${this.productType}`,
        category: 'Custom ModiWear',
        price: this.customPrice,
        quantity: this.quantity,
        itemType: 'custom',
        customization: {
          productType: this.productType,
          color: this.selectedColor,
          text: this.designText,
          textColor: this.textColor,
          textSize: this.textSize,
          textPosX: this.textPosX,
          textPosY: this.textPosY,
          textRotate: this.textRotate,
          textBoxWidth: this.textBoxWidth,
          textBoxHeight: this.textBoxHeight,
          textFontFamily: this.textFontFamily,
          pngDesign: this.uploadedPngDataUrl
            ? {
                fileName: this.uploadedPngName,
                contentType: this.uploadedPngType,
                url: this.uploadedPngUrl || this.uploadedPngDataUrl,
                posX: this.pngPosX,
                posY: this.pngPosY,
                rotate: this.pngRotate,
                width: this.pngBoxWidth,
                height: this.pngBoxHeight
              }
            : null,
          size: this.selectedSize
        }
      }

      addCartItem(customItem)
      window.dispatchEvent(new Event('cartchange'))

      this.$router.push('/cart')
    },
    buildDesignRecord() {
      const user = getAuthUser()

      return {
        id: Date.now(),
        name: this.designText || `Saved ${this.productType}`,
        productType: this.productType,
        color: this.selectedColor,
        text: this.designText,
        textColor: this.textColor,
        textSize: this.textSize,
        textPosX: this.textPosX,
        textPosY: this.textPosY,
        textRotate: this.textRotate,
        textBoxWidth: this.textBoxWidth,
        textBoxHeight: this.textBoxHeight,
        textFontFamily: this.textFontFamily,
        pngDesign: this.uploadedPngDataUrl
          ? {
              fileName: this.uploadedPngName,
              contentType: this.uploadedPngType,
              url: this.uploadedPngUrl || this.uploadedPngDataUrl,
              posX: this.pngPosX,
              posY: this.pngPosY,
              rotate: this.pngRotate,
              width: this.pngBoxWidth,
              height: this.pngBoxHeight
            }
          : null,
        size: this.selectedSize,
        savedAt: new Date().toISOString(),
        publishedBy: user?.email ? user.email.trim() : ''
      }
    },
    saveDesign() {
      if (!canAccessModiWear()) {
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }

      const design = this.buildDesignRecord()

      return this.persistDesign(design)
    },
    async persistDesign(design) {
      try {
        const user = getAuthUser()
        const endpoint = this.isAdminUser ? '/modiwear/designs/sample' : '/modiwear/designs'
        const response = await fetch(`${apiBaseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify(design)
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Failed to save design')

        const savedDesign = data
        if (this.isAdminUser) {
          this.sampleDesigns = [savedDesign, ...this.sampleDesigns.filter((item) => item.id !== savedDesign.id)].slice(0, 20)
          alert('Sample design published')
        } else {
          this.savedDesigns = [savedDesign, ...this.savedDesigns.filter((item) => item.id !== savedDesign.id)].slice(0, 20)
          alert('Design saved')
        }
      } catch (err) {
        console.error(err)
        alert(err.message || 'Failed to save design')
      }
    },
    getDesignPngSrc(design) {
      const pngDesign = design?.pngDesign || design?.customization?.pngDesign || null
      return pngDesign?.url || pngDesign?.dataUrl || ''
    },
    getDesignPngStyle(design) {
      const pngDesign = design?.pngDesign || design?.customization?.pngDesign || null
      const previewScale = 0.45
      return {
        left: `${pngDesign?.posX ?? 50}%`,
        top: `${pngDesign?.posY ?? 38}%`,
        width: `${(pngDesign?.width || 160) * previewScale}px`,
        height: `${(pngDesign?.height || 160) * previewScale}px`,
        transform: `translate(-50%, -50%) rotate(${pngDesign?.rotate || 0}deg)`
      }
    },
    getDesignTextStyle(design) {
      const previewScale = 0.45
      return {
        color: design.textColor || '#ffffff',
        fontSize: `${(design.textSize || 18) * previewScale}px`,
        fontFamily: design.textFontFamily || "'Inter', sans-serif",
        left: `${design.textPosX ?? 50}%`,
        top: `${design.textPosY ?? 50}%`,
        width: `${(design.textBoxWidth || 160) * previewScale}px`,
        height: `${(design.textBoxHeight || 70) * previewScale}px`,
        transform: `translate(-50%, -50%) rotate(${design.textRotate || 0}deg)`
      }
    },
    async fetchDesignCollections() {
      try {
        const user = getAuthUser()
        if (!user?.token) {
          this.savedDesigns = []
          this.sampleDesigns = []
          return
        }

        const response = await fetch(`${apiBaseUrl}/modiwear/designs`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Failed to load designs')

        this.savedDesigns = data.savedDesigns || []
        this.sampleDesigns = data.sampleDesigns || []
      } catch (err) {
        console.error(err)
      }
    },
    loadSavedDesign(design) {
      this.productType = design.productType || 'T-Shirt'
      this.selectedColor = design.color || '#667eea'
      this.designText = design.text || ''
      this.textColor = design.textColor || '#ffffff'
      this.textSize = design.textSize || 18
      this.textPosX = design.textPosX ?? 50
      this.textPosY = design.textPosY ?? 50
      this.textRotate = design.textRotate || 0
      this.textBoxWidth = design.textBoxWidth || 180
      this.textBoxHeight = design.textBoxHeight || 70
      this.textFontFamily = design.textFontFamily || "'Inter', sans-serif"
      this.selectedSize = design.size || 'M'
      const pngDesign = design.pngDesign || design.customization?.pngDesign || null
      if (pngDesign?.url || pngDesign?.dataUrl) {
        this.uploadedPngDataUrl = pngDesign.dataUrl || pngDesign.url
        this.uploadedPngUrl = pngDesign.url || pngDesign.dataUrl
        this.uploadedPngName = pngDesign.fileName || 'Uploaded PNG'
        this.uploadedPngType = pngDesign.contentType || 'image/png'
        this.pngPosX = pngDesign.posX ?? 50
        this.pngPosY = pngDesign.posY ?? 38
        this.pngRotate = pngDesign.rotate || 0
        this.pngBoxWidth = pngDesign.width || 160
        this.pngBoxHeight = pngDesign.height || 160
      } else {
        this.removePngDesign()
      }
      this.isTextSelected = false
      this.isPngSelected = false
    },
    async deleteSavedDesign(designId) {
      try {
        const user = getAuthUser()
        const response = await fetch(`${apiBaseUrl}/modiwear/designs/${designId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Failed to delete design')

        this.savedDesigns = this.savedDesigns.filter((design) => design.id !== designId)
      } catch (err) {
        console.error(err)
        alert(err.message || 'Failed to delete design')
      }
    },
    async deleteSampleDesign(designId) {
      if (!this.isAdminUser) return

      try {
        const user = getAuthUser()
        const response = await fetch(`${apiBaseUrl}/modiwear/designs/${designId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Failed to delete design')

        this.sampleDesigns = this.sampleDesigns.filter((design) => design.id !== designId)
      } catch (err) {
        console.error(err)
        alert(err.message || 'Failed to delete design')
      }
    },
    resetDesign() {
      this.designText = ''
      this.productType = 'T-Shirt'
      this.selectedColor = '#667eea'
      this.textColor = '#ffffff'
      this.textSize = 18
      this.textPosX = 50
      this.textPosY = 50
      this.textRotate = 0
      this.textBoxWidth = 180
      this.textBoxHeight = 70
      this.textFontFamily = "'Inter', sans-serif"
      this.isTextSelected = false
      this.removePngDesign()
      this.selectedSize = 'M'
      this.quantity = 1
    },
    applyTemplate(template) {
      this.textColor = template.color
      this.textFontFamily = template.fontFamily
      this.selectedColor = template.baseColor || this.selectedColor
      this.designText = template.sample || this.designText
    },
    syncDesignCollections() {
      this.fetchDesignCollections()
    }
  },
  mounted() {
    document.addEventListener('pointerdown', this.handleDocumentPointerDown)
    window.addEventListener('authchange', this.syncDesignCollections)
    this.syncDesignCollections()
  },
  beforeUnmount() {
    document.removeEventListener('pointerdown', this.handleDocumentPointerDown)
    window.removeEventListener('authchange', this.syncDesignCollections)
  }
}
</script>

<style scoped>
.modiwear-page {
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100px;
  padding: 0;
  display: grid;
  grid-template-columns: 40% 60%;
  align-items: stretch;
  overflow: hidden;
}

.page-header-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 100px;
}

.page-header-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.page-header-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px 24px;
  text-align: center;
}

.page-header h1 {
  font-size: clamp(32px, 4vw, 54px);
  margin: 0 0 12px 0;
}

.page-header p {
  font-size: 18px;
  margin: 0;
  opacity: 0.95;
}

.modiwear-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.design-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.canvas-area h2,
.controls-panel h3 {
  margin-top: 0;
  color: #333;
}

.preview-box {
  background: #f0f0f0;
  padding: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.garment-preview {
  position: relative;
  width: min(100%, 360px);
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
}

.garment-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.14));
}

.garment-png-wrap {
  position: absolute;
  min-width: 80px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  user-select: none;
  transform-origin: center center;
}

.garment-png {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18));
}

.garment-png-wrap.selected .garment-png {
  outline: 2px dashed rgba(118, 75, 162, 0.75);
  outline-offset: 2px;
  border-radius: 6px;
}

.garment-text-wrap {
  position: absolute;
  min-width: 120px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  user-select: none;
  transform-origin: center center;
}

.garment-text {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 8px 12px;
  border: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  font-weight: bold;
  text-align: center;
  word-wrap: break-word;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
  pointer-events: none;
  line-height: 1.1;
}

.resize-handle {
  position: absolute;
  right: -10px;
  bottom: -10px;
  z-index: 3;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid #c7c7c7;
  background: #fff;
  color: #555;
  font-size: 13px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: nwse-resize;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.resize-handle:active {
  cursor: nwse-resize;
}

.png-resize-handle {
  z-index: 4;
}

.garment-text-wrap.selected .garment-text {
  border-color: #764ba2;
  box-shadow: 0 0 0 1px rgba(118, 75, 162, 0.18);
}

.rotate-handle {
  position: absolute;
  right: -10px;
  top: -10px;
  z-index: 2;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid #c7c7c7;
  background: #fff;
  color: #555;
  font-size: 13px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.rotate-handle:active {
  cursor: grabbing;
}

.png-rotate-handle {
  z-index: 4;
}

.preview-hint {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 13px;
}

.garment-text-wrap.selected .garment-text {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.42);
}

.controls-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.control-group input,
.control-group select,
.control-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  font-family: inherit;
}

.control-group textarea {
  resize: vertical;
  font-family: inherit;
}

.upload-hint {
  margin: 0;
  color: #666;
  font-size: 12px;
}

.remove-png-btn {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: #b32424;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: 0.3s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #333;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #333;
}

.price-display {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #667eea;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
  font-size: 14px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #764ba2;
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.btn-secondary:hover {
  background: #ccc;
}

.templates-section,
.gallery-section {
  margin-bottom: 40px;
}

.sample-design-section {
  padding-top: 4px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-subtitle {
  margin: 6px 0 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.templates-section h2,
.gallery-section h2 {
  font-size: 28px;
  margin: 0 0 25px 0;
  color: #333;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.template-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.template-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.template-preview {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.template-card p {
  padding: 15px;
  text-align: center;
  margin: 0;
  color: #333;
  font-weight: 500;
}

.saved-design-card {
  display: flex;
  flex-direction: column;
}

.saved-design-preview {
  position: relative;
  display: grid;
  place-items: center;
  background: #f7f7fb;
  overflow: hidden;
}

.saved-design-preview > img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.saved-design-preview .saved-design-overlay {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.saved-design-overlay-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.saved-design-text {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  text-align: center;
  font-weight: 700;
  line-height: 1.1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
  pointer-events: none;
}

.saved-design-meta {
  padding: 12px 15px 4px !important;
  text-align: center;
  margin: 0;
  color: #333;
  font-weight: 700;
}

.saved-design-specs {
  padding: 0 15px 12px !important;
  text-align: center;
  margin: 0;
  color: #333;
  font-weight: 500;
}

.saved-design-actions {
  display: flex;
  gap: 8px;
  padding: 12px 15px 15px;
}

.saved-design-btn {
  flex: 1;
  padding: 9px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
}

.saved-design-btn.danger {
  color: #b32424;
}

.saved-design-empty {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.gallery-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gallery-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.gallery-item p {
  padding: 12px;
  text-align: center;
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    grid-template-columns: 1fr;
  }

  .design-section {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }

  .preview-box {
    padding: 10px;
    min-height: auto;
  }

  .garment-preview {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }

  .page-header-logo {
    max-width: 180px;
    height: auto;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .color-option {
    width: 40px;
    height: 40px;
  }

  .price-display {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 70%;
  }
  .page-header-logo {
    max-width: 150px;
    height: auto;
  }
  .page-header {
    grid-template-columns: 1fr;
  }

  .design-section {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }

  .preview-box {
    padding: 10px;
    min-height: auto;
  }

  .garment-preview {
    width: 100%;
    max-width: 250px;
    margin: 0 auto;
  }
  .control-group input,
  .control-group select,
  .control-group textarea {
    width: 80%;
  }
}

.modiwear-page,
.modiwear-container {
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}
</style>
