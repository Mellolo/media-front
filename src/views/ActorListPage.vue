<template>
  <div class="actor-list-container">
    <div class="actor-list-header">
      <h1>演员列表</h1>
    </div>
    
    <div class="search-section">
      <form @submit.prevent="handleSearch" class="search-form">
        <div class="form-group">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="请输入演员名称关键词" 
            class="search-input"
          />
          <button type="submit" class="search-button">搜索</button>
        </div>
      </form>
    </div>
    
    <div class="actors-grid">
      <div v-if="loading" class="loading">搜索中...</div>
      <div v-else-if="actors.length === 0" class="no-results">暂无演员信息</div>
      <div 
        v-else
        v-for="actor in actors" 
        :key="actor.id" 
        class="actor-card"
        @click="goToActorProfile(actor.id)"
      >
        <div class="actor-card-content">
          <div class="actor-image">
            <img 
              v-if="actor.id" 
              :src="`${API_CONFIG.BASE_URL}/actor/cover/${actor.id}`" 
              :alt="actor.name"
              @error="handleImageError"
            />
            <div v-else class="no-image">暂无图片</div>
          </div>
          <div class="actor-info">
            <h3 class="actor-name">{{ actor.name }}</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api.js';
import API_CONFIG from '@/config/api.js';

const router = useRouter();
const searchKeyword = ref('');
const actors = ref([]);
const loading = ref(false);

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.style.display = 'none';
};

// 获取演员列表
const fetchActors = async (keyword = '') => {
  loading.value = true;
  try {
    const response = await api.get('/actor/search', {
      params: { keyword }
    });
    actors.value = response.data.data || [];
  } catch (error) {
    console.error('获取演员列表失败:', error);
    if (error.response && error.response.data) {
      alert('获取演员列表失败: ' + error.response.data.message);
    } else {
      alert('网络错误，请检查连接');
    }
    actors.value = [];
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  // 不允许空关键词搜索已经在HTML5的input中通过required属性限制
  // 但为了保险起见，我们仍然检查一下
  fetchActors(searchKeyword.value);
};

// 跳转到演员详情页
const goToActorProfile = (actorId) => {
  router.push({ name: 'ActorProfile', params: { id: actorId } });
};

// 组件挂载时获取所有演员列表
onMounted(() => {
  fetchActors();
});
</script>

<style scoped>
.actor-list-container {
  display: flex;
  flex-direction: column;
  align-items: normal;
  min-height: calc(100vh - 60px);
  padding: 50px 20px;
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

.actor-list-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.actor-list-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-section {
  width: 100%;
  max-width: 600px;
  margin-bottom: 40px;
  align-self: center;
}

.search-form {
  width: 100%;
}

.form-group {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e1e1e1;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  color: #000;
  min-width: 0;
}

.search-input::placeholder {
  color: #aaa;
}

.search-input:focus {
  outline: none;
  border-color: #43d6b4;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.1);
}

.search-button {
  padding: 15px 30px;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-button:hover {
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.3);
  transform: translateY(-2px);
}

.loading, .no-results {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
  grid-column: 1 / -1; /* 占据整行 */
}

.actors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
  width: 1200px;
}

.actor-card {
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.actor-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.actor-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.actor-image {
  width: 100%;
  height: 150px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.actor-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #999;
  font-style: italic;
}

.actor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.actor-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.actor-description {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  flex: 1;
}

@media (max-width: 768px) {
  .actor-list-container {
    padding: 30px 15px;
    margin-top: 60px;
  }
  
  .form-group {
    flex-direction: column;
  }
  
  .search-button {
    padding: 15px;
  }
  
  .actors-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
  }
  
  .actor-image {
    height: 130px;
  }
}

@media (max-width: 480px) {
  .actors-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
  
  .actor-image {
    height: 120px;
  }
  
  .actor-info {
    padding: 10px;
  }
  
  .actor-name {
    font-size: 14px;
    margin: 0 0 5px 0;
  }
  
  .actor-description {
    font-size: 11px;
  }
}
</style>