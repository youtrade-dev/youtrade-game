// Main inline chart: lightweight-charts instance + candle/volume series + entry markers.
// Internal mutables (_chart, _candleSeries, _volSeries, _chartSym, _chartTF) are kept
// internal and exposed to other modules via getters. _candleData is a Proxy backed by
// the LRU candle cache in state.js — original `_candleData[k]` syntax keeps working.

import { S, getCandle, setCandle, hasCandle } from "../state.js";
import { INSTRUMENTS, LEVERAGE } from "../config.js";
import { _hm, _fmtTime, _getDecimals } from "../util.js";
import { fetchPrice } from "../api/price.js";
import { _fetchYahoo } from "../api/yahoo.js";
import { _fetchBinance, _getBinanceTF } from "../api/binance.js";

let _chart = null;
let _candleSeries = null;
let _volSeries = null;
let _chartSym = null;
let _chartTF = '1m';

var _tfSeconds = {
  '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400
};
var _tfCandles = {
  '1m': 80, '5m': 80, '15m': 60, '1h': 60, '4h': 48, '1d': 60
};

// Proxy preserves `_candleData[key]` syntax while routing to the LRU cache.
const _candleData = new Proxy({}, {
  get: (_, k) => getCandle(k),
  set: (_, k, v) => { setCandle(k, v); return true; },
  has: (_, k) => hasCandle(k),
});

// Cross-module read/write API
export function getChart() { return _chart; }
export function getCandleSeries() { return _candleSeries; }
export function getVolSeries() { return _volSeries; }
export function getChartSym() { return _chartSym; }
export function setChartSym(v) { _chartSym = v; }
export function getChartTF() { return _chartTF; }
export function setChartTF(v) { _chartTF = v; }

export function _buildChartWrap(){var wrap=document.createElement('div');wrap.id='inst-chart-wrap';wrap.className='inst-chart-wrap';var tfBar=document.createElement('div');tfBar.className='inst-tf-bar';var tfs=[['1m',String.fromCharCode(49,1052)],['5m',String.fromCharCode(53,1052)],['15m',String.fromCharCode(49,53,1052)],['1h',String.fromCharCode(49,1063)],['4h',String.fromCharCode(52,1063)],['1d',String.fromCharCode(49,1044)]];tfs.forEach(function(t){var b=document.createElement('button');b.className='tf'+(t[0]==='5m'?' active':'');b.dataset.tf=t[0];b.textContent=t[1];b.onclick=function(){_setTFInst(t[0],b);};tfBar.appendChild(b);});var chartWrap=document.createElement('div');chartWrap.style.position='relative';var chartDiv=document.createElement('div');chartDiv.id='tv-chart';chartDiv.className='inst-chart-body';var expandBtn=document.createElement('button');expandBtn.className='inst-chart-expand-btn';expandBtn.title=String.fromCharCode(1056,1072,1079,1074,1077,1088,1085,1091,1090,1100);expandBtn.innerHTML='&#x26F6;';expandBtn.onclick=function(e){e.stopPropagation();openFullChart();};chartWrap.appendChild(chartDiv);chartWrap.appendChild(expandBtn);wrap.appendChild(tfBar);wrap.appendChild(chartWrap);return wrap;}

export function _setTFInst(tf,btn){setTF(tf,btn);}

export function setTF(tf, btn) {
  _chartTF = tf;
  document.querySelectorAll('.tf').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  if(_chart && _chartSym) {
    _loadRealCandles(_chartSym, tf);
  } else {
    _chartSym = null;
    initChart(S.asset);
  }
}

export function initChart(sym) {
  _chartSym = sym;
  var container = document.getElementById('tv-chart');
  if(!container) return;
  container.innerHTML = '';
  if(typeof LightweightCharts === 'undefined') return;

  if(_chart) { try { _chart.remove(); } catch(e){} _chart = null; }

  _chart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: container.clientHeight || 300,
    layout: {
      background: { color: '#0d1117' },
      textColor: '#d1d4dc',
      fontSize: 12,
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
    },
    grid: {
      vertLines: { color: '#1e2230', style: 1 },
      horzLines: { color: '#1e2230', style: 1 }
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: { color: '#758696', labelBackgroundColor: '#2b2b43' },
      horzLine: { color: '#758696', labelBackgroundColor: '#2b2b43' }
    },
    rightPriceScale: {
      borderColor: '#2a2a4a',
      scaleMargins: { top: 0.08, bottom: 0.15 }
    },
    timeScale: {
      borderColor: '#2a2a4a',
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 5,
      barSpacing: 8,
      minBarSpacing: 3
    }
  });

  _candleSeries = _chart.addCandlestickSeries({
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderUpColor: '#26a69a',
    borderDownColor: '#ef5350',
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350'
  });

  _volSeries = _chart.addHistogramSeries({
    priceFormat: { type: 'volume' },
    priceScaleId: 'vol'
  });
  _chart.priceScale('vol').applyOptions({
    scaleMargins: { top: 0.85, bottom: 0 }
  });

  var ro = new ResizeObserver(function() {
    if(_chart && container) {
      _chart.applyOptions({ width: container.clientWidth, height: container.clientHeight || 300 });
    }
  });
  ro.observe(container);

  _loadRealCandles(sym, _chartTF);
  // авто-обновление графика каждые 30 сек
  if(window._chartReloadInt) clearInterval(window._chartReloadInt);
  window._chartReloadInt = setInterval(()=>{ if(_chartSym && _chart && document.getElementById("s-trade").classList.contains("active")) _loadRealCandles(_chartSym, _chartTF); }, 30000);
}

export function _buildCandleHistory(sym, tf) {
  var inst = INSTRUMENTS[sym] || {dec: 5, pip: 0.0001};
  var tfSec = {
    '1m': 60, '5m': 300, '15m': 900,
    '1h': 3600, '4h': 14400, '1d': 86400
  }[tf] || 900;
  var n = 100;
  var now = Math.floor(Date.now() / 1000 / tfSec) * tfSec;
  // Base prices for synthetic data when real data unavailable
  var BASE = {
    'GC=F': 3300, 'SI=F': 33.5,
    '^GSPC': 5480, '^IXIC': 17800, 'NQ=F': 19800,
    'EURUSD=X': 1.17, 'GBPUSD=X': 1.355, 'USDJPY=X': 159.3,
    'BTC-USD': 94000, 'ETH-USD': 3200
  };
  // Prefer a real observed price over the hard-coded BASE — keeps the synthetic seed
  // from drifting stale across years. BASE is only the cold-start fallback.
  var base = (S.prices[sym] && S.prices[sym].price) || BASE[sym] || 1;
  var candles = [];
  var price = base * (0.985 + Math.random() * 0.03);
  var vol = base > 1000 ? 50 : base > 100 ? 5 : base > 1 ? 1 : 100;
  for (var i = n; i >= 0; i--) {
    var t = now - i * tfSec;
    var chg = (Math.random() - 0.498) * inst.pip * 8;
    var open = price;
    var close = open + chg;
    var hi = Math.max(open, close) + Math.abs(chg) * Math.random() * 0.5;
    var lo = Math.min(open, close) - Math.abs(chg) * Math.random() * 0.5;
    var dec = inst.dec || 5;
    candles.push({
      time: t,
      open: parseFloat(open.toFixed(dec)),
      high: parseFloat(hi.toFixed(dec)),
      low: parseFloat(lo.toFixed(dec)),
      close: parseFloat(close.toFixed(dec)),
      volume: parseFloat((vol * (0.5 + Math.random())).toFixed(2))
    });
    price = close;
  }
  return candles;
}

export function updateChartTick(sym, price) {
  if(!_chart || _chartSym !== sym) return;
  // Guard: reject non-finite / non-positive ticks (bad proxy responses, network garbage).
  if (typeof price !== 'number' || !isFinite(price) || price <= 0) return;
  var tfSec = _tfSeconds[_chartTF] || 60;
  var now = Math.floor(Date.now() / 1000);
  now = Math.floor(now / tfSec) * tfSec;
  var dec = _getDecimals(sym);
  var val = parseFloat(price.toFixed(dec));
  var key = sym + '_' + _chartTF;
  if(!_candleData[key]) _candleData[key] = _buildCandleHistory(sym, _chartTF);
  var arr = _candleData[key];
  // Absolute sanity: per-instrument hard ranges. Catches genuinely corrupted upstream
  // (wrong-symbol responses, decimal-point drift) regardless of historical context.
  // These bounds are wide enough to survive a decade of real market movement.
  var SANITY = {
    'EURUSD=X': [0.7, 1.6], 'GBPUSD=X': [0.9, 1.9], 'USDJPY=X': [80, 200],
    'GC=F': [800, 6000], 'SI=F': [10, 80],
    '^GSPC': [1500, 12000], '^IXIC': [4000, 35000], 'NQ=F': [4000, 40000],
    'BTC-USD': [10000, 250000], 'ETH-USD': [500, 15000]
  };
  var sanity = SANITY[sym];
  if (sanity && (val < sanity[0] || val > sanity[1])) return;

  // Outlier guard: per-category max per-tick deviation from previous close.
  // Real per-tick movement (5s polling): FX <0.05%, metals <0.1%, indices <0.1%, crypto <1%.
  // Only applied when arr already holds REAL candle history (synced from _loadRealCandles)
  // — never against a synthetic baseline.
  var inst = INSTRUMENTS[sym];
  var session = inst && inst.session;
  var MAX_DELTA = { 'fx': 0.005, 'metal': 0.008, 'us_idx': 0.008, '24/7': 0.05 };
  var maxDelta = MAX_DELTA[session] || 0.02;
  if (arr.length > 0) {
    var lastClose = arr[arr.length - 1].close;
    if (lastClose > 0) {
      var delta = Math.abs(val - lastClose) / lastClose;
      if (delta > maxDelta) return;
    }
  }
  if(arr.length > 0 && arr[arr.length - 1].time === now) {
    // Update current candle
    var c = arr[arr.length - 1];
    c.close = val;
    c.high = Math.max(c.high, val);
    c.low = Math.min(c.low, val);
    _candleSeries.update({ time: now, open: c.open, high: parseFloat(c.high.toFixed(dec)), low: parseFloat(c.low.toFixed(dec)), close: val });
  } else {
    // New candle
    var prev = arr.length > 0 ? arr[arr.length-1].close : val;
    var newCandle = { time: now, open: prev, high: Math.max(prev,val), low: Math.min(prev,val), close: val };
    arr.push(newCandle);
    if(arr.length > 300) arr.shift();
    _candleSeries.update(newCandle);
  }
  drawEntryLines();
}

export function drawEntryLines() {
  if(!_candleSeries || !_chart) return;
  _candleSeries.setMarkers([]);
  var markers = [];
  S.openTrades.forEach(function(t) {
    if(t.sym !== _chartSym) return;
    var color = t.dir === 'BUY' ? '#00d4aa' : '#ff4444';
    var pnlStr = t.floatingPnl !== undefined ? (t.floatingPnl >= 0 ? '+' : '') + t.floatingPnl.toFixed(2) + '$' : '';
    markers.push({
      time: Math.floor((t.openTimestamp || Date.now()) / 1000),
      position: t.dir === 'BUY' ? 'belowBar' : 'aboveBar',
      color: color,
      shape: t.dir === 'BUY' ? 'arrowUp' : 'arrowDown',
      text: (t.dir === 'BUY' ? '▲ BUY' : '▼ SELL') + (pnlStr ? ' ' + pnlStr : '')
    });
  });
  if(markers.length > 0) _candleSeries.setMarkers(markers);
}

export async function _loadRealCandles(sym, tf) {
  if(!_candleSeries) return;
  const inst = INSTRUMENTS[sym]; if(!inst) return;
  // Loader-плашка
  let loader = document.getElementById("chart-loader");
  if(!loader){
    const c = document.getElementById("chart-cont");
    if(c){ loader = document.createElement("div"); loader.id = "chart-loader"; loader.textContent = "⏳ Загрузка котировок..."; loader.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#9aa0a6;font-size:13px;pointer-events:none;z-index:5"; c.style.position = "relative"; c.appendChild(loader); }
  }
  const removeLoader = () => { const l = document.getElementById("chart-loader"); if(l) l.remove(); };

  let candles = null;
  try {
    candles = await _fetchYahoo(sym, tf);
  } catch(e){ console.warn("Yahoo failed for", sym, e.message); }

  // Crypto fallback — Binance Spot (для свежих real-time данных)
  if((!candles || candles.length === 0) && (sym === "BTC-USD" || sym === "ETH-USD")){
    try {
      const binSym = sym === "BTC-USD" ? "BTCUSDT" : "ETHUSDT";
      candles = await _fetchBinance(binSym, _getBinanceTF(tf));
    } catch(e){ console.warn("Binance fallback failed", e.message); }
  }

  removeLoader();

  if(candles && candles.length > 0){
    _candleSeries.setData(candles);
    // Sync the in-memory _candleData cache with the real history we just rendered.
    // Without this, updateChartTick keeps comparing live ticks against the stale
    // synthetic baseline produced by _buildCandleHistory, and the per-category
    // outlier guard silently drops every legitimate tick forever.
    _candleData[sym + '_' + tf] = candles.slice(-300);
    if(_volSeries){
      const totalVol = candles.reduce((s,c) => s + (c.volume||0), 0);
      if(totalVol > 0){
        const volData = candles.map(c => ({ time: c.time, value: c.volume || 0, color: c.close >= c.open ? "rgba(38,166,154,0.5)" : "rgba(239,83,80,0.5)" }));
        _volSeries.setData(volData);
        _volSeries.applyOptions({visible: true});
      } else {
        _volSeries.setData([]);
        _volSeries.applyOptions({visible: false});
      }
    }
    _chart.timeScale().fitContent();
    drawEntryLines();

    // Синхронизируем тикер S.prices с последней свечой (чтобы цена тика и свечи совпадали)
    const last = candles[candles.length - 1];
    if(last && last.close){
      S.prices[sym] = S.prices[sym] || {};
      S.prices[sym].price = last.close;
      try { updatePriceDisplay && updatePriceDisplay(sym, last.close); } catch(e){}
    }
  } else {
    // как последний резерв — синтетика
    try {
      const synCandles = _buildCandleHistory(sym, tf);
      if(_candleSeries){
        _candleSeries.setData(synCandles);
        if(_volSeries){
          const volData = synCandles.map(c => ({ time: c.time, value: c.volume || 0, color: c.close >= c.open ? "rgba(38,166,154,0.5)" : "rgba(239,83,80,0.5)" }));
          _volSeries.setData(volData);
        }
        _chart && _chart.timeScale().fitContent();
      }
    } catch(e2){ console.warn("Synthetic fallback failed", e2.message); }
  }
}

