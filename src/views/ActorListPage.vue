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
      <div v-else-if="paginatedActors.length === 0" class="no-results">暂无演员信息</div>
      <div 
        v-else
        v-for="actor in paginatedActors" 
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
    
    <!-- 分页组件 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        :disabled="currentPage === 1" 
        @click="currentPage = 1"
        class="pagination-button"
      >
        首页
      </button>
      <button 
        :disabled="currentPage === 1" 
        @click="currentPage--"
        class="pagination-button"
      >
        上一页
      </button>
      
      <div class="pagination-input-container">
        <span>第</span>
        <input 
          type="number" 
          min="1" 
          :max="totalPages" 
          v-model.number="inputPage" 
          @keyup.enter="goToPage"
          class="pagination-input"
        />
        <span>页</span>
        <button @click="goToPage" class="go-button">跳转</button>
      </div>
      
      <span class="pagination-info">
        共 {{ totalPages }} 页
      </span>
      
      <button 
        :disabled="currentPage === totalPages" 
        @click="currentPage++"
        class="pagination-button"
      >
        下一页
      </button>
      <button 
        :disabled="currentPage === totalPages" 
        @click="currentPage = totalPages"
        class="pagination-button"
      >
        末页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api.js';
import API_CONFIG from '@/config/api.js';

const router = useRouter();
const searchKeyword = ref('');
const actors = ref([]);
const loading = ref(false);

// 分页相关
const currentPage = ref(1);
const itemsPerPage = ref(20); // 每页显示20个演员
const inputPage = ref(1); // 用于输入页码的响应式数据

// 监听当前页变化，同步更新输入框的值
watch(currentPage, (newPage) => {
  inputPage.value = newPage;
});

// 计算分页后的演员列表
const paginatedActors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return actors.value.slice(start, end);
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(actors.value.length / itemsPerPage.value);
});

// 跳转到指定页数
const goToPage = () => {
  let page = inputPage.value;
  
  // 验证输入的页码
  if (isNaN(page) || page < 1) {
    page = 1;
  } else if (page > totalPages.value) {
    page = totalPages.value;
  }
  
  currentPage.value = page;
  inputPage.value = page;
};

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
    // 重置到第一页
    currentPage.value = 1;
    inputPage.value = 1;
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
  max-width: 1200px;
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
  max-width: 1200px;
  margin: 0 auto;
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

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
  padding: 20px 0;
  flex-wrap: wrap;
}

.pagination-button {
  padding: 8px 16px;
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 50px;
}

.pagination-button:hover:not(:disabled) {
  background: #e0e0e0;
  border-color: #ccc;
}

.pagination-button:disabled {
  background: #f8f8f8;
  color: #999;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  margin: 0 10px;
}

.pagination-input-container {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  background-color: #fff; /* 白底 */
  color: #000; /* 黑字 */
}

.pagination-input:focus {
  outline: none;
  border-color: #43d6b4;
  box-shadow: 0 0 0 2px rgba(67, 214, 180, 0.2);
}

.pagination-input::-webkit-outer-spin-button,
.pagination-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.pagination-input[type=number] {
  -moz-appearance: none;
  appearance: none;
  outline: none;
  padding-right: 4px;
}

.go-button {
  padding: 6px 12px;
  background: #43d6b4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.go-button:hover {
  background: #38b8a0;
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
  
  .pagination {
    gap: 5px;
  }
  
  .pagination-button {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .pagination-input {
    width: 50px;
    padding: 4px 6px;
  }
  
  .go-button {
    padding: 4px 10px;
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
  
  .pagination {
    flex-direction: column;
  }
  
  .pagination-input-container {
    order: -1;
    margin-bottom: 10px;
  }
}
</style>