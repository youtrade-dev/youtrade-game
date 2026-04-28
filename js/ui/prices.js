// Price loading + display + main 5s refresh loop.

import { S } from "../state.js";
import { INSTRUMENTS } from "../config.js";
import { _getDecimals } from "../util.js";
import { fetchPrice } from "../api/price.js";
import { getActiveKey2 } from "../state.js";
import { updateChartTick } from "../chart/chart.js";

export async function loadCurrentPrice() {
  const sym = S.asset;
  const inst = INSTRUMENTS[sym];
  var _cpe = document.getElementById('cprice'); if(_cpe) { document.getElementById('cprice').innerHTML = '<span class="spin"></span>загрузка...'; }
  var _pc4=document.getElementById('pchange'); if(_pc4) _pc4.textContent = '—';
  var _thp=document.getElementById('trade-header-price');if(_thp)_thp.textContent='—';
  
  const data = await fetchPrice(sym);
  if(data) {
    S.prices[sym] = data;
    updatePriceDisplay();
    updRisk();
    updateOpenPnl();
    updateChartTick(sym, data.price);
  } else {
    var _cpe2=document.getElementById('cprice'); if(_cpe2) _cpe2.textContent = 'Нет данных';    var _pc3=document.getElementById('pchange'); if(_pc3) _pc3.textContent = 'Проверьте соединение';
  }
}

export function updatePriceDisplay() {
  const sym = S.asset;
  const inst = INSTRUMENTS[sym];
  const data = S.prices[sym];
  if(!data) return;
  
  const p = data.price;
  const pEl = document.getElementById('cprice');
  const chEl = document.getElementById('pchange') || {textContent:'',style:{}};
  const hdEl = document.getElementById('trade-header-price');
  
  const priceStr = p.toFixed(inst.dec);
  if(pEl) pEl.textContent = priceStr;
  
  const isUp = data.changePct >= 0;
  const arrow = isUp ? '▲' : '▼';
  const color = isUp ? 'var(--green)' : 'var(--red)';
  const chgStr = `${arrow} ${data.change >= 0 ? '+' : ''}${data.change.toFixed(inst.dec)} (${data.changePct >= 0 ? '+' : ''}${data.changePct.toFixed(2)}%)`;
  if(chEl) chEl.textContent = chgStr;
  if(chEl) chEl.style.color = color;
  if(hdEl) hdEl.textContent = inst.name + ': ' + priceStr;
}

export async function refreshAllPrices() {
  const syms = new Set();
  if (S.asset) syms.add(S.asset);
  (S.openTrades || []).forEach(t => { if (t.sym) syms.add(t.sym); });
  // Always refresh visible watchlist symbols too
  Object.keys(INSTRUMENTS).forEach(k => syms.add(k));
  // First call populates cache for all instruments at once
  const arr = Array.from(syms);
  await Promise.all(arr.map(s => fetchPrice(s).then(d => { if (d) S.prices[s] = d; })));
  if (typeof updatePriceDisplay === 'function' && S.prices[S.asset]) updatePriceDisplay();
  if (typeof updRisk === 'function') updRisk();
  if (typeof updateOpenPnl === 'function') updateOpenPnl();
  if (typeof updateAccountBar === 'function') window.updateAccountBar();
  if (typeof _updateListPrices === 'function') _updateListPrices();
  if (typeof updateChartTick === 'function' && S.prices[S.asset]) updateChartTick(S.asset, S.prices[S.asset].price);
}

export function _updateListPrices(){Object.entries(INSTRUMENTS).forEach(function(kv){var key=kv[0],inst=kv[1],data=S.prices[key];if(!data||!data.price)return;var ids=_INST_MAP[key];if(!ids)return;var lpEl=document.getElementById(ids.lp);if(lpEl){var prev=parseFloat(lpEl.dataset.prev)||0,p=data.price;lpEl.textContent=p.toFixed(inst.dec);if(prev&&p>prev){lpEl.classList.add('up');lpEl.classList.remove('dn');}else if(prev&&p<prev){lpEl.classList.add('dn');lpEl.classList.remove('up');}lpEl.dataset.prev=p;}if(setActiveKey2(==key){var spread=inst.pip*2,sp=document.getElementById(ids.sp),bp=document.getElementById(ids.bp));if(sp)sp.textContent=(data.price-spread).toFixed(inst.dec);if(bp)bp.textContent=(data.price+spread).toFixed(inst.dec);}});}

