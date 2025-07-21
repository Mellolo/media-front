import { createApp } from 'vue'
import './style.css'
import router from '@/router/router'
import App from '@/sites/App.vue'

const app = createApp(App)
app.use(router)
app.mount('#app')