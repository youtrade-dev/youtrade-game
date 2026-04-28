// Generic formatting helpers.

export function _hm(d){ return d.getUTCHours()*60 + d.getUTCMinutes(); }

export function _fmtTime(h,m){ return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0"); }

export function _tradeWord(n) {
  var m = n % 100;
  if (m >= 11 && m <= 19) return 'сделок';
  var r = n % 10;
  if (r === 1) return 'сделка';
  if (r >= 2 && r <= 4) return 'сделки';
  return 'сделок';
}

export function _dayWord(n) {
  var m = n % 100;
  if (m >= 11 && m <= 19) return 'дней';
  var r = n % 10;
  if (r === 1) return 'день';
  if (r >= 2 && r <= 4) return 'дня';
  return 'дней';
}

export function _getDecimals(sym) {
  return INSTRUMENTS[sym] ? INSTRUMENTS[sym].dec : 5;
}


export function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
