<template>
  <div class="video-player-container">
    <h1>视频播放页面</h1>
    <VideoPlayer src="https://www.w3schools.com/html/mov_bbb.mp4" />
  </div>
</template>

<script>
import VideoPlayer from './components/VideoPlayer.vue';

export default {
  name: 'VideoPlayerPage',
  components: {
    VideoPlayer
  }
};
</script>

<style scoped>
.video-player-container {
  padding: 20px;
}
</style>