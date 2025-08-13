<template>
  <div class="tag-search-video-list-container">
    <div class="tag-search-video-list-header">
      <h1>标签搜索结果</h1>
    </div>
    
    <!-- 标签搜索结果提示 -->
    <div v-if="tagSearchKeyword" class="tag-search-tip">
      以下是标签 "{{ tagSearchKeyword }}" 的搜索结果
    </div>
    
    <VideoList :videos="videos" :loading="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/api.js'
import VideoList from '@/components/VideoList.vue'

const route = useRoute()

const tagSearchKeyword = ref('')
const videos = ref([])
const loading = ref(false)

// 获取视频列表
const fetchVideos = async (params = {}) => {
  loading.value = true
  try {
    const response = await api.get('/video/search', { params })
    videos.value = response.data.data || []
  } catch (error) {
    console.error('获取视频列表失败:', error)
    if (error.response && error.response.data) {
      alert('获取视频列表失败: ' + error.response.data.message)
    } else {
      alert('网络错误，请检查连接')
    }
    videos.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取标签搜索结果
onMounted(() => {
  if (route.query.tag) {
    tagSearchKeyword.value = route.query.tag
    fetchVideos({ tags: JSON.stringify([route.query.tag]) })
  } else {
    // 如果没有标签参数，获取所有视频
    fetchVideos()
  }
})
</script>

<style scoped>
.tag-search-video-list-container {
  display: flex;
  flex-direction: column;
  align-items: normal;
  min-height: calc(100vh - 60px);
  padding: 50px 20px;
  background: white;
  border-radius: 15px;
  width: 1300px;
  max-width: 1500px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

.tag-search-video-list-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.tag-search-video-list-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 标签搜索提示样式 */
.tag-search-tip {
  background-color: #e9f7f3;
  color: #38b8a0;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 16px;
  border: 1px solid #d1ede4;
}

@media (max-width: 768px) {
  .tag-search-video-list-container {
    padding: 30px 15px;
    margin-top: 60px;
  }
}
</style>