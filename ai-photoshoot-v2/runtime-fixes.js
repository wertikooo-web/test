/* Runtime fixes: voice editing, travel visual, remove obsolete account copy */
(function(){
'use strict';

const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let activeRec=null;

function langCode(){return (document.documentElement.lang||'ru').toLowerCase().slice(0,2)}
function startVoice(textarea,button){
  if(!SR||!textarea||!button)return;
  try{activeRec?.abort?.()}catch(_e){}
  const rec=new SR();activeRec=rec;
  const l=langCode();rec.lang=l==='ro'?'ro-RO':l==='en'?'en-US':'ru-RU';rec.interimResults=false;
  button.classList.add('on');
  rec.onresult=e=>{const txt=e.results?.[0]?.[0]?.transcript||'';textarea.value+=(textarea.value?' ':'')+txt;textarea.dispatchEvent(new Event('input',{bubbles:true}))};
  rec.onend=()=>button.classList.remove('on');
  rec.onerror=()=>button.classList.remove('on');
  rec.start();
}

function removeObsoleteCopy(){
  document.querySelectorAll('.credit-note').forEach(el=>el.remove());
}

function setTravelVisual(){
  try{const item=styles.find(s=>s.id==='travel');if(item)item.img='assets/styles/travel.svg?v=20260926f'}catch(_e){}
  document.querySelectorAll('#styleGrid .style').forEach(card=>{
    const name=card.querySelector('strong')?.textContent||'';
    if(/travel/i.test(name)){const img=card.querySelector('img');if(img)img.src='assets/styles/travel.svg?v=20260926f'}
  });
}

function installEditorVoice(){
  if(typeof window.renderResults!=='function'||window.renderResults.__luxVoice)return;
  const base=window.renderResults;
  const wrapped=function(){
    const out=base.apply(this,arguments);
    document.querySelectorAll('#results .result').forEach((card,i)=>{
      const ed=card.querySelector('.editor');const ta=ed?.querySelector('textarea');if(!ed||!ta)return;
      let mic=ed.querySelector('.lux-edit-mic');
      if(!mic){
        const row=document.createElement('div');row.style.display='flex';row.style.gap='7px';row.style.alignItems='stretch';
        ta.parentNode.insertBefore(row,ta);row.appendChild(ta);
        mic=document.createElement('button');mic.type='button';mic.className='mic lux-edit-mic';mic.textContent='🎤';mic.title=langCode()==='en'?'Voice instruction':langCode()==='ro'?'Instrucțiune vocală':'Голосовая команда';row.appendChild(mic);
      }
      mic.onclick=()=>startVoice(ta,mic);
    });
    return out;
  };
  wrapped.__luxVoice=true;window.renderResults=wrapped;
}

function boot(){
  removeObsoleteCopy();setTravelVisual();installEditorVoice();
  const mainMic=document.getElementById('mainMic'),mainTa=document.getElementById('prompt');if(SR&&mainMic&&mainTa)mainMic.onclick=()=>startVoice(mainTa,mainMic);
  setTimeout(()=>{removeObsoleteCopy();setTravelVisual();installEditorVoice();try{renderStyles();renderResults()}catch(_e){}},120);
  document.addEventListener('click',e=>{if(e.target.closest('.lang-btn'))setTimeout(()=>{setTravelVisual();installEditorVoice();try{renderResults()}catch(_e){}},60)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();