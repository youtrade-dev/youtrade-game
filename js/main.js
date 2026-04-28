// Phase 0 entry point. Wires module setup + binds functions to window for inline HTML
// handlers (onclick="show(...)", etc.) and for IIFE monkey-patching (block-guard,
// price-change, bid-ask, history-actions, inst-groups). Patchable subset is bound BEFORE
// setup() runs so the IIFE wrappers see the originals; post-setup calls go via window.X
// so the wrapped versions take effect.

import "./bootstrap.js";

import { S, loadState, _applyState, resetAccount } from "./state.js";
import { tg } from "./telegram.js";
import { INSTRUMENTS } from "./config.js";

import { initChart } from "./chart/chart.js";
import { closeFullChart, setFSTF } from "./chart/fullscreen.js";
import { initChallenge, chalRender, chalSetBal, chalSetPlan, buyChal } from "./challenge/challenge.js";
import { initLeaderboard } from "./leaderboard/leaderboard.js";
import { refreshAllPrices, _updateListPrices } from "./ui/prices.js";
import {
  selAsset2, toggleFav, updateAccountBar, openInstrInfo, closeInstrInfo, show,
} from "./ui/screens.js";
import {
  updateDashboard, renderHistory, setHistFilter,
} from "./trading/dashboard.js";
import {
  trade, adjLot, closeTradeConfirm, updRisk, updateOpenPnl, renderOpenPositionsDash,
} from "./trading/orders.js";

import { setup as setupAccBar } from "./ui/acc-bar.js";
import { setup as setupHistoryActions } from "./ui/history-actions.js";
import { setup as setupDailyReset } from "./ui/daily-reset.js";
import { setup as setupInstGroups } from "./ui/inst-groups.js";
import { setup as setupBidAsk } from "./ui/bid-ask.js";
import { setup as setupPriceChange } from "./ui/price-change.js";
import { setup as setupBlockGuard } from "./trading/block-guard.js";
import { setup as setupTheme } from "./ui/theme.js";
import { setup as setupLang } from "./ui/lang.js";

// --- Bind to window for inline HTML handlers + IIFE monkey-patching ---
Object.assign(window, {
  // inline onclick targets
  adjLot, buyChal, chalSetBal, chalSetPlan,
  closeFullChart, closeInstrInfo, closeTradeConfirm,
  resetAccount, selAsset2, setFSTF, setHistFilter, show,
  toggleFav, trade,
  openInstrInfo,
  // patchable by IIFE wrappers (must exist on window before setup* runs)
  updateAccountBar, _updateListPrices, renderHistory,
  updRisk, updateOpenPnl, renderOpenPositionsDash, updateDashboard, chalRender,
});

function boot() {
  try { loadState(); _applyState(); } catch (e) { console.warn("[main] loadState failed", e); }

  // Feature setup() — these install IIFE behaviors and may wrap window.X
  setupTheme();
  setupLang();
  setupAccBar();
  setupInstGroups();
  setupBidAsk();
  setupPriceChange();
  setupHistoryActions();
  setupDailyReset();
  setupBlockGuard();

  // Initial renders — go via window so any wraps take effect
  try { initChallenge(); } catch(e) { console.warn("[main] initChallenge", e); }
  try { initLeaderboard(); } catch(e) { console.warn("[main] initLeaderboard", e); }
  try { window.updateAccountBar(); } catch(e) { console.warn("[main] updateAccountBar", e); }
  try { updateDashboard(); } catch(e) { console.warn("[main] updateDashboard", e); }
  try { window.renderHistory(); } catch(e) { console.warn("[main] renderHistory", e); }
  try { chalRender(); } catch(e) { console.warn("[main] chalRender", e); }

  // Price refresh loop (5s) — _updateListPrices is reached transitively from refreshAllPrices,
  // and that call is now `window._updateListPrices` inside prices.js so wraps take effect.
  refreshAllPrices();
  setTimeout(refreshAllPrices, 200);
  setTimeout(refreshAllPrices, 1500);
  setInterval(refreshAllPrices, 5000);

  // Default chart instrument
  try {
    const firstSym = Object.keys(INSTRUMENTS)[0];
    if (firstSym) initChart(firstSym);
  } catch(e) { console.warn("[main] initChart default", e); }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
