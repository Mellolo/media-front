<template>
  <div class="create-actor-page">
    <div class="container">
      <h1>创建演员</h1>
      <form @submit.prevent="handleSubmit" class="actor-form">
        <div class="form-group">
          <label for="name">演员名称 *</label>
          <input 
            type="text" 
            id="name" 
            v-model="actorForm.name" 
            required
            placeholder="请输入演员名称"
          />
        </div>

        <div class="form-group">
          <label for="description">描述</label>
          <textarea 
            id="description" 
            v-model="actorForm.description" 
            rows="4"
            placeholder="请输入演员描述（可选）"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="coverImage">封面图 *</label>
          <input 
            type="file" 
            id="coverImage" 
            @change="handleFileChange" 
            accept="image/*"
            required
          />
          <div v-if="previewImage" class="image-preview">
            <img :src="previewImage" alt="预览图片" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting" class="submit-button">
            {{ isSubmitting ? '提交中...' : '创建演员' }}
          </button>
          <button type="button" @click="resetForm" class="reset-button">重置</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api.js';

const router = useRouter();

// 表单数据
const actorForm = reactive({
  name: '',
  description: '',
  coverImage: null
});

// 状态管理
const isSubmitting = ref(false);
const previewImage = ref('');

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    actorForm.coverImage = file;
    
    // 生成预览图
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// 重置表单
const resetForm = () => {
  actorForm.name = '';
  actorForm.description = '';
  actorForm.coverImage = null;
  previewImage.value = '';
  const fileInput = document.getElementById('coverImage');
  if (fileInput) {
    fileInput.value = '';
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!actorForm.name || !actorForm.coverImage) {
    alert('请填写必填项');
    return;
  }

  isSubmitting.value = true;
  
  try {
    const formData = new FormData();
    formData.append('name', actorForm.name);
    formData.append('description', actorForm.description);
    formData.append('coverImage', actorForm.coverImage);

    const response = await api.post('/auth/actor/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data) {
      alert('演员创建成功');
      resetForm();
      // 可以选择跳转到演员列表或其他页面
      // router.push('/actors');
    }
  } catch (error) {
    console.error('创建演员失败:', error);
    if (error.response && error.response.data) {
      alert('创建失败: ' + error.response.data.message);
    } else {
      alert('创建失败，请重试');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.create-actor-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.actor-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

input,
textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #43d6b4;
  box-shadow: 0 0 0 2px rgba(67, 214, 180, 0.2);
}

input[type="file"] {
  padding: 10px 0;
}

.image-preview {
  margin-top: 10px;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  object-fit: cover;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.submit-button,
.reset-button {
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button {
  background-color: #43d6b4;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #38b8a0;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.reset-button {
  background-color: #f5f5f5;
  color: #333;
}

.reset-button:hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .container {
    padding: 20px;
    margin: 10px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>