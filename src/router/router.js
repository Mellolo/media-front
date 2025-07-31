import { createRouter, createWebHistory } from 'vue-router'
import VideoPlayerPage from '@/views/VideoPlayerPage.vue'
import HomePage from '@/views/HomePage.vue'
import CreateActorPage from '@/views/CreateActorPage.vue'
import LoginPage from '@/views/LoginPage.vue'

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
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router