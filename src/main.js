import { createApp } from 'vue'
import '@/style.css'
import router from '@/router/router'
import App from '@/App.vue'
import { overrideGlobalAlert } from '@/utils/alertHandler.js'

// 覆盖全局alert
overrideGlobalAlert();

const app = createApp(App)
app.use(router)
app.mount('#app')