// Challenge plans, balance selection, render, purchase CTA.

import { S } from "../state.js";
import { tg } from "../telegram.js";

let _chalPlan = '1step';
let _chalBal = '$5K';
let _chalData = {
  '1step': {
    label: '1-этапный',
    cols: ['Фаза 1','Финанс.'],
    rows: [
      ['Цель прибыли','10%','—'],
      ['Макс. дн. убыток','5%','5%'],
      ['Макс. убыток','6%','6%'],
      ['Мин. торг. дней','3','3'],
      ['Торговый период','∞','∞'],
      ['Выплата прибыли','0%','80%']
    ],
    prices: {'$5K':'$49','$10K':'$89','$25K':'$190','$50K':'$375','$100K':'$750','$200K':'$1 500'},
    balances: ['$5K','$10K','$25K','$50K','$100K','$200K'],
    best: '$50K'
  },
  '2step': {
    label: '2-этапный',
    cols: ['Фаза 1','Фаза 2','Финанс.'],
    rows: [
      ['Цель прибыли','8%','5%','—'],
      ['Макс. дн. убыток','5%','5%','5%'],
      ['Макс. убыток','8%','8%','8%'],
      ['Мин. торг. дней','3','3','3'],
      ['Торговый период','∞','∞','∞'],
      ['Выплата прибыли','0%','0%','80%']
    ],
    prices: {'$5K':'$39','$10K':'$69','$25K':'$159','$50K':'$259','$100K':'$450','$200K':'$900'},
    balances: ['$5K','$10K','$25K','$50K','$100K','$200K'],
    best: '$50K'
  },
  'instant': {
    label: 'Инстант',
    cols: ['Мгновенный'],
    rows: [
      ['Цель прибыли','—'],
      ['Макс. дн. убыток','5%'],
      ['Макс. убыток','8%'],
      ['Мин. торг. дней','3'],
      ['Торговый период','∞'],
      ['Выплата прибыли','80%']
    ],
    prices: {'$5K':'$200','$10K':'$400','$25K':'$1 125','$50K':'$2 500','$100K':'$5 000'},
    balances: ['$5K','$10K','$25K','$50K','$100K'],
    best: '$25K'
  }
};

export function setGoal(id, valText, pct, status, statusText, isRisk) {
  const valEl = document.getElementById('gv-' + id);
  const barEl = document.getElementById('gb-' + id);
  const pctEl = document.getElementById('gp-' + id);
  const statusEl = document.getElementById('gs-' + id);
  if(valEl) { valEl.textContent = valText; valEl.className = 'goal-val' + (isRisk ? ' red' : ''); }
  if(barEl) { barEl.style.width = Math.min(pct,100) + '%'; }
  if(pctEl) pctEl.textContent = Math.round(pct) + '%';
  if(statusEl) { statusEl.textContent = statusText; statusEl.className = 'goal-status ' + status; }
}

export function chalSetPlan(plan, btn) {
  _chalPlan = plan;
  document.querySelectorAll('.chal-plan-tab').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  var data = _chalData[plan];
  // Reset balance to first option
  _chalBal = data.balances[0];
  chalRender();
}

export function chalSetBal(bal) {
  _chalBal = bal;
  chalRender();
}

export function chalRender() {
  var data = _chalData[_chalPlan];

  // Render balance buttons
  var balGrid = document.getElementById('chal-bal-grid');
  if(balGrid) {
    balGrid.innerHTML = data.balances.map(function(b) {
      var isBest = b === data.best;
      var isActive = b === _chalBal;
      return '<button class="chal-bal-btn' + (isActive?' active':'') + (isBest?' best':'') + '" onclick="chalSetBal(\'' + b + '\')">' + b + '</button>';
    }).join('');
  }

  // Update price card
  var price = data.prices[_chalBal] || '—';
  var planName = document.getElementById('chal-plan-name');
  var priceEl = document.getElementById('chal-price');
  if(planName) planName.textContent = data.label + ' · ' + _chalBal;
  if(priceEl) priceEl.textContent = price;

  // Render conditions table header
  var header = document.getElementById('chal-cond-header');
  if(header) {
    header.innerHTML = '<div class="chal-cond-col-head" style="flex:1.5">Параметр</div>' +
      data.cols.map(function(c){ return '<div class="chal-cond-col-head">' + c + '</div>'; }).join('');
  }

  // Render conditions rows
  var rowsEl = document.getElementById('chal-cond-rows');
  if(rowsEl) {
    rowsEl.innerHTML = data.rows.map(function(row) {
      var label = row[0];
      var cells = row.slice(1).map(function(v, i) {
        var cls = 'chal-cval-bold';
        if(v === '—' || v === '0%') cls = 'chal-cval-muted';
        else if(v.includes('%') && (label.includes('убыток') || label.includes('потер'))) cls = 'chal-cval-red';
        else if(label.includes('Выплата') && v !== '0%' && v !== '—') cls = 'chal-cval-green';
        else if(label.includes('Цель') && v !== '—') cls = 'chal-cval-green';
        return '<div class="chal-cond-cell"><span class="' + cls + '">' + v + '</span></div>';
      }).join('');
      return '<div class="chal-cond-row"><div class="chal-cond-cell" style="flex:1.5;color:var(--text2);font-size:11px">' + label + '</div>' + cells + '</div>';
    }).join('');
  }
}

export function initChallenge() {
  chalRender();
}

export function buyChal() {
  var planLabel = _chalData[_chalPlan] ? _chalData[_chalPlan].label : _chalPlan;
  var price = (_chalData[_chalPlan] && _chalData[_chalPlan].prices && _chalData[_chalPlan].prices[_chalBal])
    ? _chalData[_chalPlan].prices[_chalBal]
    : '';
  var priceStr = price ? ' за ' + price : '';
  var msg = _chalPlan === 'instant'
    ? 'Привет! Хочу купить Инстант ' + _chalBal + priceStr + ' — как это сделать?'
    : 'Привет! Хочу купить Challenge ' + planLabel + ' ' + _chalBal + priceStr + ' — как это сделать?';
  var url = 'https://wa.me/77081906251?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

