// Dashboard widgets, history filter + render.

import { S } from "../state.js";
import { INSTRUMENTS } from "../config.js";
import { _fmtTime, _dayWord } from "../util.js";

export function updateDashboard() {
  const bal = S.bal, startBal = S.startBal;
  const totalPnl = S.totalPnl, dayPnl = S.dayPnl;
  const dayLoss = Math.abs(Math.min(dayPnl, 0));
  const maxDrop = Math.max(startBal - bal, 0);
  const goalPct = Math.max(totalPnl / startBal * 100, 0);
  const GOAL_TARGET = startBal * 0.08;
  const DAY_LIMIT = 500;
  const MAX_DD = 1000;

  // Balance card
  document.getElementById('bal').textContent = '$' + bal.toFixed(2);
  const sub = totalPnl >= 0
    ? '▲ +' + totalPnl.toFixed(2) + '$ (+' + (totalPnl/startBal*100).toFixed(2) + '%) всего'
    : '▼ ' + totalPnl.toFixed(2) + '$ (' + (totalPnl/startBal*100).toFixed(2) + '%) всего';
  const balSubEl = document.getElementById('bal-sub');
  balSubEl.textContent = sub;
  balSubEl.style.color = totalPnl >= 0 ? 'var(--green)' : 'var(--red)';

  // Info strip
  const disStart = document.getElementById('dis-startbal');
  if(disStart) disStart.textContent = '$' + startBal.toLocaleString('ru-RU', {minimumFractionDigits:2});

  // Trading days (count unique days with trades)
  const tradeDays = new Set(S.closedTrades.map(t => t.closeTime ? new Date(t.closeTime).toDateString() : '')).size;
  const MIN_DAYS = 3;

  // GOAL: Profit
  const profitPct = Math.min(totalPnl / GOAL_TARGET * 100, 100);
  const profitDone = totalPnl >= GOAL_TARGET;
  setGoal('profit', '$' + Math.max(totalPnl,0).toFixed(0) + ' / $' + GOAL_TARGET.toFixed(0), profitPct, profitDone ? 'passed' : 'working', profitDone ? 'Пройдено' : 'В работе', false);

  // GOAL: Trade days
  const daysPct = Math.min(tradeDays / MIN_DAYS * 100, 100);
  const daysDone = tradeDays >= MIN_DAYS;
  setGoal('days', tradeDays + ' / ' + MIN_DAYS + ' дней', daysPct, daysDone ? 'passed' : 'working', daysDone ? 'Пройдено' : 'В работе', false);

  // GOAL: Daily loss
  const dlPct = Math.min(dayLoss / DAY_LIMIT * 100, 100);
  const dlFailed = dayLoss >= DAY_LIMIT;
  setGoal('dloss', '$' + dayLoss.toFixed(0) + ' / $' + DAY_LIMIT, dlPct, dlFailed ? 'failed' : 'passed', dlFailed ? 'Нарушено' : 'Пройдено', true);

  // GOAL: Max drawdown
  const ddPct = Math.min(maxDrop / MAX_DD * 100, 100);
  const ddFailed = maxDrop >= MAX_DD;
  setGoal('maxdd', '$' + maxDrop.toFixed(0) + ' / $' + MAX_DD, ddPct, ddFailed ? 'failed' : 'passed', ddFailed ? 'Нарушено' : 'Пройдено', true);

  // Daily limit box
  const dlLeft = Math.max(DAY_LIMIT - dayLoss, 0);
  const dlLeftPct = Math.round(dlLeft / DAY_LIMIT * 100);
  const dlLeftEl = document.getElementById('dlim-left');
  if(dlLeftEl) {
    dlLeftEl.textContent = '$' + dlLeft.toFixed(2);
    dlLeftEl.style.color = dlLeft > 100 ? 'var(--green)' : 'var(--red)';
  }
  const dlBar = document.getElementById('dlim-bar');
  if(dlBar) dlBar.style.width = dlLeftPct + '%';
  const dlPctEl = document.getElementById('dlim-pct');
  if(dlPctEl) dlPctEl.textContent = dlLeftPct + '%';
  const dlStartDay = document.getElementById('dlim-startday');
  if(dlStartDay) dlStartDay.textContent = '$' + startBal.toLocaleString('ru-RU', {minimumFractionDigits:2});
  const dlThresh = document.getElementById('dlim-thresh');
  if(dlThresh) dlThresh.textContent = '$' + (startBal - DAY_LIMIT).toLocaleString('ru-RU', {minimumFractionDigits:2});

  // Performance
  const closed = S.closedTrades || [];
  const wins = closed.filter(t => t.pnl > 0);
  const losses = closed.filter(t => t.pnl < 0);
  const winRate = closed.length > 0 ? Math.round(wins.length / closed.length * 100) : 0;
  const avgWin = wins.length > 0 ? wins.reduce((a,t) => a + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a,t) => a + t.pnl, 0) / losses.length : 0;

  const pfCnt = document.getElementById('pf-cnt');
  if(pfCnt) pfCnt.textContent = closed.length;
  const pfWin = document.getElementById('pf-win');
  if(pfWin) { pfWin.textContent = winRate + '%'; pfWin.className = 'perf-val ' + (winRate >= 50 ? 'green' : 'red'); }
  const pfAvgWin = document.getElementById('pf-avgwin');
  if(pfAvgWin) pfAvgWin.textContent = '$' + avgWin.toFixed(2);
  const pfAvgLoss = document.getElementById('pf-avgloss');
  if(pfAvgLoss) pfAvgLoss.textContent = '$' + Math.abs(avgLoss).toFixed(2);
  const pfDpnl = document.getElementById('pf-dpnl');
  if(pfDpnl) {
    pfDpnl.textContent = (dayPnl >= 0 ? '+' : '') + '$' + dayPnl.toFixed(2);
    pfDpnl.className = 'perf-val ' + (dayPnl >= 0 ? 'green' : 'red');
  }

  // Open positions
  renderOpenPositionsDash();

  // Leaderboard
  updateLeaderboardMyStats();
}

export function setHistFilter(f, btn) {
  S.histFilter = f;
  document.querySelectorAll('.ft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHistory();
}

export function renderHistory() {
  const el = document.getElementById('history-list');
  let items = [];
  
  if(S.histFilter === 'open' || S.histFilter === 'all') {
    items = items.concat(S.openTrades.map(t => ({...t, status:'open'})));
  }
  if(S.histFilter === 'closed' || S.histFilter === 'all') {
    items = items.concat(S.closedTrades.map(t => ({...t, status:'closed'})));
  }
  
  if(items.length === 0) {
    const msgs = {open:'Нет открытых позиций', closed:'Нет закрытых сделок', all:'История пуста'};
    el.innerHTML = `<div class="empty-state">${msgs[S.histFilter] || 'Нет сделок'}<br><span style="font-size:11px;margin-top:4px;display:block">Открой первую сделку во вкладке Торговля</span></div>`;
    return;
  }
  
  el.innerHTML = items.map(t => {
    const inst = INSTRUMENTS[t.sym];
    const isOpen = t.status === 'open';
    const pnl = isOpen ? (t.floatingPnl || 0) : t.pnl;
    const col = pnl >= 0 ? 'var(--green)' : 'var(--red)';
    const statusBadge = isOpen 
      ? `<span style="font-size:9px;color:var(--green);background:rgba(0,212,170,.15);padding:2px 5px;border-radius:4px;margin-left:4px">● OPEN</span>`
      : `<span style="font-size:9px;color:var(--text2);background:rgba(255,255,255,.08);padding:2px 5px;border-radius:4px;margin-left:4px">CLOSED</span>`;
    
    const entryExit = isOpen 
      ? `Вход: ${t.entry.toFixed(inst ? inst.dec : 5)} · ${t.openTime}`
      : `Вход: ${t.entry.toFixed(inst ? inst.dec : 5)} → ${t.exit ? t.exit.toFixed(inst ? inst.dec : 5) : '?'} · ${t.closeTime}`;
    const closeBtn = '';
    const xCloseBtn = isOpen ? `<button type="button" class="hist-x-close" title="Закрыть позицию" onclick="closeTradeConfirm(${t.id})" aria-label="Закрыть"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19"></line><line x1="19" y1="5" x2="5" y2="19"></line></svg></button>` : '';
    return `<div class="hist-item">
      <div class="hist-left">
        <div class="h-sym">${t.name}${statusBadge}</div>
        <div class="h-dir ${t.dir.toLowerCase()}">${t.dir} ${t.lots} лот</div>
        <div class="h-det">${entryExit}</div>
        ${closeBtn}
      </div>
      <div class="hist-right">${xCloseBtn}
        <div class="h-pnl" style="color:${col}">${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}$</div>
        <div class="h-time">${isOpen ? t.openTime : t.closeTime}</div>
      </div>
    </div>`;
  }).join('');
}

