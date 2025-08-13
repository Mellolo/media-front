import { createRouter, createWebHistory } from 'vue-router'
import VideoPlayerPage from '@/views/VideoPlayerPage.vue'
import HomePage from '@/views/HomePage.vue'
import CreateActorPage from '@/views/CreateActorPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import ActorProfilePage from '@/views/ActorProfilePage.vue'
import ActorListPage from '@/views/ActorListPage.vue'
import VideoUploadPage from '@/views/VideoUploadPage.vue'
import VideoListPage from '@/views/VideoListPage.vue'
import TagSearchVideoListPage from '@/views/TagSearchVideoListPage.vue'

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
    path: '/video/list',
    name: 'VideoList',
    component: VideoListPage
  },
  {
    path: '/video/tag/search',
    name: 'TagSearchVideoList',
    component: TagSearchVideoListPage
  },
  {
    path: '/user/login',
    name: 'Login',
    component: LoginPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（浏览器前进/后退），则返回保存的位置
    if (savedPosition) {
      return savedPosition
    }
    // 如果路由有hash锚点，则滚动到锚点元素
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    // 默认滚动到页面顶部
    return { top: 0 }
  }
})

export default router