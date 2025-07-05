export const checkUserTheme = () => {
  if (!localStorage.getItem('app-theme')) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      localStorage.setItem('app-theme', 'dark');
      document.documentElement.classList.add('dark');

      return 'dark';
    }
    localStorage.setItem('app-theme', 'light');

    return 'light';
  } else {
    if (localStorage.getItem('app-theme') === 'dark') document.documentElement.classList.add('dark');

    return localStorage.getItem('app-theme');
  }
};
