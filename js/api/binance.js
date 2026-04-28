// Binance ticker + klines.
import { _BINANCE_MAP } from "../config.js";

export function _getBinanceTF(tf) {
  return { '1m':'1m','5m':'5m','15m':'15m','1h':'1h','4h':'4h','1d':'1d' }[tf] || '15m';
}

export async function _fetchBinanceTicker(sym) {
  try {
    const r = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=' + sym);
    if (!r.ok) return null;
    const d = await r.json();
    const price = parseFloat(d.lastPrice);
    const prev = parseFloat(d.openPrice);
    if (!isFinite(price)) return null;
    return { price, prev, change: price - prev, changePct: prev ? ((price - prev) / prev) * 100 : 0 };
  } catch (e) { return null; }
}

export async function _fetchBinance(symbol, interval) {
  var url = 'https://api.binance.com/api/v3/klines?symbol=' + symbol + '&interval=' + interval + '&limit=200';
  var r = await fetch(url, {signal: AbortSignal.timeout(8000)});
  if(!r.ok) throw new Error('Binance ' + r.status);
  var data = await r.json();
  return data.map(function(k) {
    return {
      time: Math.floor(k[0] / 1000),
      open: parseFloat(k[1]), high: parseFloat(k[2]),
      low: parseFloat(k[3]), close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    };
  });
}

