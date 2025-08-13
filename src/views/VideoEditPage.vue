<template>
  <div class="video-edit-container">
    <div class="video-edit-header">
      <h1>编辑视频</h1>
    </div>
    
    <form @submit.prevent="handleSubmit" class="video-edit-form">
      <div class="form-group">
        <label for="videoName">视频名称 *</label>
        <input 
          type="text" 
          id="videoName"
          v-model="form.name" 
          placeholder="请输入视频名称" 
          class="form-input"
          :class="{ 'input-error': nameError }"
        />
        <div v-if="nameError" class="error-message">请输入视频名称</div>
      </div>
      
      <div class="form-group">
        <label for="videoDescription">视频描述</label>
        <textarea 
          id="videoDescription"
          v-model="form.description" 
          placeholder="请输入视频描述（选填）" 
          class="form-textarea"
          rows="4"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>选择演员</label>
        <div class="actor-selectors-container">
          <div class="actor-selector">
            <div class="search-input-container">
              <input 
                type="text" 
                v-model="actorSearchKeyword" 
                placeholder="搜索演员名称" 
                class="form-input"
                @input="handleActorSearch"
              />
            </div>
            
            <div v-if="actorSearchLoading" class="search-loading">搜索中...</div>
            
            <div 
              v-if="actorSearchResults.length > 0" 
              class="search-results"
              ref="searchResultsRef"
            >
              <div 
                v-for="actor in actorSearchResults" 
                :key="actor.id"
                class="search-result-item"
                @mouseenter="event => showActorPreview(event, actor)"
                @mouseleave="hideActorPreview"
                @click="addActor(actor)"
              >
                {{ actor.name }}
              </div>
            </div>
          </div>
          
          <div v-if="selectedActors.length > 0" class="selected-actors-container">
            <div 
              v-for="(actor, actorIndex) in selectedActors" 
              :key="actor.id"
              class="selected-actor-tag"
            >
              {{ actor.name }}
              <button 
                type="button" 
                class="remove-selected-actor" 
                @click="removeActor(actorIndex)"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="videoTags">视频标签</label>
        <div class="tag-input-container">
          <input 
            type="text" 
            id="videoTags"
            v-model="tagInput" 
            placeholder="输入标签后按回车添加" 
            class="form-input"
            @keyup.enter="addTag"
          />
          <button type="button" @click="addTag" class="add-tag-button">添加</button>
        </div>
        <div class="tags-container">
          <span 
            v-for="(tag, index) in form.tags" 
            :key="index"
            class="tag"
          >
            {{ tag }}
            <button type="button" @click="removeTag(index)" class="remove-tag">×</button>
          </span>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="updating" class="submit-button">
          {{ updating ? '更新中...' : '更新视频' }}
        </button>
        <button type="button" @click="resetForm" class="reset-button">重置</button>
      </div>
    </form>
    
    <!-- 演员封面预览 -->
    <ActorCoverPreview
      v-model:visible="actorPreview.visible"
      :actor-id="actorPreview.actorId"
      :position="actorPreview.position"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/utils/api.js';
import API_CONFIG from '@/config/api.js';
import ActorCoverPreview from '@/components/ActorCoverPreview.vue';

const route = useRoute();
const router = useRouter();
const tagInput = ref('');
const updating = ref(false);

// 演员封面预览状态
const actorPreview = reactive({
  visible: false,
  actorId: null,
  position: {
    top: '0px',
    left: '0px'
  }
});

// 演员搜索相关状态
const actorSearchKeyword = ref('');
const actorSearchResults = ref([]);
const actorSearchLoading = ref(false);
const searchResultsRef = ref(null);

// 已选择的演员列表
const selectedActors = ref([]);

// 原始视频数据（用于重置）
const originalVideoData = ref(null);

const form = ref({
  name: '',
  description: '',
  actorIds: [],
  tags: []
});

// 表单验证错误状态
const nameError = ref(false);

// 显示演员预览
const showActorPreview = (event, actor) => {
  const rect = event.target.getBoundingClientRect();
  actorPreview.position.top = `${rect.bottom + 10}px`;
  actorPreview.position.left = `${rect.left}px`;
  actorPreview.actorId = actor.id;
  actorPreview.visible = true;
};

// 隐藏演员预览
const hideActorPreview = () => {
  actorPreview.visible = false;
};

// 处理演员搜索
const handleActorSearch = async () => {
  if (!actorSearchKeyword.value.trim()) {
    actorSearchResults.value = [];
    return;
  }

  try {
    actorSearchLoading.value = true;
    const response = await api.get(`/actor/search?keyword=${encodeURIComponent(actorSearchKeyword.value)}`);
    actorSearchResults.value = response.data.data || [];
  } catch (error) {
    console.error('搜索演员失败:', error);
    actorSearchResults.value = [];
  } finally {
    actorSearchLoading.value = false;
  }
};

// 添加演员到已选择列表
const addActor = (actor) => {
  // 检查是否已添加
  if (!selectedActors.value.some(a => a.id === actor.id)) {
    selectedActors.value.push(actor);
    // 更新表单数据
    form.value.actorIds = selectedActors.value.map(a => a.id);
  }
  // 清空搜索结果和关键字
  actorSearchKeyword.value = '';
  actorSearchResults.value = [];
  // 隐藏演员预览
  hideActorPreview();
};

// 从已选择列表中移除演员
const removeActor = (index) => {
  selectedActors.value.splice(index, 1);
  // 更新表单数据
  form.value.actorIds = selectedActors.value.map(a => a.id);
};

// 添加标签
const addTag = () => {
  if (tagInput.value.trim() && !form.value.tags.includes(tagInput.value.trim())) {
    form.value.tags.push(tagInput.value.trim());
    tagInput.value = '';
  }
};

// 移除标签
const removeTag = (index) => {
  form.value.tags.splice(index, 1);
};

// 重置表单（恢复原始数据）
const resetForm = () => {
  if (originalVideoData.value) {
    // 恢复原始数据
    form.value.name = originalVideoData.value.name;
    form.value.description = originalVideoData.value.description || '';
    form.value.tags = [...(originalVideoData.value.tags || [])];
    
    // 恢复演员数据
    selectedActors.value = originalVideoData.value.actors ? 
      [...originalVideoData.value.actors] : [];
    form.value.actorIds = selectedActors.value.map(actor => actor.id);
  }
  
  // 清空搜索相关状态
  tagInput.value = '';
  actorSearchKeyword.value = '';
  actorSearchResults.value = [];
  nameError.value = false;
};

// 提交表单
const handleSubmit = async () => {
  // 重置错误状态
  nameError.value = !form.value.name.trim();
  
  // 如果有必填字段错误，不提交表单
  if (nameError.value) {
    return;
  }
  
  try {
    updating.value = true;
    
    // 创建更新数据对象，包含ID和其他所有参数
    const updateData = {
      id: route.params.id,
      name: form.value.name,
      description: form.value.description,
      actorIds: form.value.actorIds,
      tags: form.value.tags
    };
    
    // 发送更新请求到正确的API地址，使用POST方法并将所有参数放入请求体
    await api.post(`/auth/video/update`, updateData);
    
    // 更新成功，跳转到视频播放页面
    router.push({ name: 'VideoPlayer', params: { id: route.params.id } });
  } catch (error) {
    console.error('更新失败:', error);
  } finally {
    updating.value = false;
  }
};

// 获取视频信息（保持原来的调用方式不变）
const fetchVideoData = async () => {
  try {
    const response = await api.get(`/video/page/${route.params.id}`);
    const videoData = response.data.data;
    
    // 保存原始数据用于重置
    originalVideoData.value = {
      name: videoData.name,
      description: videoData.description || '',
      tags: videoData.tags ? [...videoData.tags] : [],
      actors: videoData.actors ? [...videoData.actors] : []
    };
    
    // 填充表单数据
    form.value.name = videoData.name;
    form.value.description = videoData.description || '';
    form.value.tags = videoData.tags || [];
    
    // 处理演员数据
    if (videoData.actors && videoData.actors.length > 0) {
      selectedActors.value = [...videoData.actors];
      form.value.actorIds = videoData.actors.map(actor => actor.id);
    }
  } catch (error) {
    console.error('获取视频数据失败:', error);
  }
};

// 点击其他地方关闭搜索结果
const handleClickOutside = (event) => {
  if (searchResultsRef.value && !searchResultsRef.value.contains(event.target)) {
    actorSearchResults.value = [];
  }
};

// 监听路由参数变化
watch(() => route.params.id, () => {
  fetchVideoData();
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  fetchVideoData();
});
</script>

<style scoped>
.video-edit-container {
  display: flex;
  flex-direction: column;
  align-items: normal;
  min-height: calc(100vh - 60px);
  padding: 50px 20px;
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  position: relative;
}

.video-edit-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.video-edit-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.video-edit-form {
  width: 100%;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #38b8a0;
  text-align: left;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  color: #000;
  min-width: 800px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #43d6b4;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.1);
}

/* 错误状态下的输入框样式 */
.form-input.input-error,
.form-textarea.input-error {
  border-color: #ff4757;
  background-color: #fff0f0;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.hint {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
}

.actor-selectors-container {
  width: 100%;
}

.actor-selector {
  width: 100%;
  margin-bottom: 15px;
  position: relative;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-container .form-input {
  padding-right: 15px;
}

.search-loading {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.search-results {
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 5px;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 10;
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  padding: 10px;
}

.search-result-item {
  padding: 10px 15px;
  cursor: pointer;
  color: #000;
  position: relative;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  background-color: #f8f9fa;
  border-color: #43d6b4;
}

.selected-actors-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.selected-actor-tag {
  display: inline-flex;
  align-items: center;
  background: #e1f7f0;
  color: #38b8a0;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
}

.remove-selected-actor {
  background: none;
  border: none;
  color: #38b8a0;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 8px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.add-tag-button {
  padding: 12px 20px;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.add-tag-button:hover {
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.3);
  transform: translateY(-2px);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  background: #e1f7f0;
  color: #38b8a0;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
}

.remove-tag {
  background: none;
  border: none;
  color: #38b8a0;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 8px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.submit-button,
.reset-button {
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button {
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: white;
}

.submit-button:hover:not(:disabled) {
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.3);
  transform: translateY(-2px);
}

.submit-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-button {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e1e1e1;
}

.reset-button:hover {
  background: #e9ecef;
}

.error-message {
  color: #ff4757;
  font-size: 14px;
  margin-top: 5px;
  background-color: #fff0f0;
  padding: 5px 10px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .video-edit-container {
    padding: 15px;
  }
  
  .form-input,
  .form-textarea {
    min-width: auto;
  }
  
  .search-results {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .video-edit-header h1 {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .search-results {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .video-edit-header h1 {
    font-size: 24px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>