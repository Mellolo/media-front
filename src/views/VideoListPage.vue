<template>
  <div class="video-list-container">
    <div class="video-list-header">
      <h1>视频列表</h1>
    </div>
    
    <div class="search-section">
      <form @submit.prevent="handleSearch" class="search-form">
        <div class="form-group">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="请输入视频名称关键词" 
            class="search-input"
          />
          <button type="submit" class="search-button">搜索</button>
        </div>
      </form>
      
      <div class="advanced-search">
        <div class="search-filters">
          <div class="filter-group">
            <label>演员:</label>
            <div class="actor-selector">
              <input
                type="text"
                v-model="actorSearchKeyword"
                @input="debounceSearchActors"
                placeholder="搜索演员"
                class="filter-input"
              />
              <div v-if="actorSearchResults.length > 0" class="search-results">
                <div
                  v-for="actor in actorSearchResults"
                  :key="actor.id"
                  class="search-result-item"
                  @click="selectActor(actor)"
                >
                  {{ actor.name }}
                </div>
              </div>
              <div class="selected-actors" v-if="selectedActors.length > 0">
                <span
                  v-for="actor in selectedActors"
                  :key="actor.id"
                  class="selected-item"
                >
                  {{ actor.name }}
                  <span class="remove-item" @click="removeActor(actor.id)">×</span>
                </span>
              </div>
            </div>
          </div>
          
          <div class="filter-group">
            <label>标签:</label>
            <div class="tag-input-group">
              <input
                type="text"
                v-model="tagInput"
                @keyup.enter="addTag"
                placeholder="输入标签后按回车添加"
                class="filter-input"
              />
              <div class="selected-tags" v-if="selectedTags.length > 0">
                <span
                  v-for="(tag, index) in selectedTags"
                  :key="index"
                  class="selected-item"
                >
                  {{ tag }}
                  <span class="remove-item" @click="removeTag(index)">×</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="search-actions">
          <button type="button" @click="resetSearch" class="reset-button">重置</button>
          <button type="button" @click="handleSearch" class="search-button-advanced">高级搜索</button>
        </div>
      </div>
    </div>
    
    <VideoList :videos="videos" :loading="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api.js'
import VideoList from '@/components/VideoList.vue'
import { debounce } from 'lodash-es'

const searchKeyword = ref('')
const videos = ref([])
const loading = ref(false)

// 演员搜索相关
const actorSearchKeyword = ref('')
const actorSearchResults = ref([])
const selectedActors = ref([])
const searchingActors = ref(false)

// 标签相关
const tagInput = ref('')
const selectedTags = ref([])

// 搜索演员（防抖）
const searchActors = async () => {
  if (!actorSearchKeyword.value.trim()) {
    actorSearchResults.value = []
    return
  }
  
  searchingActors.value = true
  try {
    const response = await api.get('/actor/search', {
      params: { keyword: actorSearchKeyword.value }
    })
    actorSearchResults.value = response.data.data || []
  } catch (error) {
    console.error('搜索演员失败:', error)
    actorSearchResults.value = []
  } finally {
    searchingActors.value = false
  }
}

const debounceSearchActors = debounce(searchActors, 300)

// 选择演员
const selectActor = (actor) => {
  // 检查是否已选择
  if (!selectedActors.value.find(a => a.id === actor.id)) {
    selectedActors.value.push(actor)
  }
  actorSearchKeyword.value = ''
  actorSearchResults.value = []
}

// 移除演员
const removeActor = (actorId) => {
  selectedActors.value = selectedActors.value.filter(a => a.id !== actorId)
}

// 添加标签
const addTag = () => {
  if (tagInput.value.trim() && !selectedTags.value.includes(tagInput.value.trim())) {
    selectedTags.value.push(tagInput.value.trim())
    tagInput.value = ''
  }
}

// 移除标签
const removeTag = (index) => {
  selectedTags.value.splice(index, 1)
}

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

// 处理搜索
const handleSearch = () => {
  const params = {}
  
  if (searchKeyword.value.trim()) {
    params.keyword = searchKeyword.value.trim()
  }
  
  if (selectedActors.value.length > 0) {
    params.actors = JSON.stringify(selectedActors.value.map(a => a.id))
  }
  
  if (selectedTags.value.length > 0) {
    params.tags = JSON.stringify(selectedTags.value)
  }
  
  fetchVideos(params)
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  actorSearchKeyword.value = ''
  actorSearchResults.value = []
  selectedActors.value = []
  tagInput.value = ''
  selectedTags.value = []
  fetchVideos()
}

// 组件挂载时获取所有视频列表
onMounted(() => {
  fetchVideos()
})
</script>

<style scoped>
.video-list-container {
  display: flex;
  flex-direction: column;
  align-items: normal;
  min-height: calc(100vh - 60px);
  padding: 50px 20px;
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

.video-list-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.video-list-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-section {
  width: 100%;
  max-width: 600px;
  margin-bottom: 40px;
  align-self: center;
}

.search-form {
  width: 100%;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e1e1e1;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  color: #000;
  min-width: 0;
}

.search-input::placeholder {
  color: #aaa;
}

.search-input:focus {
  outline: none;
  border-color: #43d6b4;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.1);
}

.search-button {
  padding: 15px 30px;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-button:hover {
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.3);
  transform: translateY(-2px);
}

.advanced-search {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.filter-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
  background-color: #fff;
  color: #000;
}

.filter-input:focus {
  outline: none;
  border-color: #43d6b4;
  box-shadow: 0 3px 10px rgba(67, 214, 180, 0.1);
}

.actor-selector {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.selected-actors, .selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.selected-item {
  display: flex;
  align-items: center;
  background: #e9f7f3;
  color: #38b8a0;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
}

.remove-item {
  margin-left: 8px;
  cursor: pointer;
  font-weight: bold;
}

.tag-input-group {
  position: relative;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.reset-button {
  padding: 12px 25px;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background: #e0e0e0;
}

.search-button-advanced {
  padding: 12px 25px;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-button-advanced:hover {
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .video-list-container {
    padding: 30px 15px;
    margin-top: 60px;
  }
  
  .form-group {
    flex-direction: column;
  }
  
  .search-button {
    padding: 15px;
  }
  
  .advanced-search {
    padding: 15px;
  }
  
  .search-actions {
    flex-direction: column;
  }
}
</style>