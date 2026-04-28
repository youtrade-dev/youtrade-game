// Bybit ticker (used for metals XAUUSDT/XAGUSDT).

export async function _fetchBybit(sym) {
  try {
    const r = await fetch('https://api.bybit.com/v5/market/tickers?category=linear&symbol=' + sym);
    if (!r.ok) return null;
    const j = await r.json();
    const it = j && j.result && j.result.list && j.result.list[0];
    if (!it) return null;
    const price = parseFloat(it.lastPrice);
    const prev = parseFloat(it.prevPrice24h);
    if (!isFinite(price)) return null;
    return { price, prev, change: price - prev, changePct: prev ? ((price - prev) / prev) * 100 : 0 };
  } catch (e) { return null; }
}

