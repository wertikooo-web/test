/* Demo mode: keep a practically unlimited Credits balance for testing. */
(function(){
  'use strict';
  const KEY='luxCreditProfileV2';
  const DEMO_BALANCE=999999;
  try{
    let p={balance:DEMO_BALANCE,history:[],createdAt:new Date().toISOString()};
    try{
      const existing=JSON.parse(localStorage.getItem(KEY)||'null');
      if(existing&&Array.isArray(existing.history)){
        p={...existing,balance:DEMO_BALANCE};
      }
    }catch(_e){}
    localStorage.setItem(KEY,JSON.stringify(p));
  }catch(_e){}
})();
