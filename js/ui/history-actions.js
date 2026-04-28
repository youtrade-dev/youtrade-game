// close-all-open trades + history visibility
// Original: index.html script_05.js

import { tg } from "../telegram.js";

function visible(){
    const btn = document.getElementById('hist-actions');
    if (!btn) return;
    const openCount = document.querySelectorAll('#history-list .hist-x-close').length;
    if (openCount > 0) btn.removeAttribute('hidden');
    else btn.setAttribute('hidden','');
  }
  function closeAllOpen(){
    const btns = document.querySelectorAll('#history-list .hist-x-close');
    const ids = [];
    btns.forEach(b => {
      const oc = b.getAttribute('onclick') || '';
      const m = oc.match(/closeTradeConfirm\((\d+)\)/);
      if (m) ids.push(parseInt(m[1], 10));
    });
    if (!ids.length) return;
    const n = ids.length;
    const ask = 'Зафиксировать все ' + n + ' открытых ' + (n === 1 ? 'позицию' : (n < 5 ? 'позиции' : 'позиций')) + '?';
    const go = () => {
      ids.forEach(id => { try { if (typeof closeTrade === 'function') closeTrade(id); } catch(e){} });
      if (typeof renderHistory === 'function') window.renderHistory();
      if (typeof updateAccountBar === 'function') window.updateAccountBar();
      visible();
    };
    if (window.Telegram && window.Telegram.WebApp && typeof Telegram.WebApp.showConfirm === 'function') {
      Telegram.WebApp.showConfirm(ask, (ok) => { if (ok) go(); });
    } else if (window.tg && typeof tg.showConfirm === 'function') {
      tg.showConfirm(ask, (ok) => { if (ok) go(); });
    } else {
      if (confirm(ask)) go();
    }
  }
  function init(){
    const btn = document.getElementById('hist-close-all-btn');
    if (btn) btn.addEventListener('click', closeAllOpen);
    if (typeof window.renderHistory === 'function'){
      const orig = window.renderHistory;
      window.renderHistory = function(){
        const r = orig.apply(this, arguments);
        visible();
        return r;
      };
    }
    visible();
  }
  /* boot moved to setup() */
export function setup() {
  if (typeof init === 'function') init();
}
