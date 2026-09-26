/* AI Photoshoot LUX - generation stability + progress UI */
(function(){
'use strict';

const preparedCache=new WeakMap();
const TIMEOUT_MS=150000;

function langCode(){return (document.documentElement.lang||'ru').toLowerCase().slice(0,2)}
function msg(k,n,total){
  const l=langCode();
  const T={
    preparing:{ru:'Подготавливаю фотографии…',en:'Preparing photos…',ro:'Pregătesc fotografiile…'},
    generating:{ru:`Генерирую кадр ${n}/${total}…`,en:`Generating shot ${n}/${total}…`,ro:`Generez cadrul ${n}/${total}…`},
    done:{ru:'Готово.',en:'Done.',ro:'Gata.'},
    timeout:{ru:'Генерация заняла слишком много времени. Попробуйте ещё раз.',en:'Generation took too long. Please try again.',ro:'Generarea a durat prea mult. Încearcă din nou.'}
  };
  return (T[k]?.[l]||T[k]?.ru||'');
}
function nextPaint(){return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}
function blobToB64(blob){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]||'');fr.onerror=rej;fr.readAsDataURL(blob)})}
async function prepareFile(file,maxSide=1600){
  if(preparedCache.has(file))return preparedCache.get(file);
  const p=(async()=>{
    // Small files are already cheap to send; avoid unnecessary recompression.
    if(file.size<=1.6*1024*1024){return {mime:file.type,data:await blobToB64(file)}}
    try{
      const bmp=await createImageBitmap(file);
      const scale=Math.min(1,maxSide/Math.max(bmp.width,bmp.height));
      const w=Math.max(1,Math.round(bmp.width*scale)),h=Math.max(1,Math.round(bmp.height*scale));
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(bmp,0,0,w,h);bmp.close?.();
      const mime=file.type==='image/webp'?'image/webp':'image/jpeg';
      const blob=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(new Error('Image preparation failed')),mime,.9));
      return {mime,data:await blobToB64(blob)};
    }catch(_e){
      return {mime:file.type,data:await blobToB64(file)};
    }
  })();
  preparedCache.set(file,p);return p;
}

function ensureProgressUI(){
  if(document.getElementById('luxGenerationProgress'))return;
  const btn=document.getElementById('generate');if(!btn)return;
  const box=document.createElement('div');box.id='luxGenerationProgress';box.className='lux-generation-progress';box.innerHTML='<span class="lux-spin"></span><span class="lux-progress-text"></span>';
  btn.insertAdjacentElement('afterend',box);
  const st=document.createElement('style');st.id='luxGenerationProgressCss';st.textContent=`
    .lux-generation-progress{display:none;align-items:center;justify-content:center;gap:9px;margin-top:10px;color:#d7d7d7;font-size:13px;min-height:24px}
    .lux-generation-progress.on{display:flex}.lux-spin{width:16px;height:16px;border:2px solid #666;border-top-color:#fff;border-radius:50%;animation:luxSpin .75s linear infinite;flex:0 0 auto}
    #generate.lux-generating{position:relative;padding-right:48px}.lux-button-spin{position:absolute;right:17px;top:50%;width:18px;height:18px;margin-top:-9px;border:2px solid #888;border-top-color:#111;border-radius:50%;animation:luxSpin .75s linear infinite}
    @keyframes luxSpin{to{transform:rotate(360deg)}}
  `;document.head.appendChild(st);
}
function setBusy(on,text=''){
  ensureProgressUI();
  const btn=document.getElementById('generate'),box=document.getElementById('luxGenerationProgress'),txt=box?.querySelector('.lux-progress-text');
  if(txt)txt.textContent=text;
  box?.classList.toggle('on',!!on);
  if(btn){btn.disabled=!!on;btn.classList.toggle('lux-generating',!!on);let spin=btn.querySelector('.lux-button-spin');if(on&&!spin){spin=document.createElement('span');spin.className='lux-button-spin';btn.appendChild(spin)}if(!on&&spin)spin.remove()}
}

async function stableGenerateOne(key,prompt,identityRefs,styleRefParts=[]){
  const parts=[{text:prompt},...identityRefs.map(r=>({inline_data:{mime_type:r.mime,data:r.data}})),...styleRefParts.map(r=>({inline_data:{mime_type:r.mime,data:r.data}}))];
  const body={contents:[{parts}],generationConfig:{responseModalities:['IMAGE']}};
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
  try{
    // JSON.stringify can be expensive with large base64 strings. Inputs are compressed first,
    // and we yield before fetch so the spinner is visibly painted.
    await nextPaint();
    const resp=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body),signal:controller.signal});
    if(!resp.ok){let m='Gemini API error';try{const j=await resp.json();m=j.error?.message||m}catch{}throw new Error(m)}
    const j=await resp.json(),po=j.candidates?.[0]?.content?.parts||[],img=po.find(p=>p.inlineData||p.inline_data),data=img?.inlineData?.data||img?.inline_data?.data,mime=img?.inlineData?.mimeType||img?.inline_data?.mime_type||'image/png';
    if(!data)throw new Error('Gemini returned no image');return `data:${mime};base64,${data}`;
  }catch(e){if(e?.name==='AbortError')throw new Error(msg('timeout'));throw e}finally{clearTimeout(timer)}
}

async function runStableGeneration(){
  const status=document.getElementById('status'),key=document.getElementById('apiKey')?.value.trim();
  if(files.length!==5){status.textContent=typeof t==='function'?t('need5'):'Нужно загрузить ровно 5 фотографий.';return}
  if(!key){status.textContent=typeof t==='function'?t('needKey'):'Нужен Gemini API key.';return}
  if(!document.getElementById('consent')?.checked){status.textContent=typeof t==='function'?t('needConsent'):'Нужно подтвердить согласие.';return}

  setBusy(true,msg('preparing'));status.textContent=msg('preparing');
  await nextPaint();
  try{
    if(typeof renderPlan==='function'){try{renderPlan(true)}catch(_e){}}
    const refs=[];for(const f of files){refs.push(await prepareFile(f,1600));await nextPaint()}
    const styleP=[];for(const f of styleRefs){styleP.push(await prepareFile(f,1400));await nextPaint()}
    const n=Number(document.getElementById('count')?.value||1);
    resultsData.length=0;renderResults();document.getElementById('resultsWrap')?.classList.remove('hidden');
    for(let i=0;i<n;i++){
      const progress=msg('generating',i+1,n);setBusy(true,progress);status.textContent=progress;await nextPaint();
      const src=await stableGenerateOne(key,buildPrompt(i),refs,styleP);
      resultsData.push({src,rating:0,tags:[],editDraft:'',editorOpen:false});
      renderResults();await nextPaint();
    }
    status.textContent=typeof t==='function'?t('ready'):msg('done');
  }catch(e){status.textContent=e?.message||String(e)}finally{setBusy(false,'')}
}

function install(){
  ensureProgressUI();
  const btn=document.getElementById('generate');if(!btn)return;
  // Replace the accumulated chain of wrappers with one deterministic handler.
  btn.onclick=runStableGeneration;
  btn.dataset.stableGeneration='1';
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(install,250)},{once:true});else setTimeout(install,250);
})();
