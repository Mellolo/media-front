import { createRouter, createWebHistory } from 'vue-router'
import VideoPlayerPage from '@/views/VideoPlayerPage.vue'

const routes = [
  {
    path: '/',
    name: 'VideoPlayer',
    component: VideoPlayerPage
  },
  {
    path: '/video',
    name: 'VideoPlayer',
    component: VideoPlayerPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router