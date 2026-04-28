// Bot-leaderboard simulation: random bots, periodic ticks, render.

import { S } from "../state.js";
import { _tradeWord, _dayWord } from "../util.js";

let _lbBots = null;
let _lbTotal = 0;
let _lbInterval = null;
var _botNames = [
  'AlexTrader','GoldScalper','ForexGuru','PipHunter','TrendRider',
  'ScalpKing','BullRunner','NightOwl','SwingMaster','QuickFingers',
  'IronHands','RocketFX','SmartMoney','DeltaTrader','EagleEye',
  'SniperFX','WolfPack','DiamondHands','BlueSky','RedCandle',
  'MoonShot','ZeroLoss','MaxProfit','CryptoVibe','FXWizard',
  'TradeNinja','GreenLine','StockHawk','VelocityFX','AlphaBot',
  'TurboTrader','SilverBull','DeepValue','FlashTrade','CalmWater',
  'StormTrader','LuckyPip','IceTrader','FireFX','NovaStar',
  'ProPulse','SkyLimit','OceanFX','MegaTrend','SpeedDemon',
  'CoolBreeze','HotStreak','ZenTrader','PowerPip','TimberWolf'
];
var _botSuffixes = ['_KZ','_RU','_UA','_BY','_KG','77','88','99','_Pro','_FX','','_X','2024','_TG'];

export function _rndName() {
  var n = _botNames[Math.floor(Math.random() * _botNames.length)];
  var s = _botSuffixes[Math.floor(Math.random() * _botSuffixes.length)];
  return n + s;
}

export function _rndBal(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

export function initLeaderboard() {
  var count = 180 + Math.floor(Math.random() * 70); // 180-250 участников
  _lbTotal = count;
  _lbBots = [];
  for (var i = 0; i < 49; i++) {
    var startBal = 10000;
    var pct = (Math.random() < 0.72 ? 1 : -1) * (Math.random() * 22);
    var bal = Math.round(startBal * (1 + pct / 100) * 100) / 100;
    _lbBots.push({
      name: _rndName(),
      bal: bal,
      pct: Math.round(pct * 100) / 100,
      trades: Math.floor(Math.random() * 40) + 1,
      days: Math.floor(Math.random() * 28) + 1
    });
  }
  renderLeaderboard();
  if (_lbInterval) clearInterval(_lbInterval);
  _lbInterval = setInterval(tickLeaderboard, 45000);
}

export function tickLeaderboard() {
  // Slightly adjust total participants
  _lbTotal += Math.floor(Math.random() * 5) - 1;
  if (_lbTotal < 150) _lbTotal = 150;

  // Update random subset of bots
  var updates = Math.floor(Math.random() * 8) + 3;
  for (var i = 0; i < updates; i++) {
    var idx = Math.floor(Math.random() * _lbBots.length);
    var delta = (Math.random() < 0.65 ? 1 : -1) * (Math.random() * 1.5);
    _lbBots[idx].pct = Math.round((_lbBots[idx].pct + delta) * 100) / 100;
    _lbBots[idx].bal = Math.round(10000 * (1 + _lbBots[idx].pct / 100) * 100) / 100;
    _lbBots[idx].trades += Math.random() > 0.6 ? 1 : 0;
  }
  renderLeaderboard();
}

export function updateLeaderboardMyStats() {
  var pct = S.startBal > 0 ? ((S.bal - S.startBal) / S.startBal * 100) : 0;
  var el = document.getElementById('my-pct-lb');
  if (el) {
    el.textContent = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
    el.className = 'sv ' + (pct >= 0 ? 'g' : 'r');
  }
  renderLeaderboard();
}

export function renderLeaderboard() {
  if (!_lbBots) return;
  var pct = S.startBal > 0 ? ((S.bal - S.startBal) / S.startBal * 100) : 0;

  // Build combined list: bots + real user
  var all = _lbBots.map(function(b) { return {name: b.name, pct: b.pct, trades: b.trades, days: b.days, isMe: false}; });
  all.push({name: 'Вы', pct: Math.round(pct * 100) / 100, trades: S.tradeCount, days: S.day, isMe: true});
  all.sort(function(a, b) { return b.pct - a.pct; });

  var myRank = 1;
  for (var i = 0; i < all.length; i++) {
    if (all[i].isMe) { myRank = i + 1; break; }
  }
  // Scale rank to total participants
  var scaledRank = Math.round(myRank / all.length * _lbTotal);
  if (scaledRank < 1) scaledRank = 1;

  var rankEl = document.getElementById('my-rank-pos');
  if (rankEl) rankEl.textContent = '#' + scaledRank + ' из ' + _lbTotal;

  var meta = document.getElementById('lb-meta');
  if (meta) meta.textContent = 'Участников: ' + _lbTotal + ' · Обновлено сейчас';

  var medals = ['🥇','🥈','🥉'];
  var html = '';
  var shown = all.slice(0, 20);
  for (var i = 0; i < shown.length; i++) {
    var p = shown[i];
    var badge = i < 3 ? medals[i] : ('<span style="font-size:12px;color:var(--text2);font-weight:600">#' + (i+1) + '</span>');
    var pctStr = (p.pct >= 0 ? '+' : '') + p.pct.toFixed(2) + '%';
    var pctColor = p.pct >= 0 ? 'var(--green)' : 'var(--red)';
    var highlight = p.isMe ? 'background:rgba(78,53,198,0.18);border:1px solid var(--primary);' : '';
    html += '<div class="leader-card" style="' + highlight + '">'
      + '<div class="rank-badge">' + badge + '</div>'
      + '<div class="leader-info"><div class="leader-name">' + (p.isMe ? '<b>Вы</b>' : p.name) + '</div>'
      + '<div class="leader-stat">' + p.trades + ' ' + _tradeWord(p.trades) + ' · ' + p.days + ' ' + _dayWord(p.days) + '</div></div>'
      + '<div class="leader-pnl" style="color:' + pctColor + '">' + pctStr + '</div>'
      + '</div>';
  }
  var el = document.getElementById('leader-list');
  if (el) el.innerHTML = html;
}

