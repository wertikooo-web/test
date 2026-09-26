/* UI repair layer: reliable style visuals + clean planner toggle */
(function(){
  'use strict';

  const FALLBACKS={
    business:['#243447','#d5b58b','office'],
    linkedin:['#355c7d','#d9e8f3','headshot'],
    luxury:['#2b1b2f','#d6b3c7','luxury'],
    casual:['#6b7f65','#e6d7bf','casual'],
    travel:['#527b8f','#d8b47b','travel'],
    editorial:['#303030','#c9a680','editorial'],
    creative:['#6d476d','#e7b5a8','creative'],
    dating:['#9a6f74','#f1d7c9','dating']
  };

  function svgFallback(id){
    const [a,b]=FALLBACKS[id]||['#4c5968','#d8c3a5'];
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="675" viewBox="0 0 900 675">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
      </defs>
      <rect width="900" height="675" fill="url(#g)"/>
      <circle cx="150" cy="120" r="120" fill="#fff" opacity=".14" filter="url(#blur)"/>
      <circle cx="760" cy="560" r="170" fill="#000" opacity=".12" filter="url(#blur)"/>
      <ellipse cx="450" cy="245" rx="95" ry="118" fill="#e8c6a5"/>
      <path d="M344 224c15-120 188-149 225-31-23-42-75-66-120-61-53 5-87 41-105 92z" fill="#2a2424"/>
      <path d="M318 675c16-183 92-285 132-296 48 16 102 15 151 0 64 27 120 144 132 296z" fill="#1f2933" opacity=".96"/>
      <path d="M390 386c32 31 87 45 122 4l24 42-86 42-83-47z" fill="#f7f3ee" opacity=".9"/>
      <circle cx="414" cy="245" r="8" fill="#3b2e2b"/><circle cx="486" cy="245" r="8" fill="#3b2e2b"/>
      <path d="M425 300c23 16 49 16 72 0" stroke="#9d5c52" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }

  function repairStyleImages(){
    document.querySelectorAll('#styleGrid .style').forEach((card,i)=>{
      const img=card.querySelector('img');
      if(!img)return;
      const id=(typeof styles!=='undefined'&&styles[i]?.id)||['business','linkedin','luxury','casual','travel','editorial','creative','dating'][i]||'business';
      const fallback=svgFallback(id);
      const useFallback=()=>{ if(img.dataset.fallbackDone)return; img.dataset.fallbackDone='1'; img.src=fallback; };
      img.addEventListener('error',useFallback,{once:true});
      if(img.complete && img.naturalWidth===0) useFallback();
    });
  }

  if(typeof renderStyles==='function'){
    const baseRenderStyles=renderStyles;
    renderStyles=function(){
      baseRenderStyles();
      requestAnimationFrame(repairStyleImages);
    };
  }

  function cleanMemory(){
    const m=document.getElementById('memoryBox');
    if(m)m.style.display='none';
  }

  function setupPlannerToggle(){
    const box=document.getElementById('luxSeriesBox');
    const toggle=document.getElementById('luxDifferent');
    if(!box||!toggle)return false;

    let body=document.getElementById('luxPlannerBody');
    if(!body){
      body=document.createElement('div');
      body.id='luxPlannerBody';
      const quick=box.querySelector('.lux-quick');
      const plan=box.querySelector('#luxPlan');
      const status=box.querySelector('#luxPlanStatus');
      if(quick)body.appendChild(quick);
      if(plan)body.appendChild(plan);
      if(status)body.appendChild(status);
      box.appendChild(body);
    }

    const title=document.getElementById('luxPlanTitle');
    if(title)title.textContent=(typeof lt==='function'?lt('planTitle'):'Сценарий съёмки');

    const update=()=>{
      body.style.display=toggle.checked?'':'none';
      if(title)title.style.display=toggle.checked?'':'none';
    };
    toggle.addEventListener('change',update);
    update();
    return true;
  }

  function boot(){
    cleanMemory();
    repairStyleImages();
    if(!setupPlannerToggle()){
      const obs=new MutationObserver(()=>{
        cleanMemory();
        repairStyleImages();
        if(setupPlannerToggle())obs.disconnect();
      });
      obs.observe(document.body,{childList:true,subtree:true});
      setTimeout(()=>obs.disconnect(),5000);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
