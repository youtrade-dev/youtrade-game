// light/dark theme toggle
// Original: index.html script_11.js

var KEY = 'yt_theme';
  function apply(theme){
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    var btn = document.getElementById('themeToggleBtn');
    if (btn) btn.textContent = (theme === 'light') ? '🌙' : '☀️';
    btn && btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    btn && btn.setAttribute('title', theme === 'light' ? 'Тёмная тема' : 'Светлая тема');
  }
  function getTheme(){
    try { return localStorage.getItem(KEY) || 'dark'; } catch(e) { return 'dark'; }
  }
  function setTheme(t){
    try { localStorage.setItem(KEY, t); } catch(e){}
    apply(t);
  }
  function toggle(){
    var cur = getTheme();
    setTheme(cur === 'light' ? 'dark' : 'light');
  }
  function init(){
    if (document.getElementById('themeToggleBtn')) return;
    var btn = document.createElement('button');
    btn.id = 'themeToggleBtn';
    btn.type = 'button';
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
    apply(getTheme());
  }
  // Apply theme ASAP (before paint if possible)
  try { apply(getTheme()); } catch(e){}
  /* boot moved to setup() */
export function setup() {
  if (typeof init === 'function') init();
}
