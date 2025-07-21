import { createRouter, createWebHistory } from 'vue-router'
import VideoPlayerPage from '../sites/VideoPlayerPage.vue'
import App from '../sites/App.vue'

const routes = [
  {
    path: '/',
    name: 'App',
    component: App
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