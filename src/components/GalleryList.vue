<template>
  <div class="gallery-list">
    <div v-if="loading" class="loading">搜索中...</div>
    <div v-else-if="paginatedGalleries.length === 0" class="no-results">暂无图集</div>
    <div 
      v-else
      class="galleries-grid"
    >
      <div 
        v-for="gallery in paginatedGalleries" 
        :key="gallery.id" 
        class="gallery-card-wrapper"
      >
        <a
          :href="getGalleryUrl(gallery.id)"
          class="gallery-card"
        >
          <div class="gallery-card-content">
            <div class="gallery-thumbnail">
              <img 
                v-if="gallery.id && gallery.pageCount > 0" 
                :src="getThumbnailUrl(gallery.id)" 
                :alt="gallery.name"
                @error="handleImageError"
              />
              <div v-else class="no-image">暂无封面</div>
            </div>
            <div class="gallery-info">
              <h3 class="gallery-name">{{ gallery.name }}</h3>
              <div class="gallery-meta">
                <span class="gallery-count">{{ gallery.pageCount }} 张图片</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
    
    <!-- 分页组件 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        :disabled="currentPage === 1" 
        @click="currentPage = 1"
        class="pagination-button"
      >
        首页
      </button>
      <button 
        :disabled="currentPage === 1" 
        @click="currentPage--"
        class="pagination-button"
      >
        上一页
      </button>
      
      <div class="pagination-input-container">
        <span>第</span>
        <input 
          type="number" 
          min="1" 
          :max="totalPages" 
          v-model.number="inputPage" 
          @keyup.enter="goToPage"
          class="pagination-input"
        />
        <span>页</span>
        <button @click="goToPage" class="go-button">跳转</button>
      </div>
      
      <span class="pagination-info">
        共 {{ totalPages }} 页
      </span>
      
      <button 
        :disabled="currentPage === totalPages" 
        @click="currentPage++"
        class="pagination-button"
      >
        下一页
      </button>
      <button 
        :disabled="currentPage === totalPages" 
        @click="currentPage = totalPages"
        class="pagination-button"
      >
        末页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api.js'

const props = defineProps({
  galleries: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  itemsPerPage: {
    type: Number,
    default: 20
  }
})

const router = useRouter()

// 分页相关
const currentPage = ref(1)
const inputPage = ref(1) // 用于输入页码的响应式数据

// 监听当前页变化，同步更新输入框的值
watch(currentPage, (newPage) => {
  inputPage.value = newPage
})

// 监听传入的图集列表变化，重置到第一页
watch(() => props.galleries, () => {
  currentPage.value = 1
  inputPage.value = 1
})

// 计算分页后的图集列表
const paginatedGalleries = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.galleries.slice(start, end)
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(props.galleries.length / props.itemsPerPage)
})

// 跳转到指定页数
const goToPage = () => {
  let page = inputPage.value
  
  // 验证输入的页码
  if (isNaN(page) || page < 1) {
    page = 1
  } else if (page > totalPages.value) {
    page = totalPages.value
  }
  
  currentPage.value = page
  inputPage.value = page
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// 获取缩略图URL (使用图集封面)
const getThumbnailUrl = (galleryId) => {
  return `${api.defaults.baseURL}/gallery/cover/${galleryId}`
}

// 获取图集URL
const getGalleryUrl = (galleryId) => {
  const routeData = router.resolve({ name: 'GalleryView', params: { id: galleryId } });
  return routeData.href;
}
</script>

<style scoped>
.gallery-list {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .no-results {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
  grid-column: 1 / -1;
}

.galleries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-card-wrapper {
  height: 100%;
}

.gallery-card {
  text-decoration: none;
  color: inherit;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: block;
}

.gallery-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.gallery-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.gallery-thumbnail {
  width: 100%;
  height: 150px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.gallery-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #999;
  font-style: italic;
}

.gallery-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.gallery-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.gallery-meta {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.gallery-count {
  font-size: 13px;
  color: #666;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
  padding: 20px 0;
  flex-wrap: wrap;
}

.pagination-button {
  padding: 8px 16px;
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 50px;
}

.pagination-button:hover:not(:disabled) {
  background: #e0e0e0;
  border-color: #ccc;
}

.pagination-button:disabled {
  background: #f8f8f8;
  color: #999;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  margin: 0 10px;
}

.pagination-input-container {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  background-color: #fff;
  color: #000;
}

.pagination-input:focus {
  outline: none;
  border-color: #43d6b4;
  box-shadow: 0 0 0 2px rgba(67, 214, 180, 0.2);
}

.pagination-input::-webkit-outer-spin-button,
.pagination-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.pagination-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.go-button {
  padding: 6px 12px;
  background: #43d6b4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.go-button:hover {
  background: #38b8a0;
}

@media (max-width: 768px) {
  .galleries-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
  }
  
  .gallery-thumbnail {
    height: 130px;
  }
  
  .pagination {
    gap: 5px;
  }
  
  .pagination-button {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .pagination-input {
    width: 50px;
    padding: 4px 6px;
  }
  
  .go-button {
    padding: 4px 10px;
  }
}

@media (max-width: 480px) {
  .galleries-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
  
  .gallery-thumbnail {
    height: 120px;
  }
  
  .gallery-info {
    padding: 10px;
  }
  
  .gallery-name {
    font-size: 14px;
    margin: 0 0 5px 0;
  }
  
  .pagination {
    flex-direction: column;
  }
  
  .pagination-input-container {
    order: -1;
    margin-bottom: 10px;
  }
}
</style>