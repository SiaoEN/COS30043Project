<template>
  <aside class="sidebar">
    <section class="sidebar-section">
      <p class="sidebar-label">Browse</p>
      <button class="sidebar-link" :class="{ active: selectedCategory === 'All' }" @click="setCategory('All')">
        <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256">
<g fill="#8b5e3c" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(10.66667,10.66667)"><path d="M12,2.09961l-11,9.90039h3v9h6v-7h4v7h6v-9h3z"></path></g></g>
</svg></span> Home Feed
      </button>
      <button class="sidebar-link" :class="{ active: selectedCategory === 'Clothes' }" @click="setCategory('Clothes')">
        <span class="icon"><svg fill="#8b5e3c" viewBox="-1 0 19 19" xmlns="http://www.w3.org/2000/svg" class="cf-icon-svg" stroke="#8b5e3c"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m15.867 7.593-1.534.967a.544.544 0 0 1-.698-.118l-.762-.957v7.256a.476.476 0 0 1-.475.475h-7.79a.476.476 0 0 1-.475-.475V7.477l-.769.965a.544.544 0 0 1-.697.118l-1.535-.967a.387.387 0 0 1-.083-.607l2.245-2.492a2.814 2.814 0 0 1 2.092-.932h.935a2.374 2.374 0 0 0 4.364 0h.934a2.816 2.816 0 0 1 2.093.933l2.24 2.49a.388.388 0 0 1-.085.608z"></path></g></svg></span> Clothing
      </button>
      <button class="sidebar-link" :class="{ active: selectedCategory === 'Accessories' }" @click="setCategory('Accessories')">
        <span class="icon"><svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--emojione-monotone" preserveAspectRatio="xMidYMid meet" fill="#8b5e3c" stroke="#8b5e3c"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M61.991 33.672v-.579c0-.449-.048-.539-.281-.66a10.169 10.169 0 0 0-1.279-.58c-.089-.031-.188-.058-.276-.088C56.243 18.943 52.104 13 50.304 13c-.973 0-1.305.675-1.66 2.226c-.854 3.716-.054 4.892.453 5.409c.7.714 1.838.128 1.838-3.838c.762 1.864 3.807 7.594 6.165 14.285c-3.94-.588-8.976-.537-11.697-.291c-3.687.331-6.763 1.179-9.279 2.502c-2.356 1.206-5.892 1.206-8.248 0c-2.519-1.323-5.593-2.171-9.275-2.502c-2.727-.245-7.764-.297-11.701.291c2.356-6.69 5.4-12.42 6.161-14.285c0 3.966 1.14 4.552 1.839 3.838c.506-.517 1.309-1.693.455-5.409c-.358-1.551-.688-2.226-1.664-2.226c-1.802 0-5.937 5.943-9.85 18.767c-.087.029-.183.056-.269.086c-.438.157-.867.361-1.282.58c-.234.121-.281.211-.281.66v.579c0 1.09-.135.666.625 1.12c1.481.889 2.32 3.193 2.773 6.367c.641 4.625 2.853 7.523 6.452 8.909a14.128 14.128 0 0 0 10.383-.115c1.813-.741 3.402-1.915 4.666-3.817c2.216-3.336 1.551-5.418 2.695-8.283c.996-2.502 3.795-2.502 4.793 0c1.144 2.865.479 4.947 2.694 8.283c1.263 1.902 2.854 3.076 4.667 3.817a14.123 14.123 0 0 0 10.383.115c3.596-1.386 5.813-4.284 6.453-8.909c.45-3.174 1.291-5.479 2.771-6.367c.76-.454.627-.03.627-1.12" fill="#8b5e3c"></path></g></svg></span> Accessories
      </button>
      <button class="sidebar-link" :class="{ active: selectedCategory === 'Press-on Nails' }" @click="setCategory('Press-on Nails')">
        <span class="icon"><svg viewBox="0 0 64.00 64.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--emojione-monotone" preserveAspectRatio="xMidYMid meet" fill="#8b5e3c" stroke="#8b5e3c" transform="matrix(-1, 0, 0, 1, 0, 0)rotate(0)" stroke-width="0.00064"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M24.943 18.617c-2.467-1.287-4.875-1.716-6.395-.637c-1.074.765-1.549 2.19-1.572 3.914a27.446 27.446 0 0 1-5.961-8.421V2H6.434v11.477h.023C5.668 16.193 4.994 19.378 5 22.371c.008 6.04 4.738 9.08 8.586 9.08c.055 0 .105-.012.16-.013a6.234 6.234 0 0 0 1.891-.315l.035-.014c.631-.219 1.197-.537 1.648-.979c0 0-.668-.471-1.662-1.428c.623.045 1.305.03 1.986-.044c.521 2.462 1.648 5.097 2.545 6.313L39.883 62h4.809l-17.82-25.904c1.377-.031 2.707-.574 3.941-1.452c3.045-2.162 4.359-5.481.885-10.207a20.122 20.122 0 0 0-2.725-2.972c1.223.776 2.723 2.063 4.355 4.182C39.426 33.55 59 60.582 59 60.582v-3.545S41.092 32.383 34.977 24.455c-4.215-5.465-8.36-6.686-10.034-5.838M9.688 26.475c.99 2.5 5.072 3.688 5.072 3.688c-2.592 1.457-8.994-2.044-9.002-7.793c-.004-2.976.689-6.184 1.49-8.894h1.199c2.484 8.549 8.527 10.758 8.527 10.758c-2.556 0-5.555-.767-5.555-.767c2.539 2.907 7.945 3.485 7.945 3.485c-4.733 1.032-9.676-.477-9.676-.477m20.884-1.566c3.115 4.233 1.789 6.619.773 7.341c-1.014.721-.93-.781-4.045-5.016c-3.117-4.232-7.688-7.996-6.672-8.717c1.015-.719 6.829 2.159 9.944 6.392" fill="#8b5e3c"></path><path d="M56.346 23.214c.222.357 2.654 4.625 2.654 4.626v-4.199s-.666-1.096-.895-1.458c-2.637-4.215-6.115-6.534-8.189-6.647c-.471-.022-.828.07-1.092.2c-2.178-1.333-4.35-1.88-5.838-1c-1.756 1.038-2.178 3.823-1.674 6.91c-.641 2.661.717 7.541 1.84 9.374L59 56.05v-6.923l-9.502-16.508c1.283.057 2.564-.353 3.783-1.073c3.07-1.816 4.594-4.865 1.674-9.634a18.85 18.85 0 0 0-2.084-2.759c1.08.887 2.303 2.19 3.475 4.061m-2.364 6.099c-1.021.603-.818-.819-3.434-5.089c-2.617-4.271-6.652-8.21-5.631-8.814c1.023-.605 6.314 2.592 8.928 6.862c2.618 4.271 1.165 6.435.137 7.041" fill="#8b5e3c"></path><path d="M14.643 42.074l.014.018c-2.498-1.096-4.893-1.361-6.283-.201c-1.561 1.306-1.514 4.125-.506 7.091c-.188 2.728 1.957 7.321 3.369 8.95L14.533 62h5.383l-2.676-3.469c1.473-.021 2.848-.672 4.076-1.699c2.729-2.283 3.727-5.537.057-9.773c-.779-.9-1.695-1.75-2.674-2.514c1.205.689 2.691 1.82 4.27 3.579C25.996 51.498 34.984 62 34.984 62H37.6S27.567 50.209 24.522 46.818c-3.635-4.05-7.969-6.134-9.879-4.744m5.697 5.517c3.287 3.796 2.209 6.163 1.301 6.927c-.91.758-.945-.677-4.234-4.473c-3.287-3.796-7.92-7.035-7.014-7.798c.908-.761 6.658 1.55 9.947 5.344" fill="#8b5e3c"></path></g></svg></span> Press-On Nails
      </button>
      <router-link to="/modiwear" class="sidebar-link modiwear-link">
        <span class="icon"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(45)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12.5497 3.43948C12.118 2.50904 11.9022 2.04382 11.5213 2.00452C11.1405 1.96522 10.8468 2.37786 10.2595 3.20314L10.1075 3.41665C9.9406 3.65117 9.85715 3.76843 9.73698 3.83908C9.61681 3.90973 9.47352 3.92577 9.18695 3.95785L8.92606 3.98706C7.91761 4.09997 7.41339 4.15643 7.26346 4.50779C7.11353 4.85916 7.41719 5.27274 8.0245 6.0999L8.18162 6.31389C8.3542 6.54895 8.44049 6.66647 8.4718 6.80408C8.5031 6.94169 8.47588 7.08381 8.42143 7.36804L8.37186 7.62681C8.18025 8.62703 8.08445 9.12714 8.37265 9.3836C8.66086 9.64006 9.1422 9.48302 10.1049 9.16895L10.3539 9.0877C10.6275 8.99845 10.7643 8.95383 10.9038 8.96823C11.0433 8.98262 11.1698 9.05441 11.4227 9.19799L11.653 9.32871C12.543 9.83397 12.988 10.0866 13.316 9.89374C13.6441 9.70087 13.6379 9.19024 13.6256 8.16897L13.6224 7.90476C13.6189 7.61455 13.6171 7.46944 13.672 7.34073C13.727 7.21202 13.8323 7.11427 14.0431 6.91878L14.235 6.7408C14.9767 6.05285 15.3475 5.70887 15.262 5.33322C15.1766 4.95756 14.6914 4.79901 13.7211 4.4819L13.4701 4.39986C13.1943 4.30975 13.0565 4.26469 12.9509 4.17074C12.8453 4.0768 12.784 3.9446 12.6613 3.6802L12.5497 3.43948Z" fill="#7c3aed"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M22.6479 9.12222C22.8566 9.48001 22.7357 9.93925 22.378 10.148C16.6662 13.4798 15.25 18.859 15.25 22.0001C15.25 22.4143 14.9143 22.7501 14.5 22.7501C14.0858 22.7501 13.75 22.4143 13.75 22.0001C13.75 18.4746 15.3339 12.5204 21.6221 8.85229C21.9799 8.64358 22.4392 8.76443 22.6479 9.12222ZM11.2059 11.279C11.6042 11.3928 11.8348 11.8079 11.721 12.2062C11.3546 13.4888 11.2666 15.3498 11.3245 17.2144C11.3818 19.0601 11.5786 20.8296 11.7412 21.8861C11.8041 22.2955 11.5233 22.6784 11.1139 22.7414C10.7045 22.8044 10.3216 22.5236 10.2586 22.1142C10.0878 21.0039 9.88461 19.1735 9.82524 17.2609C9.76645 15.3671 9.8452 13.3114 10.2787 11.7941C10.3925 11.3958 10.8076 11.1652 11.2059 11.279Z" fill="#7c3aed"></path> <path d="M5.13352 13.7649C5.1108 13.6573 5.28229 13.5583 5.36409 13.6318C5.60184 13.8453 5.92274 14.0885 6.22264 14.1689C6.52254 14.2492 6.92203 14.1991 7.2347 14.133C7.34227 14.1103 7.44128 14.2818 7.36782 14.3636C7.15428 14.6014 6.91111 14.9223 6.83075 15.2221C6.75039 15.522 6.80054 15.9215 6.86659 16.2342C6.88931 16.3418 6.71782 16.4408 6.63602 16.3673C6.39827 16.1538 6.07737 15.9106 5.77747 15.8303C5.47757 15.7499 5.07808 15.8 4.76541 15.8661C4.65783 15.8888 4.55882 15.7173 4.63229 15.6355C4.84583 15.3978 5.089 15.0769 5.16936 14.777C5.24972 14.4771 5.19957 14.0776 5.13352 13.7649Z" fill="#7c3aed"></path> </g></svg></span> ModiWear Hub
      </router-link>
    </section>

    <div class="sidebar-divider"></div>

    <section class="sidebar-section">
      <p class="sidebar-label">Price Filter</p>
      <div class="price-ranges">
        <button
          v-for="option in priceOptions"
          :key="option.key"
          type="button"
          class="price-option"
          :class="{ active: selectedPriceKey === option.key }"
          @click="setPriceRange(option.key)"
        >
          {{ option.label }}
        </button>
      </div>
      <p class="price-display">Selected: {{ selectedPriceLabel }}</p>
      <button @click="resetFilters" class="reset-btn">Reset Filters</button>
    </section>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      selectedCategory: 'All',
      selectedCategories: [],
      selectedPriceKey: 'all',
      priceRange: [0, 500],
      selectedRatings: [],
      priceOptions: [
        { key: 'all', label: 'All Prices', range: [0, 500] },
        { key: '10-30', label: 'RM 10 - RM 30', range: [10, 30] },
        { key: '30-50', label: 'RM 30 - RM 50', range: [30, 50] },
        { key: '50-70', label: 'RM 50 - RM 70', range: [50, 70] },
        { key: '70-100', label: 'RM 70 - RM 100', range: [70, 100] },
        { key: 'over-100', label: 'Over RM 100', range: [101, 999999] }
      ]
    }
  },
  emits: ['filter-change'],
  computed: {
    selectedPriceLabel() {
      const selected = this.priceOptions.find((option) => option.key === this.selectedPriceKey)
      return selected ? selected.label : 'All Prices'
    }
  },
  methods: {
    setCategory(category) {
      this.selectedCategory = category
      this.selectedCategories = category === 'All' ? [] : [category]
      this.emitFilters()
    },
    setPriceRange(optionKey) {
      const selected = this.priceOptions.find((option) => option.key === optionKey)
      if (!selected) return
      this.selectedPriceKey = optionKey
      this.priceRange = [...selected.range]
      this.emitFilters()
    },
    resetFilters() {
      this.selectedCategory = 'All'
      this.selectedCategories = []
      this.selectedPriceKey = 'all'
      this.priceRange = [0, 500]
      this.selectedRatings = []
      this.emitFilters()
    },
    getFilters() {
      return {
        categories: this.selectedCategories,
        priceRange: this.priceRange,
        ratings: this.selectedRatings,
        sizes: [],
        colors: []
      }
    },
    emitFilters() {
      this.$emit('filter-change', this.getFilters())
    }
  },
  watch: {
    selectedRatings() {
      this.emitFilters()
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: var(--radius2);
  position: sticky;
  top: calc(var(--header-height) + 16px);
  height: fit-content;
  overflow: hidden;
}

.sidebar-section {
  padding: 18px 14px;
}

.sidebar-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text3);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 10px;
  padding: 0 8px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: none;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text2);
  text-align: left;
  padding: 9px 12px;
  border-radius: 10px;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.sidebar-link:hover {
  background: var(--bg2);
  color: var(--text);
}

.sidebar-link.active {
  background: rgba(200, 149, 108, 0.1);
  color: var(--accent);
  font-weight: 500;
}

.icon {
  width: 20px;
  text-align: center;
}

.price-ranges {
  display: grid;
  gap: 8px;
}

.price-option {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg2);
  color: var(--text2);
  font-size: 13px;
  text-align: left;
  padding: 9px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.price-option:hover {
  border-color: var(--accent);
  color: var(--text);
}

.price-option.active {
  border-color: var(--accent);
  background: rgba(200, 149, 108, 0.1);
  color: var(--accent2);
  font-weight: 600;
}

.price-display {
  width: 100%;
  text-align: left;
  font-size: 12px;
  color: var(--accent2);
  font-weight: 600;
  margin-top: 10px;
}

.sidebar-divider {
  height: 1px;
  background: var(--border);
  margin: 0 14px;
}

.modiwear-link {
  background: rgba(155, 89, 182, 0.08);
  color: #7c3aed;
}

.reset-btn {
  width: 100%;
  padding: 10px 12px;
  margin-top: 10px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: var(--accent2);
}

@media (max-width: 1100px) {
  .sidebar {
    width: 100%;
    position: static;
  }
}
</style>
