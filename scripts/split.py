#!/usr/bin/env python3
"""
One-time script: splits index.html into separate CSS/JS files.
Run once from the project root directory.
"""
import os, shutil

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src  = os.path.join(root, 'index.html')

with open(src, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def section(start, end):
    """Return joined lines (1-indexed, inclusive)."""
    return ''.join(lines[start-1:end])

os.makedirs(os.path.join(root, 'css'), exist_ok=True)
os.makedirs(os.path.join(root, 'js'),  exist_ok=True)

# ── CSS ────────────────────────────────────────────────────────────
with open(os.path.join(root, 'css', 'style.css'), 'w', encoding='utf-8') as f:
    f.write(section(15, 366))
print('css/style.css')

# ── JS FILES ───────────────────────────────────────────────────────
js_files = [
    ('js/config.js',      814,  984,  'Firebase config + auth + constants'),
    ('js/save.js',        985, 1016,  'Save / Load'),
    ('js/audio.js',      1017, 1134,  'Audio'),
    ('js/world.js',      1135, 1887,  'Locations + state + Three.js + world + characters + weapon mesh'),
    ('js/combat.js',     1888, 2220,  'Missiles + building damage + projectiles + particles'),
    ('js/gameplay.js',   2221, 2908,  'Waves + player + weapon system + hook + ultimates + gadgets'),
    ('js/enemies.js',    2909, 3370,  'Minimap + physics + soldier system'),
    ('js/ui.js',         3371, 4158,  'HUD + screens + shop + customization + save UI + world map'),
    ('js/main.js',       4159, 4632,  'Events + game loop + init + card system'),
    ('js/multiplayer.js',4633, 5295,  'PeerJS multiplayer + battle mode + DOMContentLoaded'),
]

for filename, start, end, desc in js_files:
    path = os.path.join(root, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f'// {desc}\n')
        f.write(section(start, end))
    print(f'{filename}  ({end - start + 1} lines)')

# ── NEW index.html ─────────────────────────────────────────────────
bak = src + '.bak'
if not os.path.exists(bak):
    shutil.copy(src, bak)

# Read from backup so we always split the original
with open(bak, 'r', encoding='utf-8') as f:
    orig = f.readlines()

def orig_section(start, end):
    return ''.join(orig[start-1:end])

html_head   = orig_section(1, 13)   # doctype ... CDN scripts (no </head> yet)
html_body   = orig_section(370, 810) # all <div> screens (after <body> tag)
cdn_scripts = orig_section(811, 812) # Three.js + TopoJSON CDN

script_tags = '\n'.join(
    f'<script src="{fn}"></script>' for fn, *_ in js_files
)

new_index = (
    html_head.rstrip()
    + '\n<link rel="stylesheet" href="css/style.css">\n</head>\n<body>\n'
    + html_body
    + '\n'
    + cdn_scripts
    + '\n'
    + script_tags
    + '\n\n<!-- service worker -->\n'
    + '<script>\n'
    + "  if('serviceWorker' in navigator){\n"
    + "    navigator.serviceWorker.register('/rajis/sw.js').catch(()=>{});\n"
    + "  }\n"
    + '</script>\n'
    + '</body>\n</html>\n'
)

with open(src, 'w', encoding='utf-8') as f:
    f.write(new_index)

print('\nindex.html rewritten  (original → index.html.bak)')
print('Done.')
