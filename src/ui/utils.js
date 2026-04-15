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
  Github,
  Sun,
  Moon,
  FolderOpen,
  FileCode,
  CheckCircle,
  RotateCcw,
} from 'lucide';

export function refreshIcons() {
  try {
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
        Github,
        Sun,
        Moon,
        FolderOpen,
        FileCode,
        CheckCircle,
        RotateCcw,
      },
    });
  } catch (err) {
    console.warn('Lucide icon refresh failed:', err);
  }
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

export function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (saved === 'light') {
    document.documentElement.classList.add('light');
  }
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const isLight = document.documentElement.classList.contains('light');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isDark) {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  } else if (isLight) {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    if (systemDark) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }
}
