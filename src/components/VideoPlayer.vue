<template>
  <div class="video-player">
    <video
      controls
      class="video-element"
      oncontextmenu="return false"
      controlsList="nodownload"
      :onloadedmetadata="() => {}"
    >
      <source :src="src" type="video/mp4" />
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
  width: 90%;
  height: 90%;
}
</style>