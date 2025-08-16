<template>
  <div class="gallery-edit-container">
    <div class="gallery-edit-header">
      <h1>编辑图集</h1>
    </div>
    
    <form @submit.prevent="handleSubmit" class="gallery-edit-form">
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
        <label>图集图片</label>
        <div class="gallery-images-container">
          <div 
            v-for="(image, index) in galleryImages" 
            :key="index"
            class="gallery-image-item"
          >
            <div class="image-wrapper">
              <img 
                :src="`${apiBaseUrl}/gallery/pic/${route.params.id}/${image.page}?t=${cacheBuster}`" 
                :alt="`图集图片 ${image.page}`"
                class="gallery-image"
              />
              <div class="image-overlay">
                <button 
                  type="button" 
                  class="remove-image-button"
                  @click="removeImage(index)"
                >
                  删除
                </button>
              </div>
            </div>
            <div class="image-info">
              第 {{ image.page }} 页
            </div>
          </div>
          
          <div class="upload-new-images">
            <label class="upload-label">
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileSelect"
                accept="image/*"
                multiple
                class="file-input"
              />
              <div class="upload-placeholder">
                <span class="plus-icon">+</span>
                <span>上传新图片</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="updating" class="submit-button">
          {{ updating ? '更新中...' : '更新图集' }}
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
import ActorCoverPreview from '@/components/ActorCoverPreview.vue';

const route = useRoute();
const router = useRouter();
const tagInput = ref('');
const updating = ref(false);
const fileInput = ref(null);
const apiBaseUrl = api.defaults.baseURL;
const cacheBuster = ref(Date.now());

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

// 原始图集数据（用于重置）
const originalGalleryData = ref(null);

// 图集图片列表
const galleryImages = ref([]);

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

// 移除图片
const removeImage = (index) => {
  galleryImages.value.splice(index, 1);
};

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    // 添加新文件到列表
    files.forEach(file => {
      galleryImages.value.push({
        file: file,
        isNewUploaded: true,
        page: galleryImages.value.length + 1
      });
    });
    
    // 重置文件输入
    event.target.value = '';
  }
};

// 重置表单（恢复原始数据）
const resetForm = () => {
  if (originalGalleryData.value) {
    // 恢复原始数据
    form.value.name = originalGalleryData.value.name;
    form.value.description = originalGalleryData.value.description || '';
    form.value.tags = [...(originalGalleryData.value.tags || [])];
    
    // 恢复演员数据
    selectedActors.value = originalGalleryData.value.actors ? 
      [...originalGalleryData.value.actors] : [];
    form.value.actorIds = selectedActors.value.map(actor => actor.id);
    
    // 恢复图片数据
    galleryImages.value = originalGalleryData.value.images ?
      [...originalGalleryData.value.images] : [];
  }
  
  // 清空搜索相关状态
  tagInput.value = '';
  actorSearchKeyword.value = '';
  actorSearchResults.value = [];
  nameError.value = false;
  
  // 重置文件输入
  if (fileInput.value) {
    fileInput.value.value = '';
  }
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
    
    // 准备表单数据
    const formData = new FormData();
    formData.append('id', route.params.id);
    formData.append('name', form.value.name);
    formData.append('description', form.value.description || '');
    
    // 添加演员ID
    form.value.actorIds.forEach(id => {
      formData.append('actorIds', id);
    });
    
    // 添加标签
    form.value.tags.forEach(tag => {
      formData.append('tags', tag);
    });
    
    // 添加图片信息
    const pagesData = galleryImages.value.map((image, index) => ({
      isNewUploaded: image.isNewUploaded || false,
      index: index + 1
    }));
    
    formData.append('pages', JSON.stringify(pagesData));
    
    // 添加新上传的文件
    galleryImages.value.forEach(image => {
      if (image.isNewUploaded && image.file) {
        formData.append('files', image.file);
      }
    });
    
    // 发送更新请求
    await api.post(`/auth/gallery/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // 更新成功，跳转到图集查看页面
    cacheBuster.value = Date.now();
    router.push({ name: 'GalleryView', params: { id: route.params.id }, query: { t: cacheBuster.value } });
  } catch (error) {
    console.error('更新失败:', error);
  } finally {
    updating.value = false;
  }
};

// 获取图集信息
const fetchGalleryData = async () => {
  try {
    const response = await api.get(`/gallery/page/${route.params.id}`);
    const galleryData = response.data.data;
    
    // 保存原始数据用于重置
    originalGalleryData.value = {
      name: galleryData.name,
      description: galleryData.description || '',
      tags: galleryData.tags ? [...galleryData.tags] : [],
      actors: galleryData.actors ? [...galleryData.actors] : [],
      images: []
    };
    
    // 填充表单数据
    form.value.name = galleryData.name;
    form.value.description = galleryData.description || '';
    form.value.tags = galleryData.tags || [];
    
    // 处理演员数据
    if (galleryData.actors && galleryData.actors.length > 0) {
      selectedActors.value = [...galleryData.actors];
      form.value.actorIds = galleryData.actors.map(actor => actor.id);
    }
    
    // 处理图片数据
    const pageCount = galleryData.pageCount || 0;
    galleryImages.value = Array.from({ length: pageCount }, (_, i) => ({
      page: i + 1,
      isNewUploaded: false
    }));
    
    originalGalleryData.value.images = [...galleryImages.value];
  } catch (error) {
    console.error('获取图集数据失败:', error);
    router.push({
      name: 'GalleryList',
    });
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
  fetchGalleryData();
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  fetchGalleryData();
});
</script>

<style scoped>
.gallery-edit-container {
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

.gallery-edit-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.gallery-edit-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gallery-edit-form {
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

.gallery-images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 15px;
}

.gallery-image-item {
  width: 150px;
  position: relative;
}

.image-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e1e1;
}

.gallery-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.remove-image-button {
  background: #ff4757;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.image-info {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.upload-new-images {
  width: 150px;
  height: 200px;
}

.upload-label {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-input {
  display: none;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  border: 2px dashed #e1e1e1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  border-color: #43d6b4;
  color: #43d6b4;
}

.plus-icon {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
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
  .gallery-edit-container {
    padding: 15px;
  }
  
  .form-input,
  .form-textarea {
    min-width: auto;
  }
  
  .search-results {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .gallery-edit-header h1 {
    font-size: 28px;
  }
  
  .gallery-images-container {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .search-results {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .gallery-edit-header h1 {
    font-size: 24px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>