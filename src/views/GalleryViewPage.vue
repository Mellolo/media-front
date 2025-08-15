<template>
  <div class="gallery-view-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载图集...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchGalleryData" class="retry-button">重新加载</button>
      </div>
    </div>
    <div v-else class="gallery-content">
      <div class="gallery-header">
        <h1 class="gallery-name">{{ galleryData.name }}</h1>
        <!-- 编辑和删除按钮 -->
        <div class="header-actions">
          <button class="edit-button">编辑图集</button>
          <button class="delete-button">删除图集</button>
        </div>
      </div>
      <div class="gallery-viewer-wrapper">
        <!-- 图片浏览器组件 -->
        <ImageBrowser 
          :images="images" 
          :initial-index="initialIndex"
          @update-current-index="updateCurrentIndex"
        />
      </div>
      <div class="gallery-info">
        <div class="gallery-description">
          <h2 class="section-title">图集描述</h2>
          <p class="description-text">{{ galleryData.description || '暂无描述' }}</p>
        </div>
        
        <!-- 演员信息 -->
        <div v-if="galleryData.actors && galleryData.actors.length > 0" class="gallery-actors">
          <h2 class="section-title">演员</h2>
          <div class="actors-list">
            <router-link
              v-for="actor in galleryData.actors" 
              :key="actor.id" 
              :to="`/actor/profile/${actor.id}`"
              class="actor-tag"
              @mouseenter="showActorPreview(actor.id, $event)"
              @mouseleave="clearActorPreview"
            >
              {{ actor.name }}
            </router-link>
          </div>
        </div>
        
        <!-- 标签信息 -->
        <div v-if="galleryData.tags && galleryData.tags.length > 0" class="gallery-tags">
          <h2 class="section-title">标签</h2>
          <div class="tags-list">
            <a 
              v-for="tag in galleryData.tags" 
              :key="tag" 
              :href="getTagSearchUrl(tag)"
              class="tag-item"
            >
              {{ tag }}
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 演员封面预览 -->
    <ActorCoverPreview
      v-model:visible="actorPreview.visible"
      :actor-id="actorPreview.actorId"
      :position="actorPreview.position"
    />
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/utils/api.js';
import ImageBrowser from '@/components/ImageBrowser.vue';
import ActorCoverPreview from '@/components/ActorCoverPreview.vue';

export default {
  name: 'GalleryViewPage',
  components: {
    ImageBrowser,
    ActorCoverPreview
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const galleryData = ref({});
    const loading = ref(true);
    const error = ref(null);
    const images = ref([]);
    const initialIndex = ref(0);
    const currentIndex = ref(0);
    
    // 演员封面预览状态
    const actorPreview = reactive({
      visible: false,
      actorId: null,
      position: {
        top: '0px',
        left: '0px'
      }
    });
    
    // 获取图片URL
    const getImageUrl = (page) => {
      return `${api.defaults.baseURL}/gallery/pic/${route.params.id}/${page}`;
    };
    
    // 获取缩略图URL (使用图集封面)
    const getThumbnailUrl = () => {
      return `${api.defaults.baseURL}/gallery/cover/${route.params.id}`;
    };
    
    const fetchGalleryData = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await api.get(`/gallery/page/${route.params.id}`);
        galleryData.value = response.data.data;
        
        // 构建图片数组
        const pageCount = response.data.data.pageCount || 0;
        images.value = Array.from({ length: pageCount }, (_, i) => ({
          src: getImageUrl(i + 1),
          thumb: getThumbnailUrl(), // 使用图集封面作为缩略图
          index: i
        }));
      } catch (err) {
        console.error('获取图集数据失败:', err);
        error.value = '获取图集数据失败，请稍后重试';
      } finally {
        loading.value = false;
      }
    };
    
    // 更新当前图片索引
    const updateCurrentIndex = (index) => {
      currentIndex.value = index;
    };
    
    // 获取标签搜索URL
    const getTagSearchUrl = (tag) => {
      return router.resolve({
        name: 'TagSearchVideoList',
        query: { tag: tag }
      }).href;
    };
    
    // 显示演员预览
    const showActorPreview = (actorId, event) => {
      const rect = event.target.getBoundingClientRect();
      actorPreview.position.top = `${rect.top}px`;
      actorPreview.position.left = `${rect.right + 10}px`;
      actorPreview.actorId = actorId;
      actorPreview.visible = true;
    };
    
    // 隐藏演员预览
    const clearActorPreview = () => {
      actorPreview.visible = false;
    };
    
    onMounted(() => {
      fetchGalleryData();
    });
    
    return {
      galleryData,
      loading,
      error,
      images,
      initialIndex,
      currentIndex,
      fetchGalleryData,
      updateCurrentIndex,
      getTagSearchUrl,
      actorPreview,
      showActorPreview,
      clearActorPreview
    };
  }
};
</script>

<style scoped>
.gallery-view-page {
  margin-top: 60px;
  width: 1000px;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  color: #fff;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background: #000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-top: 5px solid #43d6b4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: #ccc;
  font-size: 18px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background: #000;
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-message {
  color: #ff6b6b;
  font-size: 18px;
  margin-bottom: 20px;
}

.retry-button {
  background: #43d6b4;
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: 600;
}

.retry-button:hover {
  background: #3ab09e;
}

.gallery-content {
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gallery-header {
  width: 100%;
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gallery-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #43d6b4;
  line-height: 1.3;
  text-align: center;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.edit-button {
  background: #43d6b4;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: 600;
  white-space: nowrap;
  margin-right: 10px;
}

.edit-button:hover {
  background: #3ab09e;
}

.delete-button {
  background: #ff4757;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: 600;
  white-space: nowrap;
}

.delete-button:hover {
  background: #ff3742;
}

.gallery-viewer-wrapper {
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  margin-bottom: 30px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-info {
  width: 100%;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  padding: 25px;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #43d6b4;
  border-bottom: 2px solid #43d6b4;
  padding-bottom: 10px;
  text-align: left;
}

.description-text {
  font-size: 16px;
  line-height: 1.7;
  color: #ccc;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}

.gallery-actors,
.gallery-tags {
  margin-top: 25px;
}

.gallery-actors:first-child,
.gallery-tags:first-child {
  margin-top: 0;
}

.actors-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.actor-tag {
  background: rgba(67, 214, 180, 0.1);
  color: #43d6b4;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.actor-tag:hover {
  background: rgba(67, 214, 180, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.tag-item {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gallery-view-page {
    padding: 0;
  }
  
  .gallery-content {
    padding: 15px;
  }
  
  .gallery-name {
    font-size: 24px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .description-text {
    font-size: 15px;
  }
  
  .gallery-info {
    padding: 20px;
  }
  
  .gallery-viewer-wrapper {
    border-radius: 6px;
    margin-bottom: 20px;
  }
  
  .actors-list,
  .tags-list {
    gap: 8px;
  }
  
  .actor-tag,
  .tag-item {
    font-size: 13px;
    padding: 5px 10px;
  }
  
  .gallery-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .gallery-name {
    margin-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .gallery-name {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .description-text {
    font-size: 14px;
  }
  
  .actors-list,
  .tags-list {
    gap: 6px;
  }
  
  .actor-tag,
  .tag-item {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>