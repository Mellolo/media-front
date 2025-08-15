<template>
  <div class="gallery-upload-container">
    <div class="gallery-upload-header">
      <h1>图集上传</h1>
    </div>
    
    <form @submit.prevent="handleSubmit" class="gallery-upload-form">
      <div class="form-group">
        <label for="galleryName">图集名称 *</label>
        <input 
          type="text" 
          id="galleryName"
          v-model="form.name" 
          placeholder="请输入图集名称" 
          class="form-input"
          :class="{ 'input-error': nameError }"
        />
        <div v-if="nameError" class="error-message">请输入图集名称</div>
      </div>
      
      <div class="form-group">
        <label for="galleryDescription">图集描述</label>
        <textarea 
          id="galleryDescription"
          v-model="form.description" 
          placeholder="请输入图集描述（选填）" 
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
                @keydown.enter.prevent
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
        <label for="galleryTags">图集标签</label>
        <div class="tag-input-container">
          <input 
            type="text" 
            id="galleryTags"
            v-model="tagInput" 
            placeholder="输入标签后按回车添加" 
            class="form-input"
            @keyup.enter.stop="addTag"
            @keydown.enter.prevent
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
        <label for="galleryFiles">选择图片文件 *</label>
        <input 
          type="file" 
          id="galleryFiles"
          @change="handleFileChange" 
          accept="image/*"
          class="form-file"
          :class="{ 'input-error': filesError }"
          multiple
        />
        <div v-if="filesError" class="error-message">请选择至少一张图片</div>
        <div v-if="form.files.length > 0" class="files-info">
          已选择 {{ form.files.length }} 张图片:
          <ul class="files-list">
            <li v-for="(file, index) in form.files" :key="index">
              {{ file.name }} ({{ formatFileSize(file.size) }})
              <button type="button" @click="removeFile(index)" class="remove-file-button">×</button>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="uploading" class="submit-button">
          {{ uploading ? '上传中...' : '上传图集' }}
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
    
    <!-- 演员封面预览 -->
    <ActorCoverPreview
      v-model:visible="actorPreview.visible"
      :actor-id="actorPreview.actorId"
      :position="actorPreview.position"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api.js';
import API_CONFIG from '@/config/api.js';
import ActorCoverPreview from '@/components/ActorCoverPreview.vue';

const router = useRouter();
const tagInput = ref('');
const uploading = ref(false);
const uploadProgress = ref(0);

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

const form = ref({
  name: '',
  description: '',
  actorIds: [],
  tags: [],
  files: []
});

// 表单验证错误状态
const nameError = ref(false);
const filesError = ref(false);

// 显示演员预览
const showActorPreview = (event, actor) => {
  const rect = event.target.getBoundingClientRect();
  actorPreview.position.top = `${rect.top}px`;
  actorPreview.position.left = `${rect.right + 10}px`;
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

// 从已选列表中移除演员
const removeActor = (index) => {
  selectedActors.value.splice(index, 1);
  // 更新表单数据
  form.value.actorIds = selectedActors.value.map(a => a.id);
};

// 处理文件选择
const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    form.value.files = files;
    filesError.value = false;
  }
};

// 移除选定的文件
const removeFile = (index) => {
  form.value.files.splice(index, 1);
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
    files: []
  };
  selectedActors.value = [];
  tagInput.value = '';
  actorSearchKeyword.value = '';
  actorSearchResults.value = [];
  uploadProgress.value = 0;
  
  // 重置文件输入框
  const fileInput = document.getElementById('galleryFiles');
  if (fileInput) {
    fileInput.value = '';
  }
};

// 提交表单
const handleSubmit = async () => {
  // 重置错误状态
  nameError.value = !form.value.name.trim();
  filesError.value = form.value.files.length === 0;
  
  // 如果有必填字段错误，不提交表单
  if (nameError.value || filesError.value) {
    return;
  }
  
  try {
    uploading.value = true;
    uploadProgress.value = 0;
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('name', form.value.name);
    if (form.value.description) {
      formData.append('description', form.value.description);
    }
    if (form.value.actorIds.length > 0) {
      formData.append('actorIds', JSON.stringify(form.value.actorIds));
    }
    if (form.value.tags.length > 0) {
      formData.append('tags', JSON.stringify(form.value.tags));
    }
    // 添加所有图片文件
    form.value.files.forEach(file => {
      formData.append('files', file);
    });
    
    // 发送请求
    const response = await api.post('/auth/gallery/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      }
    });
    
    // 上传成功，跳转到图集播放页面（假设存在）
    // 这里暂时跳转到首页，等图集播放页面创建后再修改
    router.push({ name: 'Home' });
  } catch (error) {
    console.error('上传失败:', error);
    alert('上传失败: ' + (error.response?.data?.message || error.message));
  } finally {
    uploading.value = false;
  }
};

// 点击其他地方关闭搜索结果
const handleClickOutside = (event) => {
  if (searchResultsRef.value && !searchResultsRef.value.contains(event.target)) {
    actorSearchResults.value = [];
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.gallery-upload-container {
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

.gallery-upload-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.gallery-upload-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gallery-upload-form {
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
.form-textarea.input-error,
.form-file.input-error {
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

.search-result-item:last-child {
  border-bottom: none;
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

.form-file {
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

.form-file:focus {
  outline: none;
  border-color: #43d6b4;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.1);
}

.files-info {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.files-list {
  margin-top: 10px;
  padding-left: 20px;
}

.files-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.remove-file-button {
  background: none;
  border: none;
  color: #ff4757;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 10px;
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
  will-change: width;
  border-radius: 5px;
}

.progress-text {
  text-align: center;
  margin-top: 10px;
  font-weight: 600;
  color: #333;
}

.error-message {
  color: #ff4757;
  font-size: 14px;
  margin-top: 5px;
  text-align: left;
}

@media (max-width: 768px) {
  .gallery-upload-container {
    padding: 30px 15px;
    margin-top: 60px;
  }
  
  .tag-input-container {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-input,
  .form-textarea,
  .form-file {
    min-width: auto;
  }
}
</style>