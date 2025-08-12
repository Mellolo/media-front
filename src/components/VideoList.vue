<template>
  <div class="video-list">
    <div v-if="loading" class="loading">搜索中...</div>
    <div v-else-if="videos.length === 0" class="no-results">暂无视频</div>
    <div 
      v-else
      class="videos-grid"
    >
      <div 
        v-for="video in videos" 
        :key="video.id" 
        class="video-card"
        @click="goToVideo(video.id)"
      >
        <div class="video-card-content">
          <div class="video-thumbnail">
            <img 
              v-if="video.id" 
              :src="`${API_CONFIG.BASE_URL}/video/cover/${video.id}`" 
              :alt="video.name"
              @error="handleImageError"
            />
            <div v-else class="no-image">暂无封面</div>
          </div>
          <div class="video-info">
            <h3 class="video-name">{{ video.name }}</h3>
            <div class="video-meta">
              <span class="video-duration">{{ formatDuration(video.duration) }}</span>
            </div>
            <div v-if="video.actors && video.actors.length" class="video-actors">
              <span 
                v-for="actor in video.actors.slice(0, 3)" 
                :key="actor.id"
                class="actor-tag"
              >
                {{ actor.name }}
              </span>
              <span v-if="video.actors.length > 3" class="actor-tag more">...</span>
            </div>
            <div v-if="video.tags && video.tags.length" class="video-tags">
              <span 
                v-for="tag in video.tags.slice(0, 3)" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
              <span v-if="video.tags.length > 3" class="tag more">...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import API_CONFIG from '@/config/api.js'

const props = defineProps({
  videos: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 跳转到视频播放页
const goToVideo = (videoId) => {
  router.push({ name: 'VideoPlayer', params: { id: videoId } })
}
</script>

<style scoped>
.video-list {
  width: 100%;
}

.loading, .no-results {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
  grid-column: 1 / -1; /* 占据整行 */
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
  width: 1200px;
}

.video-card {
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.video-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.video-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.video-thumbnail {
  width: 100%;
  height: 150px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #999;
  font-style: italic;
}

.video-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.video-meta {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.video-duration {
  font-size: 13px;
  color: #666;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
}

.video-actors, .video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 5px;
}

.actor-tag, .tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #e9f7f3;
  color: #38b8a0;
}

.actor-tag.more, .tag.more {
  background-color: transparent;
  color: #666;
}

@media (max-width: 768px) {
  .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
  }
  
  .video-thumbnail {
    height: 130px;
  }
}

@media (max-width: 480px) {
  .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
  
  .video-thumbnail {
    height: 120px;
  }
  
  .video-info {
    padding: 10px;
  }
  
  .video-name {
    font-size: 14px;
    margin: 0 0 5px 0;
  }
}
</style>