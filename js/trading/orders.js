// Order placement, close, P&L, position-list rendering.

import { S } from "../state.js";
import { INSTRUMENTS, LEVERAGE, COMM_PER_LOT } from "../config.js";
import { _fmtTime, _tradeWord, _getDecimals } from "../util.js";
import { calcCommission, calcMargin, calcNotional } from "./math.js";
import { saveStateAfterAction } from "../state.js";
import { tg } from "../telegram.js";
import { drawEntryLines } from "../chart/chart.js";
import { getChart, getChartSym } from "../chart/chart.js";

export function adjLot(dir) {
  const inp = document.getElementById('lots');
  const inp2 = document.getElementById('lots-fs');
  let v = parseFloat((inp?inp.value:inp2?inp2.value:0.1)) + dir * 0.01;
  v = Math.max(0.01, Math.min(5, parseFloat(v.toFixed(2))));
  if(inp) inp.value = v;
  if(inp2) inp2.value = v;
  updRisk();
}

export function updRisk() {
  const sym = S.asset;
  const inst = INSTRUMENTS[sym];
  if(!inst) return;
  const lots = parseFloat(document.getElementById('lots').value || 0.1);
  const data = S.prices[sym];
  const wEl = document.getElementById("rwarn");
  const sess = isMarketOpen(sym);

  // Блок-кнопок если рынок закрыт
  const expBlk = document.querySelector("#exp-"+inst.htmlId);
  if(expBlk){
    expBlk.querySelectorAll(".inst-btn-buy, .inst-btn-sell").forEach(b => {
      b.disabled = !sess.open;
      b.style.opacity = sess.open ? "" : "0.45";
      b.style.cursor  = sess.open ? "" : "not-allowed";
    });
  }

  if(!wEl) return;
  const dotCls = sess.open ? "" : "off";
  const sessLabel = sess.open ? "Рынок открыт" : (sess.reason || "Рынок закрыт");
  let line = `<span class="pill"><span class="dot ${dotCls}"></span>${sessLabel}</span>`;
  line += `<span class="pill">Плечо <b>1:${LEVERAGE}</b></span>`;
  if(data){
    const comm = calcCommission(lots);
    const margin = calcMargin(inst, lots, data.price);
    line += `<span class="pill">Маржа <b>$${margin.toFixed(2)}</b></span>`;
    line += `<span class="pill">Комиссия <b>$${comm.toFixed(2)}</b></span>`;
  } else {
    line += `<span class="pill">⏳ Ожидание цены...</span>`;
  }
  wEl.innerHTML = line;
}

export async function trade(dir) {
  const sym = S.asset;
  const inst = INSTRUMENTS[sym];
  if (!inst) { alert('Инструмент не выбран'); return; }
  let data = S.prices[sym];
  if (!data || data.price == null) {
    // Цена ещё не загружена — пробуем подтянуть прямо сейчас
    try { data = await fetchPrice(sym); if (data) S.prices[sym] = data; } catch (e) {}
  }
  if (!data || data.price == null) { alert('Нет цены, попробуйте снова'); return; }

  // Проверка торговой сессии
  const sess = isMarketOpen(sym);
  if (!sess.open) {
    const msg = sess.reason || 'Рынок закрыт';
    try { if (tg && tg.showAlert) tg.showAlert(msg); else alert(msg); } catch (e) { alert(msg); }
    return;
  }

  const lots = parseFloat(document.getElementById('lots').value || 0.1);
  const entry = data.price;
  const comm = calcCommission(lots);
  const margin = calcMargin(inst, lots, entry);

  // Списываем комиссию с баланса сразу при открытии
  S.bal = parseFloat((S.bal - comm).toFixed(2));
  S.totalPnl = parseFloat((S.totalPnl - comm).toFixed(2));
  S.dayPnl = parseFloat((S.dayPnl - comm).toFixed(2));

  const dir2 = (dir === 'buy' || dir === 'BUY') ? 'BUY' : 'SELL';
  const nowTs = Date.now();
  const newTrade = {
    id: nowTs,
    sym,
    name: S.assetName,
    dir: dir2,
    lots,
    entry,
    openTime: new Date().toLocaleTimeString('ru', {hour:'2-digit',minute:'2-digit'}),
    openTimestamp: nowTs,
    commission: comm,
    margin
  };
  S.openTrades.push(newTrade);
  S.tradeCount++;

  const arrow = dir2 === 'BUY' ? '▲' : '▼';
  const msg = `${arrow} ${dir2} ${lots} лот ${S.assetName}\nЦена входа: ${entry.toFixed(inst.dec)}\nКомиссия: $${comm.toFixed(2)}`;
  try { if (tg && tg.showAlert) tg.showAlert(msg); else alert(msg); } catch (e) { alert(msg); }

  updateDashboard();
  window.renderHistory();
  window.updateAccountBar();
  if (getChart() && getChartSym() === sym) drawEntryLines();
  saveStateAfterAction();
}

export function closeTrade(tradeId) {
  const idx = S.openTrades.findIndex(t => t.id === tradeId);
  if(idx === -1) return;
  const t = S.openTrades[idx];
  const inst = INSTRUMENTS[t.sym];
  const data = S.prices[t.sym];
  const exitPrice = data ? data.price : t.entry;
  const priceDiff = (exitPrice - t.entry) * (t.dir === 'BUY' ? 1 : -1);
  const pips = priceDiff / inst.pip;
  const grossPnl = parseFloat((pips * inst.pipVal * t.lots).toFixed(2));
  const comm = (typeof t.commission === "number") ? t.commission : 0;
  // Чистый P&L сделки: уже учитывает списанную при открытии комиссию
  const pnl = parseFloat((grossPnl - 0).toFixed(2)); // грязный pnl без повторного учёта (комиссия уже списана при открытии)
  const closed = {
    ...t,
    exit: parseFloat(exitPrice.toFixed(inst.dec)),
    grossPnl,
    commission: comm,
    netPnl: parseFloat((grossPnl - comm).toFixed(2)),
    pnl,
    closeTime: new Date().toLocaleTimeString('ru', {hour:'2-digit',minute:'2-digit'})
  };
  S.openTrades.splice(idx, 1);
  S.closedTrades.unshift(closed);
  S.dayPnl += pnl;
  S.totalPnl += pnl;
  S.bal = S.startBal + S.totalPnl;
  updateDashboard();
  window.renderHistory();
  window.updateAccountBar();
  if(getChart() && getChartSym() === t.sym) drawEntryLines();
  saveStateAfterAction();
}

export function updateOpenPnl() {
  S.openTrades.forEach(t => {
    const data = S.prices[t.sym];
    if(!data) return;
    const inst = INSTRUMENTS[t.sym];
    const priceDiff = (data.price - t.entry) * (t.dir === 'BUY' ? 1 : -1);
    const pips = priceDiff / inst.pip;
    const gross = pips * inst.pipVal * t.lots;
    // Floating P&L уже после комиссии (она списана при открытии)
    t.floatingPnl = parseFloat(gross.toFixed(2));
    t.floatingNet = parseFloat((gross).toFixed(2));
  });
  if(document.getElementById('s-dash').classList.contains('active')) {
    renderOpenPositionsDash();
  } else if(document.getElementById("s-hist").classList.contains("active")) {
    window.renderHistory();
  }
}

export function renderOpenPositionsDash() {
  const el = document.getElementById('open-positions-dash');
  if(S.openTrades.length === 0) {
    el.innerHTML = '<div class="empty-state" style="padding:16px;font-size:12px">Нет открытых позиций<br><span style="font-size:11px">Перейди в Торговля чтобы открыть сделку</span></div>';
    return;
  }
  el.innerHTML = S.openTrades.map(t => {
    const pnl = t.floatingPnl || 0;
    const col = pnl >= 0 ? 'var(--green)' : 'var(--red)';
    const inst = INSTRUMENTS[t.sym];
    return `<div class="pos-item" onclick="closeTradeConfirm(${t.id})">
      <div>
        <div class="pos-sym">${t.name}</div>
        <div class="pos-det">${t.dir} ${t.lots} лот · Вход ${t.entry.toFixed(inst ? inst.dec : 5)} · ${t.openTime}</div>
      </div>
      <div style="text-align:right">
        <div class="pos-pnl" style="color:${col}">${pnl >= 0 ? '+' : ''}${pnl}$</div>
        <div class="pos-pnl-sub">Нажми чтобы закрыть</div>
      </div>
    </div>`;
  }).join('');
}

export function closeTradeConfirm(id) {
  const t = S.openTrades.find(x => x.id === id);
  if(!t) return;
  const pnl = t.floatingPnl || 0;
  const msg = `Закрыть ${t.name} ${t.dir}?\nP&L: ${pnl >= 0 ? '+' : ''}${pnl}$`;
  if(tg) {
    tg.showConfirm(msg, (ok) => { if(ok) closeTrade(id); });
  } else if(confirm(msg)) {
    closeTrade(id);
  }
}

