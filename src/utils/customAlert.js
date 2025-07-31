import { createApp } from 'vue';
import CustomAlert from '@/components/CustomAlert.vue';

let alertInstance = null;
let alertApp = null;

/**
 * 显示自定义alert弹窗
 * @param {Object} options - 弹窗选项
 * @param {string} options.message - 消息内容
 * @param {string} options.uuid - 唯一标识
 * @param {string} options.stack - 错误堆栈
 */
export const customAlert = ({ message = '', uuid = '', stack = '' } = {}) => {
  return new Promise((resolve) => {
    // 如果已经存在实例，先移除
    if (alertInstance) {
      document.body.removeChild(alertInstance);
      alertApp.unmount();
    }

    // 创建容器元素
    alertInstance = document.createElement('div');
    alertInstance.id = 'custom-alert-container';
    document.body.appendChild(alertInstance);

    // 创建Vue应用实例
    alertApp = createApp(CustomAlert, {
      message,
      uuid,
      stack,
      isVisible: true,
      onClose: () => {
        document.body.removeChild(alertInstance);
        alertApp.unmount();
        alertInstance = null;
        alertApp = null;
        resolve();
      }
    });

    // 挂载应用
    alertApp.mount(alertInstance);
  });
};

export default customAlert;