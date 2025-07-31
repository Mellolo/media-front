<template>
  <div v-if="isVisible" class="custom-alert-overlay" @click="closeOnOverlay">
    <div class="custom-alert-modal" @click.stop>
      <div class="custom-alert-header">
        <h3>系统提示</h3>
        <button class="custom-alert-close" @click="close">&times;</button>
      </div>
      <div class="custom-alert-body">
        <div class="custom-alert-message">
          <h4>消息内容</h4>
          <p>{{ message }}</p>
        </div>
        
        <div v-if="uuid" class="custom-alert-uuid">
          <h4>唯一标识</h4>
          <p>{{ uuid }}</p>
        </div>
        
        <div v-if="stack" class="custom-alert-stack">
          <h4>错误堆栈</h4>
          <pre>{{ stack }}</pre>
        </div>
      </div>
      <div class="custom-alert-footer">
        <button class="custom-alert-confirm" @click="close">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  uuid: {
    type: String,
    default: ''
  },
  stack: {
    type: String,
    default: ''
  },
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const closeOnOverlay = (event) => {
  if (event.target === event.currentTarget) {
    close();
  }
};
</script>

<style scoped>
.custom-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.custom-alert-modal {
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.custom-alert-header {
  padding: 20px;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-alert-header h3 {
  margin: 0;
  font-size: 18px;
}

.custom-alert-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-alert-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.custom-alert-message,
.custom-alert-uuid,
.custom-alert-stack {
  margin-bottom: 20px;
  color: #333;
}

.custom-alert-message h4,
.custom-alert-uuid h4,
.custom-alert-stack h4 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #333;
  font-size: 16px;
}

.custom-alert-message p,
.custom-alert-uuid p {
  margin: 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
  border: 1px solid #e1e1e1;
  word-break: break-all;
}

.custom-alert-stack pre {
  margin: 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
  border: 1px solid #e1e1e1;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.custom-alert-footer {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e1e1e1;
  display: flex;
  justify-content: flex-end;
}

.custom-alert-confirm {
  padding: 10px 20px;
  background: linear-gradient(135deg, #43d6b4 0%, #38b8a0 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-alert-confirm:hover {
  box-shadow: 0 3px 10px rgba(67, 214, 180, 0.3);
  transform: translateY(-2px);
}
</style>