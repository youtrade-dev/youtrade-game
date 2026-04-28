// FX batch from currency-api (jsdelivr/pages.dev) + TwelveData candles.
import { _TD_MAP } from "../config.js";

export async function _fetchFxBatch() {
  const now = Date.now();
  if (now - (window._fxCache.ts || 0) < 3000 && window._fxCache.eur) return window._fxCache;
  const urls = [
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    'https://latest.currency-api.pages.dev/v1/currencies/usd.json'
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      const j = await r.json();
      const usd = j && j.usd;
      if (!usd) continue;
      window._fxCache = { ts: now, eur: usd.eur, gbp: usd.gbp, jpy: usd.jpy };
      return window._fxCache;
    } catch (e) {}
  }
  return window._fxCache;
}

export async function _fetchTwelveData(symbol, tf) {
  var intervalMap = {'1m':'1min','5m':'5min','15m':'15min','1h':'1h','4h':'4h','1d':'1day'};
  var interval = intervalMap[tf] || '15min';
  var outputsize = {'1m':100,'5m':100,'15m':100,'1h':90,'4h':60,'1d':200}[tf] || 90;
  var origSym = Object.keys(_TD_MAP).find(function(k){ return _TD_MAP[k]===symbol; });
  var inst = INSTRUMENTS[origSym] || {dec:5};

  // 1) Twelve Data demo key
  try {
    var tdUrl = 'https://api.twelvedata.com/time_series?symbol=' + encodeURIComponent(symbol) +
      '&interval=' + interval + '&outputsize=' + outputsize + '&apikey=demo&format=JSON&order=ASC';
    var r = await fetch(tdUrl, {signal: AbortSignal.timeout(8000)});
    if(r.ok) {
      var d = await r.json();
      if(d.values && d.values.length > 1) {
        return d.values.map(function(v) {
          return { time: Math.floor(new Date(v.datetime).getTime()/1000),
            open: parseFloat(parseFloat(v.open).toFixed(inst.dec)),
            high: parseFloat(parseFloat(v.high).toFixed(inst.dec)),
            low: parseFloat(parseFloat(v.low).toFixed(inst.dec)),
            close: parseFloat(parseFloat(v.close).toFixed(inst.dec)),
            volume: parseFloat(v.volume||0) };
        });
      }
    }
  } catch(e) {}

  // 2) Yahoo Finance query1 direct (works from GitHub Pages)
  try {
    var y1Url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(origSym||symbol) +
      '?interval=' + _getYahooInterval(tf) + '&range=' + _getYahooRange(tf) + '&events=none';
    var r1 = await fetch(y1Url, {signal: AbortSignal.timeout(8000)});
    if(r1.ok) {
      var y1 = await r1.json();
      var res1 = y1 && y1.chart && y1.chart.result && y1.chart.result[0];
      if(res1 && res1.timestamp && res1.timestamp.length > 1) {
        var q1 = res1.indicators && res1.indicators.quote && res1.indicators.quote[0];
        if(q1) { var c1=[]; for(var i=0;i<res1.timestamp.length;i++){if(q1.open[i]==null||isNaN(q1.open[i]))continue; c1.push({time:res1.timestamp[i],open:parseFloat(q1.open[i].toFixed(inst.dec)),high:parseFloat(q1.high[i].toFixed(inst.dec)),low:parseFloat(q1.low[i].toFixed(inst.dec)),close:parseFloat(q1.close[i].toFixed(inst.dec)),volume:q1.volume?(q1.volume[i]||0):0});} if(c1.length>1)return c1; }
      }
    }
  } catch(e) {}

  // 3) Yahoo Finance query2 direct
  try {
    var y2Url = 'https://query2.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(origSym||symbol) +
      '?interval=' + _getYahooInterval(tf) + '&range=' + _getYahooRange(tf) + '&events=none';
    var r2 = await fetch(y2Url, {signal: AbortSignal.timeout(8000)});
    if(r2.ok) {
      var y2 = await r2.json();
      var res2 = y2 && y2.chart && y2.chart.result && y2.chart.result[0];
      if(res2 && res2.timestamp && res2.timestamp.length > 1) {
        var q2 = res2.indicators && res2.indicators.quote && res2.indicators.quote[0];
        if(q2) { var c2=[]; for(var j=0;j<res2.timestamp.length;j++){if(q2.open[j]==null||isNaN(q2.open[j]))continue; c2.push({time:res2.timestamp[j],open:parseFloat(q2.open[j].toFixed(inst.dec)),high:parseFloat(q2.high[j].toFixed(inst.dec)),low:parseFloat(q2.low[j].toFixed(inst.dec)),close:parseFloat(q2.close[j].toFixed(inst.dec)),volume:q2.volume?(q2.volume[j]||0):0});} if(c2.length>1)return c2; }
      }
    }
  } catch(e) {}

  throw new Error('All sources failed for ' + symbol);
}

