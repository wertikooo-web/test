/* AI Photoshoot LUX - active-shot planner + dialog UX + editor-state preservation */
(function(){
'use strict';

const TXT={
  ru:{adding:'Добавляем в',next:'Следующий кадр',pose:'Поза',framing:'Кадрирование',place:'Место',close:'Закрыть'},
  en:{adding:'Adding to',next:'Next shot',pose:'Pose',framing:'Framing',place:'Location',close:'Close'},
  ro:{adding:'Adăugăm în',next:'Cadrul următor',pose:'Poziție',framing:'Încadrare',place:'Loc',close:'Închide'}
};
const LABELS={
  ru:{standing:'Стою',sitting:'Сижу',walking:'Иду',full:'Полный рост',waist:'По пояс',blur:'Размытый фон',viewpoint:'Смотровая',mountains:'Горы',beach:'Пляж',city:'Город',market:'Рынок',cafe:'Кафе',park:'Парк',oldtown:'Старый город',forest:'Лес'},
  en:{standing:'Standing',sitting:'Sitting',walking:'Walking',full:'Full body',waist:'Waist-up',blur:'Blurred background',viewpoint:'Viewpoint',mountains:'Mountains',beach:'Beach',city:'City',market:'Market',cafe:'Cafe',park:'Park',oldtown:'Old town',forest:'Forest'},
  ro:{standing:'În picioare',sitting:'Așezat',walking:'Mergând',full:'Cadru întreg',waist:'Până la talie',blur:'Fundal blurat',viewpoint:'Belvedere',mountains:'Munți',beach:'Plajă',city:'Oraș',market:'Piață',cafe:'Cafenea',park:'Parc',oldtown:'Oraș vechi',forest:'Pădure'}
};
const CLAUSE={
 standing:'standing naturally',
 sitting:'seated naturally in a relaxed pose',
 walking:'walking naturally, candid mid-step',
 full:'full-body portrait, entire person visible',
 waist:'waist-up portrait',
 blur:'softly blurred background with shallow depth of field',
 viewpoint:'at a scenic viewpoint',
 mountains:'with mountains clearly visible in the background',
 beach:'on a beach with a natural coastal background',
 city:'in a lively city environment',
 market:'at a local market with a candid atmosphere',
 cafe:'at a stylish cafe setting',
 park:'in a green city park',
 oldtown:'in an old-town street with architectural character',
 forest:'in a natural forest setting'
};
const GROUPS=[
  ['pose',['standing','sitting','walking']],
  ['framing',['full','waist','blur']],
  ['place',['viewpoint','mountains','beach','city','market','cafe','park','oldtown','forest']]
];
let activeShot=0;
let shotTags=[];

function lc(){return (document.documentElement.lang||'ru').toLowerCase().slice(0,2)}
function tx(k){const l=lc();return (TXT[l]||TXT.ru)[k]||k}
function label(k){const l=lc();return (LABELS[l]||LABELS.ru)[k]||k}
function shotName(i){const l=lc();return l==='en'?`Shot ${i+1}`:l==='ro'?`Cadru ${i+1}`:`Кадр ${i+1}`}

function injectStyles(){
 if(document.getElementById('luxInteractionCss'))return;
 const s=document.createElement('style');s.id='luxInteractionCss';s.textContent=`
 .lux-active-target{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0 8px;padding:9px 10px;border:1px solid #3d3d3d;border-radius:10px;background:#101010;font-size:12px;color:#bbb}
 .lux-active-target strong{color:#fff}.lux-next-shot{border:1px solid #444;background:#202020;color:#fff;border-radius:999px;padding:6px 9px;font-size:11px}.lux-next-shot:hover{background:#fff;color:#111}
 .lux-quick{display:block!important;margin-top:9px}.lux-quick-group{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:7px 0}.lux-quick-group-title{width:84px;color:#888;font-size:11px}.lux-chip.is-shot-active{background:#fff;color:#111;border-color:#fff}
 .lux-shot-row{padding:5px;border-radius:11px;transition:.15s}.lux-shot-row.lux-current-shot{background:#202020;box-shadow:inset 0 0 0 1px #666}.lux-shot-row{cursor:pointer}.lux-shot-row input{cursor:text}
 .lux-shot-tags{grid-column:2;display:flex;gap:5px;flex-wrap:wrap;margin-top:-2px}.lux-shot-tag{display:inline-flex;align-items:center;gap:4px;border:1px solid #444;background:#171717;color:#ddd;border-radius:999px;padding:3px 7px;font-size:10px}.lux-shot-tag button{border:0;background:transparent;color:#aaa;padding:0;font-size:12px;line-height:1}.lux-shot-tag button:hover{color:#fff}
 .lux-dialog-card{position:relative}.lux-dialog-x{position:absolute;right:12px;top:10px;width:34px;height:34px;border:0;border-radius:999px;background:#eee;color:#111;font-size:21px;line-height:1}.lux-dialog.is-submitted{display:none!important}
 `;document.head.appendChild(s)
}

function ensurePlannerStructure(){
 const box=document.getElementById('luxSeriesBox');
 const quick=box?.querySelector('.lux-quick');
 const plan=document.getElementById('luxPlan');
 if(!box||!quick||!plan)return;

 // Preserve previous selections before rebuilding quick controls.
 if(!quick.dataset.activeShotUi){
   quick.dataset.activeShotUi='1';
   quick.innerHTML='';
   const target=document.createElement('div');target.className='lux-active-target';target.innerHTML=`<span>${tx('adding')}: <strong id="luxActiveShotName">${shotName(activeShot)}</strong></span><button type="button" class="lux-next-shot">${tx('next')}</button>`;
   quick.appendChild(target);
   GROUPS.forEach(([g,keys])=>{
     const row=document.createElement('div');row.className='lux-quick-group';
     const title=document.createElement('span');title.className='lux-quick-group-title';title.textContent=tx(g);row.appendChild(title);
     keys.forEach(key=>{const b=document.createElement('button');b.type='button';b.className='lux-chip';b.dataset.quick=key;b.textContent=label(key);b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();toggleTag(activeShot,key)});row.appendChild(b)});
     quick.appendChild(row);
   });
   quick.querySelector('.lux-next-shot').addEventListener('click',()=>{const n=plan.querySelectorAll('.lux-shot-row').length||1;setActiveShot((activeShot+1)%n)});
 }
 wireRows();
 refreshPlannerLabels();
}

function wireRows(){
 const rows=[...document.querySelectorAll('#luxPlan .lux-shot-row')];
 if(!rows.length)return;
 while(shotTags.length<rows.length)shotTags.push(new Set());
 shotTags=shotTags.slice(0,rows.length);
 if(activeShot>=rows.length)activeShot=rows.length-1;
 rows.forEach((row,i)=>{
   if(row.dataset.activeShotWired!=='1'){
     row.dataset.activeShotWired='1';
     row.addEventListener('click',e=>{if(e.target.closest('.lux-shot-tag button'))return;setActiveShot(i)});
     const input=row.querySelector('input');if(input)input.addEventListener('focus',()=>setActiveShot(i));
   }
   row.classList.toggle('lux-current-shot',i===activeShot);
   renderTagsForRow(row,i);
 });
 updateQuickActive();
 const name=document.getElementById('luxActiveShotName');if(name)name.textContent=shotName(activeShot);
}

function setActiveShot(i){activeShot=Math.max(0,i);wireRows()}
function toggleTag(i,key){
 if(!shotTags[i])shotTags[i]=new Set();
 if(shotTags[i].has(key))shotTags[i].delete(key);else shotTags[i].add(key);
 applyTagsToShot(i);wireRows();
}
function applyTagsToShot(i){
 const row=document.querySelectorAll('#luxPlan .lux-shot-row')[i];if(!row)return;
 const input=row.querySelector('input');if(!input)return;
 const keys=[...(shotTags[i]||[])];
 if(!keys.length)return;
 input.value=keys.map(k=>CLAUSE[k]).join(', ');
 input.dispatchEvent(new Event('input',{bubbles:true}));
}
function removeTag(i,key){if(shotTags[i])shotTags[i].delete(key);const row=document.querySelectorAll('#luxPlan .lux-shot-row')[i];if(row){const input=row.querySelector('input');if(input){const keys=[...shotTags[i]];input.value=keys.length?keys.map(k=>CLAUSE[k]).join(', '):'';input.dispatchEvent(new Event('input',{bubbles:true}))}}wireRows()}
function renderTagsForRow(row,i){
 let tags=row.querySelector('.lux-shot-tags');if(!tags){tags=document.createElement('div');tags.className='lux-shot-tags';row.appendChild(tags)}
 tags.innerHTML='';[...(shotTags[i]||[])].forEach(key=>{const chip=document.createElement('span');chip.className='lux-shot-tag';chip.innerHTML=`${label(key)} <button type="button" aria-label="remove">×</button>`;chip.querySelector('button').addEventListener('click',e=>{e.stopPropagation();removeTag(i,key)});tags.appendChild(chip)})
}
function updateQuickActive(){document.querySelectorAll('.lux-chip[data-quick]').forEach(b=>b.classList.toggle('is-shot-active',!!shotTags[activeShot]?.has(b.dataset.quick)))}
function refreshPlannerLabels(){
 const quick=document.querySelector('#luxSeriesBox .lux-quick');if(!quick)return;
 const adding=quick.querySelector('.lux-active-target span');if(adding)adding.innerHTML=`${tx('adding')}: <strong id="luxActiveShotName">${shotName(activeShot)}</strong>`;
 const next=quick.querySelector('.lux-next-shot');if(next)next.textContent=tx('next');
 quick.querySelectorAll('.lux-quick-group').forEach((row,idx)=>{const title=row.querySelector('.lux-quick-group-title');if(title)title.textContent=tx(GROUPS[idx][0])});
 quick.querySelectorAll('.lux-chip[data-quick]').forEach(b=>b.textContent=label(b.dataset.quick));
 wireRows();
}

function installPlanner(){
 injectStyles();ensurePlannerStructure();
 const plan=document.getElementById('luxPlan');if(plan&&!plan.dataset.activeObserver){plan.dataset.activeObserver='1';new MutationObserver(()=>queueMicrotask(ensurePlannerStructure)).observe(plan,{childList:true})}
 const box=document.getElementById('luxSeriesBox');if(box&&!box.dataset.langObserver){box.dataset.langObserver='1';document.addEventListener('click',e=>{if(e.target.closest('.lang-btn'))setTimeout(refreshPlannerLabels,30)})}
}

// Preserve open editor, draft text, caret and focus when any other result is generated/re-rendered.
function installRenderStateProtection(){
 if(typeof window.renderResults!=='function' || window.renderResults.__luxStateSafe)return;
 const base=window.renderResults;
 function capture(){
   const cards=[...document.querySelectorAll('#results .result')];
   cards.forEach((card,i)=>{
     const r=window.resultsData?.[i];if(!r)return;
     const ed=card.querySelector('.editor'),ta=ed?.querySelector('textarea');
     if(!ta)return;
     r.__luxDraft=ta.value;
     r.__luxEditorOpen=!ed.classList.contains('hidden');
     if(document.activeElement===ta){r.__luxFocus=true;r.__luxSel=[ta.selectionStart||0,ta.selectionEnd||0];r.__luxScroll=ta.scrollTop||0}else r.__luxFocus=false;
   });
 }
 function restore(){
   const cards=[...document.querySelectorAll('#results .result')];
   cards.forEach((card,i)=>{
     const r=window.resultsData?.[i];if(!r)return;
     const ed=card.querySelector('.editor'),ta=ed?.querySelector('textarea');if(!ta)return;
     if(typeof r.__luxDraft==='string')ta.value=r.__luxDraft;
     if(r.__luxEditorOpen)ed.classList.remove('hidden');
     if(r.__luxFocus){requestAnimationFrame(()=>{ta.focus();const s=r.__luxSel||[ta.value.length,ta.value.length];try{ta.setSelectionRange(s[0],s[1])}catch{}ta.scrollTop=r.__luxScroll||0})}
   });
 }
 const wrapped=function(){capture();const out=base.apply(this,arguments);restore();return out};wrapped.__luxStateSafe=true;window.renderResults=wrapped;
}

// Dialog closes visually as soon as Create is pressed; also provide an explicit X.
function installDialogUX(){
 document.addEventListener('click',e=>{
   const go=e.target.closest('.lux-dialog .go');if(go){const dlg=go.closest('.lux-dialog');if(dlg){dlg.classList.add('is-submitted');setTimeout(()=>{if(dlg.isConnected&&dlg.classList.contains('is-submitted'))dlg.style.display='none'},0)}}
   const x=e.target.closest('.lux-dialog-x');if(x){x.closest('.lux-dialog')?.remove()}
 },true);
 const obs=new MutationObserver(muts=>{for(const m of muts)for(const n of m.addedNodes){if(!(n instanceof HTMLElement))continue;const dialogs=n.matches?.('.lux-dialog')?[n]:[...n.querySelectorAll?.('.lux-dialog')||[]];dialogs.forEach(d=>{const card=d.querySelector('.lux-dialog-card');if(card&&!card.querySelector('.lux-dialog-x')){const x=document.createElement('button');x.type='button';x.className='lux-dialog-x';x.textContent='×';x.title=tx('close');card.prepend(x)}})}});obs.observe(document.body,{childList:true,subtree:true});
}

function boot(){installPlanner();installRenderStateProtection();installDialogUX();setTimeout(()=>{installPlanner();installRenderStateProtection()},100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
