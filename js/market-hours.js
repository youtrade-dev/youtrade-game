// Market session checks. Wired into js/api/price.js to skip fetches when closed.

import { INSTRUMENTS } from "./config.js";
import { _hm, _fmtTime } from "./util.js";

function _closedFx(d){ return {open:false, reason:"Forex закрыт • откроется в Вс 22:00 UTC"}; }

function _closedMetal(d){ return {open:false, reason:"Металлы закрыты • Вс 22:00 UTC"}; }

function _closedUsIdx(d){ return {open:false, reason:"Индексы закрыты • Вс 22:00 UTC"}; }

export function isMarketOpen(sym){
  const inst = INSTRUMENTS[sym];
  if(!inst) return {open:false, reason:"Неизвестный инструмент"};
  if(inst.session === "24/7") return {open:true, reason:"24/7"};
  const d = new Date();
  const dow = d.getUTCDay(); // 0=Sun .. 6=Sat
  const m = _hm(d);
  if(inst.session === "fx"){
    // Вс 22:00 UTC → Пт 22:00 UTC непрерывно
    if(dow === 6) return _closedFx(d);
    if(dow === 5 && m >= 22*60) return _closedFx(d);
    if(dow === 0 && m < 22*60) return _closedFx(d);
    return {open:true};
  }
  if(inst.session === "metal"){
    // Вс 22:00 UTC → Пт 21:00 UTC, daily break 21:00–22:00 UTC
    if(dow === 6) return _closedMetal(d);
    if(dow === 5 && m >= 21*60) return _closedMetal(d);
    if(dow === 0 && m < 22*60) return _closedMetal(d);
    if(m >= 21*60 && m < 22*60) return {open:false, reason:`Тех. перерыв до ${_fmtTime(22,0)} UTC`};
    return {open:true};
  }
  if(inst.session === "us_idx"){
    // CME E-mini: Вс 22:00 UTC → Пт 21:00 UTC, daily break 21:00–22:00 UTC
    if(dow === 6) return _closedUsIdx(d);
    if(dow === 5 && m >= 21*60) return _closedUsIdx(d);
    if(dow === 0 && m < 22*60) return _closedUsIdx(d);
    if(m >= 21*60 && m < 22*60) return {open:false, reason:`Перерыв сессии до ${_fmtTime(22,0)} UTC`};
    return {open:true};
  }
  return {open:true};
}
