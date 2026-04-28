// Screen navigation, asset selection, instrument-info modal, account bar.

import { S } from "../state.js";
import { INSTRUMENTS } from "../config.js";
import { _getDecimals, escapeHtml } from "../util.js";
import { getActiveKey2, setActiveKey2 } from "../state.js";
import { setChartTF, initChart } from "../chart/chart.js";
import { loadCurrentPrice, updatePriceDisplay } from "./prices.js";

export function selAsset(btn, sym, name) {
  document.querySelectorAll('.at').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  S.asset = sym;
  S.assetName = INSTRUMENTS[sym] ? INSTRUMENTS[sym].name : name;
  loadCurrentPrice();
  initChart(sym);
}

export function selAsset2(key,name,cat,rowEl){var ids=_INST_MAP[key];if(!ids)return;if(getActiveKey2()&&getActiveKey2()!==key){var pi=_INST_MAP[getActiveKey2()];if(pi){var pe=document.getElementById(pi.exp),pr=document.getElementById(pi.row);if(pe)pe.style.display='none';if(pr)pr.classList.remove('active');}}var expEl=document.getElementById(ids.exp),rowDiv=document.getElementById(ids.row);if(!expEl)return;var isOpen=expEl.style.display!=='none';if(isOpen){expEl.style.display='none';if(rowDiv)rowDiv.classList.remove('active');setActiveKey2(null);var cw=document.getElementById('inst-chart-wrap');if(cw){var holder=document.getElementById('inst-chart-holder');if(holder)holder.appendChild(cw);}}else{expEl.style.display='block';if(rowDiv)rowDiv.classList.add('active');setActiveKey2(key);S.asset=key;S.assetName=name;var inst=INSTRUMENTS[key];if(inst){var data=S.prices[key];if(data&&data.price){var spread=inst.pip*2,sp=document.getElementById(ids.sp),bp=document.getElementById(ids.bp);if(sp)sp.textContent=(data.price-spread).toFixed(inst.dec);if(bp)bp.textContent=(data.price+spread).toFixed(inst.dec);}updRisk();}loadCurrentPrice();var cw2=document.getElementById('inst-chart-wrap');if(!cw2){cw2=_buildChartWrap();}var bar=expEl.querySelector('.inst-expand-bar');if(bar)expEl.insertBefore(cw2,bar);_chartTF='5m';initChart(key);}}

export function toggleFav(key,starId,ev){if(ev){ev.stopPropagation();ev.preventDefault();}var star=document.getElementById(starId);if(!star)return;var idx=_favs2.indexOf(key);if(idx>=0){_favs2.splice(idx,1);star.classList.remove('fav');star.textContent='\u2606';}else{_favs2.push(key);star.classList.add('fav');star.textContent='\u2605';}try{localStorage.setItem('yt_favs',JSON.stringify(_favs2));}catch(e){}}

export function updateAccountBar(){
  // Маржа = сумма margin открытых позиций
  let usedMargin = 0, openPnl = 0;
  for(const t of S.openTrades){
    if(typeof t.margin === "number") usedMargin += t.margin;
    if(typeof t.floatingPnl === "number") openPnl += t.floatingPnl;
  }
  const bal = S.bal;                 // баланс кошелька (после комиссий, без учёта плавающего PnL)
  const equity = bal + openPnl;      // средства
  const free = equity - usedMargin;  // свободные средства
  const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v.toFixed(2); };
  set("ab-bal", bal);
  set("ab-eq", equity);
  set("ab-free", free);
  set("ab-mar", usedMargin);
  set("ab-pnl-v", openPnl);
  const pnlEl = document.getElementById("ab-pnl");
  if(pnlEl){ pnlEl.classList.toggle("pos", openPnl > 0); pnlEl.classList.toggle("neg", openPnl < 0); }
}

export function openInstrInfo(){
  const sym = S.asset; const inst = INSTRUMENTS[sym]; if(!inst) return;
  const data = S.prices[sym] || {};
  const lots = parseFloat((document.getElementById("lots")||{}).value || 0.1);
  const px = data.price || 0;
  const notional = px ? calcNotional(inst, lots, px) : 0;
  const margin = px ? calcMargin(inst, lots, px) : 0;
  const comm = calcCommission(lots);
  const sess = isMarketOpen(sym);
  const cat = ({forex:"Форекс",metals:"Металлы",indices:"Индексы",crypto:"Крипто"})[inst.cat] || inst.cat;
  const sessText = sess.open ? "Открыт" : (sess.reason || "Закрыт");
  const sessClass = sess.open ? "green" : "red";
  const hours = ({fx:"Пн 02:03 – Пт 01:55 (GMT+5)",metal:"Ежедн. 03:01 – 02:00 (GMT+5)",us_idx:"Ежедн. 22:00 – 21:00 (GMT+5)","24/7":"24/7"})[inst.session] || "—";
  const cs = inst.cat === "forex" ? `${inst.contractSize.toLocaleString()} ${inst.baseCcy}` : `${inst.contractSize} ${inst.baseCcy}`;
  const rows = [
    ["Категория", cat],
    ["Размер контракта (1 лот)", cs],
    ["Текущая цена", px ? px.toFixed(inst.dec) : "—"],
    ["Объём при " + lots + " лот", "$" + notional.toFixed(2)],
    ["Плечо", "1:" + LEVERAGE + " (маржа " + (100/LEVERAGE).toFixed(0) + "%)"],
    ["Требуемая маржа", "$" + margin.toFixed(2)],
    ["Комиссия открытия", "$" + comm.toFixed(2) + " (5$ × лот)"],
    ["Торговые часы", hours],
    ["Статус сессии", `<span class="spec-pill ${sessClass}">${sessText}</span>`]
  ];
  const body = rows.map(r => `<div class="spec-row"><span class="spec-key">${r[0]}</span><span class="spec-val">${r[1]}</span></div>`).join("");
  document.getElementById("instr-modal-title").textContent = "Спецификация · " + inst.name;
  document.getElementById("instr-modal-body").innerHTML = body;
  document.getElementById("instr-modal").classList.add("show");
}

export function closeInstrInfo(){ document.getElementById("instr-modal").classList.remove("show"); }

export function show(n, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('active'));
  document.getElementById('s-' + n).classList.add('active');
  btn.classList.add('active');
  if(n === 'hist') window.renderHistory();
  if(n === 'chal') chalRender();
}

