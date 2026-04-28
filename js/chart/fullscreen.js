// Fullscreen chart overlay. Created on demand, destroyed on close.

import { S } from "../state.js";
import { INSTRUMENTS, _BINANCE_MAP, _TD_MAP } from "../config.js";
import { _fmtTime } from "../util.js";
import {
  getCandleSeries, getChart, getChartSym, getChartTF, setChartTF,
  getVolSeries, _buildCandleHistory,
} from "./chart.js";
import { _getBinanceTF } from "../api/binance.js";
import { _fetchBinance } from "../api/binance.js";
import { _fetchTwelveData } from "../api/fx.js";

let _fsChart=null,_fsCandleSeries=null,_fsVolSeries=null;

export function getFsChart() { return _fsChart; }

export function openFullChart(){
  var ov=document.getElementById('chart-fs-overlay');
  if(!ov)return;
  var sym=S.asset;
  var inst=INSTRUMENTS[sym];
  var data=S.prices[sym];
  var spread=inst?inst.pip*2:0;
  var dec=inst?inst.dec:5;
  var p=data&&data.price?data.price:0;
  // update header
  var symEl=document.getElementById('fs-sym');if(symEl)symEl.textContent=S.assetName||sym;
  var priceEl=document.getElementById('fs-price');if(priceEl)priceEl.textContent=p?p.toFixed(dec):'—';
  var spEl=document.getElementById('fs-sp');if(spEl)spEl.textContent=p?(p-spread).toFixed(dec):'—';
  var bpEl=document.getElementById('fs-bp');if(bpEl)bpEl.textContent=p?(p+spread).toFixed(dec):'—';
  // sync TF buttons
  document.querySelectorAll('.chart-fs-tf-bar .tf').forEach(function(b){b.classList.remove('active');if(b.dataset.tf===getChartTF())b.classList.add('active');});
  ov.classList.add('open');
  // init fullscreen chart
  setTimeout(function(){
    var container=document.getElementById('tv-chart-fs');
    if(!container||typeof LightweightCharts==='undefined')return;
    container.innerHTML='';
    if(_fsChart){try{_fsChart.remove();}catch(e){}_fsChart=null;}
    _fsChart=LightweightCharts.createChart(container,{
      width:container.clientWidth,height:container.clientHeight,
      layout:{background:{color:'#0d1117'},textColor:'#d1d4dc',fontSize:12},
      grid:{vertLines:{color:'#1e2230',style:1},horzLines:{color:'#1e2230',style:1}},
      crosshair:{mode:LightweightCharts.CrosshairMode.Normal,vertLine:{color:'#758696',labelBackgroundColor:'#2b2b43'},horzLine:{color:'#758696',labelBackgroundColor:'#2b2b43'}},
      rightPriceScale:{borderColor:'#2a2a4a',scaleMargins:{top:0.08,bottom:0.15}},
      timeScale:{borderColor:'#2a2a4a',timeVisible:true,secondsVisible:false,rightOffset:5,barSpacing:8,minBarSpacing:3}
    });
    _fsCandleSeries=_fsChart.addCandlestickSeries({upColor:'#26a69a',downColor:'#ef5350',borderUpColor:'#26a69a',borderDownColor:'#ef5350',wickUpColor:'#26a69a',wickDownColor:'#ef5350'});
    _fsVolSeries=_fsChart.addHistogramSeries({priceFormat:{type:'volume'},priceScaleId:'fsvol'});
    _fsChart.priceScale('fsvol').applyOptions({scaleMargins:{top:0.85,bottom:0}});
    var ro=new ResizeObserver(function(){if(_fsChart&&container)_fsChart.applyOptions({width:container.clientWidth,height:container.clientHeight});});
    ro.observe(container);
    // load same candle data as inline chart
    _loadFSCandles(sym,getChartTF());
  },60);
}

export function closeFullChart(){
  var ov=document.getElementById('chart-fs-overlay');
  if(ov)ov.classList.remove('open');
  if(_fsChart){try{_fsChart.remove();}catch(e){}_fsChart=null;_fsCandleSeries=null;_fsVolSeries=null;}
}

export function setFSTF(tf,btn){
  setChartTF(tf);
  document.querySelectorAll('.chart-fs-tf-bar .tf').forEach(function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
  // also sync inline TF buttons
  document.querySelectorAll('.inst-tf-bar .tf').forEach(function(b){b.classList.remove('active');if(b.textContent===btn.textContent)b.classList.add('active');});
  _loadFSCandles(S.asset,tf);
}

export async function _loadFSCandles(sym,tf){
  if(!_fsCandleSeries)return;
  var container=document.getElementById('tv-chart-fs');
  var oldLoad=document.getElementById('fs-chart-loading');if(oldLoad)oldLoad.remove();
  var loadEl=document.createElement('div');loadEl.id='fs-chart-loading';
  loadEl.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#888;font-size:13px;pointer-events:none;z-index:10;';
  loadEl.textContent='Загрузка...';
  if(container)container.appendChild(loadEl);
  var removeLoad=function(){var el=document.getElementById('fs-chart-loading');if(el)el.remove();};
  try{
    var candles;
    var binSym=_BINANCE_MAP[sym];var tdSym=_TD_MAP[sym];
    if(binSym)candles=await _fetchBinance(binSym,_getBinanceTF(tf));
    else if(tdSym)candles=await _fetchTwelveData(tdSym,tf);
    removeLoad();
    if(candles&&candles.length>0){
      _fsCandleSeries.setData(candles);
      var volData=candles.map(function(c){return{time:c.time,value:c.volume||0,color:c.close>=c.open?'rgba(38,166,154,0.5)':'rgba(239,83,80,0.5)'};});
      if(_fsVolSeries)_fsVolSeries.setData(volData);
      _fsChart.timeScale().fitContent();
      // update inline chart too
      if(getCandleSeries()){getCandleSeries().setData(candles);if(_volSeries)_volSeries.setData(volData);getChart()&&getChart().timeScale().fitContent();}
      // update prices
      var last=candles[candles.length-1];
      var inst=INSTRUMENTS[sym];var dec=inst?inst.dec:5;var spread=inst?inst.pip*2:0;
      var lp=document.getElementById('fs-price');if(lp)lp.textContent=last.close.toFixed(dec);
      var sp2=document.getElementById('fs-sp');if(sp2)sp2.textContent=(last.close-spread).toFixed(dec);
      var bp2=document.getElementById('fs-bp');if(bp2)bp2.textContent=(last.close+spread).toFixed(dec);
    }
  }catch(e){
    removeLoad();
    try{var syn=_buildCandleHistory(sym,tf);if(_fsCandleSeries){_fsCandleSeries.setData(syn);var vd=syn.map(function(c){return{time:c.time,value:c.volume||0,color:c.close>=c.open?'rgba(16,185,129,0.5)':'rgba(239,68,68,0.5)'};});if(_fsVolSeries)_fsVolSeries.setData(vd);_fsChart&&_fsChart.timeScale().fitContent();}}catch(e2){}
  }
}

