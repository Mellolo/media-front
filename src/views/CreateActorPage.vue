<template>
  <div class="create-actor-container">
    <div class="create-actor-header">
      <h1>创建演员</h1>
    </div>
    <div class="create-actor-form">
      <form @submit.prevent="handleSubmit" class="actor-form">
        <div class="form-group">
          <label for="name" class="form-label">名称</label>
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
          <label for="coverImage" class="form-label">封面图</label>
          <input 
            type="file" 
            id="coverImage" 
            @change="handleFileChange" 
            accept="image/*"
            :class="{ 'input-error': coverImageError }"
          />
          <div v-if="coverImageError" class="error-message">请选择封面图</div>
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

// 错误状态
const nameError = ref(false);
const coverImageError = ref(false);

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
  
  // 重置错误状态
  nameError.value = false;
  coverImageError.value = false;
};

// 提交表单
const handleSubmit = async () => {
  // 重置错误状态
  nameError.value = false;
  coverImageError.value = false;
  
  // 验证表单
  let isValid = true;
  
  if (!actorForm.name.trim()) {
    nameError.value = true;
    isValid = false;
  }
  
  if (!actorForm.coverImage) {
    coverImageError.value = true;
    isValid = false;
  }
  
  // 如果验证失败，不提交表单
  if (!isValid) {
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
      // 跳转到演员展示页面
      router.push({ name: 'ActorProfile', params: { id: response.data.data } });
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
.create-actor-container {
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

.create-actor-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.create-actor-header h1 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.create-actor-form {
  width: 100%;
}

.actor-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
}

.form-group {
  margin-bottom: 25px;
  position: relative;
  width: 100%;
}

.form-label {
  display: block;
  text-align: left;
  color: #38b8a0;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 16px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  min-width: 300px;
  padding: 15px 20px;
  border: 2px solid #e1e1e1;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
  color: #000;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #aaa;
  font-size: 16px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #43d6b4;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(67, 214, 180, 0.1);
}

.form-group textarea {
  min-height: 120px;
  min-width: 500px;
  resize: vertical;
}

/* 文件输入框样式 */
.form-group input[type="file"] {
  padding: 15px 20px;
  background-color: #f8f9fa;
  cursor: pointer;
}

.form-group input[type="file"]::-webkit-file-upload-button {
  background-color: #43d6b4;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.form-group input[type="file"]::-webkit-file-upload-button:hover {
  background-color: #38b8a0;
}

/* 错误状态下的输入框样式 */
.form-group input.input-error,
.form-group textarea.input-error,
.form-group input[type="file"].input-error {
  border-color: #ff4757;
  background-color: #fff0f0;
}

/* 错误提示文字样式 */
.error-message {
  color: #ff4757;
  font-size: 14px;
  margin-top: 8px;
  text-align: left;
  font-weight: 500;
  display: block;
  animation: fadeIn 0.3s ease-in-out;
}

/* 添加淡入动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.image-preview {
  margin-top: 15px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  width: 100%;
}

.submit-button,
.reset-button {
  padding: 16px 30px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.submit-button {
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: white;
}

.submit-button:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(67, 214, 180, 0.4);
  transform: translateY(-2px);
}

.submit-button:disabled {
  background: linear-gradient(135deg, #cccccc 0%, #999999 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.reset-button {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  color: #333;
}

.reset-button:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .create-actor-container {
    padding: 30px;
    margin: 20px auto;
    width: 95%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .submit-button,
  .reset-button {
    width: 100%;
  }
}
</style>