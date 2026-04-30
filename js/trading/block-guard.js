// drawdown limit enforcement + block banner/modal
// Original: index.html script_10.js

import { S } from "../state.js";

function getLimits(){
    var startBal = (typeof S !== 'undefined' && S.startBal) ? S.startBal : 10000;
    var dayLim = (typeof DAY_LIMIT !== 'undefined') ? DAY_LIMIT : (startBal * 0.02);
    var maxLim = (typeof MAX_DD !== 'undefined') ? MAX_DD : (startBal * 0.03);
    return {startBal: startBal, dayLim: dayLim, maxLim: maxLim};
  }
  function showBlockBanner(reason){
    if(document.getElementById('account-blocked-banner')) return;
    var b = document.createElement('div');
    b.id = 'account-blocked-banner';
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(90deg,#dc2626,#991b1b);color:#fff;padding:14px 16px;text-align:center;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(220,38,38,0.5)';
    b.innerHTML = '⛔ СЧЁТ ЗАБЛОКИРОВАН: ' + (reason || 'Нарушены условия торговли');
    document.body.appendChild(b);
  }
  function showBlockModal(reason){
    if(document.getElementById('account-blocked-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'account-blocked-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px)';
    modal.innerHTML = '<div style="background:#1a1d29;border:2px solid #dc2626;border-radius:16px;padding:28px 24px;max-width:380px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.6)"><div style="font-size:64px;margin-bottom:8px">⛔</div><div style="color:#fff;font-size:22px;font-weight:800;margin-bottom:8px">Счёт заблокирован</div><div style="color:#fca5a5;font-size:14px;margin-bottom:6px;font-weight:600">' + reason + '</div><div style="color:#9aa0a6;font-size:13px;margin-bottom:20px;line-height:1.5">Вы нарушили условия прохождения челленджа. Открытие новых сделок невозможно. Чтобы начать заново — сбросьте счёт.</div><button id="abm-close" style="background:#dc2626;color:#fff;border:none;padding:11px 24px;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px;width:100%">Понятно</button></div>';
    document.body.appendChild(modal);
    document.getElementById('abm-close').onclick = function(){ modal.remove(); };
  }
  function setBlockedUI(blocked){
    document.body.classList.toggle('account-blocked', blocked);
    var btns = document.querySelectorAll('.trade-btn, .buy-btn, .sell-btn, [data-action="buy"], [data-action="sell"], button[onclick*="window.trade("], button[onclick*="placeOrder"]');
    btns.forEach(function(b){
      if(blocked){
        b.setAttribute('data-prev-disabled', b.disabled ? '1' : '0');
        b.disabled = true;
        b.style.opacity = '0.4';
        b.style.cursor = 'not-allowed';
      } else {
        if(b.getAttribute('data-prev-disabled') === '0'){ b.disabled = false; }
        b.style.opacity = '';
        b.style.cursor = '';
      }
    });
  }
  function checkBlock(){
    if(typeof S === 'undefined') return;
    if(S.accountBlocked) return;
    var L = getLimits();
    var openPnl = 0;
    if(S.openTrades){
      for(var i=0;i<S.openTrades.length;i++){
        var t = S.openTrades[i];
        if(typeof t.openPnl === 'number') openPnl += t.openPnl;
      }
    }
    var equity = (S.bal||0) + openPnl;
    var dayStartBal = (typeof S.dayStartBal === 'number') ? S.dayStartBal : L.startBal;
    var dayLoss = Math.max(0, dayStartBal - equity);
    var maxDrop = Math.max(0, L.startBal - equity);
    var reason = null;
    if(dayLoss >= L.dayLim){ reason = 'Превышен дневной лимит убытка ($' + L.dayLim.toFixed(0) + ')'; }
    else if(maxDrop >= L.maxLim){ reason = 'Превышен максимальный убыток ($' + L.maxLim.toFixed(0) + ')'; }
    if(reason){
      S.accountBlocked = true;
      S.blockReason = reason;
      try { if(typeof saveStateAfterAction === 'function') saveStateAfterAction(); } catch(e){}
      try { localStorage.setItem('yt_account_blocked', JSON.stringify({reason:reason, time:Date.now()})); } catch(e){}
      showBlockBanner(reason);
      showBlockModal(reason);
      setBlockedUI(true);
      if(S.openTrades && S.openTrades.length && typeof closeTrade === 'function'){
        var ids = S.openTrades.map(function(t){return t.id;});
        ids.forEach(function(id){ try{ closeTrade(id); }catch(e){} });
      }
    }
  }
  function restoreBlockedState(){
    try {
      var saved = localStorage.getItem('yt_account_blocked');
      if(saved){
        var data = JSON.parse(saved);
        if(typeof S !== 'undefined'){
          S.accountBlocked = true;
          S.blockReason = data.reason;
          showBlockBanner(data.reason);
          setBlockedUI(true);
        }
      }
    } catch(e){}
  }
  function installPatches(){
    if(window.__ytBlockPatched) return;
    window.__ytBlockPatched = true;
    var origReset = window.resetAccount;
    if(typeof origReset === 'function'){
      window.resetAccount = function(){
        try { localStorage.removeItem('yt_account_blocked'); } catch(e){}
        if(typeof S !== 'undefined'){ S.accountBlocked = false; S.blockReason = null; }
        var banner = document.getElementById('account-blocked-banner'); if(banner) banner.remove();
        var modal = document.getElementById('account-blocked-modal'); if(modal) modal.remove();
        setBlockedUI(false);
        return origReset.apply(this, arguments);
      };
    }
    var origUAB = window.updateAccountBar;
    if(typeof origUAB === 'function'){
      window.updateAccountBar = function(){
        var r = origUAB.apply(this, arguments);
        checkBlock();
        return r;
      };
    }
    var origTrade = window.trade;
    if(typeof origTrade === 'function'){
      window.trade = function(){
        if(typeof S !== 'undefined' && S.accountBlocked){
          showBlockModal(S.blockReason || 'Счёт заблокирован');
          return;
        }
        return origTrade.apply(this, arguments);
      };
    }
  }
  function init(){
    installPatches();
    restoreBlockedState();
    setTimeout(checkBlock, 800);
    setInterval(checkBlock, 1000);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
export function setup() {
  if (typeof init === 'function') init();
}
