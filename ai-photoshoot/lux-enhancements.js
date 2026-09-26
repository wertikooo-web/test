/* AI Photoshoot LUX enhancements. Loaded after the original app. */
(function(){
'use strict';

const dict={
 ru:{planTitle:'План кадров',planHelp:'Каждая строка ниже = отдельная фотография. Модель получает отдельное задание на каждый кадр, поэтому не собирает несколько сцен в одну картинку.',autoPlan:'Разложить пожелание',different:'Сделать кадры разными',shot:'Кадр',more:'Ещё как это',series:'Сделать серию',best:'Лучшие кадры',bestRun:'Выбрать лучшие',two:'2 варианта · 40 Credits',four:'4 варианта · 80 Credits',series4:'4 кадра · 80 Credits',series6:'6 кадров · 120 Credits',portrait:'Портретная',universal:'Универсальная',profile:'Для профиля и сайта',cancel:'Отмена',create:'Создать',testNote:'Тестовый режим: Credits пока не списываются.',analyzing:'Анализирую кадры…',sameHelp:'Сохраним человека, одежду, свет и атмосферу, но изменим позу, взгляд и кадрирование.',seriesHelp:'Сделаем согласованную фотосессию из выбранного кадра. Один результат = одна отдельная фотография.',bestHelp:'AI оценит похожесть, естественность, композицию, лицо, руки и пригодность для профиля.',bestOverall:'Лучший общий',bestProfile:'Лучший для профиля',natural:'Самый естественный',fullBody:'Лучший в полный рост',structured:'Умная серия',quick:'Быстрые идеи:',standing:'Стою',sitting:'Сижу',walking:'Иду',full:'Полный рост',waist:'По пояс',blur:'Размытый фон',viewpoint:'Смотровая',mountains:'Горы'},
 en:{planTitle:'Shot plan',planHelp:'Each row below = one separate photo. Every shot gets its own instruction, so the model does not combine several scenes into one image.',autoPlan:'Build shot plan',different:'Make shots different',shot:'Shot',more:'More like this',series:'Create a series',best:'Best shots',bestRun:'Pick best shots',two:'2 variations · 40 Credits',four:'4 variations · 80 Credits',series4:'4 shots · 80 Credits',series6:'6 shots · 120 Credits',portrait:'Portrait',universal:'Universal',profile:'Profile & website',cancel:'Cancel',create:'Create',testNote:'Test mode: Credits are not deducted yet.',analyzing:'Analyzing shots…',sameHelp:'Keep the person, outfit, light and atmosphere, while changing pose, gaze and framing.',seriesHelp:'Create a coherent photoshoot from the selected image. One result = one separate photo.',bestHelp:'AI reviews likeness, naturalness, composition, face, hands and profile usability.',bestOverall:'Best overall',bestProfile:'Best for profile',natural:'Most natural',fullBody:'Best full body',structured:'Smart series',quick:'Quick ideas:',standing:'Standing',sitting:'Sitting',walking:'Walking',full:'Full body',waist:'Waist-up',blur:'Blurred background',viewpoint:'Viewpoint',mountains:'Mountains'},
 ro:{planTitle:'Planul cadrelor',planHelp:'Fiecare rând = o fotografie separată. Fiecare cadru primește propria instrucțiune, astfel modelul nu combină mai multe scene într-o singură imagine.',autoPlan:'Construiește planul',different:'Fă cadrele diferite',shot:'Cadru',more:'Mai multe ca aceasta',series:'Creează o serie',best:'Cele mai bune cadre',bestRun:'Alege cele mai bune',two:'2 variante · 40 Credits',four:'4 variante · 80 Credits',series4:'4 cadre · 80 Credits',series6:'6 cadre · 120 Credits',portrait:'Portret',universal:'Universală',profile:'Profil și site',cancel:'Anulează',create:'Creează',testNote:'Mod test: Credits nu se scad încă.',analyzing:'Analizez cadrele…',sameHelp:'Păstrăm persoana, ținuta, lumina și atmosfera, dar schimbăm poziția, privirea și încadrarea.',seriesHelp:'Creăm o ședință coerentă pornind de la cadrul ales. Un rezultat = o fotografie separată.',bestHelp:'AI evaluează asemănarea, naturalețea, compoziția, fața, mâinile și utilitatea pentru profil.',bestOverall:'Cel mai bun',bestProfile:'Cel mai bun pentru profil',natural:'Cel mai natural',fullBody:'Cel mai bun cadru întreg',structured:'Serie inteligentă',quick:'Idei rapide:',standing:'În picioare',sitting:'Așezat',walking:'Mergând',full:'Cadru întreg',waist:'Până la talie',blur:'Fundal blurat',viewpoint:'Belvedere',mountains:'Munți'}
};
function lang(){return document.querySelector('.lang-btn.active')?.dataset.lang||document.documentElement.lang?.slice(0,2)||'ru'}
function t(k){return (dict[lang()]||dict.ru)[k]||dict.ru[k]||k}

let luxShotPlan=[];
let luxGeneralNotes='';
let hoverTimer=null;
let activeLightbox=0;

const defaultShots=[
 'close-up portrait, natural expression, eye-level camera',
 'waist-up portrait, relaxed posture, three-quarter angle',
 'full-body portrait, standing naturally, environment visible',
 'seated portrait, relaxed natural pose',
 'walking candid portrait, natural movement, mid-step',
 'three-quarter portrait at a scenic viewpoint, environment visible',
 'profile or half-profile portrait, soft natural expression',
 'environmental portrait with softly blurred background'
];

function cleanLine(s){return s.replace(/^\s*[-•]\s*/,'').replace(/\*\*/g,'').replace(/[.;]+\s*$/,'').trim()}
function parsePromptToShots(text,count){
 const src=(text||'').trim();
 const numbered=[];
 const rx=/(?:^|\n)\s*(\d+)\s*[\).:-]\s*([^\n]+)/g;
 let m; while((m=rx.exec(src))) numbered.push(cleanLine(m[2]));
 if(numbered.length>=Math.min(2,count)){
   const out=numbered.slice(0,count);
   while(out.length<count)out.push(defaultShots[out.length%defaultShots.length]);
   return out;
 }
 const candidates=[];
 const tests=[
  [/смотров|viewpoint|belvedere/i,'standing at a scenic viewpoint, wide mountain view behind'],
  [/\bсижу\b|\bсидя\b|sitt?ing|așez/i,'seated naturally, relaxed posture'],
  [/\bиду\b|\bидет\b|\bидти\b|walking|merg/i,'walking naturally, candid mid-step'],
  [/полный рост|full.?body|cadru întreg/i,'full-body portrait, entire person visible'],
  [/по пояс|waist|talie/i,'waist-up portrait, balanced composition'],
  [/размыт|blurred|blurat/i,'portrait with shallow depth of field and softly blurred background'],
  [/гор|mountain|munți/i,'environmental portrait with mountains clearly visible'],
  [/стою|standing|picioare/i,'standing portrait, natural relaxed posture']
 ];
 tests.forEach(([r,p])=>{if(r.test(src)&&!candidates.includes(p))candidates.push(p)});
 const out=[];
 for(const c of candidates){if(out.length<count)out.push(c)}
 for(const d of defaultShots){if(out.length>=count)break;if(!out.includes(d))out.push(d)}
 return out.slice(0,count);
}
function extractGeneralNotes(text){
 const lines=(text||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
 return lines.filter(x=>!/^\s*\d+\s*[\).:-]/.test(x) && !/сери[яю]|series|serie|в серии должны|one photo|одно фото|кадр\s*\d/i.test(x)).join(' ').trim();
}

function addPlannerUI(){
 const prompt=document.getElementById('prompt'); if(!prompt||document.getElementById('luxSeriesBox'))return;
 const box=document.createElement('div');box.className='lux-series-box';box.id='luxSeriesBox';
 box.innerHTML=`<div class="lux-series-head"><strong>${t('planTitle')}</strong><button type="button" id="luxAutoPlan">${t('autoPlan')}</button></div><div class="lux-series-help">${t('planHelp')}</div><label class="lux-toggle"><input type="checkbox" id="luxDifferent" checked> ${t('different')}</label><div class="lux-quick"><span style="font-size:11px;color:#999;align-self:center">${t('quick')}</span>${[['standing','standing'],['sitting','sitting'],['walking','walking'],['full','full'],['waist','waist'],['blur','blur'],['viewpoint','viewpoint'],['mountains','mountains']].map(([v,k])=>`<button type="button" class="lux-chip" data-quick="${v}">${t(k)}</button>`).join('')}</div><div class="lux-plan" id="luxPlan"></div><div class="lux-plan-status" id="luxPlanStatus"></div>`;
 prompt.closest('.field').appendChild(box);
 const rebuild=()=>renderPlan(true);
 document.getElementById('luxAutoPlan').onclick=rebuild;
 document.getElementById('count')?.addEventListener('change',()=>renderPlan(false));
 prompt.addEventListener('blur',()=>renderPlan(true));
 box.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{b.classList.toggle('active');renderPlan(false)});
 renderPlan(false);
}
function quickShots(){
 const map={standing:'standing portrait, natural relaxed posture',sitting:'seated naturally, relaxed pose',walking:'walking naturally, candid mid-step',full:'full-body portrait, entire person visible',waist:'waist-up portrait',blur:'portrait with softly blurred background',viewpoint:'at a scenic viewpoint, landscape visible',mountains:'mountains visible in the background'};
 return [...document.querySelectorAll('.lux-chip.active')].map(b=>map[b.dataset.quick]).filter(Boolean);
}
function renderPlan(fromPrompt){
 const root=document.getElementById('luxPlan');if(!root)return;
 const count=+document.getElementById('count').value;
 let plan=[];
 if(fromPrompt)plan=parsePromptToShots(document.getElementById('prompt').value,count);
 else{
   const existing=[...root.querySelectorAll('input')].map(i=>i.value.trim()).filter(Boolean);
   const quick=quickShots(); plan=[...quick,...existing];
   for(const d of defaultShots){if(plan.length>=count)break;if(!plan.includes(d))plan.push(d)}
   plan=plan.slice(0,count);
 }
 luxShotPlan=plan;
 root.innerHTML='';
 plan.forEach((p,i)=>{const row=document.createElement('label');row.className='lux-shot-row';row.innerHTML=`<span>${t('shot')} ${i+1}</span><input data-shot="${i}" value="${p.replace(/"/g,'&quot;')}">`;root.appendChild(row)});
 root.querySelectorAll('input').forEach(inp=>inp.addEventListener('input',()=>{luxShotPlan=[...root.querySelectorAll('input')].map(x=>x.value.trim())}));
 luxGeneralNotes=extractGeneralNotes(document.getElementById('prompt').value);
 document.getElementById('luxPlanStatus').textContent=count>1?`${count} × 1 photo. No collages / contact sheets.`:'';
}

const originalBuildPrompt=typeof buildPrompt==='function'?buildPrompt:null;
if(originalBuildPrompt){
 buildPrompt=function(style,index){
   const count=+document.getElementById('count').value;
   if(count<=1)return originalBuildPrompt(style,index)+` CRITICAL: return exactly ONE standalone photograph, one scene, one person. Never create a collage, contact sheet, split screen, diptych, triptych, storyboard, grid or multiple frames inside the image.`;
   if(!luxShotPlan.length||luxShotPlan.length!==count)renderPlan(true);
   const bg=document.getElementById('background').value.trim(),outfit=document.getElementById('outfit').value.trim(),gender=document.getElementById('gender').value,ratio=document.getElementById('ratio').value,res=document.getElementById('resolution').value;
   const shot=luxShotPlan[index]||defaultShots[index%defaultShots.length];
   const diversity=document.getElementById('luxDifferent')?.checked;
   return `Create exactly ONE standalone photorealistic professional photograph of the SAME single person shown in the identity references. This request is ONLY for shot ${index+1} of ${count}; do not depict any other shot from the series. ABSOLUTELY NO collage, contact sheet, grid, split screen, diptych, triptych, storyboard, before/after layout, inset image or multiple frames. One canvas = one photograph = one scene. Preserve facial identity, apparent age, facial proportions, eye shape, nose, lips, skin tone and distinctive features with very high fidelity. Identity comes ONLY from the identity reference photos. If style references are included, use them only for styling, lighting, pose, clothing mood, composition and background inspiration; never copy their face. Style: ${style.prompt}. Presentation: ${gender}. Desired ratio: ${ratio}. Preferred quality: ${res}. ${bg?`Background preference: ${bg}.`:''} ${outfit?`Outfit: ${outfit}.`:''} ${luxGeneralNotes?`General series mood: ${luxGeneralNotes}.`:''} THIS SHOT'S UNIQUE BRIEF: ${shot}. ${diversity?'Make this shot visibly distinct from the other planned shots in pose, body position, framing and composition.':''} ${memoryPrompt()} Professional camera, believable skin texture, realistic hands and anatomically correct fingers, natural hair, no text, no borders.`;
 }
}

const originalGenerate=document.getElementById('generate')?.onclick;
if(originalGenerate){document.getElementById('generate').onclick=async function(){renderPlan(true);return originalGenerate.call(this)}}

function ensureResultTools(){
 const head=document.querySelector('.results-head');if(!head||document.getElementById('luxBestBtn'))return;
 const tools=document.createElement('div');tools.className='lux-results-tools';
 const existing=head.querySelector('#downloadAll'); if(existing)tools.appendChild(existing);
 const best=document.createElement('button');best.type='button';best.id='luxBestBtn';best.className='lux-best-btn';best.textContent=t('best');best.onclick=analyzeBestShots;tools.insertBefore(best,tools.firstChild);
 head.appendChild(tools);
}

function makeDialog(title,desc,options,onGo){
 const wrap=document.createElement('div');wrap.className='lux-dialog';
 wrap.innerHTML=`<div class="lux-dialog-card"><h3>${title}</h3><p>${desc}</p><div class="lux-dialog-options"></div><div class="lux-dialog-note">${t('testNote')}</div><div class="lux-dialog-actions"><button class="cancel">${t('cancel')}</button><button class="go">${t('create')}</button></div></div>`;
 const list=wrap.querySelector('.lux-dialog-options');let selected=options[0]?.value;
 options.forEach((o,i)=>{const b=document.createElement('button');b.type='button';b.textContent=o.label;b.dataset.value=o.value;if(i===0)b.classList.add('selected');b.onclick=()=>{selected=o.value;list.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b))};list.appendChild(b)});
 wrap.querySelector('.cancel').onclick=()=>wrap.remove();wrap.onclick=e=>{if(e.target===wrap)wrap.remove()};wrap.querySelector('.go').onclick=async()=>{wrap.querySelector('.go').disabled=true;try{await onGo(selected);wrap.remove()}catch(e){alert(e.message);wrap.querySelector('.go').disabled=false}};document.body.appendChild(wrap);
}
async function identityInputsWithAnchor(item){
 const current=dataUrlToBase64(item.src);const ids=await Promise.all(files.slice(0,3).map(async f=>({mime:f.type,data:await toBase64(f)})));const ref=styleRefs[0]?{mime:styleRefs[0].type,data:await toBase64(styleRefs[0])}:null;return [current,...ids,...(ref?[ref]:[])].slice(0,5)
}
async function moreLikeThis(index){
 const item=resultsData[index]; if(!item)return;
 makeDialog(t('more'),t('sameHelp'),[{value:'2',label:t('two')},{value:'4',label:t('four')}],async v=>{
   const n=+v,key=document.getElementById('apiKey').value.trim();if(!key)throw new Error('Gemini API key required');
   item.busy=true;renderResults();const inputs=await identityInputsWithAnchor(item);const style=styles.find(s=>s.id===selected);
   try{for(let j=0;j<n;j++){const p=`Create exactly ONE standalone new photograph of the SAME person as the FIRST reference image. Use the first image as the visual anchor for outfit, lighting, location mood and styling. Preserve identity very closely, but create a genuinely new pose, gaze, body position and framing. Variation ${j+1} of ${n}. Style: ${style.prompt}. Never create a collage, grid, contact sheet, split screen or multiple frames. One image = one scene = one person. Photorealistic, natural skin, realistic hands, professional camera.`;const src=await callGemini(key,p,inputs);resultsData.push({src,rating:0,originType:'variation',parentIndex:index,shotLabel:t('more')})}}
   finally{item.busy=false;renderResults()}
 })
}
function seriesTemplate(type,n){
 const portrait=['close-up headshot, natural expression','chest-up portrait, slight three-quarter angle','waist-up portrait, relaxed hands','seated portrait, natural posture','half-profile portrait, soft gaze','close-up candid portrait with shallow depth of field'];
 const universal=['close-up portrait','waist-up portrait','full-body standing portrait','seated portrait','walking candid portrait','three-quarter environmental portrait'];
 const profile=['clean square-friendly profile portrait','vertical business portrait, chest-up','waist-up website portrait with negative space','full-body professional portrait','friendly natural portrait','horizontal website hero portrait with negative space'];
 return ({portrait,universal,profile}[type]||universal).slice(0,n)
}
async function createSeries(index){
 const item=resultsData[index];if(!item)return;
 makeDialog(t('series'),t('seriesHelp'),[{value:'universal:4',label:`${t('universal')} · ${t('series4')}`},{value:'universal:6',label:`${t('universal')} · ${t('series6')}`},{value:'portrait:4',label:`${t('portrait')} · ${t('series4')}`},{value:'profile:6',label:`${t('profile')} · ${t('series6')}`}],async v=>{
   const [type,ns]=v.split(':'),n=+ns,key=document.getElementById('apiKey').value.trim();if(!key)throw new Error('Gemini API key required');
   const inputs=await identityInputsWithAnchor(item),style=styles.find(s=>s.id===selected),shots=seriesTemplate(type,n);item.busy=true;renderResults();
   try{for(let j=0;j<n;j++){const p=`Create exactly ONE standalone photorealistic photo for a coherent professional photoshoot series. The FIRST reference image is the visual anchor: preserve the same person's identity, apparent age, outfit, styling, lighting character and overall atmosphere. This is shot ${j+1} of ${n}, but render ONLY this one shot. Unique shot brief: ${shots[j]}. Make it visibly different in framing and pose from the other planned shots while remaining part of the same shoot. Style: ${style.prompt}. NO collage, NO contact sheet, NO grid, NO split screen, NO multiple frames. One canvas = one photograph. Natural anatomy, realistic hands, believable skin texture.`;const src=await callGemini(key,p,inputs);resultsData.push({src,rating:0,originType:'series',parentIndex:index,shotLabel:`${t('series')} · ${j+1}/${n}: ${shots[j]}`})}}
   finally{item.busy=false;renderResults()}
 })
}

async function analyzeBestShots(){
 if(!resultsData.length)return;const btn=document.getElementById('luxBestBtn');const old=btn.textContent;btn.textContent=t('analyzing');btn.disabled=true;
 try{
  const key=document.getElementById('apiKey').value.trim();if(!key)throw new Error('Gemini API key required');
  const imgs=resultsData.slice(0,8).map(x=>dataUrlToBase64(x.src));
  const parts=[{text:`You are a professional portrait photo editor. Evaluate these ${imgs.length} generated portraits, numbered in order from 1. Return ONLY valid JSON, no markdown, in this exact shape: {"bestOverall":1,"bestProfile":2,"mostNatural":3,"bestFullBody":4,"reasons":{"1":"short reason","2":"short reason","3":"short reason","4":"short reason"}}. Judge facial naturalness, likeness consistency across the set, eyes, hands/anatomy, pose, composition, lighting and professional usefulness. If no full-body image exists, set bestFullBody to null. Do not rank attractiveness.`},...imgs.map(x=>({inline_data:{mime_type:x.mime,data:x.data}}))];
  const resp=await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-3-pro-image:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts}],generationConfig:{responseModalities:['TEXT']}})});
  if(!resp.ok)throw new Error('Не удалось проанализировать кадры');const j=await resp.json();const txt=(j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').replace(/```json|```/g,'').trim();const data=JSON.parse(txt);
  resultsData.forEach(x=>{x.bestTags=[];x.bestReason='' });
  const add=(num,label)=>{if(Number.isInteger(num)&&resultsData[num-1]){resultsData[num-1].bestTags=resultsData[num-1].bestTags||[];if(!resultsData[num-1].bestTags.includes(label))resultsData[num-1].bestTags.push(label);resultsData[num-1].bestReason=data.reasons?.[String(num)]||resultsData[num-1].bestReason||''}};
  add(data.bestOverall,t('bestOverall'));add(data.bestProfile,t('bestProfile'));add(data.mostNatural,t('natural'));add(data.bestFullBody,t('fullBody'));renderResults();
 }catch(e){
  const order=resultsData.map((x,i)=>({i,score:(x.rating||0)+(x.liked?2:0)-(x.disliked?2:0)})).sort((a,b)=>b.score-a.score);resultsData.forEach(x=>{x.bestTags=[]});if(order[0])resultsData[order[0].i].bestTags=[t('bestOverall')];if(order[1])resultsData[order[1].i].bestTags=[t('bestProfile')];renderResults();
 }finally{btn.textContent=old;btn.disabled=false}
}

function ensureHoverPreview(){if(document.getElementById('luxHoverPreview'))return;const p=document.createElement('div');p.id='luxHoverPreview';p.className='lux-hover-preview';p.innerHTML='<img alt="Preview">';document.body.appendChild(p)}
function showHover(img,e){if(matchMedia('(max-width:700px)').matches)return;ensureHoverPreview();clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{const p=document.getElementById('luxHoverPreview'),pi=p.querySelector('img');pi.src=img.src;p.style.display='block';moveHover(e)},180)}
function moveHover(e){const p=document.getElementById('luxHoverPreview');if(!p||p.style.display==='none')return;const w=Math.min(440,innerWidth*.44),x=e.clientX+24+w>innerWidth?e.clientX-w-24:e.clientX+24,y=Math.max(10,Math.min(e.clientY-80,innerHeight-p.offsetHeight-10));p.style.left=Math.max(10,x)+'px';p.style.top=y+'px'}
function hideHover(){clearTimeout(hoverTimer);const p=document.getElementById('luxHoverPreview');if(p)p.style.display='none'}
function ensureLightbox(){if(document.getElementById('luxLightbox'))return;const l=document.createElement('div');l.id='luxLightbox';l.className='lux-lightbox';l.innerHTML='<div class="lux-lightbox-inner"><img alt="Large preview"><button class="lux-lightbox-close">×</button><button class="lux-lightbox-prev">‹</button><button class="lux-lightbox-next">›</button><div class="lux-lightbox-caption"></div></div>';document.body.appendChild(l);l.querySelector('.lux-lightbox-close').onclick=closeLightbox;l.querySelector('.lux-lightbox-prev').onclick=e=>{e.stopPropagation();openLightbox((activeLightbox-1+resultsData.length)%resultsData.length)};l.querySelector('.lux-lightbox-next').onclick=e=>{e.stopPropagation();openLightbox((activeLightbox+1)%resultsData.length)};l.onclick=e=>{if(e.target===l)closeLightbox()};document.addEventListener('keydown',e=>{if(!l.classList.contains('open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')openLightbox((activeLightbox-1+resultsData.length)%resultsData.length);if(e.key==='ArrowRight')openLightbox((activeLightbox+1)%resultsData.length)})}
function openLightbox(i){if(!resultsData[i])return;ensureLightbox();activeLightbox=i;const l=document.getElementById('luxLightbox');l.querySelector('img').src=resultsData[i].src;l.querySelector('.lux-lightbox-caption').textContent=resultsData[i].shotLabel||`${t('shot')} ${i+1}`;l.classList.add('open');document.body.style.overflow='hidden'}
function closeLightbox(){document.getElementById('luxLightbox')?.classList.remove('open');document.body.style.overflow=''}

const originalRenderResults=typeof renderResults==='function'?renderResults:null;
if(originalRenderResults){
 renderResults=function(){
  originalRenderResults();ensureResultTools();
  document.querySelectorAll('#results .result').forEach((card,i)=>{
   const item=resultsData[i];const img=card.querySelector(':scope > img');if(img){img.onmouseenter=e=>showHover(img,e);img.onmousemove=moveHover;img.onmouseleave=hideHover;img.onclick=()=>openLightbox(i)}
   if(item?.bestTags?.length){const badges=document.createElement('div');badges.className='lux-badges';badges.innerHTML=item.bestTags.map(x=>`<span class="lux-badge">${x}</span>`).join('');card.appendChild(badges)}
   if(item?.shotLabel){const lab=document.createElement('div');lab.className='lux-shot-label';lab.textContent=item.shotLabel;card.appendChild(lab)}
   if(item?.bestReason){const r=document.createElement('div');r.className='lux-best-reason';r.textContent=item.bestReason;card.appendChild(r)}
   const actions=document.createElement('div');actions.className='lux-card-actions';actions.innerHTML=`<button type="button" class="lux-primary lux-more">${t('more')}</button><button type="button" class="lux-series">${t('series')}</button>`;actions.querySelector('.lux-more').onclick=()=>moreLikeThis(i);actions.querySelector('.lux-series').onclick=()=>createSeries(i);card.appendChild(actions)
  })
 }
}

// Keep regeneration tied to the specific shot brief when available.
if(typeof regenerateOne==='function'){
 regenerateOne=async function(i){const key=document.getElementById('apiKey').value.trim();if(!key||!resultsData[i])return;resultsData[i].busy=true;renderResults();try{const inputs=await prepareInputs();const style=styles.find(s=>s.id===selected);let p;if(resultsData[i].shotLabel){p=`Create exactly ONE standalone fresh alternative of this specific shot: ${resultsData[i].shotLabel}. Same person and identity, same general style, but a new natural composition. ${style.prompt}. NO collage, grid, contact sheet, split screen or multiple frames.`}else{p=buildPrompt(style,i%Math.max(1,+document.getElementById('count').value))+' Generate a fresh alternative composition while keeping this shot brief.'}resultsData[i].src=await callGemini(key,p,inputs)}catch(e){alert(e.message)}finally{resultsData[i].busy=false;renderResults()}}
}

addPlannerUI();ensureHoverPreview();ensureLightbox();ensureResultTools();
// Re-render current results, if any, to attach new controls.
if(typeof renderResults==='function'&&typeof resultsData!=='undefined'&&resultsData.length)renderResults();
})();
