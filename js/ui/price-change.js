// % change column updater
// Original: index.html script_09.js

import { S } from "../state.js";
import { INSTRUMENTS } from "../config.js";

function updatePct(){
    try{
      if(typeof INSTRUMENTS==='undefined' || typeof S==='undefined' || !S.prices) return;
      var rowIds = {'EURUSD=X':'EURUSD','GBPUSD=X':'GBPUSD','USDJPY=X':'USDJPY','GC=F':'XAUUSD','SI=F':'XAGUSD','^GSPC':'SP500','^IXIC':'NASDAQ','BTC-USD':'BTC','ETH-USD':'ETH'};
      Object.keys(rowIds).forEach(function(key){
        var rid = rowIds[key];
        var el = document.getElementById('chg-'+rid);
        if(!el) return;
        var data = S.prices[key];
        if(!data || typeof data.price !== 'number'){ el.textContent='—'; el.className='px-chg chg-flat'; return; }
        var pct;
        if(typeof data.changePct==='number' && isFinite(data.changePct)){
          pct = data.changePct;
        } else if(typeof data.prev==='number' && data.prev>0){
          pct = (data.price - data.prev) / data.prev * 100;
        } else { el.textContent='—'; el.className='px-chg chg-flat'; return; }
        var abs = Math.abs(pct);
        var sign = pct > 0 ? '+' : (pct < 0 ? '−' : '');
        var arrow = pct > 0.0001 ? '▲' : (pct < -0.0001 ? '▼' : '•');
        el.textContent = arrow + ' ' + sign + abs.toFixed(2) + '%';
        el.className = 'px-chg ' + (pct > 0.0001 ? 'chg-up' : (pct < -0.0001 ? 'chg-dn' : 'chg-flat'));
      });
    }catch(e){}
  }
  function wrap(){
    if(typeof _updateListPrices !== 'function'){ setTimeout(wrap, 300); return; }
    var orig = window._updateListPrices;
    window._updateListPrices = function(){
      var r = orig.apply(this, arguments);
      updatePct();
      return r;
    };
    updatePct();
    setInterval(updatePct, 1000);
  }
  /* boot moved to setup() */
export function setup() {
  if (typeof wrap === 'function') wrap();
}
