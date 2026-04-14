/**
 * Bookma - UI Helpers & Utilities
 */

import {
  createIcons,
  Folder,
  Bookmark,
  UploadCloud,
  ArrowUp,
  ChevronRight,
  ChevronDown,
  Import,
  Search,
  Info,
  AlertCircle,
} from 'lucide';

export function refreshIcons() {
  createIcons({
    icons: {
      Folder,
      Bookmark,
      UploadCloud,
      ArrowUp,
      ChevronRight,
      ChevronDown,
      Import,
      Search,
      Info,
      AlertCircle,
    },
  });
}

export function toggleStickyHeader() {
  const controls = document.querySelector('.controls');
  const observer = new IntersectionObserver(
    ([e]) => e.target.classList.toggle('stuck', e.intersectionRatio < 1),
    { threshold: [1] }
  );
  if (controls) observer.observe(controls);
  return observer;
}

export function setupScrollTop() {
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  window.onscroll = () => {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      scrollTopBtn.style.display = 'flex';
    } else {
      scrollTopBtn.style.display = 'none';
    }
  };
  scrollTopBtn.onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}
