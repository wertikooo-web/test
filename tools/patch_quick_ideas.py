from pathlib import Path
p=Path('ai-photoshoot-v2/lux-enhancements.js')
s=p.read_text(encoding='utf-8')
# Remove the redundant auto-plan button and its click handler.
s=s.replace('<button type="button" id="luxAutoPlan">${lt(\'autoPlan\')}</button>','')
s=s.replace(" document.getElementById('luxAutoPlan').onclick=()=>renderPlan(true);\n",'')
s=s.replace("document.getElementById('luxAutoPlan').onclick=()=>renderPlan(true);\n",'')
# Add more quick-scene labels in all languages.
s=s.replace("mountains:'Горы',more:","mountains:'Горы',beach:'Пляж',city:'Город',market:'Рынок',cafe:'Кафе',park:'Парк',oldtown:'Старый город',forest:'Лес',more:")
s=s.replace("mountains:'Mountains',more:","mountains:'Mountains',beach:'Beach',city:'City',market:'Market',cafe:'Cafe',park:'Park',oldtown:'Old town',forest:'Forest',more:")
s=s.replace("mountains:'Munți',more:","mountains:'Munți',beach:'Plajă',city:'Oraș',market:'Piață',cafe:'Cafenea',park:'Parc',oldtown:'Oraș vechi',forest:'Pădure',more:")
# Expand quick idea chips.
s=s.replace("['viewpoint','viewpoint'],['mountains','mountains']", "['viewpoint','viewpoint'],['mountains','mountains'],['beach','beach'],['city','city'],['market','market'],['cafe','cafe'],['park','park'],['oldtown','oldtown'],['forest','forest']")
# Expand quick-plan prompt mapping.
s=s.replace("mountains:'mountains visible in the background'}", "mountains:'mountains visible in the background',beach:'on a beach with natural coastal background',city:'in a lively city environment',market:'at a local market with natural candid atmosphere',cafe:'at an outdoor or stylish cafe setting',park:'in a green city park',oldtown:'in an old-town street with architectural character',forest:'in a natural forest setting'}")
p.write_text(s,encoding='utf-8')
print('patched quick ideas')
