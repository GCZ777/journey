/* =====================================================================
   SPOTS: attractions with photos for all 77 provinces, shown on the map
   (photo pins + swipeable cards) and on the province picker. Data:
   SPOT_DATA[prov] (coords + Wikimedia photo) and SOFT[prov] (character).
   ===================================================================== */
const SPI=__SPI__;
const sS=(k,w)=>SVG(SPI[k]||'',w||2);
const cimg=(f,w)=>f?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(f.replace(/ /g,'_'))+'?width='+(w||640):null;
const SK={geo:{c:'#C8643B',bg:'#FCE7DA',ic:'bone'},temple:{c:'#8352C8',bg:'#EFE7FB',ic:'temple'},nature:{c:'#2F8F6F',bg:'#DDF2E8',ic:'mountain'},dive:{c:'#1C8FA6',bg:'#DDF1F6',ic:'waves'},photo:{c:'#2F7FC1',bg:'#E1EDF8',ic:'camera'},food:{c:'#D9603F',bg:'#FCE6DE',ic:'utensils'},night:{c:'#3B3F8F',bg:'#E4E5F6',ic:'moon'},culture:{c:'#B23A55',bg:'#FBE3EA',ic:'silk'}};
const skOf=k=>SK[k]||SK.photo;
/* make every province's spots available to the existing place machinery */
(function(){for(const pv in SPOT_DATA){PLACES[pv]=SPOT_DATA[pv].map(s=>[s.th,s.en,s.k,s.we||'']);
  SPOT_DATA[pv].forEach((s,i)=>{const key=pv+':p'+i,c=placeCache[key]||{};if(s.ll||s.img)placeCache[key]={lat:s.ll?s.ll[0]:c.lat??null,lng:s.ll?s.ll[1]:c.lng??null,img:s.img?cimg(s.img,480):c.img||null}})}})();
function spotsOf(prov){const D=SPOT_DATA[prov]||[];return D.map((s,i)=>{const c=placeCache[prov+':p'+i]||{};return Object.assign({},s,{i,id:'p'+i,prov,lat:c.lat,lng:c.lng,photo:s.img?cimg(s.img,640):c.img||null})})}
const spName=s=>state.lang==='th'?s.th:s.en;
const spT=o=>o?(o[state.lang]||(state.lang==='th'?o.th:o.en)):'';
function spStamps(){return store.get('spotStamp')||{}}
function spHas(prov,id){return !!((spStamps()[prov]||{})[id])}
function spArt(s){const k=skOf(s.k);return `<span class="sp-art" style="--c:${k.c};--b:${k.bg}">${sS(k.ic,1.6)}</span>`}
function spImg(s,cls){return s.photo?`<img class="${cls||''}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="${esc(s.photo)}" onerror="this.remove()">`:''}

/* ----- map: one bottom panel with two tabs (places | guides) ----- */
state.layer=state.layer||'spots';state.spotK='all';state.spotSel=null;
let setLayerOnEnter=null;
const spFrom=()=>state.me&&state.province&&distKm(state.me,state.province)<80?state.me:null;
function spMeta(s){const me=spFrom();if(me&&s.lat!=null){const d=distKm(me,{lat:s.lat,lng:s.lng});return t('sp_km',{n:d<10?d.toFixed(1):Math.round(d)})}if(s.d)return t('sp_ampoe',{d:spT(s.d)});if(s.lat==null)return t('sp_noloc');const d=distKm(state.province,{lat:s.lat,lng:s.lng});return d<1.5?t('sp_incity'):t('sp_fromcity',{n:Math.round(d)})}
function renderPnTabs(){const el=$('#pnTabs');if(!el||!state.province)return;const n=spotsOf(state.province.en).length,g=state.guides.filter(x=>x.visible&&x.fit).length;
  el.innerHTML=[['spots',t('mm_spots'),n,'camera'],['guides',t('mm_guides'),g,'guide']].map(([k,l,c,ic])=>`<button data-ly="${k}" role="tab" aria-selected="${state.layer===k}">${sS(ic,2)}<span>${esc(l)}</span><i>${c}</i></button>`).join('')}
function setLayer(l){state.layer=l;document.body.classList.toggle('spots-on',l==='spots');if(l!=='spots')state.spotSel=null;
  renderPnTabs();renderPanel();placeSig='';refreshPlaces()}
function spotsPanelHTML(){
  const p=state.province,all=spotsOf(p.en),kinds=[...new Set(all.map(s=>s.k))];if(!kinds.includes(state.spotK))state.spotK='all';
  const L=all.filter(s=>state.spotK==='all'||s.k===state.spotK);
  return `<div class="spp-h"><h2>${esc(t('sp_title',{p:pname(p)}))}</h2>${kinds.length>1?`<button class="f-btn${state.spotK!=='all'?' on':''}" id="spFilt">${SVG(IC.filter)}${esc(state.spotK==='all'?t('filters'):t('sk_'+state.spotK))}</button>`:''}</div>
   <div class="spl" id="spl">${L.map(s=>{const k=skOf(s.k);return `<button class="spc${state.spotSel===s.id?' on':''}" data-sp="${s.id}"><span class="spc-ph" style="--c:${k.c};--b:${k.bg}">${spArt(s)}${spImg(s)}${spHas(p.en,s.id)?`<i class="spc-got">${sS('stamp',2)}</i>`:''}</span><span class="spc-tx"><small style="color:${k.c}">${esc(t('sk_'+s.k))}</small><b>${esc(spName(s))}</b><span>${esc(spMeta(s))}</span></span></button>`}).join('')}</div>`;
}
function bindSpotsPanel(el){
  const sp=$('#spl',el);let to;
  sp.onscroll=()=>{if(!spHorizontal())return;clearTimeout(to);to=setTimeout(()=>{const r=sp.getBoundingClientRect(),cx=r.left+r.width/2;let best=null,bd=1e9;$$('.spc',sp).forEach(c=>{const b=c.getBoundingClientRect(),d=Math.abs(b.left+b.width/2-cx);if(d<bd){bd=d;best=c}});if(best&&best.dataset.sp!==state.spotSel)spotFocus(best.dataset.sp,false)},160)};
  const fb=$('#spFilt',el);fb&&(fb.onclick=()=>{const kinds=['all',...new Set(spotsOf(state.province.en).map(s=>s.k))];
    openSheet(t('filters'),`<div class="spk-list">${kinds.map(k=>`<button data-spk="${k}" aria-pressed="${state.spotK===k}">${k==='all'?sS('map',2):sS(skOf(k).ic,2)}<span>${esc(k==='all'?t('sp_all'):t('sk_'+k))}</span><i>${k==='all'?spotsOf(state.province.en).length:spotsOf(state.province.en).filter(s=>s.k===k).length}</i></button>`).join('')}</div>`,b=>$$('[data-spk]',b).forEach(x=>x.onclick=()=>{state.spotK=x.dataset.spk;state.spotSel=null;closeSheet();renderPanel();placeSig='';refreshPlaces()}))});
  if(state.spotSel){const c=$(`.spc[data-sp="${state.spotSel}"]`,sp);if(c){if(spHorizontal())sp.scrollLeft=c.offsetLeft-(sp.clientWidth-c.offsetWidth)/2;else c.scrollIntoView({block:'nearest'})}}
}
const spHorizontal=()=>{const sp=$('#spl');return sp&&getComputedStyle(sp).flexDirection==='row'};
function spotFocus(id,scroll){
  state.spotSel=id;$$('#spl .spc').forEach(c=>c.classList.toggle('on',c.dataset.sp===id));
  if(scroll){const sp=$('#spl'),c=sp&&$(`.spc[data-sp="${id}"]`,sp);if(c){if(spHorizontal())sp.scrollTo({left:c.offsetLeft-(sp.clientWidth-c.offsetWidth)/2,behavior:'smooth'});else c.scrollIntoView({block:'nearest',behavior:'smooth'})}}
  placeSig='';refreshPlaces();const pc=(window.PLACE_LIST||[]).find(x=>x.id===id);if(pc&&MAP.focus)MAP.focus(pc.x,pc.y);
}
function spotPick(id){if(state.layer!=='spots')setLayer('spots');spotFocus(id,true);spotOpen(state.province.en,id)}

/* ----- detail sheet ----- */
const SPX=(()=>{try{return JSON.parse(localStorage.getItem('jy_spx'))||{}}catch(e){return {}}})();
async function spExtract(s){
  const want=state.lang==='th'&&s.wt?['th',s.wt]:s.we?['en',s.we]:s.wt?['th',s.wt]:null;if(!want)return '';
  const key=want.join(':');if(key in SPX)return SPX[key];
  try{const r=await fetch(`https://${want[0]}.wikipedia.org/api/rest_v1/page/summary/`+encodeURIComponent(want[1].replace(/ /g,'_')));const j=r.ok?await r.json():{};const x=(j.type==='disambiguation'?'':(j.extract||'')).trim();SPX[key]=x;try{localStorage.setItem('jy_spx',JSON.stringify(SPX))}catch(e){}return x}catch(e){return ''}
}
function spotOpen(prov,id){
  const s=spotsOf(prov).find(x=>x.id===id);if(!s)return;const k=skOf(s.k),has=spHas(prov,id),P=PROV.find(x=>x.en===prov);
  openSheet('',`<div class="spd"><div class="spd-hero" style="--c:${k.c};--b:${k.bg}">${spArt(s)}${spImg(s)}<div class="spd-ov"><span class="spd-k">${sS(k.ic,2)}${esc(t('sk_'+s.k))}</span><h2>${esc(spName(s))}</h2><p>${sS('pin',2)}${esc(s.d?t('sp_dist',{d:spT(s.d),p:pname(P)}):pname(P))}${s.ap?' · '+esc(t('sp_approx')):''}</p></div>${has?`<span class="spd-got">${sS('stamp',2)}</span>`:''}</div>
   <div class="spd-a"><button class="btn primary" id="spdAdd">${sS('plus',2.2)}${esc(t('sp_add'))}</button>${s.lat!=null?`<a class="btn line" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank" rel="noopener">${sS('nav',2)}${esc(t('sp_nav'))}</a>`:''}</div>
   <div class="spd-ic"><button id="spdGuides">${sS('users',2)}<span>${esc(t('sp_guides'))}</span></button>${s.lat!=null?`<button id="spdCheck"${has?' disabled class="done"':''}>${sS('stamp',2)}<span>${esc(has?t('sp_stamped'):t('sp_checkin'))}</span></button>`:''}</div>
   <div class="spd-body" id="spdBody">${s.s?`<p class="spd-s clamp" id="spdS">${esc(spT(s.s))}</p>`:`<p class="spd-s clamp" id="spdS"><span class="spd-load"></span></p>`}<button class="link spd-more" id="spdMore" hidden>${esc(t('sp_more'))}</button>
   ${s.f?`<ul class="spd-f">${s.f.map(x=>`<li>${esc(spT(x))}</li>`).join('')}</ul>`:''}${s.tip?`<p class="spd-tip">${sS('spark',2)}${esc(spT(s.tip))}</p>`:''}</div>
   ${s.img?`<p class="spd-cr">${esc(t('sp_photo'))} <a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(s.img.replace(/ /g,'_'))}" target="_blank" rel="noopener">Wikimedia Commons</a></p>`:''}</div>`,b=>{
    const more=()=>{const el=$('#spdS',b),m=$('#spdMore',b);if(!el||!m)return;requestAnimationFrame(()=>{m.hidden=el.scrollHeight<=el.clientHeight+2});m.onclick=()=>{el.classList.remove('clamp');m.hidden=true}};
    if(s.s)more();else spExtract(s).then(x=>{const el=$('#spdS',b);if(!el)return;if(x){el.textContent=x;more()}else el.remove()});
    $('#spdAdd',b).onclick=()=>spAddSheet(prov,[s]);
    $('#spdGuides',b).onclick=()=>{closeSheet();const dl=DIST[prov]||[],di=s.d?dl.findIndex(([th])=>th===s.d.th.split('–')[0]):-1;state.province=P;F.kind=di>=0?'local':'all';F.di=di;state.listLim=30;if(state.screen==='map'){setLayer('guides');refilter&&refilter()}else{setLayerOnEnter='guides';goMap()}};
    const ck=$('#spdCheck',b);ck&&!has&&(ck.onclick=()=>{if(!navigator.geolocation){toast(t('sp_loc_off'));return}ck.disabled=true;navigator.geolocation.getCurrentPosition(pos=>{const km=distKm({lat:pos.coords.latitude,lng:pos.coords.longitude},s);if(km<=(s.ap?8:2)){const st=spStamps();st[prov]=st[prov]||{};st[prov][id]=Date.now();store.set('spotStamp',st);toast(t('sp_stamped'));closeSheet();if(state.screen==='map'&&state.layer==='spots')renderPanel()}else{ck.disabled=false;toast(t('sp_far',{km:km<10?km.toFixed(1):Math.round(km)}))}},()=>{ck.disabled=false;toast(t('sp_loc_off'))},{enableHighAccuracy:true,timeout:9000,maximumAge:60000})});
  });
}
function spAddSheet(prov,list){
  const mine=PLANS.filter(p=>p.prov===prov),P=PROV.find(x=>x.en===prov);
  const mk=s=>{const st=mkStop(s.k==='food'?'eat':'see',null,'me',spName(s));if(s.lat!=null){st.lat=s.lat;st.lng=s.lng}st.spot=prov+':'+s.id;return st};
  const make=()=>{const pl={id:'pl'+uid(),name:t('pl_default',{p:pname(P)}),prov,start:isoDay(7),days:[{start:'08:30',stops:list.map(mk)}],members:['me'],log:[{by:'me',at:Date.now(),k:'lg_create'}],at:Date.now()};PLANS.push(pl);plSave();closeSheet();toast(t('sp_added',{p:pl.name}));openPlan(pl.id)};
  if(!mine.length){make();return}
  openSheet(t('sp_add'),`<div class="acc-list">${mine.map(p=>`<button class="acc-row sp-pick" data-pl="${p.id}"><span class="acc-main"><span><b>${esc(p.name)}</b><small>${esc(t('sp_days',{n:p.days.length}))}</small></span></span>${sS('plus',2.2)}</button>`).join('')}</div><button class="btn primary block" id="spNewPl">${sS('plus',2.2)}${esc(t('sp_new_plan',{p:pname(P)}))}</button>`,b=>{
    $$('[data-pl]',b).forEach(x=>x.onclick=()=>{const pl=PLANS.find(q=>q.id===x.dataset.pl);pl.days[pl.days.length-1].stops.push(...list.map(mk));pl.log.push({by:'me',at:Date.now(),k:'lg_add',v:{s:spName(list[0])}});plSave();closeSheet();toast(t('sp_added',{p:pl.name}))});
    $('#spNewPl',b).onclick=make});
}

/* ----- province picker: one line + three highlight photos ----- */
function renderDestSoft(){
  const el=$('#destSoft');if(!el)return;const p=state.province;if(!p){el.innerHTML='';return}
  const S=SOFT[p.en],all=spotsOf(p.en),L=all.filter(s=>s.photo).concat(all.filter(s=>!s.photo)).slice(0,3);
  el.innerHTML=`${S?`<p class="ds-tag">${esc(state.lang==='th'?S[0]:S[1])}</p>`:''}${L.length?`<div class="ds-grid">${L.map(s=>{const k=skOf(s.k);return `<button class="ds-card" data-dsp="${s.id}"><span class="ds-ph" style="--c:${k.c};--b:${k.bg}">${spArt(s)}${spImg(s)}</span><b>${esc(spName(s))}</b></button>`}).join('')}</div>`:''}`;
}
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-dsp]');if(c&&state.province){state.spotSel=c.dataset.dsp;setLayerOnEnter='spots';goMap();setTimeout(()=>{spotFocus(c.dataset.dsp,true);spotOpen(state.province.en,c.dataset.dsp)},400);return}
  const ly=e.target.closest('#pnTabs [data-ly]');if(ly){if(ly.dataset.ly!==state.layer)setLayer(ly.dataset.ly);return}
  const sp=e.target.closest('#spl [data-sp]');if(sp){spotFocus(sp.dataset.sp,true);spotOpen(state.province.en,sp.dataset.sp);return}
});

/* ----- province drawer: slides in from the right, handle under the top bar ----- */
function pvOpen(on){const d=$('#pvDrawer');if(!d)return;if(on)renderPvDrawer();d.classList.toggle('on',on);d.setAttribute('aria-hidden',!on);$('#pvScrim').classList.toggle('on',on);$('#pvHandle').setAttribute('aria-expanded',on)}
function renderPvDrawer(){
  const el=$('#pvBody'),p=state.province;if(!el||!p)return;const S=SOFT[p.en],all=spotsOf(p.en),hi=all.filter(s=>s.photo).concat(all.filter(s=>!s.photo)).slice(0,3),got=Object.keys(spStamps()[p.en]||{}).length;
  el.innerHTML=`<div class="pvd-h"><div><small>${esc(t('pv_info'))}</small><h2>${esc(pname(p))}</h2>${state.lang!=='en'?`<span>${esc(p.en)}</span>`:''}</div><button class="icon-btn" id="pvClose" aria-label="Close">${SVG(IC.x,2.2)}</button></div>
   ${S?`<p class="pvd-tag">${esc(state.lang==='th'?S[0]:S[1])}</p><div class="pvd-sig">${S[2].map(x=>`<span>${sS('spark',2)}${esc(state.lang==='th'?x[0]:x[1])}</span>`).join('')}</div>`:''}
   <div class="pvd-stats"><div><b>${all.length}</b><small>${esc(t('mm_spots'))}</small></div><div><b>${state.guides.length}</b><small>${esc(t('mm_guides'))}</small></div><div><b>${got}/${all.length}</b><small>${esc(t('sp_checkin'))}</small></div></div>
   <div class="pvd-sec"><b>${esc(t('pv_weather'))}</b><div class="pvd-wx" id="pvWx"><span class="spd-load"></span></div></div>
   ${hi.length?`<div class="pvd-sec"><b>${esc(t('pv_highlights'))}</b><div class="pvd-hi">${hi.map(s=>{const k=skOf(s.k);return `<button data-pvs="${s.id}"><span class="ds-ph" style="--c:${k.c};--b:${k.bg}">${spArt(s)}${spImg(s)}</span><span><small style="color:${k.c}">${esc(t('sk_'+s.k))}</small><b>${esc(spName(s))}</b></span></button>`}).join('')}</div></div>`:''}
   <button class="btn line block" data-go="home">${SVG(IC.map||SPI.map,2)}${esc(t('pv_change'))}</button>`;
  $('#pvClose',el).onclick=()=>pvOpen(false);
  $$('[data-pvs]',el).forEach(b=>b.onclick=()=>{pvOpen(false);spotPick(b.dataset.pvs)});
  const pl={prov:p.en,start:isoDay(0),days:[{},{},{}]};
  Promise.resolve(loadWeather(pl)).then(w=>{const x=$('#pvWx');if(!x)return;if(!w||w.far){x.innerHTML=`<p class="pvd-na">${esc(t('wx_na'))}</p>`;return}
    x.innerHTML=[0,1,2].map(i=>{const d=isoDay(i),v=w[d];if(!v)return '';const [k,ic]=WMO(v.c);return `<div><small>${esc(i===0?t('pv_today'):new Date(d+'T00:00').toLocaleDateString(state.lang==='th'?'th-TH':state.lang,{weekday:'short'}))}</small>${SVG(ic,1.7)}<b>${v.hi}°</b><span>${v.lo}° · ${SVG(IC.rain,2)}${v.rain??'–'}%</span></div>`}).join('')+`<em>Open-Meteo</em>`});
}
document.addEventListener('click',e=>{if(e.target.closest('#pvHandle')){pvOpen(!$('#pvDrawer').classList.contains('on'));return}if(e.target.closest('#pvScrim')){pvOpen(false)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#pvDrawer')&&$('#pvDrawer').classList.contains('on'))pvOpen(false)});
