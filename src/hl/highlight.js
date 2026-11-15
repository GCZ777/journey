/* =====================================================================
   PROVINCE HIGHLIGHT (soft power): illustrated 3D province map, place
   stories, deep-time slider, routes → trip plans, geopark passport,
   and playable local treasures. Data lives in HL[prov] + HL_GEO[prov].
   ===================================================================== */
const HLI=__HLI__;
Object.assign(HA_IC,{bone:HLI.bone});
const hS=(k,w)=>SVG(HLI[k]||'',w||2);
const hT=o=>o?(o[state.lang]||(state.lang==='th'?o.th:o.en)||o.en||o.th):'';
const hName=p=>state.lang==='th'?p.th:p.en;
const HS={prov:null,f:'all',tab:'places',age:0,time:false,route:null,sel:null,z:1,x:0,y:0};
function hlStamps(){return store.get('hlStamp')||{}}
function hlStamp(prov,id){const s=hlStamps();s[prov]=s[prov]||{};s[prov][id]=Date.now();store.set('hlStamp',s)}
function hlHas(prov,id){return !!((hlStamps()[prov]||{})[id])}
function openHL(prov){HS.prov=prov||HS.prov||'Kalasin';HS.route=null;HS.sel=null;HS.age=0;HS.time=false;HS.z=1;HS.x=0;HS.y=0;show('hl')}

/* ----- geometry: oblique projection of real district outlines ----- */
const HL_TILT=.74,HL_DEP=26;
function hlProj(G){
  if(G._p)return G._p;
  let a=180,b=-180,c=90,d=-90;G.d.forEach(([,,rs])=>rs.forEach(r=>r.forEach(([x,y])=>{a=Math.min(a,x);b=Math.max(b,x);c=Math.min(c,y);d=Math.max(d,y)})));
  const k=Math.cos((c+d)/2*Math.PI/180),S=1000,P=40;
  const pr=(lon,lat)=>[(lon-a)*k*S+P,(d-lat)*S*HL_TILT+P];
  const W=(b-a)*k*S+P*2,H=(d-c)*S*HL_TILT+P*2+HL_DEP;
  return G._p={pr,W,H};
}
const hlPath=(rs,pr)=>rs.map(r=>'M'+r.map(([x,y])=>pr(x,y).map(v=>v.toFixed(1)).join(',')).join('L')+'Z').join('');
const HL_PAL=['#F7DCCB','#E8DEF8','#D9EFE1','#FBEAC0','#F7D6E0','#D8E7F8','#EFE3D2','#E2F1D6'];
function hlMapSVG(H,G){
  const {pr,W,H:Ht}=hlProj(G);
  const ds=G.d.map(([th,en,rs],i)=>{let cx=0,cy=0,n=0;rs[0].forEach(([x,y])=>{const q=pr(x,y);cx+=q[0];cy+=q[1];n++});return {th,en,path:hlPath(rs,pr),cx:cx/n,cy:cy/n,c:HL_PAL[(i*3)%HL_PAL.length]}});
  const lake=hlPath([G.lake],pr);
  const route=HS.route?H.routes.find(r=>r.id===HS.route):null;
  let rl='';if(route){route.days.forEach((ids,di)=>{const pts=ids.map(id=>H.places.find(p=>p.id===id)).filter(Boolean).map(p=>pr(p.lng,p.lat));rl+=`<path class="hl-rt${di?' d2':''}" d="M${pts.map(q=>q.map(v=>v.toFixed(1)).join(',')).join('L')}" style="--rc:${route.c}"/>`})}
  return `<svg class="hl-svg" viewBox="0 0 ${W.toFixed(0)} ${Ht.toFixed(0)}" aria-hidden="true">
   <defs><linearGradient id="hlSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C79A78"/><stop offset="1" stop-color="#8C6249"/></linearGradient>
   <pattern id="hlWave" width="28" height="12" patternUnits="userSpaceOnUse"><path d="M0 8q7-6 14 0t14 0" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/></pattern>
   <filter id="hlSh" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="#5A3A9E" flood-opacity=".22"/></filter></defs>
   <g filter="url(#hlSh)"><g transform="translate(0 ${HL_DEP})">${ds.map(x=>`<path d="${x.path}" fill="url(#hlSide)"/>`).join('')}</g>
   ${[...Array(5)].map((_,i)=>`<g transform="translate(0 ${(HL_DEP*(4-i)/5).toFixed(1)})" opacity=".55">${ds.map(x=>`<path d="${x.path}" fill="#A87C5E"/>`).join('')}</g>`).join('')}
   ${ds.map(x=>`<path class="hl-d" d="${x.path}" fill="${x.c}"/>`).join('')}</g>
   <path d="${lake}" fill="#9FCDEB" stroke="#79B2DB" stroke-width="2"/><path d="${lake}" fill="url(#hlWave)"/>
   ${ds.map(x=>`<text class="hl-dl" x="${x.cx.toFixed(0)}" y="${x.cy.toFixed(0)}" text-anchor="middle">${esc(state.lang==='th'?x.th:x.en)}</text>`).join('')}
   ${rl}</svg>`;
}
function hlPinsHTML(H,G){
  const {pr,W,H:Ht}=hlProj(G),route=HS.route?H.routes.find(r=>r.id===HS.route):null,order={};
  if(route){let n=1;route.days.flat().forEach(id=>{if(!order[id])order[id]=n++})}
  const w=$('#hlWorld'),pxW=((w&&w.offsetWidth)||360)*HS.z,pxH=pxW*Ht/W,R=38;
  const items=H.places.map(p=>{const [x,y]=pr(p.lng,p.lat);return {p,x:x/W*100,y:y/Ht*100,dim:(HS.f!=='all'&&HS.f!==p.t)||(route&&!order[p.id])||(HS.time&&HS.age>0&&!(p.age&&Math.abs(p.age-HS.age)<=8)),hit:HS.time&&HS.age>0&&p.age&&Math.abs(p.age-HS.age)<=8}});
  const cl=[];if(!route)items.filter(i=>!i.dim).sort((a,b)=>(b.p.star||0)-(a.p.star||0)).forEach(i=>{const c=cl.find(c=>Math.hypot((c.x-i.x)/100*pxW,(c.y-i.y)/100*pxH)<R);if(c)c.m.push(i);else cl.push({x:i.x,y:i.y,m:[i]})});
  const solo=new Set(),out=[];cl.forEach(c=>{if(c.m.length===1)solo.add(c.m[0].p.id);else{const lead=c.m[0].p,ty=H.types[lead.t];out.push(`<button class="hl-pin cl star" data-hcl="${c.x.toFixed(2)},${c.y.toFixed(2)}" style="left:${c.x.toFixed(2)}%;top:${c.y.toFixed(2)}%;--pc:${ty.c}" aria-label="${esc(hName(lead))} +${c.m.length-1}"><span class="hp-b"><span class="hp-n">${c.m.length}</span></span><span class="hp-l">${esc(hName(lead))} +${c.m.length-1}</span></button>`)}});
  items.forEach(({p,x,y,dim,hit})=>{if(!route&&!dim&&!solo.has(p.id))return;const ty=H.types[p.t];
    out.push(`<button class="hl-pin${p.star?' star':''}${dim?' dim':''}${hit?' hit':''}${HS.sel===p.id?' on':''}${hlHas(H.prov,p.id)?' got':''}" data-hp="${p.id}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;--pc:${ty.c};--pb:${ty.bg}" aria-label="${esc(hName(p))}"><span class="hp-b">${order[p.id]?`<b>${order[p.id]}</b>`:hS(ty.ic,2)}</span><span class="hp-l">${esc(hName(p))}</span></button>`)});
  return out.join('');
}
function hlFocus(pts,pad){const st=$('#hlStage'),w=$('#hlWorld');if(!st||!w||!pts.length)return;const ww=w.offsetWidth,wh=w.offsetHeight,sw=st.clientWidth,sh=st.clientHeight;
  let a=Math.min(...pts.map(p=>p[0])),b=Math.max(...pts.map(p=>p[0])),c=Math.min(...pts.map(p=>p[1])),d=Math.max(...pts.map(p=>p[1]));const bw=Math.max(.05,(b-a)/100)*ww,bh=Math.max(.05,(d-c)/100)*wh;
  HS.z=Math.max(1,Math.min(5,Math.min(sw/(bw+pad*2),sh/(bh+pad*2))));HS.x=sw/2-((a+b)/200)*ww*HS.z;HS.y=sh/2-((c+d)/200)*wh*HS.z;hlClamp();hlApplyView()}
function hlDefaultView(H,G){const st=$('#hlStage'),w=$('#hlWorld');if(!st||!w)return;const sw=st.clientWidth,sh=st.clientHeight,wh=w.offsetHeight;
  if(wh<sh*.92){const {pr,W,H:Ht}=hlProj(G),stars=H.places.filter(p=>p.star).map(p=>{const q=pr(p.lng,p.lat);return [q[0]/W*100,q[1]/Ht*100]});HS.z=HS.z0=Math.min(3,sh*.96/wh);const cx=stars.reduce((s,p)=>s+p[0],0)/stars.length;HS.x=sw/2-cx/100*w.offsetWidth*HS.z;HS.y=0;hlClamp();hlApplyView()}else{HS.z=HS.z0=1;hlClamp();hlApplyView()}}
/* ----- art for place cards (no borrowed photos): strata, falls, temple, silk ----- */
function hlArt(p,ty){
  const R=rng(hash(p.id)),c=ty.c,bg=ty.bg;let g='';
  if(p.t==='geo'){const cols=['#F3D2B8','#E8B48F','#D99A74','#C27E5C','#A9654A','#8C5040'];let y=60;cols.forEach((k,i)=>{const h=18+R()*16;g+=`<path d="M0 ${y}Q100 ${y-8-R()*10} 200 ${y+R()*6}T400 ${y-4}V${y+h+40}H0Z" fill="${k}"/>`;y+=h});
    g+=`<g transform="translate(${150+R()*60} ${100+R()*20}) rotate(${-20+R()*40})" fill="#FFF6EC" opacity=".9"><path d="M0 0c10-6 24-6 30 4 6-10 22-12 30-2l-6 6c-6-4-14-2-18 4h-12c-4-6-12-8-18-4z"/><rect x="18" y="-2" width="24" height="8" rx="3"/></g>`}
  else if(p.t==='nature'){g=`<rect width="400" height="220" fill="#CFEADF"/><path d="M0 220V120l70-50 60 30 80-70 70 40 120-40v190z" fill="#8CC7A9"/><path d="M0 220V160l90-30 80 20 100-40 130 30v80z" fill="#5FA785"/>${p.id.includes('tat')||p.id==='phali'?`<path d="M190 70c-6 40-2 90 10 150h24c-8-60-10-110-6-150z" fill="#E9F6FF"/><path d="M196 80c-2 40 2 90 10 140" stroke="#BFE3F7" stroke-width="3" fill="none"/>`:''}${p.id==='bridge'?`<rect y="150" width="400" height="70" fill="#9FCDEB"/><path d="M0 150h400" stroke="#fff" stroke-width="5"/>${[...Array(9)].map((_,i)=>`<rect x="${20+i*45}" y="150" width="5" height="26" fill="#fff"/>`).join('')}<circle cx="320" cy="70" r="26" fill="#FFD9A8"/>`:''}`}
  else if(p.t==='faith'){g=`<rect width="400" height="220" fill="#EFE7FB"/><circle cx="${120+R()*160}" cy="70" r="34" fill="#FFE6C2"/><path d="M200 40l14 40h-28zM170 80h60l12 30h-84zM150 110h100v70H150z" fill="#B49BE4"/><path d="M186 180v-40h28v40z" fill="#EFE7FB"/><path d="M0 190h400v30H0z" fill="#CDBDF0"/>`}
  else{let s='';for(let i=0;i<5;i++)for(let j=0;j<10;j++){const x=j*44-((i%2)*22),y=i*48;s+=`<path d="M${x+22} ${y}l22 24-22 24-22-24z" fill="${(i+j)%3?'#F5C04A':'#fff'}" opacity="${(i+j)%3?.9:.7}"/><path d="M${x+22} ${y+14}l10 10-10 10-10-10z" fill="#7A1F35"/>`}g=`<rect width="400" height="220" fill="#B23A55"/>${s}`}
  return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" class="hl-art" aria-hidden="true"><rect width="400" height="220" fill="${bg}"/>${g}<rect width="400" height="220" fill="url(#hlArtFade)"/></svg>`;
}

/* ----- screen ----- */
function renderHL(){
  const el=$('#hlBody');if(!el)return;const H=HL[HS.prov||'Kalasin'],G=HL_GEO[H.prov],P=PROV.find(p=>p.en===H.prov);
  const got=Object.keys(hlStamps()[H.prov]||{}).length;
  el.innerHTML=`<header class="hl-top"><button class="icon-btn" data-go="home" aria-label="${esc(t('hl_back'))}">${hS('chevl',2)}</button><div class="hl-tt"><small>${esc(t('hl_kicker'))} · ${esc(pname(P))}</small><b>${esc(hT(H.brand))}</b></div><button class="hl-passbtn" id="hlPassBtn" aria-label="${esc(t('hl_pass_t'))}">${hS('stamp',2)}<span>${got}/${H.places.length}</span></button></header>
  <section class="hl-hero"><h1>${esc(hT(H.tag))}</h1><p>${esc(hT(H.lead))}</p><div class="hl-stats">${H.stats.map(([n,l])=>`<span><b>${esc(String(n))}</b><small>${esc(hT(l))}</small></span>`).join('')}</div></section>
  <section class="hl-mapcard"><div class="hl-chips" id="hlChips">${[['all',t('hl_all'),'map',H.accent]].concat(Object.entries(H.types).map(([k,v])=>[k,hT(v),v.ic,v.c])).map(([k,l,ic,c])=>`<button data-hf="${k}" aria-pressed="${HS.f===k}" style="--cc:${c}">${hS(ic,2)}${esc(l)}</button>`).join('')}</div>
   <div class="hl-stage${HS.time?' time':''}" id="hlStage" style="--age:${(HS.age/150).toFixed(3)}"><div class="hl-world" id="hlWorld" style="aspect-ratio:${(hlProj(G).W/hlProj(G).H).toFixed(4)}">${hlMapSVG(H,G)}<div class="hl-pins" id="hlPins">${hlPinsHTML(H,G)}</div></div>
    <div class="hl-ctl"><button id="hlZin" aria-label="Zoom in">${hS('zin',2)}</button><button id="hlZout" aria-label="Zoom out">${hS('zout',2)}</button><button id="hlFit" aria-label="Fit">${hS('fit',2)}</button></div>
    <button class="hl-timebtn${HS.time?' on':''}" id="hlTimeBtn">${hS('history',2)}<span>${esc(t('hl_time'))}</span></button>
   </div>
   ${HS.time?hlTimePanel(H):''}
   <a class="hl-360" href="${H.tour360}" target="_blank" rel="noopener">${hS('r3d',2)}<span>${esc(t('hl_360_all'))}</span>${hS('ext',2)}</a></section>
  <div class="hl-tabs" role="tablist">${[['places',t('hl_tab_places')],['routes',t('hl_tab_routes')],['soft',t('hl_tab_soft')],['pass',t('hl_tab_pass')]].map(([k,l])=>`<button role="tab" data-ht="${k}" aria-selected="${HS.tab===k}">${esc(l)}</button>`).join('')}</div>
  <div class="hl-pane" id="hlPane">${hlPane(H)}</div>
  <footer class="hl-foot"><a href="${H.site}" target="_blank" rel="noopener">${hS('ext',2)}${esc(t('hl_official'))} · ${esc(hT(H.brand))}</a><small>${esc(t('hl_src'))}</small></footer>
  <svg width="0" height="0" style="position:absolute"><defs><linearGradient id="hlArtFade" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient></defs></svg>`;
  hlBind(H,G);
}
function hlTimePanel(H){
  const e=[...H.eras].reverse().find(x=>HS.age>=x[0]-4)||H.eras[0];
  const hits=H.places.filter(p=>p.age&&Math.abs(p.age-HS.age)<=8);
  return `<div class="hl-time"><div class="ht-h"><b>${HS.age?esc(t('hl_mya',{n:HS.age})):esc(t('hl_now'))}</b><span>${esc(hT(e[1]))}</span></div>
   <input type="range" id="hlAge" min="0" max="150" step="1" value="${HS.age}" aria-label="${esc(t('hl_time'))}">
   <div class="ht-ticks"><span>${esc(t('hl_now'))}</span><span>66</span><span>100</span><span>150</span></div>
   <p>${esc(hT(e[2]))}</p>${hits.length?`<div class="ht-hits"><small>${esc(t('hl_era_hits'))}</small>${hits.map(p=>`<button data-hp="${p.id}">${esc(hName(p))}</button>`).join('')}</div>`:''}</div>`;
}
function hlPane(H){
  if(HS.tab==='places')return `<div class="hl-list">${H.places.filter(p=>HS.f==='all'||p.t===HS.f).sort((a,b)=>(b.star||0)-(a.star||0)).map(p=>{const ty=H.types[p.t];return `<button class="hl-row" data-hp="${p.id}"><span class="hr-art">${hlArt(p,ty)}</span><span class="hr-t"><small style="color:${ty.c}">${esc(hT(ty))}</small><b>${esc(hName(p))}</b><span>${esc(hT(p.s)).slice(0,88)}…</span></span>${hlHas(H.prov,p.id)?`<i class="hr-got">${hS('stamp',2)}</i>`:''}</button>`}).join('')}</div>`;
  if(HS.tab==='routes')return `<div class="hl-routes">${H.routes.map(r=>{const ps=r.days.flat().map(id=>H.places.find(p=>p.id===id)).filter(Boolean);let km=0;for(let i=1;i<ps.length;i++)km+=distKm(ps[i-1],ps[i])*1.3;
    return `<article class="hl-rc${HS.route===r.id?' on':''}" style="--rc:${r.c}"><div class="rc-h"><b>${esc(hName(r))}</b><small>${esc(t('hl_stops',{n:ps.length}))} · ${esc(t('hl_km',{n:Math.round(km)}))}${r.days.length>1?' · '+esc(t('hl_days',{n:r.days.length})):''}</small></div><p>${esc(hT(r.sub))}</p>
     <ol>${r.days.map((d,di)=>`${r.days.length>1?`<li class="rc-day">${esc(t('hl_day',{n:di+1}))}</li>`:''}${d.map(id=>{const p=H.places.find(x=>x.id===id);return `<li><button data-hp="${id}">${esc(hName(p))}</button></li>`}).join('')}`).join('')}</ol>
     <div class="rc-a"><button class="btn line sm" data-hrs="${r.id}">${hS('route',2)}${esc(t('hl_show_map'))}</button><button class="btn primary sm" data-hru="${r.id}">${hS('plus',2.2)}${esc(t('hl_use_route'))}</button></div></article>`}).join('')}</div>`;
  if(HS.tab==='soft')return `<div class="hl-soft">${H.soft.map(s=>`<article class="hl-sc" style="--sc:${s.c}"><div class="sc-h"><span class="sc-ic">${hS(s.ic,2)}</span><b>${esc(hName(s))}</b></div><p>${esc(hT(s.s))}</p>${s.id==='dino'?hlSize():s.id==='silk'?`<div class="hl-weave" id="hlWeave" role="button" tabindex="0" aria-label="${esc(t('hl_weave'))}">${hlWeave(1)}</div><small class="sc-hint">${esc(t('hl_weave'))}</small>`:s.id==='ponglang'?hlPongLang():''}</article>`).join('')}</div>`;
  const got=hlStamps()[H.prov]||{},n=Object.keys(got).length,lv=n>=H.places.length?3:n>=10?2:n>=5?1:0;
  return `<div class="hl-pass"><div class="ps-h"><div class="ps-ring" style="--p:${(n/H.places.length*100).toFixed(1)}"><b>${n}</b><small>/${H.places.length}</small></div><div><b>${esc(t('hl_pass_t'))}</b><p>${esc(t('hl_pass_s'))}</p><div class="ps-lv">${['hl_lv1','hl_lv2','hl_lv3'].map((k,i)=>`<span class="${lv>i?'on':''}">${hS('award',2)}${esc(t(k))}<small>${[5,10,H.places.length][i]}</small></span>`).join('')}</div></div></div>
   <div class="ps-grid">${H.places.map(p=>{const ty=H.types[p.t];return `<button class="ps-st${got[p.id]?' got':''}" data-hp="${p.id}" style="--pc:${ty.c}"><span class="ps-c">${hS(ty.ic,1.8)}</span><small>${esc(hName(p))}</small></button>`}).join('')}</div></div>`;
}
function hlSize(){return `<div class="hl-size"><b>${esc(t('hl_size_t'))}</b><svg viewBox="0 0 320 140" aria-hidden="true"><line x1="0" y1="130" x2="320" y2="130" stroke="#E2D6C8" stroke-width="2"/>
  <g fill="#7A68D4"><circle cx="70" cy="22" r="10"/><rect x="60" y="34" width="20" height="50" rx="9"/><rect x="61" y="80" width="8" height="50" rx="4"/><rect x="71" y="80" width="8" height="50" rx="4"/></g><text x="70" y="12" text-anchor="middle" class="sz-t">${esc(t('hl_you'))} 170</text>
  <g fill="#C8643B" transform="translate(150 84)"><ellipse cx="40" cy="12" rx="26" ry="12"/><path d="M60 8q18-6 28-26l6 4q-8 22-28 30z"/><circle cx="94" cy="-20" r="6"/><path d="M14 12q-30-2-50 10q22 4 50-2z"/><rect x="32" y="20" width="5" height="26" rx="2"/><rect x="44" y="20" width="5" height="26" rx="2"/></g><text x="200" y="56" text-anchor="middle" class="sz-t">Minimocursor ~60</text></svg><small>${esc(t('hl_size_s'))}</small></div>`}
function hlWeave(seed){const R=rng(seed*7919),pal=[['#B23A55','#F5C04A','#fff','#2E2650'],['#7A1F35','#E9B949','#F7E6C4','#1F6B5A'],['#8C2346','#F2A541','#fff','#3B3F8F']][seed%3],cell=[...Array(5)].map(()=>[...Array(5)].map(()=>Math.floor(R()*4)));
  let s='';for(let i=0;i<9;i++)for(let j=0;j<9;j++){const a=Math.abs(4-i),b=Math.abs(4-j),v=cell[Math.min(a,4)][Math.min(b,4)];if(v===0)continue;s+=`<rect x="${j*12}" y="${i*12}" width="12" height="12" fill="${pal[v]}" transform="rotate(45 ${j*12+6} ${i*12+6})" opacity=".95"/>`}
  return `<svg viewBox="-8 -8 124 124" aria-hidden="true"><rect x="-8" y="-8" width="124" height="124" fill="${pal[0]}"/>${s}</svg><svg viewBox="-8 -8 124 124" aria-hidden="true"><rect x="-8" y="-8" width="124" height="124" fill="${pal[0]}"/>${s}</svg><svg viewBox="-8 -8 124 124" aria-hidden="true"><rect x="-8" y="-8" width="124" height="124" fill="${pal[0]}"/>${s}</svg>`}
const HL_NOTES=[261.63,293.66,329.63,392,440,523.25,587.33,659.25,783.99,880,1046.5,1174.66];
function hlPongLang(){return `<div class="hl-pl" id="hlPL">${HL_NOTES.map((f,i)=>`<button data-pl="${i}" style="--h:${100-i*4.2}%" aria-label="${i+1}"></button>`).join('')}</div><button class="btn line sm" id="hlPlay">${hS('music',2)}${esc(t('hl_play'))}</button>`}
let HL_AC=null;
function hlTone(i){try{HL_AC=HL_AC||new (window.AudioContext||window.webkitAudioContext)();const ac=HL_AC,f=HL_NOTES[i],t0=ac.currentTime,g=ac.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.5,t0+.005);g.gain.exponentialRampToValueAtTime(.0001,t0+.7);g.connect(ac.destination);
  [[f,'sine',1],[f*2.76,'sine',.35],[f*5.4,'triangle',.08]].forEach(([fr,ty,a])=>{const o=ac.createOscillator(),gg=ac.createGain();o.type=ty;o.frequency.value=fr;gg.gain.value=a;o.connect(gg);gg.connect(g);o.start(t0);o.stop(t0+.75)});
  const b=$(`[data-pl="${i}"]`);if(b){b.classList.remove('hit');void b.offsetWidth;b.classList.add('hit')}}catch(e){}}
function hlSay(p){if(!('speechSynthesis' in window)){toast(t('hl_no_tts'));return}if(speechSynthesis.speaking){speechSynthesis.cancel();return}const u=new SpeechSynthesisUtterance(hName(p)+'. '+hT(p.s));u.lang=state.lang==='th'?'th-TH':'en-US';speechSynthesis.speak(u)}

/* ----- place sheet ----- */
function hlOpenPlace(H,id){
  const p=H.places.find(x=>x.id===id);if(!p)return;HS.sel=id;const ty=H.types[p.t],has=hlHas(H.prov,id);
  const pins=$('#hlPins');if(pins)$$('.hl-pin',pins).forEach(b=>b.classList.toggle('on',b.dataset.hp===id));
  openSheet(hName(p),`<div class="hl-ps"><div class="ps-art">${hlArt(p,ty)}<span class="ps-type" style="--pc:${ty.c}">${hS(ty.ic,2)}${esc(hT(ty))}</span>${has?`<span class="ps-got">${hS('stamp',2)}${esc(t('hl_stamped'))}</span>`:''}</div>
   <div class="ps-meta">${p.d?`<span>${hS('pin',2)}${esc(t('hl_dist',{d:hT(p.d)}))}</span>`:''}${p.approx?`<span class="ap">${hS('info',2)}${esc(t('hl_approx'))}</span>`:''}${p.age?`<span>${hS('history',2)}${esc(t('hl_mya',{n:p.age}))}</span>`:''}</div>
   <p class="ps-s">${esc(hT(p.s))}</p>${p.f?`<ul class="ps-f">${p.f.map(x=>`<li>${esc(hT(x))}</li>`).join('')}</ul>`:''}${p.tip?`<p class="ps-tip">${hS('spark',2)}${esc(hT(p.tip))}</p>`:''}
   <div class="ps-a"><a class="btn primary" href="https://kalasin-geopark.com/360/${p.v}" target="_blank" rel="noopener">${hS('r3d',2)}${esc(t('hl_360'))}</a><button class="btn line" id="psAdd">${hS('plus',2.2)}${esc(t('hl_add'))}</button>
    <button class="btn line" id="psGuides">${hS('users',2)}${esc(t('hl_guides'))}</button><a class="btn line" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" rel="noopener">${hS('nav',2)}${esc(t('hl_nav'))}</a>
    <button class="btn line" id="psSay">${hS('vol',2)}${esc(t('hl_listen'))}</button><button class="btn line${has?' done':''}" id="psCheck"${has?' disabled':''}>${hS('stamp',2)}${esc(has?t('hl_stamped'):t('hl_checkin'))}</button></div></div>`,b=>{
    $('#psAdd',b).onclick=()=>hlAddSheet(H,[[id]],hName(p));
    $('#psGuides',b).onclick=()=>{closeSheet();const pr=PROV.find(x=>x.en===H.prov),dl=DIST[H.prov]||[],di=p.d?dl.findIndex(([th])=>th===p.d.th.split('–')[0]):-1;state.province=pr;F.kind='local';F.di=di;state.listLim=30;goMap()};
    $('#psSay',b).onclick=()=>hlSay(p);
    const ck=$('#psCheck',b);ck.onclick=()=>{if(!navigator.geolocation){toast(t('hl_loc_off'));return}ck.disabled=true;navigator.geolocation.getCurrentPosition(pos=>{const km=distKm({lat:pos.coords.latitude,lng:pos.coords.longitude},p);if(km<=(p.approx?8:2)){hlStamp(H.prov,id);toast(t('hl_stamped'));closeSheet();renderHL()}else{ck.disabled=false;toast(t('hl_far',{km:km<10?km.toFixed(1):Math.round(km)}))}},()=>{ck.disabled=false;toast(t('hl_loc_off'))},{enableHighAccuracy:true,timeout:9000,maximumAge:60000})};
  });
}
function hlStopsFor(H,days){return days.map(ids=>({start:'08:30',stops:ids.map(id=>{const p=H.places.find(x=>x.id===id);const s=mkStop('see',null,'me',hName(p));s.lat=p.lat;s.lng=p.lng;s.hl=H.prov+':'+id;return s})}))}
function hlAddSheet(H,days,label){
  const mine=PLANS.filter(p=>p.prov===H.prov),P=PROV.find(x=>x.en===H.prov);
  const make=()=>{const ds=hlStopsFor(H,days);const pl={id:'pl'+uid(),name:days.length>1||days[0].length>1?label:t('pl_default',{p:pname(P)}),prov:H.prov,start:isoDay(7),days:ds,members:['me'],log:[{by:'me',at:Date.now(),k:'lg_create'}],at:Date.now()};PLANS.push(pl);plSave();closeSheet();toast(t('hl_added',{p:pl.name}));openPlan(pl.id)};
  if(!mine.length||days.length>1||days[0].length>1){make();return}
  openSheet(t('hl_add'),`<div class="acc-list">${mine.map(p=>`<button class="acc-row hl-pick" data-pl="${p.id}"><span class="acc-main"><span><b>${esc(p.name)}</b><small>${esc(t('hl_days',{n:p.days.length}))}</small></span></span>${hS('plus',2.2)}</button>`).join('')}</div><button class="btn primary block" id="hlNewPl">${hS('plus',2.2)}${esc(t('hl_new_plan',{p:pname(P)}))}</button>`,b=>{
    $$('[data-pl]',b).forEach(x=>x.onclick=()=>{const pl=PLANS.find(q=>q.id===x.dataset.pl);const d=pl.days[pl.days.length-1];d.stops.push(...hlStopsFor(H,days)[0].stops);pl.log.push({by:'me',at:Date.now(),k:'lg_add',v:{s:label}});plSave();closeSheet();toast(t('hl_added',{p:pl.name}))});
    $('#hlNewPl',b).onclick=make});
}

/* ----- interactions: filters, tabs, pan/zoom, time slider ----- */
let HL_ZB=0;
function hlApplyView(){const w=$('#hlWorld');if(!w)return;const zb=Math.round(Math.log(HS.z)/Math.log(1.3));if(zb!==HL_ZB){HL_ZB=zb;const pins=$('#hlPins'),H=HL[HS.prov];if(pins&&H)pins.innerHTML=hlPinsHTML(H,HL_GEO[H.prov])}w.style.transform=`translate(${HS.x}px,${HS.y}px) scale(${HS.z})`;w.style.setProperty('--s',HS.z);const st=$('#hlStage');if(st){st.classList.toggle('zoomed',HS.z>=(HS.z0||1)*1.5);st.classList.toggle('wide',st.clientWidth>=760);st.classList.toggle('route',!!HS.route)}}
function hlZoom(f,cx,cy){const st=$('#hlStage');if(!st)return;const r=st.getBoundingClientRect();cx=cx??r.width/2;cy=cy??r.height/2;const z=Math.min(5,Math.max(1,HS.z*f));const k=z/HS.z;HS.x=cx-(cx-HS.x)*k;HS.y=cy-(cy-HS.y)*k;HS.z=z;hlClamp();hlApplyView()}
function hlClamp(){const st=$('#hlStage'),w=$('#hlWorld');if(!st||!w)return;const sw=st.clientWidth,sh=st.clientHeight,ww=w.offsetWidth*HS.z,wh=w.offsetHeight*HS.z;const minX=Math.min(0,sw-ww),minY=Math.min(0,sh-wh);if(HS.z===1){HS.x=0;HS.y=Math.max(0,(sh-wh)/2)}else{HS.x=Math.min(0,Math.max(minX,HS.x));HS.y=Math.min(Math.max(0,(sh-wh)/2),Math.max(minY,HS.y))}}
function hlRefreshMap(H,G){const w=$('#hlWorld');if(!w)return;w.innerHTML=hlMapSVG(H,G)+`<div class="hl-pins" id="hlPins">${hlPinsHTML(H,G)}</div>`}
function hlBind(H,G){
  const el=$('#hlBody'),st=$('#hlStage');
  requestAnimationFrame(()=>{HL_ZB=-99;if(HS.route){const r=H.routes.find(x=>x.id===HS.route),{pr,W,H:Ht}=hlProj(G);hlFocus(r.days.flat().map(id=>{const p=H.places.find(x=>x.id===id),q=pr(p.lng,p.lat);return [q[0]/W*100,q[1]/Ht*100]}),28)}else if(HS.z===1)hlDefaultView(H,G);else{hlClamp();hlApplyView()}});
  $('#hlPassBtn').onclick=()=>{HS.tab='pass';renderHL();$('#hlPane').scrollIntoView({behavior:'smooth',block:'start'})};
  $('#hlChips').onclick=e=>{const b=e.target.closest('[data-hf]');if(!b)return;HS.f=b.dataset.hf;HS.route=null;$$('#hlChips [data-hf]').forEach(x=>x.setAttribute('aria-pressed',x===b));hlRefreshMap(H,G);if(HS.tab==='places')$('#hlPane').innerHTML=hlPane(H)};
  $('#hlZin').onclick=()=>hlZoom(1.4);$('#hlZout').onclick=()=>hlZoom(1/1.4);$('#hlFit').onclick=()=>hlDefaultView(H,G);
  $('#hlTimeBtn').onclick=()=>{HS.time=!HS.time;if(!HS.time)HS.age=0;else if(!HS.age)HS.age=150;renderHL()};
  const ag=$('#hlAge');if(ag)ag.oninput=e=>{HS.age=+e.target.value;st.style.setProperty('--age',(HS.age/150).toFixed(3));const tp=$('.hl-time');tp.outerHTML=hlTimePanel(H);hlRefreshMap(H,G);const a2=$('#hlAge');a2.oninput=ag.oninput;a2.focus()};
  el.onclick=e=>{const c=e.target.closest('[data-hcl]');if(c&&!st._dragged){const [x,y]=c.dataset.hcl.split(',').map(Number),w=$('#hlWorld');hlZoom(2.2,HS.x+x/100*w.offsetWidth*HS.z,HS.y+y/100*w.offsetHeight*HS.z);return}
    const p=e.target.closest('[data-hp]');if(p&&!st._dragged){hlOpenPlace(H,p.dataset.hp);return}
    const tb=e.target.closest('[data-ht]');if(tb){HS.tab=tb.dataset.ht;$$('[data-ht]',el).forEach(x=>x.setAttribute('aria-selected',x===tb));$('#hlPane').innerHTML=hlPane(H);hlBindPane(H);return}
    const rs=e.target.closest('[data-hrs]');if(rs){HS.route=HS.route===rs.dataset.hrs?null:rs.dataset.hrs;HS.f='all';hlRefreshMap(H,G);$('#hlPane').innerHTML=hlPane(H);hlBindPane(H);st.scrollIntoView({behavior:'smooth',block:'center'});HL_ZB=-99;if(HS.route){const r=H.routes.find(x=>x.id===HS.route),{pr,W,H:Ht}=hlProj(G);hlFocus(r.days.flat().map(id=>{const p=H.places.find(x=>x.id===id),q=pr(p.lng,p.lat);return [q[0]/W*100,q[1]/Ht*100]}),28)}else hlDefaultView(H,G);return}
    const ru=e.target.closest('[data-hru]');if(ru){const r=H.routes.find(x=>x.id===ru.dataset.hru);hlAddSheet(H,r.days,hName(r));return}};
  // drag + pinch + wheel
  const pts=new Map();let last=null,d0=0,z0=1;
  st.addEventListener('pointerdown',e=>{if(e.target.closest('.hl-ctl,.hl-timebtn,.hl-time'))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});st._dragged=false;last={x:e.clientX,y:e.clientY};if(pts.size===2){const [a,b]=[...pts.values()];d0=Math.hypot(a.x-b.x,a.y-b.y);z0=HS.z}});
  st.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y),r=st.getBoundingClientRect();hlZoom(z0*d/d0/HS.z,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);st._dragged=true;return}
    if(HS.z>1&&last){const dx=e.clientX-last.x,dy=e.clientY-last.y;if(Math.abs(dx)+Math.abs(dy)>3){st._dragged=true;st.setPointerCapture&&st.setPointerCapture(e.pointerId)}HS.x+=dx;HS.y+=dy;last={x:e.clientX,y:e.clientY};hlClamp();hlApplyView()}});
  const up=e=>{pts.delete(e.pointerId);if(!pts.size){last=null;setTimeout(()=>{st._dragged=false},30)}};st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);
  st.addEventListener('wheel',e=>{if(!e.ctrlKey&&Math.abs(e.deltaY)<Math.abs(e.deltaX))return;e.preventDefault();const r=st.getBoundingClientRect();hlZoom(e.deltaY<0?1.15:1/1.15,e.clientX-r.left,e.clientY-r.top)},{passive:false});
  st.addEventListener('dblclick',e=>{if(e.target.closest('.hl-pin,.hl-ctl,.hl-time,.hl-timebtn'))return;const r=st.getBoundingClientRect();hlZoom(1.8,e.clientX-r.left,e.clientY-r.top)});
  hlBindPane(H);
}
function hlBindPane(H){
  const w=$('#hlWeave');if(w){let n=1;const go=()=>{n++;w.innerHTML=hlWeave(n)};w.onclick=go;w.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}}
  const pl=$('#hlPL');if(pl){pl.onpointerdown=e=>{const b=e.target.closest('[data-pl]');if(b)hlTone(+b.dataset.pl)};pl.onkeydown=e=>{const b=e.target.closest('[data-pl]');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();hlTone(+b.dataset.pl)}};
    $('#hlPlay').onclick=()=>{const tune=[4,5,7,5,4,2,4,5,4,2,1,2,4,7,8,7,5,4,5,4];tune.forEach((n,i)=>setTimeout(()=>hlTone(n),i*260))}}
}
