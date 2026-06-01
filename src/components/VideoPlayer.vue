<template>
  <div class="video-player">
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin"
      controls
      preload="auto"
      oncontextmenu="return false"
      controlsList="nodownload"
    >
      <!-- 根据视频类型动态设置 source -->
      <source v-if="videoType === 'native'" :src="nativeSrc" type="video/mp4" />
      <source v-else-if="videoType === 'hls'" :src="hlsSrc" type="application/x-mpegURL" />
      您的浏览器不支持视频播放。
    </video>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>
  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default {
  name: 'VideoPlayer',
  props: {
    videoId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      player: null,
      videoType: 'native', // 'native' 或 'hls'
      nativeSrc: '',
      hlsSrc: '',
      loading: true,
      loadingMessage: '准备视频中...'
    };
  },
  async mounted() {
    await this.initializePlayer();
  },
  methods: {
    async initializePlayer() {
      try {
        this.loading = true;
        this.loadingMessage = '准备视频中...';
        
        // 请求流式播放接口（后端智能判断是否需要转码）
        const response = await fetch(`/api/video/stream/${this.videoId}`, {
          headers: { 
            'Authorization': localStorage.getItem('authToken')
          }
        });
        
        if (!response.ok) {
          throw new Error('获取视频信息失败');
        }
        
        const data = await response.json();
        
        if (data.type === 'native') {
          // 直接播放原始文件
          this.videoType = 'native';
          this.nativeSrc = this.addTokenToUrl(data.url);
          this.loading = false;
        } else {
          // 播放 HLS 流
          this.videoType = 'hls';
          this.loadingMessage = '正在转码，请稍候...';
          this.hlsSrc = data.playlist_url;
          this.loading = false;
        }
        
        // 初始化播放器
        this.initVideoJS();
        
      } catch (error) {
        console.error('初始化播放器失败:', error);
        this.loadingMessage = '加载失败，请重试';
        this.loading = true;
      }
    },
    
    initVideoJS() {
      this.player = videojs(this.$refs.videoPlayer, {
        controls: true,
        preload: 'auto',
        fluid: true,
        responsive: true,
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true
          }
        }
      });
      
      // 禁用右键菜单
      this.$refs.videoPlayer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
      
      // 禁用拖拽
      this.$refs.videoPlayer.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      });
    },
    
    addTokenToUrl(url) {
      const token = localStorage.getItem('authToken');
      if (!token) return url;
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}token=${encodeURIComponent(token)}`;
    }
  },
  beforeUnmount() {
    // 销毁播放器实例以防止内存泄漏
    if (this.player) {
      this.player.dispose();
    }
  }
};
</script>

<style scoped>
.video-player {
  width: 800px;
  height: 450px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background-color: #000;
}

:deep(.video-js) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  background-color: #000;
}

:deep(.vjs-tech) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

:deep(.vjs-default-skin) {
  color: #fff;
  font-family: Arial, sans-serif;
}

/* 覆盖默认样式以适应我们的设计 */
:deep(.vjs-control-bar) {
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.vjs-play-progress) {
  background-color: #43d6b4;
}

:deep(.vjs-volume-level) {
  background-color: #43d6b4;
}

:deep(.vjs-slider-bar) {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 控制按钮样式 */
:deep(.vjs-control-bar .vjs-button) {
  color: #fff;
}

:deep(.vjs-control-bar .vjs-button:hover) {
  color: #43d6b4;
}

/* 时间显示样式 */
:deep(.vjs-current-time, .vjs-duration) {
  color: #fff;
}

/* 全屏按钮样式 */
:deep(.vjs-fullscreen-control) {
  float: right;
}

/* 音量控制样式 */
:deep(.vjs-volume-panel) {
  float: right;
}

/* 响应式控制栏 */
:deep(.vjs-control-bar) {
  font-size: 14px;
}

/* 加载状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  z-index: 10;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #43d6b4;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1200px) {
  .video-player {
    max-width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
  }
  
  :deep(.vjs-control-bar) {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  :deep(.vjs-control-bar) {
    font-size: 10px;
  }
  
  :deep(.vjs-big-play-button) {
    width: 2.5em;
    height: 2.5em;
  }
  
  :deep(.vjs-big-play-button:before) {
    font-size: 1.5em;
    line-height: 1.6em;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
  }
}
</style>