import { UI_CONFIG, NOTIFICATION_TYPES } from '../core/constants.js';

let container = null;

function getContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

export function showNotification(
  message,
  type = NOTIFICATION_TYPES.INFO,
  duration = UI_CONFIG.NOTIFICATION_DURATION
) {
  const toastContainer = getContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconName =
    type === NOTIFICATION_TYPES.SUCCESS
      ? 'check-circle'
      : type === NOTIFICATION_TYPES.ERROR
        ? 'alert-circle'
        : 'info';

  toast.innerHTML = `
        <i data-lucide="${iconName}" style="width:16px; height:16px;"></i>
        <div class="toast-message">${message}</div>
    `;

  toastContainer.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons({
      attrs: { class: 'lucide-icon' },
    });
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}
