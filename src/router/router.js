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
import EditActorPage from '@/views/EditActorPage.vue'
import VideoEditPage from '@/views/VideoEditPage.vue'
import NotFoundPage from '@/views/NotFoundPage.vue'
import GalleryUploadPage from '@/views/GalleryUploadPage.vue'
import GalleryListPage from '@/views/GalleryListPage.vue'
import TagSearchGalleryPage from '@/views/TagSearchGalleryPage.vue'
import GalleryEditPage from '@/views/GalleryEditPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/video/page/:id',
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
    path: '/actor/edit/:id',
    name: 'EditActor',
    component: EditActorPage,
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
    path: '/gallery/upload',
    name: 'GalleryUpload',
    component: GalleryUploadPage
  },
  {
    path: '/gallery/list',
    name: 'GalleryList',
    component: GalleryListPage
  },
  {
    path: '/gallery/page/:id',
    name: 'GalleryView',
    component: () => import('@/views/GalleryViewPage.vue'),
    props: true
  },
  {
    path: '/gallery/edit/:id',
    name: 'GalleryEdit',
    component: GalleryEditPage,
    props: true
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
  },
  {
    path: '/video/edit/:id',
    name: 'VideoEdit',
    component: VideoEditPage,
    props: true
  },
  {
    path: '/gallery/tag/search',
    name: 'TagSearchGallery',
    component: TagSearchGalleryPage
  },
  // 通配符路由，将所有不存在的URL重定向到404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundWildcard',
    component: NotFoundPage
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