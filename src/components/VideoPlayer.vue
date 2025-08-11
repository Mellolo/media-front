<template>
  <div class="video-player">
    <video
      controls
      class="video-element"
      oncontextmenu="return false"
      controlsList="nodownload"
    >
      <source :src="fullSrc" type="video/mp4" />
      您的浏览器不支持视频播放。
    </video>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    src: {
      type: String,
      required: true
    }
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
  }
};
</script>

<style scoped>
.video-player {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  max-width: 100%;
}

.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>