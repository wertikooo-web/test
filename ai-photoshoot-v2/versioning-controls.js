/* AI Photoshoot LUX - repeat regeneration, version history, credit ledger, bulk controls */
(function(){
'use strict';

const COST={newPhoto:20,regenerate:20,edit:20,upgrade4k:10};
const PROFILE_KEY='luxCreditProfileV1';

const COPY={
  ru:{version:'Версия',spent:'Потрачено',history:'История',restore:'Вернуть',generated:'Новый кадр',regenerated:'Перегенерация',edited:'Изменение',restored:'Возврат к версии',deleteAll:'Удалить все фото',clearAll:'Очистить всё',clearHint:'Сбросить настройки и фильтры. Исходные 5 фото останутся.',deleteConfirm:'Удалить все созданные фотографии? Credits не возвращаются.',clearConfirm:'Сбросить все настройки, фильтры, референсы стиля и сценарий съёмки? Исходные 5 фотографий останутся.',creditHistory:'История Credits',balance:'Баланс',noTransactions:'Операций пока нет.',notEnough:'Недостаточно Credits.',close:'Закрыть',editLabel:'Правка',testLocal:'Тестовый учёт хранится в этом браузере.'},
  en:{version:'Version',spent:'Spent',history:'History',restore:'Restore',generated:'New shot',regenerated:'Regeneration',edited:'Edit',restored:'Restored version',deleteAll:'Delete all photos',clearAll:'Clear all',clearHint:'Reset settings and filters. Your 5 source photos stay.',deleteConfirm:'Delete all generated photos? Credits will not be refunded.',clearConfirm:'Reset all settings, filters, style references and shot scenario? Your 5 source photos stay.',creditHistory:'Credits history',balance:'Balance',noTransactions:'No transactions yet.',notEnough:'Not enough Credits.',close:'Close',editLabel:'Edit',testLocal:'Test accounting is stored in this browser.'},
  ro:{version:'Versiune',spent:'Cheltuit',history:'Istoric',restore:'Revino',generated:'Cadru nou',regenerated:'Regenerare',edited:'Modificare',restored:'Revenire la versiune',deleteAll:'Șterge toate fotografiile',clearAll:'Curăță tot',clearHint:'Resetează setările și filtrele. Cele 5 fotografii sursă rămân.',deleteConfirm:'Ștergi toate fotografiile generate? Credits nu se restituie.',clearConfirm:'Resetezi toate setările, filtrele, referințele de stil și scenariul? Cele 5 fotografii sursă rămân.',creditHistory:'Istoric Credits',balance:'Sold',noTransactions:'Nu există operații încă.',notEnough:'Credits insuficiente.',close:'Închide',editLabel:'Modificare',testLocal:'Evidența de test este păstrată în acest browser.'}
};

function langCode(){return (document.documentElement.lang||'ru').toLowerCase().slice(0,2)}
function c(k){const l=langCode();return (COPY[l]||COPY.ru)[k]||COPY.ru[k]||k}
function now(){return new Date().toISOString()}
function uid(){return 'shot_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}

function loadProfile(){
  try{
    const p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');
    if(p&&Number.isFinite(p.balance)&&Array.isArray(p.history))return p;
  }catch(_e){}
  return {balance:120,history:[],createdAt:now()};
}
let creditProfile=loadProfile();
function saveProfile(){localStorage.setItem(PROFILE_KEY,JSON.stringify(creditProfile));updateBalanceUI()}
function updateBalanceUI(){
  const v=document.getElementById('balanceValue');if(v)v.textContent=String(Math.max(0,creditProfile.balance));
  const box=document.querySelector('.balance');if(box){box.style.cursor='pointer';box.title=c('creditHistory')}
}
function debit(amount,type,shotId,note){
  amount=Number(amount)||0;
  if(amount<=0)return true;
  if(creditProfile.balance<amount)return false;
  creditProfile.balance-=amount;
  creditProfile.history.unshift({id:'tx_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),at:now(),amount:-amount,type,shotId:shotId||null,note:note||''});
  saveProfile();return true;
}
function actionLabel(type){return type==='edit'?c('edited'):type==='regenerate'?c('regenerated'):type==='restore'?c('restored'):c('generated')}

function injectCss(){
 if(document.getElementById('luxVersionCss'))return;
 const s=document.createElement('style');s.id='luxVersionCss';s.textContent=`
 .lux-version-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:0 10px 10px;color:#aaa;font-size:11px}.lux-version-meta strong{color:#fff}.lux-history-btn,.lux-bulk-btn{border:1px solid #444;background:#181818;color:#fff;border-radius:9px;padding:7px 9px;font-size:11px}.lux-history-btn:hover,.lux-bulk-btn:hover{background:#fff;color:#111}.lux-bulk-btn.danger{background:#4a1b1b;border-color:#673030}.lux-bulk-actions{display:flex;gap:7px;flex-wrap:wrap;align-items:center}.lux-history-list{display:grid;gap:9px;max-height:55vh;overflow:auto;margin-top:14px}.lux-history-row{display:grid;grid-template-columns:56px 1fr auto;gap:10px;align-items:center;border:1px solid #ddd;border-radius:12px;padding:8px}.lux-history-row img{width:56px;height:68px;object-fit:cover;border-radius:8px;background:#eee}.lux-history-row small{display:block;color:#777;margin-top:3px}.lux-history-row button{border:0;border-radius:999px;background:#111;color:#fff;padding:7px 9px}.lux-credit-row{display:grid;grid-template-columns:1fr auto;gap:12px;border-bottom:1px solid #e5e1da;padding:9px 0}.lux-credit-row:last-child{border-bottom:0}.lux-credit-row small{display:block;color:#777;margin-top:3px}.lux-credit-amount{font-weight:850}.lux-credit-amount.neg{color:#8a2b2b}.lux-dialog-subnote{font-size:11px;color:#888;margin-top:12px}
 `;document.head.appendChild(s)
}

function ensureResultMeta(r){
 if(!r)return;
 if(!r.__luxId)r.__luxId=uid();
 if(!Array.isArray(r.__luxVersions))r.__luxVersions=[];
 if(!Number.isInteger(r.__luxCurrentVersion))r.__luxCurrentVersion=Math.max(0,r.__luxVersions.length-1);
 if(!Number.isFinite(r.__luxSpent))r.__luxSpent=0;
 if(!r.__luxInitialRecorded && r.src){
   const extra=document.getElementById('resolution')?.value==='4K'?COST.upgrade4k:0;
   const cost=COST.newPhoto+extra;
   if(debit(cost,'generation',r.__luxId,'initial')){
     r.__luxVersions.push({src:r.src,type:'generation',credits:cost,at:now(),note:''});
     r.__luxCurrentVersion=r.__luxVersions.length-1;
     r.__luxSpent+=cost;
   }else{
     r.__luxVersions.push({src:r.src,type:'generation',credits:0,at:now(),note:'test balance exhausted'});
     r.__luxCurrentVersion=r.__luxVersions.length-1;
   }
   r.__luxInitialRecorded=true;
 }
}
function captureEditors(){
 const cards=[...document.querySelectorAll('#results .result')];
 cards.forEach((card,i)=>{
   const r=resultsData?.[i];if(!r)return;
   const ed=card.querySelector('.editor'),ta=ed?.querySelector('textarea');if(!ta)return;
   r.__luxDraft=ta.value;r.__luxEditorOpen=!ed.classList.contains('hidden');r.__luxFocus=document.activeElement===ta;
   if(r.__luxFocus){r.__luxSelection=[ta.selectionStart||0,ta.selectionEnd||0];r.__luxScroll=ta.scrollTop||0}
 });
}
function restoreEditors(){
 const cards=[...document.querySelectorAll('#results .result')];
 cards.forEach((card,i)=>{
   const r=resultsData?.[i];if(!r)return;
   const ed=card.querySelector('.editor'),ta=ed?.querySelector('textarea');if(!ta)return;
   if(typeof r.__luxDraft==='string')ta.value=r.__luxDraft;
   if(r.__luxEditorOpen)ed.classList.remove('hidden');
   if(r.__luxFocus)requestAnimationFrame(()=>{ta.focus();const a=r.__luxSelection||[ta.value.length,ta.value.length];try{ta.setSelectionRange(a[0],a[1])}catch(_e){}ta.scrollTop=r.__luxScroll||0});
 });
}

function decorateCards(){
 const cards=[...document.querySelectorAll('#results .result')];
 cards.forEach((card,i)=>{
   const r=resultsData?.[i];if(!r)return;ensureResultMeta(r);
   let meta=card.querySelector('.lux-version-meta');
   if(!meta){meta=document.createElement('div');meta.className='lux-version-meta';const editor=card.querySelector('.editor');if(editor)card.insertBefore(meta,editor);else card.appendChild(meta)}
   const current=(r.__luxCurrentVersion??0)+1,total=r.__luxVersions?.length||1;
   const nextHtml=`<span><strong>${c('version')} v${current}</strong>${total>1?' / '+total:''}</span><span>${c('spent')}: <strong>${r.__luxSpent||0} Credits</strong></span><button type="button" class="lux-history-btn">${c('history')}</button>`;
   if(meta.innerHTML!==nextHtml)meta.innerHTML=nextHtml;
   const historyBtn=meta.querySelector('.lux-history-btn');if(historyBtn)historyBtn.onclick=()=>openVersionHistory(i);
 });
}

function modal(title,html){
 const w=document.createElement('div');w.className='lux-dialog';w.innerHTML=`<div class="lux-dialog-card"><button type="button" class="lux-dialog-x">×</button><h3>${title}</h3>${html}</div>`;
 const close=()=>w.remove();w.querySelector('.lux-dialog-x').onclick=close;w.onclick=e=>{if(e.target===w)close()};document.body.appendChild(w);return w;
}
function openVersionHistory(idx){
 const r=resultsData?.[idx];if(!r)return;ensureResultMeta(r);
 const rows=[...r.__luxVersions].map((v,i)=>({v,i})).reverse().map(({v,i})=>`<div class="lux-history-row"><img src="${v.src}" alt="v${i+1}"><div><strong>v${i+1} · ${actionLabel(v.type)}</strong>${v.note?`<small>${escapeHtml(v.note)}</small>`:''}<small>${new Date(v.at).toLocaleString()} · ${v.credits||0} Credits</small></div><button type="button" data-restore="${i}" ${i===r.__luxCurrentVersion?'disabled':''}>${c('restore')}</button></div>`).join('');
 const w=modal(`${c('history')} · ${c('version')} v${(r.__luxCurrentVersion||0)+1}`,`<div class="lux-history-list">${rows}</div>`);
 w.querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>{const vi=Number(b.dataset.restore),v=r.__luxVersions[vi];if(!v)return;r.src=v.src;r.__luxCurrentVersion=vi;r.__luxDraft='';r.__luxEditorOpen=false;creditProfile.history.unshift({id:'tx_'+Date.now(),at:now(),amount:0,type:'restore',shotId:r.__luxId,note:'v'+(vi+1)});saveProfile();w.remove();renderResults()});
}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}

function openCreditHistory(){
 const rows=creditProfile.history.length?creditProfile.history.map(tx=>`<div class="lux-credit-row"><div><strong>${actionLabel(tx.type)}</strong>${tx.note?`<small>${escapeHtml(tx.note)}</small>`:''}<small>${new Date(tx.at).toLocaleString()}</small></div><div class="lux-credit-amount ${tx.amount<0?'neg':''}">${tx.amount>0?'+':''}${tx.amount} Credits</div></div>`).join(''):`<p>${c('noTransactions')}</p>`;
 modal(c('creditHistory'),`<p><strong>${c('balance')}: ${Math.max(0,creditProfile.balance)} Credits</strong></p><div>${rows}</div><div class="lux-dialog-subnote">${c('testLocal')}</div>`);
}

function currentAnchorParts(r){
 const m=String(r.src||'').match(/^data:([^;]+);base64,(.+)$/);return m?{mime:m[1],data:m[2]}:{mime:'image/png',data:String(r.src||'').split(',')[1]||''};
}
async function repeatRegenerate(idx,editText){
 const r=resultsData?.[idx];if(!r)return;ensureResultMeta(r);
 const isEdit=!!String(editText||'').trim();const cost=isEdit?COST.edit:COST.regenerate;
 if(creditProfile.balance<cost){alert(c('notEnough'));return}
 const key=document.getElementById('apiKey')?.value.trim();if(!key){document.getElementById('status').textContent=typeof t==='function'?t('needKey'):'Gemini API key required';return}
 const card=document.querySelectorAll('#results .result')[idx];card?.classList.add('busy');
 try{
   const anchor=currentAnchorParts(r);const identity=await Promise.all(files.slice(0,4).map(async f=>({mime:f.type,data:await toB64(f)})));const refs=[anchor,...identity];const base=buildPrompt(idx);
   const instruction=isEdit?`EDIT THE FIRST REFERENCE IMAGE as the current version of this shot. Apply this user request: ${editText}. Preserve this person's identity with very high fidelity, preserve successful details unless the request changes them, and output exactly one standalone photograph.`:`REGENERATE a new variation from the FIRST REFERENCE IMAGE, which is the current version of this shot. Preserve identity, overall intent and successful styling, but create a genuinely new natural variation in pose, expression, framing or small scene details. Output exactly one standalone photograph.`;
   const newSrc=await generateOne(key,`${instruction} ${base}`,refs,[]);
   if(!debit(cost,isEdit?'edit':'regenerate',r.__luxId,isEdit?String(editText).trim():'repeat regeneration')){alert(c('notEnough'));return}
   r.src=newSrc;r.__luxVersions.push({src:newSrc,type:isEdit?'edit':'regenerate',credits:cost,at:now(),note:isEdit?String(editText).trim():''});r.__luxCurrentVersion=r.__luxVersions.length-1;r.__luxSpent=(r.__luxSpent||0)+cost;r.__luxDraft='';r.__luxEditorOpen=false;r.__luxFocus=false;renderResults();
 }catch(e){const st=document.getElementById('status');if(st)st.textContent=e?.message||String(e)}finally{document.querySelectorAll('#results .result')[idx]?.classList.remove('busy')}
}

function resetFilters(){
 if(!confirm(c('clearConfirm')))return;
 try{selected='business'}catch(_e){}
 const set=(id,val)=>{const el=document.getElementById(id);if(el)el.value=val};
 set('styleSelect','business');set('gender','auto');set('background','');set('outfit','');set('ratio','4:5');set('count','4');set('resolution','2K');set('prompt','');
 try{styleRefs.length=0;renderRefs()}catch(_e){}try{luxPlan.length=0}catch(_e){}try{if(typeof shotTags!=='undefined')shotTags=[]}catch(_e){}
 document.querySelectorAll('.lux-chip').forEach(b=>b.classList.remove('active','is-shot-active'));
 try{renderStyles()}catch(_e){}try{updateCost()}catch(_e){}try{renderPlan(false)}catch(_e){}const status=document.getElementById('status');if(status)status.textContent='';
}
function deleteAllResults(){if(!resultsData?.length)return;if(!confirm(c('deleteConfirm')))return;resultsData.length=0;renderResults();const wrap=document.getElementById('resultsWrap');if(wrap)wrap.classList.add('hidden')}
function ensureBulkControls(){
 const head=document.querySelector('.results-head');if(!head||document.getElementById('luxBulkActions'))return;
 const wrap=document.createElement('div');wrap.className='lux-bulk-actions';wrap.id='luxBulkActions';
 const del=document.createElement('button');del.type='button';del.className='lux-bulk-btn danger';del.textContent=c('deleteAll');del.onclick=deleteAllResults;
 const clear=document.createElement('button');clear.type='button';clear.className='lux-bulk-btn';clear.textContent=c('clearAll');clear.title=c('clearHint');clear.onclick=resetFilters;
 wrap.append(del,clear);head.appendChild(wrap);
}
function refreshBulkLabels(){const w=document.getElementById('luxBulkActions');if(!w)return;const b=w.querySelectorAll('button');if(b[0])b[0].textContent=c('deleteAll');if(b[1]){b[1].textContent=c('clearAll');b[1].title=c('clearHint')}}

function wrapRender(){
 if(typeof renderResults!=='function'||renderResults.__luxVersionSafe)return;
 const base=renderResults;
 const wrapped=function(){captureEditors();const out=base.apply(this,arguments);decorateCards();ensureBulkControls();restoreEditors();return out};wrapped.__luxVersionSafe=true;renderResults=wrapped;
}
function overrideRegeneration(){regenerateIndex=repeatRegenerate}
function guardMainGeneration(){
 const btn=document.getElementById('generate');if(!btn||btn.dataset.creditGuard==='1')return;btn.dataset.creditGuard='1';const base=btn.onclick;if(typeof base!=='function')return;
 btn.onclick=async function(e){const n=Number(document.getElementById('count')?.value||1),extra=document.getElementById('resolution')?.value==='4K'?COST.upgrade4k:0,required=n*(COST.newPhoto+extra);if(creditProfile.balance<required){alert(`${c('notEnough')} ${c('balance')}: ${creditProfile.balance} Credits.`);return}return base.call(this,e)};
}
function wireBalance(){const box=document.querySelector('.balance');if(box&&box.dataset.historyWired!=='1'){box.dataset.historyWired='1';box.addEventListener('click',openCreditHistory)}}

function boot(){
 injectCss();updateBalanceUI();wrapRender();overrideRegeneration();guardMainGeneration();wireBalance();ensureBulkControls();decorateCards();
 document.addEventListener('click',e=>{if(e.target.closest('.lang-btn'))setTimeout(()=>{refreshBulkLabels();decorateCards();updateBalanceUI()},40)});
 /* No MutationObserver here. The old subtree observer called decorateCards(),
    which rewrote meta.innerHTML, triggered the same observer again and created
    an endless DOM mutation loop that froze the page. renderResults is already
    wrapped above, so all card decoration is updated at the correct lifecycle point. */
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();