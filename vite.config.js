import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 设置 @ 指向 src 目录
    }
  },
  server: {
    host: '0.0.0.0', // 允许外部IP访问
    port: 9980,
    proxy: {
      '/api': {
        target: 'http://192.168.5.178:18080/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  optimizeDeps: {
    include: [
      'video.js',
    ]
  }
})