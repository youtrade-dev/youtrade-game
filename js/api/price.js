// Provider router. Wires isMarketOpen() to skip fetches when markets are closed.
import { INSTRUMENTS } from "../config.js";
import { S } from "../state.js";
import { isMarketOpen } from "../market-hours.js";
import { _fetchBinanceTicker } from "./binance.js";
import { _fetchBybit } from "./bybit.js";
import { _fetchYahooViaProxy,  } from "./yahoo.js";
import { _fetchFxBatch } from "./fx.js";

export async function fetchPrice(symbol) {
  // [Phase 0 fix B] Market-hours guard: skip fetch when session is closed.
  // Crypto (24/7) bypasses. For closed markets we return cached price + closed flag.
  try {
    const inst = INSTRUMENTS[symbol];
    if (inst && inst.session && inst.session !== '24/7') {
      const open = isMarketOpen(symbol);
      if (open && open.open === false) {
        const cached = (S && S.prices && S.prices[symbol]) ? S.prices[symbol] : null;
        return Promise.resolve(cached ? Object.assign({}, cached, { closed: true }) : null);
      }
    }
  } catch(e) {}

  try {
    // FX
    if (symbol === 'EURUSD=X' || symbol === 'GBPUSD=X' || symbol === 'USDJPY=X') {
      // PRIMARY: Yahoo (минутные тики), fallback ниже на currency-api
      try { const yh = await _fetchYahooViaProxy(symbol); if (yh && isFinite(yh.price) && yh.price > 0) return yh; } catch(e){}
      const fx = await _fetchFxBatch();
      let price = null;
      if (symbol === 'EURUSD=X' && fx.eur) price = 1 / fx.eur;
      else if (symbol === 'GBPUSD=X' && fx.gbp) price = 1 / fx.gbp;
      else if (symbol === 'USDJPY=X' && fx.jpy) price = fx.jpy;
      if (price != null && isFinite(price)) {
        const prev = price * 0.9999;
        return { price, prev, change: price - prev, changePct: ((price - prev) / prev) * 100 };
      }
      // FX fallback to Yahoo proxy
      return await _fetchYahooViaProxy(symbol);
    }
    // Metals
    if (symbol === 'GC=F') {
      const r = await _fetchBybit('XAUUSDT');
      if (r) return r;
      return await _fetchYahooViaProxy(symbol);
    }
    if (symbol === 'SI=F') {
      const r = await _fetchBybit('XAGUSDT');
      if (r) return r;
      return await _fetchYahooViaProxy(symbol);
    }
    // Crypto
    if (symbol === 'BTC-USD' || symbol === 'ETH-USD') {
      const pair = symbol === 'BTC-USD' ? 'BTCUSDT' : 'ETHUSDT';
      const r = await _fetchBinanceTicker(pair);
      if (r) return r;
      return await _fetchYahooViaProxy(symbol);
    }
    // Indices: Yahoo via proxies only
    if (symbol === '^GSPC' || symbol === '^IXIC') {
      return await _fetchYahooViaProxy(symbol);
    }
    return await _fetchYahooViaProxy(symbol);
  } catch (e) { return null; }
}
