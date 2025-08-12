<template>
  <div class="video-player">
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin"
      controls
      preload="auto"
    >
      <source :src="fullSrc" type="video/mp4" />
      您的浏览器不支持视频播放。
    </video>
  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default {
  name: 'VideoPlayer',
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      player: null
    };
  },
  computed: {
    fullSrc() {
        return this.addTokenToUrl(this.src);
    }
  },
  methods: {
    addTokenToUrl(url) {
      // 获取存储在localStorage中的token
      const token = localStorage.getItem('authToken');
      
      // 如果没有token，直接返回原始URL
      if (!token) {
        return url;
      }
      
      // 检查URL是否已经包含查询参数
      const separator = url.includes('?') ? '&' : '?';
      
      // 添加token作为查询参数
      return `${url}${separator}token=${encodeURIComponent(token)}`;
    }
  },
  mounted() {
    // 初始化video.js播放器
    this.player = videojs(this.$refs.videoPlayer, {
      controls: true,
      preload: 'auto',
      fluid: false,
      responsive: false,
      aspectRatio: '16:9',
      width: '100%',
      height: '100%'
    });
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
  max-width: 1200px;
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

/* 大播放按钮样式 */
:deep(.vjs-big-play-button) {
  background-color: rgba(0, 0, 0, 0.5);
  border: 2px solid #43d6b4;
  border-radius: 50%;
  width: 3em;
  height: 3em;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

:deep(.vjs-big-play-button:hover) {
  background-color: rgba(67, 214, 180, 0.5);
  border-color: #fff;
}

:deep(.vjs-big-play-button:before) {
  font-size: 2em;
  line-height: 1.5em;
  text-shadow: none;
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
}
</style>