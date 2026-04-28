// 21:00 UTC daily reset timer
// Original: index.html script_06.js

import { S } from "../state.js";

function nextResetUtc(nowMs){
    const d = new Date(nowMs);
    const target = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 21, 0, 0);
    if (target <= nowMs) return target + 24*60*60*1000;
    return target;
  }
  function fmt(ms){
    if (ms < 0) ms = 0;
    const total = Math.floor(ms/1000);
    const h = Math.floor(total/3600);
    const m = Math.floor((total%3600)/60);
    const s = total%60;
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }
  function performReset(){
    try {
      if (typeof S !== 'undefined' && S) {
        S.dayStartBal = (typeof S.bal === 'number') ? S.bal : (S.startBal || 0);
        S.dayPnl = 0;
      }
    } catch(e){}
    try { localStorage.setItem('yt.lastDailyReset', String(Date.now())); } catch(e){}
    try { if (typeof window.updateDashboard === 'function') window.updateDashboard(); } catch(e){}
    try { if (typeof updateAccountBar === 'function') window.updateAccountBar(); } catch(e){}
  }
  function ensureCatchUp(){
    try {
      const last = parseInt(localStorage.getItem('yt.lastDailyReset') || '0', 10);
      const now = Date.now();
      const d = new Date(now);
      let lastBoundary = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 21, 0, 0);
      if (lastBoundary > now) lastBoundary -= 24*60*60*1000;
      if (last < lastBoundary) {
        performReset();
      }
    } catch(e){}
  }
  function mountTimer(){
    const row = document.getElementById('goal-dloss');
    if (!row) return null;
    let pill = document.getElementById('dd-reset-timer');
    if (pill) return pill;
    pill = document.createElement('div');
    pill.id = 'dd-reset-timer';
    pill.className = 'dd-reset-timer';
    pill.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg><span class="dd-reset-timer-text">--:--:--</span><span class="dd-reset-timer-note">до обновления</span>';
    row.appendChild(pill);
    return pill;
  }
  let tickTimer = null;
  function tick(){
    const pill = mountTimer();
    if (!pill) return;
    const now = Date.now();
    const target = nextResetUtc(now);
    const remaining = target - now;
    const txt = pill.querySelector('.dd-reset-timer-text');
    if (txt) txt.textContent = fmt(remaining);
    if (remaining <= 0) { performReset(); }
  }
  function start(){
    ensureCatchUp();
    mountTimer();
    tick();
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(tick, 1000);
  }
  /* boot moved to setup() */
export function setup() {
  if (typeof start === 'function') start();
}
