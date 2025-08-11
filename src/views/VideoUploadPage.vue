<template>
  <div class="video-upload-container">
    <div class="video-upload-header">
      <h1>视频上传</h1>
    </div>
    
    <form @submit.prevent="handleSubmit" class="video-upload-form">
      <div class="form-group">
        <label for="videoName">视频名称 *</label>
        <input 
          type="text" 
          id="videoName"
          v-model="form.name" 
          placeholder="请输入视频名称" 
          class="form-input"
          required
        />
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
            >
              <div 
                v-for="actor in actorSearchResults" 
                :key="actor.id"
                class="search-result-item"
                @mouseenter="loadActorImage(actor)"
                @mouseleave="clearActorImage()"
                @click="addActor(actor)"
              >
                {{ actor.name }}
                <div v-if="hoveredActorImage && hoveredActorId === actor.id" class="actor-image-preview">
                  <img 
                    :src="hoveredActorImage" 
                    :alt="actor.name"
                    @error="handleImageError"
                  />
                </div>
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
      
      <div class="form-group">
        <label for="videoFile">选择视频文件 *</label>
        <input 
          type="file" 
          id="videoFile"
          @change="handleFileChange" 
          accept="video/*"
          class="form-file"
          required
        />
        <div v-if="form.file" class="file-info">
          已选择文件: {{ form.file.name }} ({{ formatFileSize(form.file.size) }})
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="uploading" class="submit-button">
          {{ uploading ? '上传中...' : '上传视频' }}
        </button>
        <button type="button" @click="resetForm" class="reset-button">重置</button>
      </div>
      
      <div v-if="uploading" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <div class="progress-text">{{ uploadProgress }}%</div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api.js';
import { debounce } from 'lodash';
import API_CONFIG from '@/config/api.js';

const router = useRouter();
const tagInput = ref('');
const uploading = ref(false);
const uploadProgress = ref(0);

// 演员搜索相关状态
const actorSearchKeyword = ref('');
const actorSearchResults = ref([]);
const actorSearchLoading = ref(false);

// 悬停显示演员图片相关状态
const hoveredActorImage = ref('');
const hoveredActorId = ref(null);
const imageCache = ref({}); // 缓存已加载的图片

// 已选择的演员列表
const selectedActors = ref([]);

const form = ref({
  name: '',
  description: '',
  actorIds: [],
  tags: [],
  file: null
});

// 防抖搜索函数
const debouncedSearch = debounce(async (keyword) => {
  if (!keyword.trim()) {
    actorSearchResults.value = [];
    actorSearchLoading.value = false;
    return;
  }

  try {
    const response = await api.get('/actor/search', {
      params: { keyword }
    });
    actorSearchResults.value = response.data.data || [];
  } catch (error) {
    console.error('搜索演员失败:', error);
    actorSearchResults.value = [];
  } finally {
    actorSearchLoading.value = false;
  }
}, 300);

// 处理演员搜索
const handleActorSearch = () => {
  actorSearchLoading.value = true;
  debouncedSearch(actorSearchKeyword.value);
};

// 加载演员图片
const loadActorImage = async (actor) => {
  // 如果图片已缓存，直接使用
  if (imageCache.value[actor.id]) {
    hoveredActorImage.value = imageCache.value[actor.id];
    hoveredActorId.value = actor.id;
    return;
  }
  
  // 如果演员没有ID，不加载图片
  if (!actor.id) {
    return;
  }
  
  try {
    // 构造图片URL
    const imageUrl = `${API_CONFIG.BASE_URL}/actor/cover/${actor.id}`;
    
    // 预加载图片
    const img = new Image();
    img.onload = () => {
      // 确保鼠标仍在该演员项上
      hoveredActorImage.value = imageUrl;
      hoveredActorId.value = actor.id;
      // 缓存图片
      imageCache.value[actor.id] = imageUrl;
    };
    img.src = imageUrl;
  } catch (error) {
    console.error('加载演员图片失败:', error);
  }
};

// 清除演员图片
const clearActorImage = () => {
  hoveredActorImage.value = '';
  hoveredActorId.value = null;
};

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.style.display = 'none';
};

// 添加演员到已选列表
const addActor = (actor) => {
  // 检查是否已选择该演员
  if (!selectedActors.value.some(selected => selected.id === actor.id)) {
    selectedActors.value.push(actor);
  }
  
  // 清空搜索关键词和结果
  actorSearchKeyword.value = '';
  actorSearchResults.value = [];
  
  // 清除悬停图片
  clearActorImage();
};

// 从已选列表中移除演员
const removeActor = (index) => {
  selectedActors.value.splice(index, 1);
};

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.file = file;
  }
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

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    actorIds: [],
    tags: [],
    file: null
  };
  selectedActors.value = [];
  tagInput.value = '';
  actorSearchKeyword.value = '';
  actorSearchResults.value = [];
  hoveredActorImage.value = '';
  hoveredActorId.value = null;
  uploadProgress.value = 0;
};

// 提交表单
const handleSubmit = async () => {
  if (!form.value.file) {
    alert('请选择视频文件');
    return;
  }

  // 收集所有选中的演员ID
  const actorIds = selectedActors.value.map(actor => actor.id);

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // 创建FormData对象
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('description', form.value.description);
    
    // 添加演员ID列表（作为JSON字符串）
    formData.append('actors', JSON.stringify(actorIds));
    
    // 添加标签列表（作为JSON字符串）
    formData.append('tags', JSON.stringify(form.value.tags));
    
    // 添加视频文件
    formData.append('file', form.value.file);

    // 发送POST请求
    const response = await api.post('/video/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          uploadProgress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        }
      }
    });

    alert('视频上传成功');
    resetForm();
    
    // 可以选择跳转到其他页面
    // router.push('/videos');
  } catch (error) {
    console.error('视频上传失败:', error);
    if (error.response && error.response.data) {
      alert('视频上传失败: ' + error.response.data.message);
    } else {
      alert('网络错误，请检查连接');
    }
  } finally {
    uploading.value = false;
  }
};

// 组件挂载时不需要获取所有演员
onMounted(() => {
  // 不需要预先加载演员列表
});
</script>

<style scoped>
.video-upload-container {
  display: flex;
  flex-direction: column;
  align-items: normal;
  min-height: calc(100vh - 60px);
  padding: 50px 20px;
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

.video-upload-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.video-upload-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.video-upload-form {
  width: 100%;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
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
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #43d6b4;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.1);
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
  max-height: 200px;
  overflow-y: auto;
  margin-top: 5px;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 10;
  position: relative;
}

.search-result-item {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  color: #000; /* 黑色字体 */
  position: relative;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.actor-image-preview {
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 10px;
  width: 100px;
  height: 100px;
  background-color: #f8f9fa;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 20;
}

.actor-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.file-info {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
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

.progress-container {
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #43d6b4, #38b8a0);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  margin-top: 10px;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .video-upload-container {
    padding: 30px 15px;
    margin-top: 60px;
  }
  
  .tag-input-container {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .actor-image-preview {
    left: 0;
    top: 100%;
    margin-left: 0;
    margin-top: 5px;
  }
}
</style>