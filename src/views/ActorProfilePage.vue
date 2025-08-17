<template>
  <div>
    <div class="actor-profile-container">
      <div class="actor-profile-content">
        <div class="actor-profile-layout">
          <div class="actor-info">
            <div class="actor-profile-header">
              <h1>演员信息</h1>
            </div>

            <div class="info-group">
              <label class="info-label">名称</label>
              <div class="info-value">{{ actor.name || '暂无' }}</div>
            </div>

            <div class="info-group">
              <label class="info-label">描述</label>
              <div class="info-value">{{ actor.description || '暂无描述' }}</div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="action-buttons" v-if="userLoginStatus.loggedIn">
              <button @click="goToEditPage" class="edit-button">编辑演员信息</button>
              <button @click="deleteActor" class="delete-button">删除演员</button>
            </div>
          </div>
          
          <div class="actor-image-section">
            <div class="image-frame">
              <div class="image-frame-header">
                <span class="image-frame-title">封面</span>
              </div>
              <div class="image-frame-content">
                <div class="image-preview" v-if="actor.id">
                  <img :src="`${API_CONFIG.BASE_URL}/actor/cover/${actor.id}?t=${imageTimestamp}`" :alt="actor.name" />
                </div>
                <div v-else class="no-image">暂无封面图</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 视频列表展示 -->
    <div class="actor-videos-section">
      <div class="section-header">
        <h2>相关视频</h2>
      </div>
      <VideoList :videos="actor.videos || []" :items-per-page="5" />
    </div>

    <!-- 图集列表展示 -->
    <div class="actor-galleries-section">
      <div class="section-header">
        <h2>相关图集</h2>
      </div>
      <GalleryList :galleries="actor.galleries || []" :items-per-page="5" :show-pagination="false" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/utils/api.js';
import API_CONFIG from '@/config/api.js';
import VideoList from '@/components/VideoList.vue';
import GalleryList from '@/components/GalleryList.vue';

const route = useRoute();
const router = useRouter();
const actor = ref({
  id: '',
  name: '',
  description: '',
  videos: [],
  galleries: [] // 添加图集数据字段
});

// 用户登录状态
const userLoginStatus = ref({
  loggedIn: false
});

// 检查用户登录状态
const checkLoginStatus = async () => {
  try {
    const response = await api.get('/user/login/status');
    userLoginStatus.value.loggedIn = response.data.data.loggedIn;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    userLoginStatus.value.loggedIn = false;
  }
};

// 图片时间戳，用于刷新缓存
const imageTimestamp = ref(Date.now());

// 获取演员信息
const fetchActorInfo = async () => {
  try {
    const response = await api.get(`/actor/page/${route.params.id}`);
    actor.value = response.data.data;
    
        
    // 更新时间戳以刷新图片
    imageTimestamp.value = Date.now();
  } catch (error) {
    console.error('获取演员信息失败:', error);
    router.push({
        name: 'ActorList',
      });
  }
};

// 跳转到编辑页面
const goToEditPage = () => {
  router.push({ name: 'EditActor', params: { id: route.params.id } });
};

// 删除演员
const deleteActor = async () => {
  // 弹窗确认是否删除
  if (confirm(`确定要删除演员 "${actor.value.name}" 吗？此操作不可恢复。`)) {
    try {
      // 发送删除请求
      await api.delete(`/auth/actor/delete/${route.params.id}`);
      alert('演员删除成功');
      // 删除成功后跳转到演员列表页面
      router.push({ name: 'ActorList' });
    } catch (error) {
      console.error('删除演员失败:', error);
    }
  }
};

// 组件挂载时获取演员信息和检查登录状态
onMounted(() => {
  fetchActorInfo();
  checkLoginStatus(); // 检查用户登录状态
});

// 监听路由变化，如果查询参数中有时间戳，则刷新数据
import { watch } from 'vue';
watch(() => route.query, (newQuery) => {
  if (newQuery.t) {
    fetchActorInfo();
  }
});
</script>

<style scoped>
.actor-profile-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(80vh - 60px);
  padding: 100px;
  background: white;
  border-radius: 80px;
  width: 100%;
  max-width: 2000px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

.actor-profile-header {
  text-align: left;
  margin-top: 20px;
  margin-bottom: 20px;
  width: 100%;
}

.actor-profile-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.actor-profile-content {
  width: 100%;
}

.actor-profile-layout {
  display: flex;
  gap: 30px;
  width: 100%;
}

.actor-info {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  flex-shrink: 0;
}

.info-group {
  margin-bottom: 25px;
  width: 100%;
}

.info-label {
  display: block;
  text-align: left;
  color: #000;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 16px;
}

.info-value {
  font-size: 16px;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
  text-align: left;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.edit-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.edit-button:hover {
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.3);
  transform: translateY(-2px);
}

.delete-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #ff7f7f 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.delete-button:hover {
  box-shadow: 0 5px 15px rgba(255, 127, 127, 0.3);
  transform: translateY(-2px);
}

.actor-image-section {
  width: 400px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.image-frame {
  border: 1px solid #e1e1e1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background: #fff;
  width: 400px;
}

.image-frame-header {
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  padding: 12px 20px;
  text-align: center;
}

.image-frame-title {
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.image-frame-content {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.no-image {
  color: #666;
  font-style: italic;
  padding: 20px;
  text-align: center;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* 视频列表部分样式 */
.actor-videos-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
  background: white;
  border-radius: 30px;
  width: 1200px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

/* 图集列表部分样式 */
.actor-galleries-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
  background: white;
  border-radius: 30px;
  width: 1200px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

.section-header h2 {
  color: #333;
  margin: 0 0 30px 0;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 768px) {
  .actor-profile-layout {
    flex-direction: column;
  }
  
  .actor-image-section {
    width: 100%;
  }
  
  .image-frame {
    width: 100%;
  }
  
  .actor-videos-section,
  .actor-galleries-section {
    padding: 0 15px;
    margin: 30px auto;
    width: calc(100% - 30px);
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>