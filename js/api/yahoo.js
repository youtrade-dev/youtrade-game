// Yahoo Finance via public CORS proxies (corsproxy.io / allorigins.win / codetabs.com).

export function _getYahooInterval(tf) {
  return { '1m':'1m','5m':'5m','15m':'15m','1h':'60m','4h':'60m','1d':'1d' }[tf] || '15m';
}

export function _getYahooRange(tf) {
  return { '1m':'1d','5m':'5d','15m':'10d','1h':'60d','4h':'60d','1d':'2y' }[tf] || '5d';
}

export async function _fetchYahooViaProxy(symbol) {
  const encoded = encodeURIComponent(symbol);
  const target = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encoded + '?range=1d&interval=1m&_=' + Date.now();
  const proxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest='
  ];
  for (const p of proxies) {
    try {
      const r = await fetch(p + encodeURIComponent(target));
      if (!r.ok) continue;
      const txt = await r.text();
      let j; try { j = JSON.parse(txt); } catch (e) { continue; }
      const res = j && j.chart && j.chart.result && j.chart.result[0];
      if (!res) continue;
      const meta = res.meta || {};
      const closes = (res.indicators && res.indicators.quote && res.indicators.quote[0] && res.indicators.quote[0].close) || [];
      let lastClose = null;
      for (let i = closes.length - 1; i >= 0; i--) { if (closes[i] != null) { lastClose = closes[i]; break; } }
      const price = lastClose != null ? lastClose : meta.regularMarketPrice;
      const prev = meta.chartPreviousClose || meta.regularMarketPreviousClose || price;
      if (price == null) continue;
      return { price, prev, change: price - prev, changePct: prev ? ((price - prev) / prev) * 100 : 0 };
    } catch (e) {}
  }
  return null;
}

export async function _fetchYahooQuote(symbol) { return await fetchPrice(symbol); }

export async function _fetchYahoo(sym, tf){
  const intMap = { "1m":"1m", "5m":"5m", "15m":"15m", "1h":"60m", "4h":"60m", "1d":"1d" };
  const rngMap = { "1m":"1d", "5m":"5d", "15m":"5d", "1h":"1mo", "4h":"3mo", "1d":"1y" };
  const interval = intMap[tf] || "5m";
  const range = rngMap[tf] || "5d";
  const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${interval}&range=${range}`;
  const url = "https://corsproxy.io/?" + encodeURIComponent(yUrl);
  const r = await fetch(url, { cache: "no-store" });
  if(!r.ok) throw new Error("Yahoo " + r.status);
  const j = await r.json();
  const res = j.chart && j.chart.result && j.chart.result[0];
  if(!res || !res.timestamp) throw new Error("Yahoo: empty result");
  const ts = res.timestamp;
  const q = res.indicators.quote[0] || {};
  const inst = INSTRUMENTS[sym];
  const dec = inst ? inst.dec : 5;
  // Соберём свечи, отбрасывая null
  const raw = [];
  for(let i = 0; i < ts.length; i++){
    const o = q.open && q.open[i], h = q.high && q.high[i], l = q.low && q.low[i], c = q.close && q.close[i];
    if(o == null || h == null || l == null || c == null) continue;
    raw.push({ time: ts[i], open: +o.toFixed(dec), high: +h.toFixed(dec), low: +l.toFixed(dec), close: +c.toFixed(dec), volume: (q.volume && q.volume[i]) || 0 });
  }
  // Если пользователь выбрал 4h — агрегируем 60m в 4h-бакеты
  if(tf === "4h" && interval === "60m"){
    const out = [];
    let bucket = null;
    for(const c of raw){
      const bStart = Math.floor(c.time / 14400) * 14400; // 4ч = 14400 сек
      if(!bucket || bucket.time !== bStart){
        if(bucket) out.push(bucket);
        bucket = { time: bStart, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume };
      } else {
        bucket.high = Math.max(bucket.high, c.high);
        bucket.low  = Math.min(bucket.low, c.low);
        bucket.close = c.close;
        bucket.volume += c.volume;
      }
    }
    if(bucket) out.push(bucket);
    return out;
  }
  return raw;
}

