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

/* ----- map layer: guides | spots ----- */
state.layer=state.layer||'guides';state.spotK='all';state.spotSel=null;
function setLayer(l){state.layer=l;document.body.classList.toggle('spots-on',l==='spots');$$('#mmSeg [data-ly]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ly===l));
  if(l==='spots'){renderSpotBar();placeSig='';refreshPlaces();const f=state.spotSel||($('#sbTrack .sb-card')||{dataset:{}}).dataset.sp;if(f)setTimeout(()=>spotFocus(f,true),60);return}state.spotSel=null;placeSig='';refreshPlaces()}
function renderSpotBar(){
  const el=$('#spotBar');if(!el)return;const p=state.province;if(!p)return;const all=spotsOf(p.en);
  const kinds=['all',...new Set(all.map(s=>s.k))];if(!kinds.includes(state.spotK))state.spotK='all';
  const L=all.filter(s=>state.spotK==='all'||s.k===state.spotK),o=state.origin||{lat:p.lat,lng:p.lng};
  el.innerHTML=`<div class="sb-chips">${kinds.length>2?kinds.map(k=>`<button data-sk="${k}" aria-pressed="${state.spotK===k}"${k!=='all'?` style="--c:${skOf(k).c}"`:''}>${k==='all'?esc(t('sp_all')):sS(skOf(k).ic,2)+esc(t('sk_'+k))}</button>`).join(''):''}</div>
   <div class="sb-track" id="sbTrack">${L.map(s=>{const k=skOf(s.k),d=s.lat!=null?distKm(o,{lat:s.lat,lng:s.lng}):null;return `<button class="sb-card${state.spotSel===s.id?' on':''}" data-sp="${s.id}"><span class="sb-ph" style="--c:${k.c};--b:${k.bg}">${spArt(s)}${spImg(s)}${spHas(p.en,s.id)?`<i class="sb-got">${sS('stamp',2)}</i>`:''}</span><span class="sb-tx"><small style="color:${k.c}">${sS(k.ic,2)}${esc(t('sk_'+s.k))}</small><b>${esc(spName(s))}</b><span>${s.d?esc(spT(s.d))+' · ':''}${d!=null?esc(t('sp_km',{n:d<10?d.toFixed(1):Math.round(d)})):esc(t('sp_noloc'))}</span></span></button>`}).join('')}</div>`;
  const tr=$('#sbTrack');let to;
  tr.onscroll=()=>{clearTimeout(to);to=setTimeout(()=>{const r=tr.getBoundingClientRect(),cx=r.left+r.width/2;let best=null,bd=1e9;$$('.sb-card',tr).forEach(c=>{const b=c.getBoundingClientRect(),d=Math.abs(b.left+b.width/2-cx);if(d<bd){bd=d;best=c}});if(best)spotFocus(best.dataset.sp,false)},140)};
  if(state.spotSel){const c=$(`.sb-card[data-sp="${state.spotSel}"]`,tr);if(c)tr.scrollLeft=c.offsetLeft-(tr.clientWidth-c.offsetWidth)/2}
}
function spotFocus(id,scroll){
  state.spotSel=id;$$('#sbTrack .sb-card').forEach(c=>c.classList.toggle('on',c.dataset.sp===id));
  if(scroll){const tr=$('#sbTrack'),c=tr&&$(`.sb-card[data-sp="${id}"]`,tr);if(c)tr.scrollTo({left:c.offsetLeft-(tr.clientWidth-c.offsetWidth)/2,behavior:'smooth'})}
  placeSig='';refreshPlaces();const pc=(window.PLACE_LIST||[]).find(x=>x.id===id);if(pc&&MAP.focus)MAP.focus(pc.x,pc.y);
}
function spotPick(id){if(state.layer!=='spots')setLayer('spots');spotFocus(id,true);spotOpen(state.province.en,id)}

/* ----- detail sheet ----- */
const SPX=(()=>{try{return JSON.parse(localStorage.getItem('jy_spx'))||{}}catch(e){return {}}})();
async function spExtract(s){
  const want=state.lang==='th'&&s.wt?['th',s.wt]:s.we?['en',s.we]:s.wt?['th',s.wt]:null;if(!want)return '';
  const key=want.join(':');if(key in SPX)return SPX[key];
  try{const r=await fetch(`https://${want[0]}.wikipedia.org/api/rest_v1/page/summary/`+encodeURIComponent(want[1].replace(/ /g,'_')));const j=r.ok?await r.json():{};let x=(j.extract||'').trim();if(x.length>420)x=x.slice(0,x.lastIndexOf(' ',400)>200?x.lastIndexOf(' ',400):400)+'…';SPX[key]=x;try{localStorage.setItem('jy_spx',JSON.stringify(SPX))}catch(e){}return x}catch(e){return ''}
}
function spotOpen(prov,id){
  const s=spotsOf(prov).find(x=>x.id===id);if(!s)return;const k=skOf(s.k),has=spHas(prov,id),P=PROV.find(x=>x.en===prov);
  openSheet(spName(s),`<div class="spd"><div class="spd-ph" style="--c:${k.c};--b:${k.bg}">${spArt(s)}${spImg(s)}<span class="spd-k" style="--c:${k.c}">${sS(k.ic,2)}${esc(t('sk_'+s.k))}</span>${has?`<span class="spd-got">${sS('stamp',2)}${esc(t('sp_stamped'))}</span>`:''}</div>
   <div class="spd-meta"><span>${sS('pin',2)}${esc(s.d?t('sp_dist',{d:spT(s.d),p:pname(P)}):pname(P))}</span>${s.ap?`<span class="ap">${sS('info',2)}${esc(t('sp_approx'))}</span>`:''}${s.lat==null?`<span class="ap">${sS('info',2)}${esc(t('sp_noloc'))}</span>`:''}${s.age?`<span>${sS('history',2)}${esc(t('sp_mya',{n:s.age}))}</span>`:''}</div>
   <p class="spd-s" id="spdS">${s.s?esc(spT(s.s)):`<span class="spd-load"></span>`}</p>${s.f?`<ul class="spd-f">${s.f.map(x=>`<li>${esc(spT(x))}</li>`).join('')}</ul>`:''}${s.tip?`<p class="spd-tip">${sS('spark',2)}${esc(spT(s.tip))}</p>`:''}
   <div class="spd-a"><button class="btn primary" id="spdAdd">${sS('plus',2.2)}${esc(t('sp_add'))}</button>${s.lat!=null?`<a class="btn line" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}" target="_blank" rel="noopener">${sS('nav',2)}${esc(t('sp_nav'))}</a>`:''}
    <button class="btn line" id="spdGuides">${sS('users',2)}${esc(t('sp_guides'))}</button><button class="btn line" id="spdSay">${sS('vol',2)}${esc(t('sp_listen'))}</button>
    ${s.lat!=null?`<button class="btn line${has?' done':''}" id="spdCheck"${has?' disabled':''}>${sS('stamp',2)}${esc(has?t('sp_stamped'):t('sp_checkin'))}</button>`:''}</div>
   ${s.img?`<p class="spd-cr">${esc(t('sp_photo'))} <a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(s.img.replace(/ /g,'_'))}" target="_blank" rel="noopener">Wikimedia Commons</a></p>`:''}</div>`,b=>{
    if(!s.s)spExtract(s).then(x=>{const el=$('#spdS');if(el)el.textContent=x||t('sp_nodesc')});
    $('#spdAdd',b).onclick=()=>spAddSheet(prov,[s]);
    $('#spdGuides',b).onclick=()=>{closeSheet();const dl=DIST[prov]||[],di=s.d?dl.findIndex(([th])=>th===s.d.th.split('–')[0]):-1;state.province=P;F.kind='local';F.di=di;state.listLim=30;setLayer('guides');goMap()};
    $('#spdSay',b).onclick=()=>{if(!('speechSynthesis' in window)){toast(t('sp_no_tts'));return}if(speechSynthesis.speaking){speechSynthesis.cancel();return}const u=new SpeechSynthesisUtterance(spName(s)+'. '+($('#spdS')?$('#spdS').textContent:''));u.lang=state.lang==='th'?'th-TH':'en-US';speechSynthesis.speak(u)};
    const ck=$('#spdCheck',b);ck&&(ck.onclick=()=>{if(!navigator.geolocation){toast(t('sp_loc_off'));return}ck.disabled=true;navigator.geolocation.getCurrentPosition(pos=>{const km=distKm({lat:pos.coords.latitude,lng:pos.coords.longitude},s);if(km<=(s.ap?8:2)){const st=spStamps();st[prov]=st[prov]||{};st[prov][id]=Date.now();store.set('spotStamp',st);toast(t('sp_stamped'));closeSheet();if(state.layer==='spots')renderSpotBar();if(state.screen==='home')renderDestSoft()}else{ck.disabled=false;toast(t('sp_far',{km:km<10?km.toFixed(1):Math.round(km)}))}},()=>{ck.disabled=false;toast(t('sp_loc_off'))},{enableHighAccuracy:true,timeout:9000,maximumAge:60000})});
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

/* ----- province picker: character + photo spots ----- */
function renderDestSoft(){
  const el=$('#destSoft');if(!el)return;const p=state.province;if(!p){el.innerHTML='';return}
  const S=SOFT[p.en],L=spotsOf(p.en).slice(0,8),got=Object.keys(spStamps()[p.en]||{}).length;
  el.innerHTML=`${S?`<p class="ds-tag">${esc(state.lang==='th'?S[0]:S[1])}</p><div class="ds-chips">${S[2].map(x=>`<span>${sS('spark',2)}${esc(state.lang==='th'?x[0]:x[1])}</span>`).join('')}${got?`<span class="ds-got">${sS('stamp',2)}${esc(t('sp_got',{n:got,m:spotsOf(p.en).length}))}</span>`:''}</div>`:''}
   ${L.length?`<div class="ds-h"><b>${esc(t('sp_title',{p:pname(p)}))}</b><button class="link" id="dsAll">${esc(t('sp_on_map'))}</button></div><div class="ds-row">${L.map(s=>{const k=skOf(s.k);return `<button class="ds-card" data-dsp="${s.id}"><span class="ds-ph" style="--c:${k.c};--b:${k.bg}">${spArt(s)}${spImg(s)}</span><small style="color:${k.c}">${esc(t('sk_'+s.k))}</small><b>${esc(spName(s))}</b></button>`}).join('')}</div>`:''}`;
}
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-dsp]');if(c&&state.province){state.spotSel=c.dataset.dsp;setLayerOnEnter='spots';goMap();setTimeout(()=>{spotFocus(c.dataset.dsp,true);spotOpen(state.province.en,c.dataset.dsp)},350);return}
  if(e.target.closest('#dsAll,#destSpots')){setLayerOnEnter='spots';goMap();return}
  const k=e.target.closest('#spotBar [data-sk]');if(k){state.spotK=k.dataset.sk;state.spotSel=null;renderSpotBar();placeSig='';refreshPlaces();return}
  const sp=e.target.closest('#spotBar [data-sp]');if(sp){spotFocus(sp.dataset.sp,true);spotOpen(state.province.en,sp.dataset.sp);return}
  const ly=e.target.closest('#mmSeg [data-ly]');if(ly){setLayer(ly.dataset.ly);return}
});
let setLayerOnEnter=null;
