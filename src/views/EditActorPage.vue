<template>
  <div class="edit-actor-container">
    <div class="edit-actor-header">
      <h1>编辑演员</h1>
    </div>
    <div class="edit-actor-form">
      <form @submit.prevent="handleSubmit" class="actor-form">
        <div class="form-group">
          <label for="name" class="form-label">名称 *</label>
          <input 
            type="text" 
            id="name" 
            v-model="actorForm.name" 
            placeholder="名称 *"
            :class="{ 'input-error': nameError }"
          />
          <div v-if="nameError" class="error-message">请输入名称</div>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">描述</label>
          <textarea 
            id="description" 
            v-model="actorForm.description" 
            rows="4"
            placeholder="描述"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="cover" class="form-label">封面图</label>
          <input 
            type="file" 
            id="cover" 
            @change="handleFileChange" 
            accept="image/*"
            ref="fileInput"
          />
          <div v-if="previewImage" class="image-preview">
            <img :src="previewImage" alt="预览图片" />
          </div>
          <div v-else-if="existingCover" class="image-preview">
            <img :src="existingCover" alt="当前封面图" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting" class="submit-button">
            {{ isSubmitting ? '提交中...' : '更新演员' }}
          </button>
          <button type="button" @click="resetForm" class="reset-button">重置</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/utils/api.js';
import API_CONFIG from '@/config/api.js';

const route = useRoute();
const router = useRouter();
const fileInput = ref(null);

// 表单数据
const actorForm = reactive({
  name: '',
  description: '',
  cover: null
});

// 状态管理
const isSubmitting = ref(false);
const previewImage = ref('');
const existingCover = ref('');
const originalActorData = ref({});

// 错误状态
const nameError = ref(false);

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    actorForm.cover = file;
    
    // 生成预览图
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    actorForm.cover = null;
    previewImage.value = '';
  }
};

// 重置表单
const resetForm = () => {
  actorForm.name = originalActorData.value.name || '';
  actorForm.description = originalActorData.value.description || '';
  actorForm.cover = null;
  
  previewImage.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  
  // 重置错误状态
  nameError.value = false;
};

// 获取演员信息
const fetchActorInfo = async () => {
  try {
    const response = await api.get(`/actor/page/${route.params.id}`);
    const actorData = response.data.data;
    
    // 保存原始数据
    originalActorData.value = { ...actorData };
    
    // 填充表单
    actorForm.name = actorData.name || '';
    actorForm.description = actorData.description || '';
    
    // 设置现有封面图
    if (actorData.id) {
      existingCover.value = `${API_CONFIG.BASE_URL}/actor/cover/${actorData.id}?t=${new Date().getTime()}`;
    }
  } catch (error) {
    console.error('获取演员信息失败:', error);
    alert('获取演员信息失败');
  }
};

// 提交表单
const handleSubmit = async () => {
  // 重置错误状态
  nameError.value = false;
  
  // 验证表单
  let isValid = true;
  
  if (!actorForm.name.trim()) {
    nameError.value = true;
    isValid = false;
  }
  
  // 如果验证失败，不提交表单
  if (!isValid) {
    return;
  }

  isSubmitting.value = true;
  
  try {
    const formData = new FormData();
    formData.append('id', route.params.id); // 将ID添加到请求体中
    formData.append('name', actorForm.name);
    formData.append('description', actorForm.description);
    
    // 只有当用户选择了新图片时才添加cover字段
    if (actorForm.cover) {
      formData.append('cover', actorForm.cover);
    }

    // 修改API端点，不再在URL中包含ID
    const response = await api.post(`/auth/actor/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data) {
      alert('演员信息更新成功');
      // 跳转到演员展示页面，并添加时间戳参数以确保刷新数据和图片
      router.push({ 
        name: 'ActorProfile', 
        params: { id: route.params.id },
        query: { t: new Date().getTime() } // 添加时间戳确保刷新
      });
    }
  } catch (error) {
    console.error('更新演员失败:', error);
    alert('更新演员失败');
  } finally {
    isSubmitting.value = false;
  }
};

// 组件挂载时获取演员信息
onMounted(() => {
  fetchActorInfo();
});
</script>

<style scoped>
.edit-actor-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 50px;
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 60px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}

.edit-actor-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.edit-actor-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.edit-actor-form {
  width: 100%;
}

.actor-form {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  color: #000;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #43d6b4;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-group input.input-error {
  border-color: #ff4d4f;
  background-color: #fff6f6;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 5px;
}

.image-preview {
  margin-top: 15px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.submit-button,
.reset-button {
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.submit-button {
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: white;
}

.submit-button:hover:not(:disabled) {
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.3);
  transform: translateY(-2px);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-button {
  background: #f0f0f0;
  color: #666;
}

.reset-button:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .edit-actor-container {
    padding: 30px 20px;
    margin-top: 60px;
  }
  
  .edit-actor-header h1 {
    font-size: 24px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .submit-button,
  .reset-button {
    width: 100%;
    padding: 15px;
  }
}
</style>