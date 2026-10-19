#!/usr/bin/env python3
"""One-shot text rebrand: AI Notebook -> Notely. Idempotent."""
import os
import re

MARKUP = [
    ('AI <span class="grad-text">Notebook</span>', 'Note<span class="grad-text">ly</span>'),
    ('<span>AI <em>Notebook</em></span>', '<span>Note<em>ly</em></span>'),
    ('AI Notebook Pro Max', 'Notely Pro Max'),
    ('AI Notebook Pro', 'Notely Pro'),
    ('AI Notebook', 'Notely'),
    ('ai-notebook-data.json', 'notely-data.json'),
    ('/assets/ai-notebook-og.png', '/assets/notely-og.png'),
]

EXTS = {'.html', '.js', '.json', '.py', '.kt', '.xml', '.tsx', '.css',
        '.yaml', '.yml', '.toml', '.mjs', '.cjs', '.ts', '.md'}
SKIP_DIRS = {'.git', 'node_modules', '__pycache__', 'visible'}

changed = []
for dp, dns, fns in os.walk('.'):
    dns[:] = [d for d in dns if d not in SKIP_DIRS]
    for fn in fns:
        if os.path.splitext(fn)[1] not in EXTS:
            continue
        if fn == 'package-lock.json':
            continue
        p = os.path.join(dp, fn)
        with open(p, encoding='utf-8') as f:
            s = f.read()
        o = s
        for a, b in MARKUP:
            s = s.replace(a, b)
        if s != o:
            with open(p, 'w', encoding='utf-8') as f:
                f.write(s)
            changed.append(p)

# Next.js theme color token
p = 'web/app/layout.tsx'
if os.path.exists(p):
    s = open(p, encoding='utf-8').read()
    if '#090b11' in s:
        open(p, 'w', encoding='utf-8').write(s.replace('#090b11', '#0A1020'))

# Canonical favicon trio on every PWA page
SVG = '<link rel="icon" type="image/svg+xml" href="/assets/notely-logo.svg" />'
PNG = '<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />'
TOUCH = '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />'
for dp, dns, fns in os.walk('frontend'):
    if 'assets' in dp.split(os.sep):
        continue
    for fn in fns:
        if not fn.endswith('.html'):
            continue
        p = os.path.join(dp, fn)
        lines = open(p, encoding='utf-8').read().split('\n')
        kept = [l for l in lines if not re.search(r'rel="(icon|apple-touch-icon)"', l)]
        s = '\n'.join(kept)
        if '<link rel="manifest"' in s:
            s = re.sub(r'(<link rel="manifest"[^>]*>\n)',
                       lambda m: m.group(1) + f'  {SVG}\n  {PNG}\n  {TOUCH}\n', s, count=1)
        else:
            s = s.replace('</head>', f'  {SVG}\n  {PNG}\n  {TOUCH}\n</head>', 1)
        open(p, 'w', encoding='utf-8').write(s)

old = 'frontend/assets/ai-notebook-og.png'
if os.path.exists(old):
    os.remove(old)

print('rebranded', len(changed), 'files')
for p in sorted(changed):
    print(' -', p)
