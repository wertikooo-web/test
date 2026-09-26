/* AI Photoshoot LUX - shot scenario visibility fix */
(function(){
'use strict';

function wirePlanner(){
  const box=document.getElementById('luxSeriesBox');
  const toggle=document.getElementById('luxDifferent');
  if(!box||!toggle||box.dataset.toggleWired==='1')return;
  box.dataset.toggleWired='1';

  // Remove obsolete explanatory/help controls if an older build still injects them.
  box.querySelector('#luxAutoPlan')?.remove();
  box.querySelector('#luxPlanHelp')?.remove();

  const update=()=>{
    const enabled=!!toggle.checked;
    const head=box.querySelector('.lux-series-head');
    const quick=box.querySelector('.lux-quick');
    const plan=box.querySelector('#luxPlan');
    const status=box.querySelector('#luxPlanStatus');

    if(head) head.style.display=enabled?'':'none';
    if(quick) quick.style.display=enabled?'flex':'none';
    if(plan) plan.style.display=enabled?'':'none';
    if(status) status.style.display=enabled?'':'none';

    // When disabled, keep the general prompt as the only source of guidance.
    // When re-enabled, ask the existing planner to rebuild its per-shot fields.
    if(enabled && typeof renderPlan==='function'){
      try{ renderPlan(false); }catch(_e){}
    }
  };

  toggle.addEventListener('change',update);
  update();
}

function ensureMissingQuickIdeas(){
  const box=document.getElementById('luxSeriesBox');
  const quick=box?.querySelector('.lux-quick');
  if(!quick)return;

  const lang=(document.documentElement.lang||'ru').toLowerCase().slice(0,2);
  const labels={
    ru:{beach:'Пляж',city:'Город',market:'Рынок',cafe:'Кафе',park:'Парк',oldtown:'Старый город',forest:'Лес'},
    en:{beach:'Beach',city:'City',market:'Market',cafe:'Cafe',park:'Park',oldtown:'Old town',forest:'Forest'},
    ro:{beach:'Plajă',city:'Oraș',market:'Piață',cafe:'Cafenea',park:'Parc',oldtown:'Oraș vechi',forest:'Pădure'}
  };
  const text=labels[lang]||labels.ru;
  const prompts={
    beach:'on a beach with a natural coastal background',
    city:'in a lively city environment',
    market:'at a local market with a natural candid atmosphere',
    cafe:'at an outdoor or stylish cafe setting',
    park:'in a green city park',
    oldtown:'in an old-town street with architectural character',
    forest:'in a natural forest setting'
  };

  Object.entries(text).forEach(([key,label])=>{
    if(quick.querySelector('[data-quick="'+key+'"]'))return;
    const b=document.createElement('button');
    b.type='button';
    b.className='lux-chip';
    b.dataset.quick=key;
    b.dataset.lkey=key;
    b.textContent=label;
    b.addEventListener('click',()=>{
      b.classList.toggle('active');
      if(typeof renderPlan==='function'){
        try{renderPlan(false);}catch(_e){}
      } else {
        const root=document.getElementById('luxPlan');
        if(root && b.classList.contains('active')){
          const inputs=[...root.querySelectorAll('input')];
          const empty=inputs.find(i=>!i.value.trim());
          if(empty)empty.value=prompts[key];
        }
      }
    });
    quick.appendChild(b);
  });
}

function normalizeScenarioTitle(){
  const title=document.getElementById('luxPlanTitle');
  if(!title)return;
  const lang=(document.documentElement.lang||'ru').toLowerCase().slice(0,2);
  title.textContent=lang==='en'?'Shoot scenario':lang==='ro'?'Scenariul ședinței':'Сценарий съёмки';
}

function apply(){
  wirePlanner();
  ensureMissingQuickIdeas();
  normalizeScenarioTitle();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);
else apply();

const observer=new MutationObserver(()=>apply());
observer.observe(document.documentElement,{childList:true,subtree:true});
})();
