import { Injectable } from '@angular/core';

export class ThemeService {

  constructor(private isDark: boolean) {
    this.set(this.isDark ? 'dark' : 'light')
  }

  set(theme: 'dark' | 'light') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  toggleTheme() {
    document.documentElement.classList.toggle('dark')
  }

  isDarkTheme() {
    return document.documentElement.classList.contains("dark")
  }
}
