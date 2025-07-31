import { createRouter, createWebHistory } from 'vue-router'
import VideoPlayerPage from '@/views/VideoPlayerPage.vue'
import HomePage from '@/views/HomePage.vue'
import CreateActorPage from '@/views/CreateActorPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/video/:id',
    name: 'VideoPlayer',
    component: VideoPlayerPage,
    props: true
  },
  {
    path: '/actor/create',
    name: 'CreateActor',
    component: CreateActorPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router