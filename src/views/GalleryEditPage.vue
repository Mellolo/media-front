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
        <div class="hint">拖拽图片可调整顺序</div>
        <div class="gallery-images-container">
          <div 
            v-for="(image, index) in galleryImages" 
            :key="index"
            class="gallery-image-item"
            :class="{ 
              'dragging': dragState.draggingIndex === index,
              'drag-over': dragState.dragOverIndex === index
            }"
            draggable="true"
            :data-index="index"
            @dragstart="dragStart(index, $event)"
            @dragover.prevent="dragOver(index, $event)"
            @dragenter.prevent="dragEnter(index, $event)"
            @dragleave="dragLeave(index, $event)"
            @drop="drop(index, $event)"
            @dragend="dragEnd($event)"
            @mousedown="handleMouseDown(index, $event)"
            @touchstart="handleTouchStart(index, $event)"
            @touchmove="handleTouchMove(index, $event)"
            @touchend="handleTouchEnd(index, $event)"
          >
            <div class="image-wrapper">
              <img 
                v-if="!image.isNewUploaded"
                :src="getCachedImageUrl(image.originalPage)" 
                :alt="`图集图片 ${image.page}`"
                class="gallery-image"
              />
              <img 
                v-else
                :src="image.previewUrl"
                :alt="`新上传图片 ${index + 1}`"
                class="gallery-image"
              />
              <div class="image-overlay">
                <button 
                  type="button" 
                  class="remove-image-button"
                  @click.stop="removeImage(index)"
                  :disabled="isDeleting"
                  :class="{ 'deleting': isDeleting }"
                >
                  <span v-if="!isDeleting">删除</span>
                  <span v-else>删除中...</span>
                </button>
              </div>
            </div>
            <div class="image-info">
              第 {{ image.page }} 页
              <span v-if="image.isNewUploaded" class="new-tag">新</span>
              <span v-else class="original-page-tag">原:{{ image.originalPage }}</span>
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
import { ref, onMounted, reactive, watch, onUnmounted } from 'vue';
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

// 拖拽相关状态
const dragState = reactive({
  draggingIndex: null,
  dragOverIndex: null
});

// 删除相关状态
const isDeleting = ref(false);

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

// 图片缓存对象，用于存储所有图片的Blob数据
const imageCache = ref({});

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
  const imageToRemove = galleryImages.value[index];
  
  // 如果是新上传的图片，清理对应的预览URL
  if (imageToRemove.isNewUploaded) {
    if (imageToRemove.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }
  }
  // 注意：对于缓存图片，不删除imageCache中的内容，因为初始页码映射永远不变
  
  galleryImages.value.splice(index, 1);
  
  // 重新计算页码
  recalculatePageNumbers();
  
  // 确保响应式更新
  galleryImages.value = [...galleryImages.value];
};

// 获取图片预览URL
const getImagePreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

// 处理鼠标按下
const handleMouseDown = (index, event) => {
  // 只处理左键
  if (event.button === 0) {
    dragState.draggingIndex = index;
    event.target.classList.add('dragging');
  }
};

// 处理触摸开始
const handleTouchStart = (index, event) => {
  dragState.draggingIndex = index;
  event.target.classList.add('dragging');
  // 阻止默认的触摸滚动行为
  event.preventDefault();
};

// 处理触摸移动
const handleTouchMove = (index, event) => {
  // 防止触发点击事件
  if (dragState.draggingIndex !== null) {
    event.preventDefault();
  }
};

// 处理触摸结束
const handleTouchEnd = (index, event) => {
  if (dragState.draggingIndex !== null) {
    // 在触摸结束时找到放置位置
    const touch = event.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element) {
      // 找到最近的gallery-image-item元素
      const targetItem = element.closest('.gallery-image-item');
      if (targetItem && targetItem !== event.target) {
        const targetIndex = parseInt(targetItem.dataset.index);
        if (!isNaN(targetIndex)) {
          moveImage(dragState.draggingIndex, targetIndex);
          recalculatePageNumbers();
        }
      }
    }
    
    // 移除所有拖拽样式
    const imageItems = document.querySelectorAll('.gallery-image-item');
    imageItems.forEach(item => {
      item.classList.remove('drag-over');
      item.classList.remove('dragging');
    });
    
    // 重置拖拽状态
    dragState.draggingIndex = null;
    dragState.dragOverIndex = null;
  }
};

// 拖拽开始
const dragStart = (index, event) => {
  dragState.draggingIndex = index;
  event.dataTransfer.effectAllowed = 'move';
  // 添加拖拽样式
  event.target.classList.add('dragging');
  
  // 设置拖拽数据（用于兼容某些浏览器）
  event.dataTransfer.setData('text/plain', index);
};

// 拖拽经过
const dragOver = (index, event) => {
  event.preventDefault();
  dragState.dragOverIndex = index;
};

// 拖拽进入
const dragEnter = (index, event) => {
  event.preventDefault();
  // 添加拖拽目标样式
  if (index !== dragState.draggingIndex) {
    event.target.classList.add('drag-over');
  }
};

// 拖拽离开
const dragLeave = (index, event) => {
  // 移除拖拽目标样式
  event.target.classList.remove('drag-over');
};

// 放置
const drop = (index, event) => {
  event.preventDefault();
  
  // 移除所有拖拽样式
  const imageItems = document.querySelectorAll('.gallery-image-item');
  imageItems.forEach(item => {
    item.classList.remove('drag-over');
    item.classList.remove('dragging');
  });
  
  // 执行图片位置移动
  if (dragState.draggingIndex !== null && 
      dragState.draggingIndex !== index) {
    moveImage(dragState.draggingIndex, index);
  }
  
  // 重置拖拽状态
  dragState.draggingIndex = null;
  dragState.dragOverIndex = null;
};

// 拖拽结束
const dragEnd = (event) => {
  // 移除所有拖拽样式
  const imageItems = document.querySelectorAll('.gallery-image-item');
  imageItems.forEach(item => {
    item.classList.remove('drag-over');
    item.classList.remove('dragging');
  });
  
  // 重置拖拽状态
  dragState.draggingIndex = null;
  dragState.dragOverIndex = null;
};

// 移动图片到新位置
const moveImage = (fromIndex, toIndex) => {
  if (fromIndex >= 0 && fromIndex < galleryImages.value.length && 
      toIndex >= 0 && toIndex < galleryImages.value.length && 
      fromIndex !== toIndex) {
    // 创建新数组
    const newImages = [...galleryImages.value];
    // 取出要移动的图片
    const [movedImage] = newImages.splice(fromIndex, 1);
    // 将图片插入到新位置
    newImages.splice(toIndex, 0, movedImage);
    
    // 更新图片列表
    galleryImages.value = newImages;
    
    // 重新计算页码（只更新显示页码，不更新原始页码）
    recalculatePageNumbers();
  }
};

// 重新计算页码
const recalculatePageNumbers = () => {
  // 重新计算所有图片的显示页码
  galleryImages.value.forEach((image, index) => {
    // 更新显示页码
    image.page = index + 1;
  });
  
  // 不再需要更新新上传图片的缓存键名，因为预览图直接存储在元素中
};


// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    // 添加新文件到列表
    files.forEach(file => {
      // 为新上传的文件创建预览URL
      const previewUrl = URL.createObjectURL(file);
      
      galleryImages.value.push({
        file: file,
        isNewUploaded: true,
        page: galleryImages.value.length + 1,
        originalPage: null, // 新上传的图片没有原始页码
        previewUrl: previewUrl // 直接将预览图存储在元素中
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
      
    // 恢复初始页码映射
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
  
  // 重置拖拽状态
  dragState.draggingIndex = null;
  dragState.dragOverIndex = null;
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
    
    // 添加演员ID（使用JSON格式）
    if (form.value.actorIds.length > 0) {
      formData.append('actorIds', JSON.stringify(form.value.actorIds));
    }
    
    // 添加标签（使用JSON格式）
    if (form.value.tags.length > 0) {
      formData.append('tags', JSON.stringify(form.value.tags));
    }
    
    // 添加图片信息（按照要求的格式组织）
    // 先获取所有新上传的图片及其索引
    const newUploadedImages = galleryImages.value
      .map((image, index) => ({ image, index }))
      .filter(({ image }) => image.isNewUploaded);
    
    const pagesData = galleryImages.value.map((image, index) => {
      if (image.isNewUploaded) {
        // 如果是新增图片，isNewUploaded为true，index为空
        return {
          isNewUploaded: true,
          index: null
        };
      } else {
        // 如果是缓存图片，isNewUploaded为false，index为缓存图片原先的页码
        return {
          isNewUploaded: false,
          index: image.originalPage
        };
      }
    });
    
    formData.append('pages', JSON.stringify(pagesData));
    
    // 添加新上传的文件（只添加新上传的文件，按照在galleryImages中的顺序添加）
    newUploadedImages.forEach(({ image }) => {
      if (image.file) {
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
    
    // 填充表单数据
    form.value.name = galleryData.name;
    form.value.description = galleryData.description || '';
    form.value.tags = galleryData.tags || [];
    
    // 处理演员数据
    if (galleryData.actors && galleryData.actors.length > 0) {
      selectedActors.value = [...galleryData.actors];
      form.value.actorIds = galleryData.actors.map(actor => actor.id);
    } else {
      selectedActors.value = [];
      form.value.actorIds = [];
    }
    
    // 处理图片数据，记住每张图片的原始页码
    const pageCount = galleryData.pageCount || 0;
    galleryImages.value = Array.from({ length: pageCount }, (_, i) => ({
      page: i + 1,
      originalPage: i + 1, // 记住原始页码
      isNewUploaded: false
    }));
    
    // 保存原始数据用于重置
    originalGalleryData.value = {
      name: galleryData.name,
      description: galleryData.description || '',
      tags: galleryData.tags ? [...galleryData.tags] : [],
      actors: galleryData.actors ? [...galleryData.actors] : [],
      images: [...galleryImages.value]
    };
    
    // 缓存所有图片
    await cacheAllImages(pageCount);
    
    // 保存初始页码映射（永远不变）
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

onUnmounted(() => {
  // 清理图片缓存，避免内存泄漏
  Object.values(imageCache.value).forEach(url => {
    URL.revokeObjectURL(url);
  });
});

// 缓存所有图片
const cacheAllImages = async (pageCount) => {
  try {
    for (let i = 1; i <= pageCount; i++) {
      const imageUrl = `${apiBaseUrl}/gallery/pic/${route.params.id}/${i}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      imageCache.value[i] = URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error('缓存图片失败:', error);
  }
};

const getCachedImageUrl = (page) => {
  // 如果是新上传的图片，使用特殊键名获取
  if (page === null) {
    // 这里需要根据实际情况处理新上传的图片
    return '';
  }
  return imageCache.value[page] || '';
};

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
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: move;
}

.gallery-image-item.dragging {
  opacity: 0.7;
  transform: scale(0.93);
  z-index: 1000;
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.4);
  transition: all 0.3s ease;
}

.gallery-image-item.drag-over {
  transform: scale(1.08);
  box-shadow: 0 0 20px rgba(67, 214, 180, 0.6);
  z-index: 999;
  border: 2px dashed #43d6b4;
  background-color: #f0fbf7;
  transition: all 0.3s ease;
}

.image-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e1e1;
  transition: border-color 0.3s ease;
}

.gallery-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  -webkit-user-drag: none;
  pointer-events: none;
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
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.remove-image-button.deleting {
  background: #ff7f7f;
  cursor: not-allowed;
}

.remove-image-button:disabled {
  background: #ff7f7f;
  cursor: not-allowed;
}

.image-info {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.new-tag {
  background: #43d6b4;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 5px;
}

.original-page-tag {
  background: #38b8a0;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 5px;
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