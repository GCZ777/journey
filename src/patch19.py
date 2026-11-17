# patch19: UI review fixes (profile email, guides panel header, map label collision,
# home desktop layout, hero slider 2-up on desktop)
P='/home/claude/journey.html'
s=open(P).read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    assert c==n,(a[:70],c)
    s=s.replace(a,b)

# 3) profile "undefined" when the account has no email
rep('<small>${u?esc(u.email):t(','<small>${u?esc(u.email||\'\'):t(',2)

# 4) guides list: one header row, filters live in the filter sheet; extras move to the end
i=s.find('function listHTML(){');j=s.find('function bindList(el){',i)
body=s[i:j]
a=body.find('  let h=`<div class="panel-head">');b=body.find('</span></p>`;',a)+len('</span></p>`;')
new_head='''  const kc=fc+(F.kind!=='all');
  let h=`<div class="spp-h gl-h"><h2>${t('guides_near')}<span class="gl-n">${vis.length}</span></h2><button class="f-btn${kc?' on':''}" id="fBtn">${SVG(IC.filter)}${t('filters')}${kc?`<i>${kc}</i>`:''}</button></div>`;
  const act=[];if(F.kind!=='all')act.push(`<button class="f-btn on" id="fKindClr">${t('k_'+F.kind)}${SVG(IC.x,2.2,'xi')}</button>`);
  if(F.kind!=='general'&&F.di>=0)act.push(`<button class="f-btn on" id="fDiClr">${SVG(IC.mappinned)}${esc(dname(state.province,F.di))}${SVG(IC.x,2.2,'xi')}</button>`);
  if(act.length)h+=`<div class="gl-act">${act.join('')}</div>`;
  const tail=`<div class="gl-foot">${n?`<button class="lp-bar" id="lpOpen"><span class="lp-avs">${LP.items.slice(0,4).map(s=>`<span class="av" style="background:${s.color}">${s.initials}</span>`).join('')}</span><span class="lp-txt"><b>${t('lp_title')}</b><small>${t('lp_n',{n})}</small></span>${SVG(IC.chev,2,'chev')}</button>`:''}<button class="f-btn" id="editPrefs">${SVG(IC.user||IC.filter)}${t('edit_prefs')}</button><p class="radar-note">${SVG(IC.radar)}<span>${t('radar_note2')}</span></p></div>`;'''
body=body[:a]+new_head+body[b:]
assert body.count("</div>`;\n  return h;\n}")==0
body=body.replace("<button class=\"btn line\" id=\"fReset\">${t('f_clear')}</button></div>`;","<button class=\"btn line\" id=\"fReset\">${t('f_clear')}</button></div>`+tail;")
k=body.rfind('  return h;\n}');assert k>0
body=body[:k]+'  return h+tail;\n}'+body[k+len('  return h;\n}'):]
s=s[:i]+body+s[j:]
rep("  q('#kindSeg').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;F.kind=b.dataset.k;if(F.kind==='general')F.di=-1;state.listLim=30;refilter()};",
    "  q('#fKindClr')&&(q('#fKindClr').onclick=()=>{F.kind='all';state.listLim=30;refilter()});")

# 5) map: keep the "you" label off place cards
rep('route=null,hits=[],placeHits=[],','route=null,hits=[],placeHits=[],cardR=[],')
rep('placeHits=[];const cw0=W<500?112:132','placeHits=[];cardR=[];const cw0=W<500?112:132')
rep('const px=r[0],py=r[1],top=py-20-ih-lh-6,left=px-cw/2;','const px=r[0],py=r[1],top=py-20-ih-lh-6,left=px-cw/2;cardR.push([left-4,top-4,cw+8,ih+lh+30]);')
rep("      label(u[0],u[1]+28,t('you'),'#4f3192','#fff');",
"""      {const hit=y=>cardR.some(c=>u[0]+32>c[0]&&u[0]-32<c[0]+c[2]&&y+12>c[1]&&y-12<c[1]+c[3]);
       const ly=!hit(u[1]+28)?u[1]+28:!hit(u[1]-28)?u[1]-28:null;if(ly!==null)label(u[0],ly,t('you'),'#4f3192','#fff')}""")

# 8) hero slider: page by slide width (2-up on desktop)
rep("const w=tr.clientWidth||1;HA.i=Math.round(tr.scrollLeft/w);haDots()",
    "const c0=tr.children[0],w=c0?c0.getBoundingClientRect().width+(parseFloat(getComputedStyle(tr).columnGap)||0):1;HA.i=Math.min(Math.round(tr.scrollLeft/w),haMax());haDots()")
rep("function haGo(i,smooth=true){const tr=$('#haTrack');if(!tr)return;const n=tr.children.length;HA.i=(i+n)%n;",
    "function haMax(){const tr=$('#haTrack');if(!tr||!tr.children.length)return 0;const c0=tr.children[0],pv=Math.max(1,Math.round(tr.clientWidth/(c0.getBoundingClientRect().width||1)));return Math.max(0,tr.children.length-pv)}\nfunction haGo(i,smooth=true){const tr=$('#haTrack');if(!tr)return;const n=haMax()+1;HA.i=(i+n)%n;")
rep("function haDots(){$$('#haDots button').forEach((b,j)=>b.toggleAttribute('aria-current',j===HA.i))}",
    "function haDots(){const m=haMax();$$('#haDots button').forEach((b,j)=>{b.toggleAttribute('aria-current',j===HA.i);b.hidden=j>m})}\naddEventListener('resize',()=>{if($('#haTrack'))haDots()});")

CSS='''
/* ---- patch19: review fixes ---- */
.gl-h h2{display:flex;align-items:baseline;gap:8px}
.gl-n{font-size:13px;font-weight:600;color:var(--muted)}
.gl-act{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 10px}
.gl-foot{display:flex;flex-direction:column;align-items:stretch;gap:10px;padding:14px 0 6px}
.gl-foot #editPrefs{align-self:flex-start}
.gl-foot .radar-note{margin:0}
.gl-foot .lp-bar{margin:0}
@media (min-width:861px){
  .ha-track{gap:14px}
  .ha-slide{flex:0 0 calc(50% - 7px);min-height:190px}
  .ha-slide .gp-art{width:104px;height:104px}
  .ha-slide .gp-art i:nth-child(2){inset:16px}.ha-slide .gp-art i:nth-child(3){inset:30px}
  .ha-slide{grid-template-columns:minmax(0,1fr) 104px}
  .ds-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
  .ds-ph{aspect-ratio:16/10}
  #popGuides{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow:visible;margin-inline:0;padding:4px 0 14px}
  #popGuides .gcard{width:auto}
}
'''
rep('</style>',CSS+'</style>')
open(P,'w').write(s)
print('patch19 ok')
s=open(P).read()
assert s.count('u=provImgCache[p.en];return `<button class="ccard"')==1
s=s.replace('u=provImgCache[p.en];return `<button class="ccard"','u=provImgCache[p.en]||(typeof provCover===\'function\'?provCover(p.en):null);return `<button class="ccard"')
open(P,'w').write(s);print('patch19b ok')
