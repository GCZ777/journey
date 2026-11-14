import re, json
SP='/tmp/claude-0/-home-claude/a941acfd-1ee4-5a72-ad7b-5b47bb706bfd/scratchpad/'
SRC='/home/claude/journey/src/'
F='/home/claude/journey.html'
s=open('/home/claude/journey.bak10.html').read()

ICD=SP+'logo/node_modules/lucide-static/icons/'
def lu(n):
    x=open(ICD+n+'.svg').read();x=re.sub(r'<!--.*?-->','',x,flags=re.S)
    x=re.search(r'<svg[^>]*>(.*)</svg>',x,re.S).group(1);x=re.sub(r'>\s+<','><',x.strip());return re.sub(r'\s+',' ',x)
def sv(n,w='1.8'):return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round">%s</svg>'%(w,lu(n))
def rep(old,new,cnt=1):
    global s
    if old not in s: raise SystemExit('MISSING: '+old[:120])
    s=s.replace(old,new,cnt)
def rd(n):return open(SRC+n).read()

# ---- icons ----
add=dict(heart='heart',repost='repeat-2',share='share-2',dots='ellipsis',eyeoff='eye-off',eye='eye',userplus='user-plus',crop='crop',sliders='sliders-horizontal',
 palette='palette',rotate='rotate-cw',zoomin='zoom-in',imgplus='image-plus',filter='list-filter',alert='triangle-alert',car='car-front',alarm='alarm-clock',calplus='calendar-plus',
 search='search',rectH='rectangle-horizontal',rectV='rectangle-vertical',max='maximize',min='minimize',mute='volume-x',vol='volume-2',pause='pause',play='play',plus='plus',thumb='thumbs-up',
 pencil='pencil',images='images',image='image',link='link',copy='copy',sun='sun',cloudsun='cloud-sun',cloud='cloud',fog='cloud-fog',rain='cloud-rain',storm='cloud-lightning',
 coffee='coffee',fuel='fuel',bed='bed-double',camera='camera',utensils='utensils')
acts=dict(hike='footprints',temple='landmark',food='utensils',nature='trees',photo='camera',history='scroll',culture='drama',night='moon',dive='waves',island='tree-palm',boat='sailboat',market='store',cafe='coffee',shop='shopping-bag',bike='bike',family='baby',wellness='flower-2',art='palette')
icjs='Object.assign(IC,{'+','.join("%s:'%s'"%(k,lu(v)) for k,v in add.items())+'});\nconst ACT_IC={'+','.join("%s:'%s'"%(k,lu(v)) for k,v in acts.items())+'};\n'
rep("const SVC=[",icjs+"const SVC=[")
s=re.sub(r"const SVC=\[.*?\n\];","const SVC=[{k:'general',ic:IC.route},{k:'local',ic:IC.mappinned},{k:'plan',ic:IC.users}];",s,count=1,flags=re.S)
rep("$('#services').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;goMap(SVC.find(x=>x.k===b.dataset.k).spec)};",
    "$('#services').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;const k=b.dataset.k;if(k==='plan'){show('plans');return}F.kind=k;F.di=-1;state.listLim=30;goMap()};")
rep("const SPECS=['temple','food','nature','night','dive','photo'];","const SPECS=['hike','temple','food','nature','photo','history','night','dive','island','market','cafe','family'];")

# ---- data + guides ----
rep("/* ---------------- guides ---------------- */",open(SP+'dist.js').read()+"\n/* ---------------- guides ---------------- */")
s=re.sub(r"function genGuides\(p\)\{\n.*?\n  return out\.sort\(\(a,b\)=>a\.dist-b\.dist\);\n\}\n",lambda m:rd('guides2.js')+"\n",s,count=1,flags=re.S)
s=re.sub(r"function applyFilter\(\)\{state\.guides\.forEach\(g=>g\.visible=\(\(state\.filter.*?\n","",s,count=1)
s=re.sub(r"function itemHTML\(g\)\{\n  return `<button class=\"g-item\".*?\n\}\n","",s,count=1,flags=re.S)
rep("function guidesFor(p){if(!gcache[p.en]){if(Map3D.cur!==p.en)Map3D.setWorld(p);gcache[p.en]=genGuides(p)}return gcache[p.en]}",
    "function guidesFor(p){if(Map3D.cur!==p.en)Map3D.setWorld(p);if(!gcache[p.en])gcache[p.en]=genGuides(p);if(gcache[p.en]._placed!==p.en||GEN&&GEN._for!==p.en){placeGuides(p,gcache[p.en]);gcache[p.en]._placed=p.en;if(GEN)GEN._for=p.en}return gcache[p.en]}")
rep("const dayRate=g=>Math.round(g.price*7/50)*50;","const dayRate=g=>g.dayRate||Math.round(g.price*7/50)*50;")

# ---- panel ----
rep("  const g=state.guides.find(x=>x.id===state.selected);\n  if(!g){","  if(state.mapMode==='plan'){renderPlanPanel();return}\n  const g=state.guides.find(x=>x.id===state.selected);\n  if(!g){")
s=re.sub(r"  if\(!g\)\{\n    const vis=state\.guides.*?\n    return;\n  \}\n","  if(!g){el._g=null;ft.hidden=true;$('#panel').classList.remove('has-guide');el.innerHTML=listHTML();bindList(el);return}\n",s,count=1,flags=re.S)
rep("· ${g.reviews} ${t('reviews')} · ${fmtKm(g.dist)}</p>","· ${g.reviews} ${t('reviews')}</p><p class=\"dh-kind\">${kindMeta(g)}<button class=\"link\" id=\"gProfLink\">${t('view_profile')}</button></p>")
rep("<p class=\"bio\">${esc(t('bio',{p:pname(state.province),n:g.years}))}</p>","<p class=\"bio\">${esc(g.kind==='local'?t('bio_loc',{d:dname(state.province,g.di),p:pname(state.province),n:g.years}):t('bio_gen',{n:g.years,c:g.covered}))}</p>")
rep("    else html+=`<div class=\"seg2\" id=\"modeSeg\">","    else if(g.kind==='local')html+=localBookHTML(g);\n    else html+=`<div class=\"seg2\" id=\"modeSeg\">")
rep("    ft.innerHTML=`<span class=\"ft-tot\"><small>${t('total')} · ${money(rate)}","    ft.innerHTML=g.kind==='local'?localFootHTML(g):`<span class=\"ft-tot\"><small>${t('total')} · ${money(rate)}")
rep("else if(tab==='trip'){","else if(tab==='trip'){if(g.kind==='local')state.lb.mode=state.plan.mode==='custom'?'hour':state.plan.mode;")
rep("state.gtab='book';renderPanel()}else book()});","state.gtab='book';renderPanel()}else if(g.kind==='local')lpAddFromPanel(g);else book()});")
rep("  q('#cancelBtn')&&(q('#cancelBtn').onclick=()=>cancelTrip(false));",
    "  if(g.kind==='local'&&idle)bindLocalBook(el,g);\n  q('#gProfLink')&&(q('#gProfLink').onclick=()=>openProfile(g.kind==='general'?'g:'+g.id:'g:'+state.province.en+':'+g.id));\n  q('#cancelBtn')&&(q('#cancelBtn').onclick=()=>cancelTrip(false));")
rep("  if(g){if(exactShown(g))MAP.focus(g.x,g.y);else{const [fx,fy]=zonePos(g);MAP.focus(fx,fy)}}","  if(g&&exactShown(g))MAP.focus(g.x,g.y);")

# ---- map: radar at me, no guide markers ----
rep("    // places: fixed-size photo cards, readable at any zoom","""    // search radar around me (guides' own locations are never drawn)
    let meRadar=false;
    if(state.mapMode!=='plan'&&state.trip==='idle'){const u0=P(0,0,0);if(u0){
      const ring=k=>{const pts=[];for(let i=0;i<40;i++){const a=i/40*Math.PI*2,q=P(Math.cos(a)*k,Math.sin(a)*k,0);if(!q)return null;pts.push(q)}return pts};
      const path=pts=>{ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath()};
      const outer=ring(820);if(outer){path(outer);ctx.fillStyle='rgba(122,104,212,.07)';ctx.fill()}
      for(const k of [280,550,820]){const r2=ring(k);if(r2){path(r2);ctx.setLineDash([4,7]);ctx.lineWidth=1.2;ctx.strokeStyle='rgba(122,104,212,.4)';ctx.stroke();ctx.setLineDash([])}}
      if(!REDUCED){const n2=performance.now();for(const off of [0,.33,.66]){const ph=((n2/3400)+off)%1,r2=ring(50+ph*770);if(r2){path(r2);ctx.lineWidth=2;ctx.strokeStyle=`rgba(122,104,212,${.6*(1-ph)})`;ctx.stroke()}}
        const sa=(n2/2600)%1*Math.PI*2;for(let j=0;j<10;j++){const a=sa-j*.06,q=P(Math.cos(a)*820,Math.sin(a)*820,0);if(q){ctx.beginPath();ctx.moveTo(u0[0],u0[1]);ctx.lineTo(q[0],q[1]);ctx.lineWidth=2.4;ctx.strokeStyle=`rgba(122,104,212,${.38*(1-j/10)})`;ctx.stroke()}}
        meRadar=true}}}
    // places: fixed-size photo cards, readable at any zoom""")
rep("    hits=[];radarOn=false;","    hits=[];radarOn=meRadar;")
rep("const pins=[];for(const g of guides){if(!g.visible)continue;","const pins=[];for(const g of guides){if(!g.visible||!exactShown(g))continue;")
# google
rep("""      if(userM)userM.map=null;const u=document.createElement('div');u.style.cssText='width:18px;height:18px;border-radius:50%;background:#4f3192;border:3px solid #fff;box-shadow:0 0 0 8px rgba(127,91,208,.2)';""",
    """      if(userM)userM.map=null;const u=document.createElement('div');u.className='me-radar';u.innerHTML='<i></i><i></i><i></i><span></span>';""")
rep("""        const m=new google.maps.marker.AdvancedMarkerElement({map:g.visible?map:null,position:toLL(...(ex?[g.x,g.y]:zp)),content:ex?pinEl(g,g.id===selId):dotEl(g,g.id===selId),title:g.name});""",
    """        const m=new google.maps.marker.AdvancedMarkerElement({map:g.visible&&ex?map:null,position:toLL(g.x,g.y),content:pinEl(g,g.id===selId),title:g.name});""")
rep("""        const c=new google.maps.Circle(Object.assign({map:g.visible&&!ex?map:null,center:toLL(...zp),radius:RZ,clickable:true},zoneOpts(g)));c.addListener('click',()=>onPick(g.id));""",
    """        const c={setMap(){},setOptions(){}};""")
rep("""    select(id){selId=id;Object.values(markers).forEach(m=>{const g=m._g;m.content=m._ex?pinEl(g,g.id===id):dotEl(g,g.id===id);m.zIndex=g.id===id?99:1;m._c.setOptions(zoneOpts(g))})},""",
    """    select(id){selId=id;Object.values(markers).forEach(m=>{const g=m._g;if(m._ex)m.content=pinEl(g,g.id===id);m.zIndex=g.id===id?99:1})},
    traffic(on){if(!map)return;if(!this._tl)this._tl=new google.maps.TrafficLayer();this._tl.setMap(on?map:null)},""")
rep("""    refresh(list){list.forEach(g=>{const m=markers[g.id];if(!m)return;const ex=exactShown(g);m.position=toLL(...(ex?[g.x,g.y]:zonePos(g)));m.map=g.visible?map:null;m._c.setMap(g.visible&&!ex?map:null);if(ex!==m._ex){m._ex=ex;m.content=ex?pinEl(g,g.id===selId):dotEl(g,g.id===selId)}})},""",
    """    refresh(list){list.forEach(g=>{const m=markers[g.id];if(!m)return;const ex=exactShown(g);m.position=toLL(g.x,g.y);m.map=g.visible&&ex?map:null;if(ex!==m._ex){m._ex=ex;m.content=pinEl(g,g.id===selId)}})},""")

# ---- map modes ----
rep("  applyFilter();\n  MAP.setGuides(state.guides);MAP.select(state.selected);",
    """  document.body.classList.toggle('plan-mode',state.mapMode==='plan');
  if(state.mapMode==='plan'){MAP.setGuides([]);MAP.select(null);placeSig='';$('#panel').classList.remove('min','full');MAP.start();renderPanel();planMapRefresh(true);
    {const pv=p;loadPlaceInfo(pv).then(ch=>{if(ch&&state.mapMode==='plan'&&state.screen==='map'){placeSig='';renderPanel();planMapRefresh(true)}})}
    if(state.locState==='idle')locate(()=>{applyOrigin();renderLoc()});return}
  applyFilter();
  MAP.setGuides(state.guides);MAP.select(state.selected);""")
rep("function refreshPlaces(fit){\n  const p=state.province;if(!p||!MAP.setPlaces)return;","function refreshPlaces(fit){\n  if(state.mapMode==='plan'){planMapRefresh(fit);return}\n  const p=state.province;if(!p||!MAP.setPlaces)return;")
rep("function goMap(spec){state.spec=spec||null;","function goMap(spec){state.spec=spec||null;if(state.mapMode==='plan'){state.mapMode='guides';MAP.setRoute(null);placeSig=''}")
rep("function prefsDone(){prefs.done=true;store.set('prefs',prefs);","function prefsDone(){prefs.done=true;store.set('prefs',prefs);fFromPrefs();")
rep("document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){",
    "document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g&&g.dataset.go==='home'&&state.screen==='map'&&state.mapMode==='plan'){leavePlan();return}if(g){")

# ---- routing ----
rep("const TABS=['home','inbox','notif','profile'],GTABS=['gjobs','gsched','gearn','gprof'];","const TABS=['home','feed','inbox','notif','profile'],GTABS=['gjobs','feed','gsched','gearn','gprof'];")
rep("  const tb=$('#tabbar');tb.hidden=!TABS.includes(name);$('#gtabbar').hidden=!GTABS.includes(name);\n  if(GTABS.includes(name))store.set('mode','guide');else if(TABS.includes(name))store.set('mode','trav');",
    "  const both=TABS.includes(name)&&GTABS.includes(name);\n  if(!both){if(GTABS.includes(name))store.set('mode','guide');else if(TABS.includes(name))store.set('mode','trav')}\n  const gmode=store.get('mode')==='guide';\n  $('#tabbar').hidden=!(TABS.includes(name)&&(!both||!gmode));$('#gtabbar').hidden=!(GTABS.includes(name)&&(!both||gmode));")
rep("  else if(n==='gjobs')renderGJobs();","  else if(SCR[n])SCR[n]();\n  if(n==='gjobs')renderGJobs();")

# ---- home extras ----
rep('    <div class="services" id="services"></div>','    <div id="nextApWrap"></div>\n    <div class="services" id="services"></div>')
rep("  renderRegions();renderCarousel();renderDest();renderPopular();\n}","  renderRegions();renderCarousel();renderDest();renderPopular();\n  $('#nextApWrap').innerHTML=apptCardHTML();const na=$('#nextAp');if(na)na.onclick=openAppts;\n}")

# ---- alerts icons ----
rep("const NIC={spark:{d:IC.spark,c:'#6a4fcf',bg:'#efe9ff'},","const NIC={cal:{d:IC.cal,c:'#1F7A4D',bg:'#E6F6EE'},clock:{d:IC.alarm,c:'#B0662D',bg:'#FFF4E8'},spark:{d:IC.spark,c:'#6a4fcf',bg:'#efe9ff'},")

# ---- profile rows ----
rep("const rows=[['settings',IC.gear,t('settings'),''],['lang',IC.globe,t('language'),L.n],['gmode',IC.brief,t('g_menu'),''],['help',IC.help,t('help'),'']];",
    "const rows=[['myprof',IC.user,t('my_profile'),''],['appts',IC.cal,t('ap_title'),APPTS.filter(a=>a.status==='ok'&&apStart(a)>Date.now()).length||''],['plans',IC.users,t('pl_title'),PLANS.length||''],['settings',IC.gear,t('settings'),''],['lang',IC.globe,t('language'),L.n],['gmode',IC.brief,t('g_menu'),''],['help',IC.help,t('help'),'']];")
rep("  else if(k==='gmode')goGuide();","  else if(k==='gmode')goGuide();\n  else if(k==='myprof')openProfile('me');\n  else if(k==='appts')openAppts();\n  else if(k==='plans')show('plans');")
rep("""      <button class="row" data-g="verify"><span class="r-ic">${SVG(IC.coins2)}</span>""",
    """      <button class="row" data-g="gedit"><span class="r-ic">${SVG(IC.pencil)}</span><span class="row-main"><b>${t('g_cust')}</b></span>${SVG(IC.chev,2,'chev')}</button>
      <button class="row" data-g="gpub"><span class="r-ic">${SVG(IC.eye)}</span><span class="row-main"><b>${t('g_pub')}</b></span>${SVG(IC.chev,2,'chev')}</button>
      <button class="row" data-g="verify"><span class="r-ic">${SVG(IC.coins2)}</span>""")
rep("  else if(k==='login'){state.gAuthMode='login';show('gauth')}","  else if(k==='login'){state.gAuthMode='login';show('gauth')}\n  else if(k==='gedit')show('gedit');\n  else if(k==='gpub')openProfile('meg');")

# ---- tab bars ----
feedTab='  <button class="tab" data-tab="feed"><span class="ti">%s</span><span data-i18n="tab_feed"></span></button>\n'%sv('newspaper')
rep('<button class="tab" data-tab="inbox">',feedTab.lstrip()+'  <button class="tab" data-tab="inbox">')
rep('  <button class="tab" data-tab="gsched">',feedTab+'  <button class="tab" data-tab="gsched">')

# ---- screens + overlays ----
back=sv('chevron-left','2')
scr='''
<!-- ============ COMMUNITY ============ -->
<section class="screen app" id="s-feed" hidden><div class="wrap"><div class="app-inner feed">
  <header class="page-h"><h1 data-i18n="tab_feed"></h1><span class="ph-act"><button class="icon-btn" id="feedSearch" aria-label="Search">%s</button><button class="icon-btn accent" id="feedNew" aria-label="New post">%s</button></span></header>
  <div id="feedBody"></div>
</div></div></section>
<section class="screen app" id="s-csearch" hidden><div class="wrap"><div class="app-inner">
  <header class="cs-head"><button class="icon-btn" id="csBack" aria-label="Back">%s</button><div class="search">%s<input class="input" id="csIn" type="search" autocomplete="off" data-i18n-ph="cs_ph"></div></header>
  <div id="csRes"></div>
</div></div></section>
<section class="screen app" id="s-compose" hidden><div class="wrap"><div class="app-inner" id="cpBody"></div></div></section>
<section class="screen app" id="s-uprof" hidden><div class="wrap"><div class="app-inner" id="upBody"></div></div></section>
<section class="screen app" id="s-pedit" hidden><div class="wrap"><div class="app-inner" id="peBody"></div></div></section>
<section class="screen app" id="s-gedit" hidden><div class="wrap"><div class="app-inner" id="geBody"></div></div></section>
<section class="screen app" id="s-lplan" hidden><div class="wrap"><div class="app-inner" id="lpBody"></div></div></section>
<section class="screen app" id="s-appts" hidden><div class="wrap"><div class="app-inner" id="apBody"></div></div></section>
<section class="screen app" id="s-privset" hidden><div class="wrap"><div class="app-inner" id="pvBody"></div></div></section>
<section class="screen app" id="s-plans" hidden><div class="wrap"><div class="app-inner" id="plBody"></div></div></section>
<div class="editor" id="editor" hidden><div class="ed-top"><button class="ed-tb" id="edCancel" data-i18n="cancel"></button><b id="edTitle"></b><button class="ed-tb done" id="edDone" data-i18n="done"></button></div><div class="ed-stage"><canvas id="edCanvas"></canvas></div><div class="ed-tools" id="edTools"></div></div>
<div class="stc" id="stc" hidden><div class="ed-top"><button class="ed-tb" id="stcCancel" data-i18n="cancel"></button><b data-i18n="st_new"></b><span style="width:60px"></span></div><div class="stc-wrap"><div class="stc-frame" id="stcFrame"><div class="stc-bg" id="stcBg"></div><div id="stcM"></div></div></div><div class="stc-tools" id="stcTools"></div></div>
<div class="sv" id="sv" hidden><div class="sv-card" id="svCard"><div class="sv-media" id="svMedia"></div><div class="sv-top"><div class="sv-bars" id="svBars"></div><div class="sv-head" id="svHead"></div></div><p class="sv-cap" id="svCap" hidden></p><div class="sv-foot" id="svFoot"></div></div></div>
<div class="lightbox" id="lightbox" hidden></div>
'''%(sv('search'),sv('plus','2.2'),back,sv('search','2'))
rep('<div id="toast" role="status"></div>',scr+'<div id="toast" role="status"></div>')

# ---- modules ----
mods='\n'.join(rd(f) for f in ['lplan.js','community.js','stories.js','profiles.js','privacy.js','planner.js'])
mods+="\nconst SCR={feed:renderFeed,csearch:renderCSearch,compose:renderCompose,uprof:renderUProf,pedit:renderPEdit,gedit:renderGEdit,lplan:renderLPlan,appts:renderAppts,plans:renderPlans,privset:renderPrivSet};\n"
rep("/* ---------------- boot ---------------- */",mods+"\n/* ---------------- boot ---------------- */")
rep("syncAuth();setStep(1);applyI18n();renderAvatar();","syncAuth();setStep(1);applyI18n();renderAvatar();checkReminders();")

# ---- i18n ----
t11=json.load(open(SRC+'i18n_all.json'))
rep("for(const k in T10)Object.assign(T[k],T10[k]);","for(const k in T10)Object.assign(T[k],T10[k]);\nconst T11="+json.dumps(t11,ensure_ascii=False,separators=(',',':'))+";\nfor(const k in T11)Object.assign(T[k],T11[k]);")

rep("const firstFit=state._fitFor!==p.en;state._fitFor=p.en;","const firstFit=false;state._fitFor=p.en;if(state._camFor!==p.en){state._camFor=p.en;MAP.focus(0,0)}")
# ---- css ----
rep("</style>",rd('social.css')+"\n</style>")
open(F,'w').write(s)
print('ok',len(s))
