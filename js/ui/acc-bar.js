// account bar customizable metrics
// Original: index.html script_04.js

const STORAGE_KEY = 'yt.accBar.metrics';
  const DEFAULTS = ['pnl','eq','bal'];
  const ALL = ['pnl','eq','bal','free','mar'];
  function load(){
    try { const s = localStorage.getItem(STORAGE_KEY); if(s){ const a = JSON.parse(s); if(Array.isArray(a)) return a.filter(k => ALL.includes(k)); } } catch(e){}
    return DEFAULTS.slice();
  }
  function save(arr){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch(e){} }
  function apply(selected){
    document.querySelectorAll('#acc-bar .acc-cell[data-metric]').forEach(el => {
      const m = el.getAttribute('data-metric');
      if (selected.includes(m)) el.removeAttribute('data-hidden');
      else el.setAttribute('data-hidden','1');
    });
  }
  function init(){
    const btn = document.getElementById('acc-chooser-btn');
    const panel = document.getElementById('acc-chooser-panel');
    if (!btn || !panel) return;
    let selected = load();
    apply(selected);
    panel.querySelectorAll('input[type="checkbox"][data-metric]').forEach(cb => {
      cb.checked = selected.includes(cb.getAttribute('data-metric'));
      cb.addEventListener('change', () => {
        const m = cb.getAttribute('data-metric');
        if (cb.checked){ if (!selected.includes(m)) selected.push(m); }
        else { selected = selected.filter(x => x !== m); }
        save(selected);
        apply(selected);
      });
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !panel.hasAttribute('hidden');
      if (isOpen){ panel.setAttribute('hidden',''); btn.classList.remove('open'); }
      else { panel.removeAttribute('hidden'); btn.classList.add('open'); }
    });
    document.addEventListener('click', (e) => {
      if (panel.hasAttribute('hidden')) return;
      if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)){
        panel.setAttribute('hidden',''); btn.classList.remove('open');
      }
    });
  }
  /* boot moved to setup() */
export function setup() {
  if (typeof init === 'function') init();
}
