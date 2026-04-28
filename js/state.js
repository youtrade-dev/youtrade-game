// Application state, persistence (localStorage + Telegram CloudStorage),
import { tg } from "./telegram.js";
// and LRU candle cache (replaces direct _candleData object access).

export const S = {
  bal: 10000,
  startBal: 10000,
  dayPnl: 0,
  totalPnl: 0,
  tradeCount: 0,
  day: 1,
  asset: 'EURUSD=X',
  assetName: 'EUR/USD',
  prices: {},         // symbol -> {price, prevClose, change, changePct, decimals, pipValue}
  openTrades: [],     // {id, sym, name, dir, lots, entry, openTime}
  closedTrades: [],   // {id, sym, name, dir, lots, entry, exit, pnl, closeTime}
  histFilter: 'open',
  priceLoading: false
};

export let _activeKey2=null,_favs2=[];
export function getActiveKey2() { return _activeKey2; }
export function setActiveKey2(v) { _activeKey2 = v; }

// --- LRU candle cache (cap 50, evict oldest on overflow) ---
const _candleCache = new Map();
const CANDLE_CACHE_CAP = 50;
export function getCandle(key) {
  if (!_candleCache.has(key)) return undefined;
  const v = _candleCache.get(key);
  _candleCache.delete(key);
  _candleCache.set(key, v); // mark as recently used
  return v;
}
export function setCandle(key, value) {
  if (_candleCache.has(key)) _candleCache.delete(key);
  _candleCache.set(key, value);
  if (_candleCache.size > CANDLE_CACHE_CAP) {
    const oldest = _candleCache.keys().next().value;
    _candleCache.delete(oldest);
  }
}
export function hasCandle(key) { return _candleCache.has(key); }
export function clearCandles() { _candleCache.clear(); }

export function saveState() {
  var storage = tg && tg.CloudStorage;
  if(!storage) {
    // Fallback: localStorage
    try {
      var payload = JSON.stringify({
        bal: S.bal, startBal: S.startBal, dayPnl: S.dayPnl,
        totalPnl: S.totalPnl, tradeCount: S.tradeCount, day: S.day,
        openTrades: S.openTrades, closedTrades: S.closedTrades.slice(0, 50)
      });
      localStorage.setItem('ytg_state', payload);
    } catch(e) {}
    return;
  }
  // Telegram CloudStorage (works in real Telegram app)
  try {
    var payload = JSON.stringify({
      bal: S.bal, startBal: S.startBal, dayPnl: S.dayPnl,
      totalPnl: S.totalPnl, tradeCount: S.tradeCount, day: S.day,
      openTrades: S.openTrades, closedTrades: S.closedTrades.slice(0, 50)
    });
    storage.setItem('ytg_state', payload, function(err) {
      if(err) console.log('CloudStorage save error:', err);
    });
  } catch(e) { console.log('CloudStorage err:', e); }
}

export function loadState(callback) {
  // Try Telegram CloudStorage first
  var storage = tg && tg.CloudStorage;
  if(storage) {
    try {
      storage.getItem('ytg_state', function(err, val) {
        if(!err && val) {
          _applyState(val);
        }
        if(callback) callback();
      });
      return;
    } catch(e) {}
  }
  // Fallback: localStorage
  try {
    var val = localStorage.getItem('ytg_state');
    if(val) _applyState(val);
  } catch(e) {}
  if(callback) callback();
}

export function _applyState(jsonStr) {
  try {
    var saved = JSON.parse(jsonStr);
    if(!saved || typeof saved.bal !== 'number') return;
    S.bal = saved.bal;
    S.startBal = saved.startBal || 10000;
    S.dayPnl = saved.dayPnl || 0;
    S.totalPnl = saved.totalPnl || 0;
    S.tradeCount = saved.tradeCount || 0;
    S.day = saved.day || 1;
    S.openTrades = saved.openTrades || [];
    S.closedTrades = saved.closedTrades || [];
    // Ensure floatingPnl exists on open trades
    S.openTrades.forEach(function(t) { if(!t.floatingPnl) t.floatingPnl = 0; });
    console.log('State loaded: bal=' + S.bal + ' openTrades=' + S.openTrades.length);
  } catch(e) { console.log('State parse error:', e); }
}

export function saveStateAfterAction() {
  setTimeout(saveState, 200);
}

export function resetAccount() {
  if (!confirm('Сбросить счёт? Баланс вернётся к $10 000, все сделки и история будут удалены.')) return;
  // Close all open trades without PnL
  S.openTrades = [];
  S.closedTrades = [];
  S.bal = 10000;
  S.startBal = 10000;
  S.dayPnl = 0;
  S.totalPnl = 0;
  S.tradeCount = 0;
  S.day = 1;
  window.updateDashboard();
  window.renderOpenPositionsDash();
  window.renderHistory();
  saveState();
  alert('Счёт сброшен! Баланс: $10 000');
}

