/**
 * Bookma - Toast Notification System
 * A minimalist, brutalist-themed notification manager.
 */

let container = null;

function getContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

/**
 * Shows a toast notification
 * @param {string} message - The text to display
 * @param {'success'|'error'|'info'} type - The type of notification
 * @param {number} duration - Time in ms before it disappears
 */
export function showNotification(message, type = 'info', duration = 5000) {
  const toastContainer = getContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';

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
