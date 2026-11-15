import re,json,base64,os,sys
SRC='/home/claude/journey/partners-src/'
LU='/tmp/claude-0/-home-claude/a941acfd-1ee4-5a72-ad7b-5b47bb706bfd/scratchpad/logo/node_modules/lucide-static/icons/'
MAP=dict(dash='layout-dashboard',flow='waypoints',megaphone='megaphone',calendar='calendar-days',shield='shield-check',siren='siren',calcheck='calendar-check',route='route',bed='bed-double',tag='tag',sparkle='sparkles',utensils='utensils',armchair='armchair',route2='signpost',clipboard='clipboard-list',bus='bus',idcard='id-card',compass='compass',ticket='ticket',users='users',star='star',percent='percent',package='package',wallet='wallet',chart='chart-column',chat='message-circle',network='network',team='users-round',gear='settings',landing='plane-landing',takeoff='plane-takeoff',landmark='landmark',alert='triangle-alert',info='info',lock='lock',badge='badge-check',check='check',copy='copy',upload='upload',download='download',send='send-horizontal',chevl='chevron-left',chevr='chevron-right',chevd='chevrons-up-down',plus='plus',search='search',trash='trash-2',menu='menu',bell='bell',x='x',logout='log-out',building='building-2',globe='globe',inbox='inbox')
IC={}
for k,n in MAP.items():
    p=LU+n+'.svg'
    if not os.path.exists(p): sys.exit('missing icon '+n)
    t=open(p).read(); inner=re.search(r'<svg[^>]*>(.*)</svg>',t,re.S).group(1)
    inner=re.sub(r'<!--.*?-->','',inner,flags=re.S); inner=re.sub(r'\s+',' ',inner).strip()
    IC[k]=inner
js=''.join(open(SRC+f).read()+'\n' for f in ['core.js','seed.js','ui.js','views1.js','views2.js','views3.js','app.js'])
used=set(re.findall(r"IC\.([a-z0-9]+)",js))|set(re.findall(r"IC\[['\"]([a-z0-9]+)",js))
miss=used-set(IC); 
if miss: sys.exit('IC missing: '+str(miss))
js=js.replace('const IC=__IC__;','const IC='+json.dumps(IC,ensure_ascii=False)+';')
js=js.replace('</script','<\\/script')
css=open(SRC+'style.css').read()
pub='/home/claude/journey/public/'
b64=lambda f:'data:image/svg+xml;base64,'+base64.b64encode(open(pub+f,'rb').read()).decode()
svg=lambda k:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg>'
h=open(SRC+'shell.html').read()
h=h.replace('__CSS__',css).replace('__LOGO__',b64('journey-logo.svg')).replace('__MARK__',b64('journey-mark.svg'))
h=h.replace('__MENU__',svg('menu')).replace('__BELL__',svg('bell')).replace('__X__',svg('x')).replace('__SPARK__',svg('sparkle'))
h=h.replace('__JS__',js)
open('/home/claude/partners.html','w').write(h)
open(SP+'/p.js','w').write(js) if (SP:=os.path.dirname(os.path.abspath(__file__))) else None
print('ok',len(h))
# deploy copy (real site at /partners/)
i=h.index('<div id="splash">')
head,body=h[:i],h[i:]
doc='<!doctype html>\n<html lang="th">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}</style>\n'+head+'</head>\n<body>\n'+body+'</body>\n</html>\n'
os.makedirs('/home/claude/journey/public/partners',exist_ok=True)
open('/home/claude/journey/public/partners/index.html','w').write(doc)
print('deploy ok')
