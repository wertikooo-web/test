from pathlib import Path

p=Path('ai-photoshoot/index.html')
s=p.read_text(encoding='utf-8')

css = r'''
.credit-balance{display:flex;align-items:center;gap:8px;border:1px solid #d8d2ca;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;white-space:nowrap}.credit-balance strong{font-size:13px}.credit-buy{border:0;background:#111;color:#fff;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800;text-decoration:none}.credit-buy:hover{opacity:.82}.credit-section{padding:54px 0}.credit-section h2{font:500 42px/1.05 Georgia,serif;margin:0 0 12px}.credit-intro{color:var(--muted);font-size:18px;max-width:760px;line-height:1.5}.credit-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:28px}.credit-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:24px;position:relative}.credit-card.featured{border:2px solid #111}.credit-card .tag{display:inline-block;background:#111;color:#fff;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:800;margin-bottom:14px}.credit-card h3{font-size:20px;margin:0 0 8px}.credit-card .credits{font:500 34px Georgia,serif;margin:6px 0}.credit-card .price{font-size:24px;font-weight:850;margin:8px 0}.credit-card p{color:var(--muted);line-height:1.45}.bonus{color:#26734f;font-weight:850}.credit-action{display:inline-block;margin-top:8px;background:#111;color:#fff;text-decoration:none;border-radius:999px;padding:11px 15px;font-weight:800}.usage{margin-top:28px;background:#fff;border:1px solid var(--line);border-radius:22px;padding:24px}.usage-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px}.usage-item{background:#f2eee7;border-radius:16px;padding:16px}.usage-item strong{display:block;font-size:21px;margin-top:6px}.credit-note{margin-top:18px;padding:16px 18px;border-radius:16px;background:#ece7de;line-height:1.5}.cost-preview{margin-top:8px;padding:10px 12px;border:1px solid #3b3b3b;border-radius:11px;background:#151515;color:#ddd;font-size:13px}.test-api summary{cursor:pointer;color:#aaa;font-size:12px}.test-api{margin-top:12px}.test-api .api{margin-top:8px}.auth-note{font-size:12px;color:#777;margin-top:12px}.auth-note b{color:#333}@media(max-width:900px){.credit-cards{grid-template-columns:1fr}.usage-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.credit-balance{display:none}.usage-grid{grid-template-columns:1fr}.credit-section h2{font-size:36px}}
'''
if '.credit-balance{' not in s:
    s=s.replace('</style>', css+'</style>')

old='<header class="wrap top"><div class="brand">AI Photoshoot LUX</div><nav class="nav"><a href="#styles">Стили</a><a href="#studio">Создать</a><div class="lang-switch" aria-label="Language">'
new='<header class="wrap top"><div class="brand">AI Photoshoot LUX</div><nav class="nav"><a href="#styles">Стили</a><a href="#studio">Создать</a><div class="credit-balance" id="creditBalance">Credits: <strong>120</strong></div><a class="credit-buy" href="#credits">Докупить</a><div class="lang-switch" aria-label="Language">'
s=s.replace(old,new)

s=s.replace('Пять фотографий помогают сохранить внешность. Можно добавить референсы стиля, диктовать правки голосом и обучать следующую генерацию своими оценками.','Создавайте профессиональные AI-фото и платите Credits только за нужные действия: новые кадры, правки, перегенерацию и 4K. Credits действуют 12 месяцев.')

count_old='<div class="field"><label>Количество кадров</label><select id="count"><option value="1">1</option><option value="2">2</option><option value="4" selected>4</option><option value="6">6</option><option value="8">8</option></select></div>'
count_new='<div class="field"><label>Количество кадров</label><select id="count"><option value="1">1</option><option value="2">2</option><option value="4" selected>4</option><option value="6">6</option><option value="8">8</option></select><div class="cost-preview" id="generationCost">4 фото в 2K · 80 Credits</div></div>'
s=s.replace(count_old,count_new)

s=s.replace('В тестовой версии размер передаётся как пожелание в промпте. Фактический размер выбирает Gemini. Это сделано специально, чтобы не повторялась ошибка API с aspectRatio/imageSize.','2K — стандартное качество. 4K доступен как дополнительная опция за Credits.')

api_old='<div class="api"><b>Gemini API key</b><div class="field"><input id="apiKey" type="password" placeholder="Вставьте Gemini API key"></div></div>'
api_new='<details class="test-api"><summary>Тестовый режим: Gemini API key</summary><div class="api"><b>Gemini API key</b><div class="field"><input id="apiKey" type="password" placeholder="Вставьте Gemini API key"></div><div class="notice">После подключения оплаты и backend это поле исчезнет. Пользователь будет работать только с балансом Credits.</div></div></details>'
s=s.replace(api_old,api_new)

section=r'''
<section class="wrap credit-section" id="credits">
<h2>Credits: платите только за то, что используете</h2>
<p class="credit-intro">Купите Credits один раз и тратьте их на новые фото, правки, перегенерацию и 4K. Остаток всегда виден сверху, докупить Credits можно в любой момент. Все Credits действуют 12 месяцев с даты покупки.</p>
<div class="credit-cards">
<div class="credit-card featured"><span class="tag">Выгодный старт</span><h3>Starter</h3><div class="credits">100 Credits <span class="bonus">+ 20 в подарок</span></div><div class="price">€4.99</div><p><b>Итого 120 Credits.</b> Подходит, чтобы попробовать несколько вариантов, внести правки и выбрать лучшие кадры.</p><a class="credit-action" href="#studio">Начать за €4.99</a></div>
<div class="credit-card"><h3>Standard</h3><div class="credits">250 Credits</div><div class="price">€9.99</div><p>Для полноценной серии с дополнительными кадрами, правками и несколькими перегенерациями.</p><a class="credit-action" href="#studio">Купить 250 Credits</a></div>
<div class="credit-card"><h3>LUX</h3><div class="credits">600 Credits</div><div class="price">€19.99</div><p>Для большой фотосессии, нескольких стилей, экспериментов, редактирования и 4K.</p><a class="credit-action" href="#studio">Купить 600 Credits</a></div>
</div>
<div class="usage"><h3>Сколько стоит каждое действие</h3><div class="usage-grid"><div class="usage-item">Новое фото в 2K<strong>20 Credits</strong></div><div class="usage-item">Перегенерация фото<strong>20 Credits</strong></div><div class="usage-item">Редактирование фото<strong>15 Credits</strong></div><div class="usage-item">4K upgrade одного фото<strong>10 Credits</strong></div></div><div class="credit-note"><b>Без отдельного личного кабинета.</b> После подключения платежей пользователь войдёт по email или Google, а сайт будет хранить его баланс Credits и историю списаний. Баланс виден прямо в шапке, рядом находится кнопка «Докупить».</div><div class="auth-note">Credits действуют <b>12 месяцев</b> с даты покупки.</div></div>
</section>
'''
if 'id="credits"' not in s:
    s=s.replace('</main>',section+'</main>')

js=r'''
<script>
(function(){
 const count=document.getElementById('count'), quality=document.getElementById('resolution'), out=document.getElementById('generationCost');
 function updateCreditCost(){
  if(!count||!quality||!out)return;
  const n=Number(count.value||1), q=quality.value, total=n*20+(q==='4K'?n*10:0);
  out.textContent=n+' фото · '+total+' Credits'+(q==='4K'?' · 4K':' · '+q);
 }
 if(count)count.addEventListener('change',updateCreditCost);
 if(quality)quality.addEventListener('change',updateCreditCost);
 updateCreditCost();
})();
</script>
'''
if 'updateCreditCost' not in s:
    s=s.replace('</body>',js+'</body>')

# Add basic i18n entries to the existing dictionaries.
entries={
'en':{
'Докупить':'Buy more','Credits: платите только за то, что используете':'Credits: pay only for what you use','Выгодный старт':'Best start','+ 20 в подарок':'+ 20 bonus','Начать за €4.99':'Start for €4.99','Купить 250 Credits':'Buy 250 Credits','Купить 600 Credits':'Buy 600 Credits','Сколько стоит каждое действие':'Cost per action','Новое фото в 2K':'New 2K photo','Перегенерация фото':'Regenerate photo','Редактирование фото':'Edit photo','4K upgrade одного фото':'4K upgrade for one photo','Тестовый режим: Gemini API key':'Test mode: Gemini API key','2K — стандартное качество. 4K доступен как дополнительная опция за Credits.':'2K is standard quality. 4K is available as an upgrade for Credits.'},
'ro':{
'Докупить':'Cumpără','Credits: платите только за то, что используете':'Credits: plătești doar pentru ce folosești','Выгодный старт':'Start avantajos','+ 20 в подарок':'+ 20 bonus','Начать за €4.99':'Începe cu €4.99','Купить 250 Credits':'Cumpără 250 Credits','Купить 600 Credits':'Cumpără 600 Credits','Сколько стоит каждое действие':'Costul fiecărei acțiuni','Новое фото в 2K':'Fotografie nouă 2K','Перегенерация фото':'Regenerează fotografia','Редактирование фото':'Modifică fotografia','4K upgrade одного фото':'Upgrade 4K pentru o fotografie','Тестовый режим: Gemini API key':'Mod test: cheie API Gemini','2K — стандартное качество. 4K доступен как дополнительная опция за Credits.':'2K este calitatea standard. 4K este disponibil ca opțiune contra Credits.'}}
for lang,vals in entries.items():
    marker=' '+lang+':{'
    if marker in s:
        payload=''.join([repr(k)+':'+repr(v)+',' for k,v in vals.items()])
        s=s.replace(marker, marker+payload, 1)

p.write_text(s,encoding='utf-8')
print('credits model applied')
