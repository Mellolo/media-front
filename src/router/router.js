import { createRouter, createWebHistory } from 'vue-router'
import VideoPlayerPage from '@/views/VideoPlayerPage.vue'
import HomePage from '@/views/HomePage.vue'
import CreateActorPage from '@/views/CreateActorPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import ActorProfilePage from '@/views/ActorProfilePage.vue'
import ActorListPage from '@/views/ActorListPage.vue'
import VideoUploadPage from '@/views/VideoUploadPage.vue'

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
    path: '/actor/profile/:id',
    name: 'ActorProfile',
    component: ActorProfilePage,
    props: true
  },
  {
    path: '/actor/list',
    name: 'ActorList',
    component: ActorListPage
  },
  {
    path: '/video/upload',
    name: 'VideoUpload',
    component: VideoUploadPage
  },
  {
    path: '/user/login',
    name: 'Login',
    component: LoginPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router