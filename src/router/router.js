import { createRouter, createWebHistory } from 'vue-router'
import VideoPlayerPage from '@/views/VideoPlayerPage.vue'
import HomePage from '@/views/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
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