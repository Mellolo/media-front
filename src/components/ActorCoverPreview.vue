<template>
  <div 
    v-if="visible" 
    class="actor-preview"
    :style="previewStyle"
  >
    <div v-if="loading" class="preview-loading">加载中...</div>
    <img 
      v-else-if="imageUrl && !error"
      :src="imageUrl" 
      alt="演员封面"
      class="preview-image"
      @error="onImageError"
    />
    <div v-else class="preview-error">图片加载失败</div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import API_CONFIG from '@/config/api.js'

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  actorId: {
    type: [String, Number],
    default: null
  },
  position: {
    type: Object,
    default: () => ({ top: '0px', left: '0px' })
  }
})

// 定义组件事件
const emit = defineEmits(['update:visible'])

// 响应式数据
const loading = ref(false)
const imageUrl = ref('')
const error = ref(false)

// 计算样式，确保预览框不会超出视窗边界
const previewStyle = computed(() => {
  let top = parseInt(props.position.top) || 0;
  let left = parseInt(props.position.left) || 0;
  
  // 检查是否在浏览器环境中
  if (typeof window !== 'undefined') {
    // 预览框尺寸
    const previewWidth = 150;
    const previewHeight = 150;
    
    // 获取视窗尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 确保预览框不会超出右边界
    if (left + previewWidth > viewportWidth) {
      left = viewportWidth - previewWidth - 10; // 留10px边距
    }
    
    // 确保预览框不会超出左边界
    if (left < 0) {
      left = 10; // 留10px边距
    }
    
    // 确保预览框不会超出下边界
    if (top + previewHeight > viewportHeight) {
      top = viewportHeight - previewHeight - 10; // 留10px边距
    }
    
    // 确保预览框不会超出上边界
    if (top < 0) {
      top = 10; // 留10px边距
    }
  }
  
  return {
    top: `${top}px`,
    left: `${left}px`
  }
})

// 监听属性变化
watch(() => props.actorId, (newActorId) => {
  if (newActorId) {
    loadActorCover(newActorId)
  }
})

watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    // 重置状态
    loading.value = false
    imageUrl.value = ''
    error.value = false
  } else if (props.actorId) {
    loadActorCover(props.actorId)
  }
})

// 加载演员封面图
const loadActorCover = (actorId) => {
  loading.value = true
  error.value = false
  imageUrl.value = `${API_CONFIG.BASE_URL}/actor/cover/${actorId}`
  loading.value = false
}

// 处理图片加载错误
const onImageError = () => {
  loading.value = false
  error.value = true
}

// 关闭预览
const closePreview = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.actor-preview {
  position: fixed;
  width: 150px;
  height: 150px;
  background: #333;
  border: 1px solid #43d6b4;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-loading,
.preview-error {
  color: #fff;
  font-size: 14px;
}

@media (max-width: 768px) {
  .actor-preview {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 480px) {
  .actor-preview {
    width: 100px;
    height: 100px;
  }
}
</style>