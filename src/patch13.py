import re, json
SP='/tmp/claude-0/-home-claude/a941acfd-1ee4-5a72-ad7b-5b47bb706bfd/scratchpad/'
F='/home/claude/journey.html'
s=open(F).read()
P=json.load(open(SP+'logo2/parts.json'))
def rep(old,new,cnt=1):
    global s
    if old not in s: raise SystemExit('MISSING: '+old[:100])
    s=s.replace(old,new,cnt)
# 1) language page: full stacked logo (pin + plane + wordmark)
full=open(SP+'logo2/journey-logo.svg').read()
full=re.sub(r'<defs>.*?</defs>','',full,flags=re.S)   # gradients come from the shared defs
full=full.replace('<svg xmlns="http://www.w3.org/2000/svg" ','<svg class="lang-logo" ')
m=re.search(r'<div class="brand lang-brand">.*?</svg></div>',s,re.S)
s=s[:m.start()]+'<h1 class="lang-brand-full">'+full+'</h1>'+s[m.end():]
# 2) support chat uses the app icon
icon=f'<svg viewBox="360 162 536 660" aria-hidden="true"><path d="{P["pin"]}" fill="url(#jPin)"/>{P["scene"]}</svg>'.replace('\n','')
rep("const seedChats=","const LOGO_AV='<span class=\"av logo-av\">"+icon.replace("'","\\'")+"</span>';\nconst seedChats=")
rep('<span class="av" style="background:${c.color}">${c.initials}</span>','${c.sys?LOGO_AV:`<span class="av" style="background:${c.color}">${c.initials}</span>`}')
rep("const av=$('#thAv');av.style.background=c.color;av.textContent=c.initials;","const av=$('#thAv');if(c.sys){av.style.background='#fff';av.innerHTML=LOGO_AV.replace('<span class=\"av logo-av\">','').replace(/<\\/span>$/,'')}else{av.style.background=c.color;av.textContent=c.initials}")
# 3) colours follow the logo: purple -> pink -> peach
rep('</style>','''
/* ===== palette aligned with the logo ===== */
:root{--grad:linear-gradient(135deg,#8A4FC6 0%,#B262C4 55%,#E07FB2 100%);--lav-600:#8352C8;--lav-800:#5A3A9E;--violet-ink:#5A3A9E;--dusk:linear-gradient(135deg,#FFD9C4 0%,#F4BFD5 38%,#CBA6EE 74%,#9A6BD8 100%)}
.btn.primary{box-shadow:0 12px 24px -14px rgba(138,79,198,.85),inset 0 1px 0 rgba(255,255,255,.3)}
.lang-brand-full{margin:0 0 6px;display:flex;justify-content:center}
.lang-logo{width:min(220px,52vw);height:auto;display:block;filter:drop-shadow(0 18px 30px rgba(138,79,198,.22))}
@media (max-height:700px){.lang-logo{width:min(160px,40vw)}}
.logo-av{background:#fff!important;box-shadow:inset 0 0 0 1px var(--line)}
.logo-av svg{width:62%;height:auto}
#thAv svg{width:62%;height:auto}
</style>''')
open(F,'w').write(s)
print('ok')
