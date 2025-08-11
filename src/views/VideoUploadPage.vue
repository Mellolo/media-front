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
          <div 
            v-for="(actorSelector, index) in actorSelectors" 
            :key="index"
            class="actor-selector-wrapper"
          >
            <div class="actor-selector">
              <div class="search-input-container">
                <input 
                  type="text" 
                  v-model="actorSelector.keyword" 
                  placeholder="搜索演员名称" 
                  class="form-input"
                  @input="handleActorSearch(index)"
                />
                <button 
                  type="button" 
                  class="remove-actor-selector" 
                  @click="removeActorSelector(index)"
                >
                  ×
                </button>
              </div>
              
              <div v-if="actorSelector.loading" class="search-loading">搜索中...</div>
              
              <div 
                v-if="actorSelector.results.length > 0" 
                class="search-results"
              >
                <div 
                  v-for="actor in actorSelector.results" 
                  :key="actor.id"
                  class="search-result-item"
                  @click="addActor(index, actor)"
                >
                  {{ actor.name }}
                </div>
              </div>
            </div>
          </div>
          
          <button 
            type="button" 
            class="add-actor-selector" 
            @click="addActorSelector"
          >
            + 添加演员搜索框
          </button>
          
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

const router = useRouter();
const tagInput = ref('');
const uploading = ref(false);
const uploadProgress = ref(0);

// 演员选择器数组
const actorSelectors = ref([]);

// 已选择的演员列表
const selectedActors = ref([]);

const form = ref({
  name: '',
  description: '',
  actorIds: [],
  tags: [],
  file: null
});

// 添加演员选择器
const addActorSelector = () => {
  actorSelectors.value.push({
    keyword: '',
    results: [],
    loading: false
  });
};

// 移除演员选择器
const removeActorSelector = (index) => {
  actorSelectors.value.splice(index, 1);
};

// 防抖搜索函数
const debouncedSearch = debounce(async (index, keyword) => {
  const selector = actorSelectors.value[index];
  if (!selector) return;
  
  if (!keyword.trim()) {
    selector.results = [];
    selector.loading = false;
    return;
  }

  try {
    const response = await api.get('/actor/search', {
      params: { keyword }
    });
    // 更新对应选择器的结果
    if (actorSelectors.value[index]) {
      actorSelectors.value[index].results = response.data.data || [];
    }
  } catch (error) {
    console.error('搜索演员失败:', error);
    if (actorSelectors.value[index]) {
      actorSelectors.value[index].results = [];
    }
  } finally {
    if (actorSelectors.value[index]) {
      actorSelectors.value[index].loading = false;
    }
  }
}, 300);

// 处理演员搜索
const handleActorSearch = (index) => {
  const selector = actorSelectors.value[index];
  if (selector) {
    selector.loading = true;
    debouncedSearch(index, selector.keyword);
  }
};

// 添加演员到已选列表
const addActor = (index, actor) => {
  // 检查是否已选择该演员
  if (!selectedActors.value.some(selected => selected.id === actor.id)) {
    selectedActors.value.push(actor);
  }
  
  // 清空该选择器的搜索结果和关键词
  const selector = actorSelectors.value[index];
  if (selector) {
    selector.keyword = '';
    selector.results = [];
  }
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
  actorSelectors.value = [];
  selectedActors.value = [];
  tagInput.value = '';
  uploadProgress.value = 0;
};

// 提交表单
const handleSubmit = async () => {
  if (!form.value.file) {
    alert('请选择视频文件');
    return;
  }

  // 收集所有选中的演员ID
  form.value.actorIds = selectedActors.value.map(actor => actor.id);

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // 创建FormData对象
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('description', form.value.description);
    
    // 添加演员ID列表
    form.value.actorIds.forEach(id => {
      formData.append('actorIds', id);
    });
    
    // 添加标签列表
    form.value.tags.forEach(tag => {
      formData.append('tags', tag);
    });
    
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
  // 初始状态不添加任何演员选择器
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

.actor-selector-wrapper {
  margin-bottom: 15px;
  position: relative;
}

.actor-selector {
  width: 100%;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-container .form-input {
  padding-right: 40px;
}

.remove-actor-selector {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  font-weight: bold;
  color: #999;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.remove-actor-selector:hover {
  background-color: #f0f0f0;
  color: #ff6b6b;
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

.add-actor-selector {
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
  width: 100%;
  margin-bottom: 15px;
}

.add-actor-selector:hover {
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.3);
  transform: translateY(-2px);
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
}
</style>