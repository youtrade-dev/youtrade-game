// Trading instruments, leverage, commissions, and provider symbol maps.

export const INSTRUMENTS = {
  'EURUSD=X': {name:'EUR/USD', dec:5, pip:0.0001, pipVal:10, cat:'forex',   contractSize:100000, baseCcy:'EUR', quoteCcy:'USD', session:'fx', htmlId:'EURUSD'},
  'GBPUSD=X': {name:'GBP/USD', dec:5, pip:0.0001, pipVal:10, cat:'forex',   contractSize:100000, baseCcy:'GBP', quoteCcy:'USD', session:'fx', htmlId:'GBPUSD'},
  'USDJPY=X': {name:'USD/JPY', dec:3, pip:0.01,   pipVal:9,  cat:'forex',   contractSize:100000, baseCcy:'USD', quoteCcy:'JPY', session:'fx', htmlId:'USDJPY'},
  'GC=F':     {name:'XAUUSD',  dec:2, pip:0.1,    pipVal:10, cat:'metals',  contractSize:100,    baseCcy:'XAU', quoteCcy:'USD', session:'metal', htmlId:'XAUUSD'},
  'SI=F':     {name:'XAGUSD',  dec:3, pip:0.001,  pipVal:5,  cat:'metals',  contractSize:5000,   baseCcy:'XAG', quoteCcy:'USD', session:'metal', htmlId:'XAGUSD'},
  '^GSPC':    {name:'S&P 500', dec:2, pip:0.25,   pipVal:12.5, cat:'indices', contractSize:1,    baseCcy:'USD', quoteCcy:'USD', session:'us_idx', htmlId:'SP500'},
  '^IXIC':    {name:'NASDAQ',  dec:2, pip:0.25,   pipVal:5,  cat:'indices', contractSize:1,      baseCcy:'USD', quoteCcy:'USD', session:'us_idx', htmlId:'NASDAQ'},
  'BTC-USD':  {name:'BTC/USD', dec:2, pip:1,      pipVal:1,  cat:'crypto',  contractSize:1,      baseCcy:'BTC', quoteCcy:'USD', session:'24/7', htmlId:'BTC'},
  'ETH-USD':  {name:'ETH/USD', dec:2, pip:0.01,   pipVal:1,  cat:'crypto',  contractSize:1,      baseCcy:'ETH', quoteCcy:'USD', session:'24/7', htmlId:'ETH'},
};

export const LEVERAGE = 50;

export const COMM_PER_LOT = 5;

export const _BINANCE_MAP = {
  'BTC-USD':'BTCUSDT','ETH-USD':'ETHUSDT',
  'EURUSD=X':'EURUSDT','GBPUSD=X':'GBPUSDT',
  'GC=F':'XAUUSDT','SI=F':'XAGUSDT'
};

export const _INST_MAP={'EURUSD=X':{row:'row-EURUSD',exp:'exp-EURUSD',lp:'lp-EURUSD',sp:'sp-EURUSD',bp:'bp-EURUSD', htmlId:'EURUSD'},'GBPUSD=X':{row:'row-GBPUSD',exp:'exp-GBPUSD',lp:'lp-GBPUSD',sp:'sp-GBPUSD',bp:'bp-GBPUSD', htmlId:'GBPUSD'},'USDJPY=X':{row:'row-USDJPY',exp:'exp-USDJPY',lp:'lp-USDJPY',sp:'sp-USDJPY',bp:'bp-USDJPY', htmlId:'USDJPY'},'GC=F':{row:'row-XAUUSD',exp:'exp-XAUUSD',lp:'lp-XAUUSD',sp:'sp-XAUUSD',bp:'bp-XAUUSD', htmlId:'XAUUSD'},'SI=F':{row:'row-XAGUSD',exp:'exp-XAGUSD',lp:'lp-XAGUSD',sp:'sp-XAGUSD',bp:'bp-XAGUSD', htmlId:'XAGUSD'},'^GSPC':{row:'row-SP500',exp:'exp-SP500',lp:'lp-SP500',sp:'sp-SP500',bp:'bp-SP500', htmlId:'SP500'},'^IXIC':{row:'row-NASDAQ',exp:'exp-NASDAQ',lp:'lp-NASDAQ',sp:'sp-NASDAQ',bp:'bp-NASDAQ', htmlId:'NASDAQ'},'BTC-USD':{row:'row-BTC',exp:'exp-BTC',lp:'lp-BTC',sp:'sp-BTC',bp:'bp-BTC', htmlId:'BTC'},'ETH-USD':{row:'row-ETH',exp:'exp-ETH',lp:'lp-ETH',sp:'sp-ETH',bp:'bp-ETH', htmlId:'ETH'}};

export const _TD_MAP = {
  'USDJPY=X':'USD/JPY',
  'NQ=F':'NQ1!','^IXIC':'IXIC'
};

