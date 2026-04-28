// bid/ask price column updater
// Original: index.html script_08.js

import { S } from "../state.js";
import { INSTRUMENTS } from "../config.js";

function fmt(v, dec){ return (typeof v==='number' && isFinite(v)) ? v.toFixed(dec) : '—'; }
  function updateBA(){
    try{
      if(typeof INSTRUMENTS==='undefined' || typeof S==='undefined' || !S.prices) return;
      var rowIds = {'EURUSD=X':'EURUSD','GBPUSD=X':'GBPUSD','USDJPY=X':'USDJPY','GC=F':'XAUUSD','SI=F':'XAGUSD','^GSPC':'SP500','^IXIC':'NASDAQ','BTC-USD':'BTC','ETH-USD':'ETH'};
      Object.keys(INSTRUMENTS).forEach(function(key){
        var inst = INSTRUMENTS[key];
        var data = S.prices[key];
        var rid = rowIds[key];
        if(!rid || !inst) return;
        var bidEl = document.getElementById('bid-'+rid);
        var askEl = document.getElementById('ask-'+rid);
        if(!bidEl || !askEl) return;
        if(!data || typeof data.price !== 'number'){ bidEl.textContent='—'; askEl.textContent='—'; return; }
        var p = data.price, pip = inst.pip || 0, dec = inst.dec || 2;
        bidEl.textContent = fmt(p - pip, dec);
        askEl.textContent = fmt(p + pip, dec);
      });
    }catch(e){}
  }
  function wrap(){
    if(typeof _updateListPrices !== 'function'){ setTimeout(wrap, 300); return; }
    var orig = window._updateListPrices;
    window._updateListPrices = function(){
      var r = orig.apply(this, arguments);
      updateBA();
      return r;
    };
    updateBA();
    setInterval(updateBA, 1000);
  }
  /* boot moved to setup() */
export function setup() {
  if (typeof wrap === 'function') wrap();
}
