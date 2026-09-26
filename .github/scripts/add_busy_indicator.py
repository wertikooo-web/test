from pathlib import Path

p = Path('ai-photoshoot-v2/index.html')
s = p.read_text(encoding='utf-8')
link = '<link rel="stylesheet" href="busy-indicator.css">'
if link not in s:
    s = s.replace('</head>', link + '\n</head>', 1)
p.write_text(s, encoding='utf-8')
