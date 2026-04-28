// Telegram WebApp bridge. Currently only Telegram.WebApp.showConfirm is used.
const tg = (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
if (tg && typeof tg.expand === 'function') { try { tg.expand(); } catch(e){} }
export { tg };
