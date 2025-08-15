<template>
  <div class="gallery-viewer" ref="galleryContainer">
    <div class="gallery-thumbnails" v-if="images.length > 1">
      <div 
        v-for="(image, index) in images" 
        :key="image.id"
        class="thumbnail-item"
        :class="{ 'active': index === currentIndex }"
        @click="goToImage(index)"
      >
        <img :src="image.thumb" :alt="image.alt" />
      </div>
    </div>
    
    <div class="gallery-main">
      <div 
        class="gallery-slide" 
        v-for="(image, index) in images" 
        :key="image.id"
        :class="{ 'active': index === currentIndex }"
      >
        <img :src="image.src" :alt="image.alt" @load="onImageLoad" />
        <div class="image-info" v-if="images.length > 1">
          <span class="image-counter">{{ index + 1 }} / {{ images.length }}</span>
          <span class="image-caption">{{ image.caption }}</span>
        </div>
      </div>
      
      <div class="gallery-navigation" v-if="images.length > 1">
        <button class="nav-button prev-button" @click="prevImage" :disabled="currentIndex === 0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="nav-button next-button" @click="nextImage" :disabled="currentIndex === images.length - 1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      
      <div class="gallery-placeholder" v-if="images.length === 0">
        <p>暂无图片</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';

export default {
  name: 'GalleryViewer',
  props: {
    images: {
      type: Array,
      default: () => []
    }
  },
  emits: ['image-change'],
  setup(props, { emit }) {
    const galleryContainer = ref(null);
    const currentIndex = ref(0);
    const loadedImages = ref(new Set());
    
    // 上一张图片
    const prevImage = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
        emit('image-change', currentIndex.value);
      }
    };
    
    // 下一张图片
    const nextImage = () => {
      if (currentIndex.value < props.images.length - 1) {
        currentIndex.value++;
        emit('image-change', currentIndex.value);
      }
    };
    
    // 跳转到指定图片
    const goToImage = (index) => {
      if (index >= 0 && index < props.images.length) {
        currentIndex.value = index;
        emit('image-change', currentIndex.value);
      }
    };
    
    // 图片加载完成
    const onImageLoad = (event) => {
      const img = event.target;
      loadedImages.value.add(img.src);
    };
    
    // 键盘事件处理
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        default:
          break;
      }
    };
    
    // 监听图片变化
    watch(
      () => props.images,
      (newImages) => {
        if (newImages.length > 0 && currentIndex.value >= newImages.length) {
          currentIndex.value = newImages.length - 1;
        }
      }
    );
    
    // 组件挂载时添加事件监听
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown);
    });
    
    // 组件卸载时移除事件监听
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
    
    return {
      galleryContainer,
      currentIndex,
      loadedImages,
      prevImage,
      nextImage,
      goToImage,
      onImageLoad
    };
  }
};
</script>

<style scoped>
.gallery-viewer {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.gallery-thumbnails {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.7);
  max-height: 150px;
  overflow-y: auto;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.thumbnail-item:hover {
  border-color: #43d6b4;
  transform: scale(1.05);
}

.thumbnail-item.active {
  border-color: #43d6b4;
  box-shadow: 0 0 10px rgba(67, 214, 180, 0.5);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-main {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  min-height: 400px;
}

.gallery-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.gallery-slide.active {
  opacity: 1;
  z-index: 2;
}

.gallery-slide img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.image-info {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 14px;
}

.image-counter {
  font-weight: bold;
  color: #43d6b4;
}

.image-caption {
  text-align: right;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gallery-navigation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.3s ease;
}

.nav-button:hover:not(:disabled) {
  background: rgba(67, 214, 180, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button.prev-button {
  left: 20px;
}

.nav-button.next-button {
  right: 20px;
}

.gallery-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .thumbnail-item {
    width: 60px;
    height: 60px;
  }
  
  .nav-button {
    width: 40px;
    height: 40px;
  }
  
  .nav-button.prev-button {
    left: 10px;
  }
  
  .nav-button.next-button {
    right: 10px;
  }
  
  .image-info {
    flex-direction: column;
    align-items: center;
    gap: 5px;
    bottom: 10px;
    padding: 8px 15px;
  }
  
  .image-counter,
  .image-caption {
    text-align: center;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .gallery-thumbnails {
    max-height: 100px;
    padding: 10px 5px;
  }
  
  .thumbnail-item {
    width: 50px;
    height: 50px;
  }
  
  .gallery-main {
    min-height: 300px;
  }
  
  .gallery-slide img {
    max-height: 60vh;
  }
}
</style>