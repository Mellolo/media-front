<template>
  <div 
    v-if="visible" 
    class="actor-preview"
    :style="style"
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
import { ref, reactive, watch } from 'vue'
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

// 样式计算
const style = reactive({
  top: props.position.top || '0px',
  left: props.position.left || '0px'
})

// 监听属性变化
watch(() => props.position, (newPosition) => {
  style.top = newPosition.top || '0px'
  style.left = newPosition.left || '0px'
})

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