import { LEVERAGE, COMM_PER_LOT } from "../config.js";

// Trade math: commission, notional, margin.

export function calcCommission(lots){ return Math.round(COMM_PER_LOT * lots * 100) / 100; }

export function calcNotional(inst, lots, price){
  if(inst.cat === 'forex'){
    // notional в USD: contractSize * lots, конверсия по валюте базы
    if(inst.baseCcy === 'USD') return inst.contractSize * lots;       // USDJPY
    // EUR/USD, GBP/USD: USD = lots * 100000 * price
    return inst.contractSize * lots * price;
  }
  if(inst.cat === 'metals'){
    // Унции * цена
    return inst.contractSize * lots * price;
  }
  if(inst.cat === 'indices'){
    // notional ≈ price * lots * 1
    return price * lots;
  }
  if(inst.cat === 'crypto'){
    return price * lots;
  }
  return price * lots;
}

export function calcMargin(inst, lots, price){ return calcNotional(inst, lots, price) / LEVERAGE; }

