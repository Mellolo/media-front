<template>
  <div ref="imageBrowserRef" class="image-browser">
    <div 
      v-if="images.length === 0" 
      class="no-images"
    >
      暂无图片
    </div>
    <div 
      v-else
      class="image-container"
    >
      <!-- 当前图片显示区域 -->
      <div class="current-image-container">
        <img 
          v-if="currentImage" 
          :src="currentImage.src" 
          :alt="`图片 ${currentIndex + 1}`"
          class="current-image"
          @load="onImageLoad"
          @error="onImageError"
        >
        <div v-else class="image-placeholder">
          加载中...
        </div>
        
        <!-- 图片加载错误提示 -->
        <div 
          v-if="imageLoadError" 
          class="image-error"
        >
          图片加载失败
        </div>
      </div>
      
      <!-- 图片导航控件 -->
      <div class="image-navigation">
        <button 
          class="nav-button prev-button"
          :disabled="currentIndex === 0"
          @click="prevImage"
        >
          上一张
        </button>
        
        <div class="image-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
        
        <button 
          class="nav-button next-button"
          :disabled="currentIndex === images.length - 1"
          @click="nextImage"
        >
          下一张
        </button>
      </div>
      
      <!-- 缩略图列表 -->
      <div class="thumbnail-list">
        <div 
          v-for="(image, index) in images" 
          :key="index"
          class="thumbnail-item"
          :class="{ active: index === currentIndex }"
          @click="setCurrentImage(index)"
        >
          <img 
            :src="image.thumb" 
            :alt="`缩略图 ${index + 1}`"
            @error="onThumbnailError(index, $event)"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

export default {
  name: 'ImageBrowser',
  props: {
    images: {
      type: Array,
      default: () => []
    },
    initialIndex: {
      type: Number,
      default: 0
    }
  },
  emits: ['update-current-index'],
  setup(props, { emit }) {
    const imageBrowserRef = ref(null);
    const currentIndex = ref(props.initialIndex);
    const imageLoadError = ref(false);
    
    // 当前显示的图片
    const currentImage = computed(() => {
      return props.images[currentIndex.value];
    });
    
    // 图片加载成功处理
    const onImageLoad = () => {
      imageLoadError.value = false;
    };
    
    // 图片加载失败处理
    const onImageError = () => {
      imageLoadError.value = true;
    };
    
    // 缩略图加载失败处理
    const onThumbnailError = (index, event) => {
      // 可以在这里处理缩略图加载失败的情况
      console.warn(`缩略图 ${index + 1} 加载失败`);
    };
    
    // 设置当前图片
    const setCurrentImage = (index) => {
      if (index >= 0 && index < props.images.length) {
        currentIndex.value = index;
        imageLoadError.value = false;
        emit('update-current-index', index);
      }
    };
    
    // 上一张图片
    const prevImage = () => {
      if (currentIndex.value > 0) {
        setCurrentImage(currentIndex.value - 1);
      }
    };
    
    // 下一张图片
    const nextImage = () => {
      if (currentIndex.value < props.images.length - 1) {
        setCurrentImage(currentIndex.value + 1);
      }
    };
    
    // 键盘事件处理
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        prevImage();
      } else if (event.key === 'ArrowRight') {
        nextImage();
      }
    };
    
    // 监听images变化，重置currentIndex
    watch(() => props.images, (newImages) => {
      if (newImages.length > 0) {
        // 确保currentIndex在有效范围内
        if (currentIndex.value >= newImages.length) {
          currentIndex.value = newImages.length - 1;
        }
      } else {
        currentIndex.value = 0;
      }
      imageLoadError.value = false;
    });
    
    // 监听currentIndex变化
    watch(currentIndex, (newIndex) => {
      emit('update-current-index', newIndex);
    });
    
    onMounted(() => {
      // 添加键盘事件监听
      window.addEventListener('keydown', handleKeyDown);
    });
    
    onUnmounted(() => {
      // 移除键盘事件监听
      window.removeEventListener('keydown', handleKeyDown);
    });
    
    return {
      imageBrowserRef,
      currentIndex,
      currentImage,
      imageLoadError,
      onImageLoad,
      onImageError,
      onThumbnailError,
      setCurrentImage,
      prevImage,
      nextImage
    };
  }
};
</script>

<style scoped>
.image-browser {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #000;
}

.no-images {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 500px;
  color: #ccc;
  font-size: 18px;
}

.image-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.current-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 400px;
}

.current-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  height: 400px;
}

.image-placeholder {
  color: #ccc;
  font-size: 18px;
}

.image-error {
  position: absolute;
  color: #ff6b6b;
  font-size: 18px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 8px;
}

.image-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: rgba(30, 30, 30, 0.9);
}

.nav-button {
  background: #43d6b4;
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: 600;
}

.nav-button:hover:not(:disabled) {
  background: #3ab09e;
}

.nav-button:disabled {
  background: #555;
  cursor: not-allowed;
}

.image-counter {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.thumbnail-list {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 15px 10px;
  background-color: rgba(20, 20, 20, 0.95);
  gap: 10px;
  max-height: 120px;
}

.thumbnail-item {
  flex: 0 0 auto;
  width: 100px;
  height: 100px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.thumbnail-item.active {
  border-color: #43d6b4;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-item:hover {
  border-color: #3ab09e;
}

/* 滚动条样式 */
.thumbnail-list::-webkit-scrollbar {
  height: 8px;
}

.thumbnail-list::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.thumbnail-list::-webkit-scrollbar-thumb {
  background: #43d6b4;
  border-radius: 4px;
}

.thumbnail-list::-webkit-scrollbar-thumb:hover {
  background: #3ab09e;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-navigation {
    padding: 10px 15px;
  }
  
  .nav-button {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .image-counter {
    font-size: 16px;
  }
  
  .thumbnail-item {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .current-image-container {
    height: 300px;
  }
  
  .nav-button {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .image-counter {
    font-size: 14px;
  }
  
  .thumbnail-item {
    width: 60px;
    height: 60px;
  }
}
</style>