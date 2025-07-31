import customAlert from './customAlert.js';

/**
 * 替换全局alert函数
 */
export const overrideGlobalAlert = () => {
  window.originalAlert = window.alert;
  
  window.alert = function(message) {
    customAlert({ message });
  };
};

/**
 * 恢复原始alert函数
 */
export const restoreGlobalAlert = () => {
  if (window.originalAlert) {
    window.alert = window.originalAlert;
    delete window.originalAlert;
  }
};

/**
 * 显示带错误详情的自定义alert
 * @param {string} message - 错误消息
 * @param {string} uuid - 错误UUID
 * @param {string} stack - 错误堆栈
 */
export const showErrorAlert = (message, uuid = '', stack = '') => {
  customAlert({ message, uuid, stack });
};

export default {
  overrideGlobalAlert,
  restoreGlobalAlert,
  showErrorAlert
};