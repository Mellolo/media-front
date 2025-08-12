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
      fluid: true,
      responsive: true
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
  width: 700px;
  max-width: 1200px;
  height: 675px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

:deep(.video-js) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

:deep(.vjs-default-skin) {
  color: #fff;
}

/* 覆盖默认样式以适应我们的设计 */
:deep(.vjs-control-bar) {
  background: rgba(0, 0, 0, 0.7);
}

:deep(.vjs-play-progress) {
  background-color: #43d6b4;
}

:deep(.vjs-volume-level) {
  background-color: #43d6b4;
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
}
</style>