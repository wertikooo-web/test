from pathlib import Path
p=Path('ai-photoshoot-v2/lux-enhancements.js')
s=p.read_text(encoding='utf-8')
s=s.replace("planTitle:'План кадров',planHelp:'Каждая строка ниже = отдельная фотография. Один пункт плана не может превращаться в коллаж или несколько сцен в одной картинке.'","planTitle:'Сценарий съёмки',planHelp:''")
s=s.replace("planTitle:'Shot plan',planHelp:'Each row below = one separate photo. A shot brief can never become a collage or several scenes inside one image.'","planTitle:'Shoot scenario',planHelp:''")
s=s.replace("planTitle:'Planul cadrelor',planHelp:'Fiecare rând = o fotografie separată. Un cadru nu poate deveni colaj sau mai multe scene într-o singură imagine.'","planTitle:'Scenariul ședinței',planHelp:''")
s=s.replace('<div class="lux-series-help" id="luxPlanHelp">${lt(\'planHelp\')}</div>','')
s=s.replace("if(q('#luxPlanHelp'))q('#luxPlanHelp').textContent=lt('planHelp');","")
p.write_text(s,encoding='utf-8')
