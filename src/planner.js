/* =====================================================================
   PLAN WITH FRIENDS — shared day-by-day route on the map: photo cards
   for sights, rest stops and stopovers, arrival times, legs with an
   estimated traffic level, and daily weather (Open-Meteo).
   ===================================================================== */
const STYPES=['see','eat','rest','stop','stay'];
const STYPE_IC={see:'camera',eat:'utensils',rest:'coffee',stop:'fuel',stay:'bed'};
const STYPE_DUR={see:90,eat:60,rest:30,stop:15,stay:0};
const SUGG={eat:['sg_eat1','sg_eat2','sg_eat3'],rest:['sg_rest1','sg_rest2','sg_rest3'],stop:['sg_stop1','sg_stop2','sg_stop3'],stay:['sg_stay1','sg_stay2']};
const BIG=['Bangkok','Chiang Mai','Phuket','Chon Buri','Nonthaburi','Samut Prakan','Pathum Thani','Songkhla','Nakhon Ratchasima','Khon Kaen'];
let PLANS=store.get('plans')||[];
const plSave=()=>store.set('plans',PLANS);
const curPlan=()=>PLANS.find(p=>p.id===state.planId);
state.mapMode='guides';state.pday=0;
const uid=()=>Date.now().toString(36)+Math.floor(Math.random()*1e5).toString(36);
const planDate=(pl,i)=>{const d=new Date(pl.start+'T00:00');d.setDate(d.getDate()+i);return dKey(d)};

/* ----- list + create ----- */
function renderPlans(){
  const el=$('#plBody');if(!el)return;
  el.innerHTML=`<header class="page-h sub"><button class="icon-btn" data-go="home" aria-label="Back">${SVG('<path d="m15 18-6-6 6-6" />',2)}</button><h1>${t('pl_title')}</h1><button class="btn primary sm" id="plNew">${SVG(IC.plus,2.2)}${t('pl_new')}</button></header>
  <p class="lp-lead">${t('pl_lead')}</p>
  ${PLANS.length?`<div class="pl-list">${PLANS.slice().sort((a,b)=>a.start.localeCompare(b.start)).map(pl=>{const P2=PROV.find(x=>x.en===pl.prov)||PROV[0],first=pl.days.flatMap(d=>d.stops).find(s=>s.pid),img=first&&(placeCache[pl.prov+':'+first.pid]||{}).img,n=pl.days.reduce((a,d)=>a+d.stops.filter(s=>s.st!=='sug').length,0);
    return `<button class="pl-card" data-pl="${pl.id}"><span class="pl-cov">${img?`<img alt="" referrerpolicy="no-referrer" src="${esc(img)}">`:`<img alt="" src="${artURL(P2.type==='city'?'city':P2.type==='beach'?'beach':P2.type==='temple'?'temple':'mountain',pl.id,640,360)}">`}</span>
    <span class="pl-info"><b>${esc(pl.name)}</b><small>${esc(pname(P2))} · ${fmtDate(pl.start)} · ${t('pl_days',{n:pl.days.length})}</small><span class="pl-mem">${pl.members.slice(0,5).map(id=>avHTML(acct(id),'sm')).join('')}<small>${t('pl_stops',{n})}</small></span></span></button>`}).join('')}</div>`
  :`<div class="empty-state">${SVG(IC.route,1.5)}<span>${t('pl_empty')}</span></div>`}`;
  hydrateMedia(el);
  $('#plNew').onclick=newPlanSheet;
}
$('#plBody').addEventListener('click',e=>{const b=e.target.closest('[data-pl]');if(b)openPlan(b.dataset.pl)});
function friendsList(){return SOC.follow.map(acct).filter(a=>a.name!=='?').concat(PEOPLE.filter(p=>!SOC.follow.includes(p.id)).slice(0,4))}
function newPlanSheet(){
  const fr=friendsList(),p0=state.province||PROV.find(p=>p.en==='Chiang Mai');
  openSheet(t('pl_new'),`<form class="pl-form" id="plForm">
    <div class="field"><label for="plName">${t('pl_name')}</label><input class="input" id="plName" maxlength="50" placeholder="${t('pl_name_ph')}"></div>
    <div class="field"><label for="plProv">${t('pl_where')}</label><select class="input" id="plProv">${PROV.map(p=>`<option value="${p.en}"${p===p0?' selected':''}>${esc(pname(p))}</option>`).join('')}</select></div>
    <div class="lb-grid"><div class="field"><label for="plStart">${t('start_date')}</label><input class="input" type="date" id="plStart" min="${isoDay(0)}" value="${isoDay(7)}"></div>
    <div class="field"><label for="plDays">${t('days')}</label><select class="input" id="plDays">${[1,2,3,4,5,6,7].map(n=>`<option value="${n}"${n===2?' selected':''}>${t('pl_days',{n})}</option>`).join('')}</select></div></div>
    <div class="field"><span class="sec-label">${t('pl_invite')}</span><div class="acc-list pick">${fr.map(a=>`<label class="acc-row"><span class="acc-main">${avHTML(a)}<span><b>${esc(a.name)}</b><small>@${esc(a.handle)}</small></span></span><input type="checkbox" class="switch" value="${a.id}"></label>`).join('')}</div></div>
    <button class="btn primary block" type="submit">${t('pl_create')}</button></form>`,()=>{
    hydrateMedia($('#optBody'));
    $('#plForm').onsubmit=e=>{e.preventDefault();
      const prov=$('#plProv').value,P2=PROV.find(p=>p.en===prov),n=+$('#plDays').value,mem=['me'].concat($$('#plForm input[type=checkbox]:checked').map(i=>i.value));
      const pl={id:'pl'+uid(),name:$('#plName').value.trim()||t('pl_default',{p:pname(P2)}),prov,start:$('#plStart').value||isoDay(7),days:[...Array(n)].map(()=>({start:'08:30',stops:[]})),members:mem,log:[{by:'me',at:Date.now(),k:'lg_create'}],at:Date.now()};
      const pl0=placesOf(P2);
      if(pl0.length){pl.days[0].stops.push(mkStop('see',pl0[0],'me'));if(pl0[1])pl.days[0].stops.push(mkStop('eat',null,'me',t('sg_eat1')));if(pl0[1])pl.days[0].stops.push(mkStop('see',pl0[1],'me'))}
      if(mem.length>1&&pl0[2]){const f=mem[1];const s=mkStop('see',pl0[2],f);s.st='sug';pl.days[0].stops.push(s);pl.log.push({by:f,at:Date.now(),k:'lg_suggest',v:{s:placeName(pl0[2])}})}
      PLANS.push(pl);plSave();closeSheet();openPlan(pl.id)}});
}
function mkStop(type,place,by,name){return {id:'s'+uid(),type,pid:place?place.id:null,name:place?null:name,dur:STYPE_DUR[type],by,votes:by==='me'?['me']:[by],note:''}}
function openPlan(id){const pl=PLANS.find(p=>p.id===id);if(!pl)return;state.planId=id;state.pday=Math.min(state.pday||0,pl.days.length-1);state.mapMode='plan';state.province=PROV.find(p=>p.en===pl.prov)||PROV[0];state.selected=null;show('map')}
function leavePlan(){state.mapMode='guides';MAP.setRoute(null);if(MAP.traffic)MAP.traffic(false);placeSig='';show('plans')}

/* ----- geometry, legs, traffic ----- */
const stopName=(pl,s)=>{if(s.pid){const P2=PROV.find(p=>p.en===pl.prov),x=placesOf(P2).find(y=>y.id===s.pid);return x?placeName(x):s.pid}return s.name&&s.name.startsWith('sg_')?t(s.name):s.name||t('st_'+s.type)};
function stopXY(pl,day,i){
  const P2=PROV.find(p=>p.en===pl.prov),o=state.origin||{lat:P2.lat,lng:P2.lng},k=Math.cos(o.lat*Math.PI/180),s=day.stops[i];
  if(s.pid){const c=placeCache[pl.prov+':'+s.pid]||{};
    if(c.lat!=null){let X=(c.lng-o.lng)*111320*k,Y=(c.lat-o.lat)*111320;const d=Math.hypot(X,Y);if(d>800){const f=(800+220*Math.log10(d/800))/d;X*=f;Y*=f}return {x:X,y:Y,lat:c.lat,lng:c.lng,real:d}}
    const a=(hash(pl.prov+s.pid)%360)*Math.PI/180,r=520+hash(s.pid+pl.prov)%620;return {x:Math.cos(a)*r,y:Math.sin(a)*r,lat:o.lat+Math.sin(a)*r/111320,lng:o.lng+Math.cos(a)*r/(111320*k)}}
  const prev=i>0?stopXY(pl,day,i-1):{x:0,y:0},nx=day.stops.slice(i+1).findIndex(q=>q.pid),nxt=nx>=0?stopXY(pl,day,i+1+nx):{x:prev.x+260,y:prev.y+120};
  const a=(hash(s.id)%628)/100,x=(prev.x+nxt.x)/2+Math.cos(a)*90,y=(prev.y+nxt.y)/2+Math.sin(a)*90;
  return {x,y,lat:o.lat+y/111320,lng:o.lng+x/(111320*k)};
}
function trafficAt(prov,min){const h=min/60,big=BIG.includes(prov);if((h>=7&&h<9.5)||(h>=16.5&&h<19.5))return big?['heavy',2.1]:['mod',1.4];if(h>=11&&h<14)return big?['mod',1.4]:['light',1.1];return ['light',1]}
function legOf(pl,a,b,depart){
  let km;if(a.lat!=null&&b.lat!=null&&(a.real||b.real))km=distKm(a,b)*1.3;else km=Math.hypot(a.x-b.x,a.y-b.y)/1000*1.3;
  km=Math.max(.3,km);const [lv,f]=trafficAt(pl.prov,depart),spd=km>25?55:BIG.includes(pl.prov)?22:30;
  return {km,min:Math.round(km/spd*60*f+4),lv};
}
function dayTimeline(pl,di){
  const day=pl.days[di],out=[];let tm=toMin(day.start||'08:30'),prevXY=null;
  day.stops.forEach((s,i)=>{if(s.st==='sug'){out.push({s,sug:true,xy:stopXY(pl,day,i)});return}
    const xy=stopXY(pl,day,i);let leg=null;if(prevXY){leg=legOf(pl,prevXY,xy,tm);tm+=leg.min}
    out.push({s,arr:tm,dep:tm+s.dur,leg,xy});tm+=s.dur;prevXY=xy});
  return out;
}

/* ----- weather (Open-Meteo, no key) ----- */
const WX={};
const WMO=c=>c===0?['wx_clear',IC.sun]:c<=2?['wx_partly',IC.cloudsun]:c===3?['wx_cloudy',IC.cloud]:c<=48?['wx_fog',IC.fog]:c<=67||c>=80&&c<=82?['wx_rain',IC.rain]:c>=95?['wx_storm',IC.storm]:['wx_cloudy',IC.cloud];
function loadWeather(pl){
  const P2=PROV.find(p=>p.en===pl.prov),key=pl.prov+':'+pl.start+':'+pl.days.length;if(WX[key])return WX[key];
  const end=planDate(pl,pl.days.length-1),lim=isoDay(15);
  if(pl.start>lim){WX[key]=Promise.resolve({far:true});return WX[key]}
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${P2.lat}&longitude=${P2.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FBangkok&start_date=${pl.start<isoDay(0)?isoDay(0):pl.start}&end_date=${end>lim?lim:end}`;
  WX[key]=fetch(u).then(r=>r.ok?r.json():null).then(j=>{if(!j||!j.daily)return null;const o={};j.daily.time.forEach((d,i)=>o[d]={c:j.daily.weather_code[i],hi:Math.round(j.daily.temperature_2m_max[i]),lo:Math.round(j.daily.temperature_2m_min[i]),rain:j.daily.precipitation_probability_max[i]});return o}).catch(()=>null);
  return WX[key];
}
function wxChip(w,d,big){
  if(!w)return `<span class="wx na">${SVG(IC.cloud)}${big?t('wx_na'):'–'}</span>`;
  if(w.far)return `<span class="wx na">${SVG(IC.cloud)}${big?t('wx_far'):'–'}</span>`;
  const x=w[d];if(!x)return `<span class="wx na">${SVG(IC.cloud)}${big?t('wx_far'):'–'}</span>`;
  const [k,ic]=WMO(x.c);return big?`<div class="wx-card"><span class="wx-ic">${SVG(ic,1.6)}</span><span class="wx-m"><b>${t(k)} · ${x.hi}° / ${x.lo}°</b><small>${SVG(IC.rain)}${t('wx_rainp',{n:x.rain==null?'–':x.rain})}${x.rain>=60?' · '+t('wx_tip_rain'):x.hi>=35?' · '+t('wx_tip_hot'):''}</small></span><span class="wx-src">Open-Meteo</span></div>`:`<span class="wx">${SVG(ic)}${x.hi}°</span>`;
}

/* ----- map + panel ----- */
function planMapRefresh(fit){
  const pl=curPlan();if(!pl||!MAP.setPlaces)return;const tl=dayTimeline(pl,state.pday);
  let n=0;const list=tl.map(r=>{const s=r.s,c=s.pid?placeCache[pl.prov+':'+s.pid]||{}:{};const ord=r.sug?null:++n;return {id:s.id,name:(ord?'':'? ')+stopName(pl,s),x:r.xy.x,y:r.xy.y,lat:r.xy.lat,lng:r.xy.lng,src:c.img||null,img:imgFor(c.img),order:ord,dim:!!r.sug}});
  const sig=JSON.stringify([state.planId,state.pday,list.map(l=>[l.id,l.order,l.src,l.lat])]);
  if(sig!==placeSig||fit){placeSig=sig;MAP.setPlaces(list,fit)}
  const pts=tl.filter(r=>!r.sug).map(r=>[r.xy.x,r.xy.y]);MAP.setRoute(pts.length>1?pts:null);
  $('#photoCredit').hidden=!list.some(l=>l.src);
}
function renderPlanPanel(){
  const el=$('#panelScroll'),ft=$('#panelFoot'),pl=curPlan();if(!el)return;
  if(!pl){leavePlan();return}
  $('#panel').classList.remove('has-guide');
  const P2=PROV.find(p=>p.en===pl.prov),di=state.pday,day=pl.days[di],tl=dayTimeline(pl,di);
  const wkey=pl.prov+':'+pl.start+':'+pl.days.length;
  loadWeather(pl).then(w=>{if(state.mapMode==='plan'&&curPlan()===pl){WX[wkey+'v']=w;const c=$('#plWx');if(c)c.innerHTML=wxChip(w,planDate(pl,state.pday),true);$$('[data-pd]').forEach(b=>{const s=b.querySelector('.pd-wx');if(s)s.innerHTML=wxChip(w,planDate(pl,+b.dataset.pd),false)})}});
  const w=WX[wkey+'v'];
  const real=tl.filter(r=>!r.sug),km=real.reduce((a,r)=>a+(r.leg?r.leg.km:0),0),drive=real.reduce((a,r)=>a+(r.leg?r.leg.min:0),0);
  let h=`<div class="pl-head"><button class="back-link" id="plBack">${SVG('<path d="m15 18-6-6 6-6" />',2)}${t('pl_title')}</button>
  <div class="pl-h"><h2>${esc(pl.name)}</h2><button class="icon-btn sm" id="plRename" aria-label="${t('pl_rename')}">${SVG(IC.pencil)}</button></div>
  <small>${esc(pname(P2))} · ${fmtDate(pl.start)} – ${fmtDate(planDate(pl,pl.days.length-1))}</small>
  <div class="pl-mem"><span class="pl-avs">${pl.members.map(id=>avHTML(acct(id),'sm')).join('')}</span><button class="f-btn" id="plInvite">${SVG(IC.userplus)}${t('pl_invite_btn')}</button>${MAP.traffic?`<button class="f-btn${state.trafficOn?' on':''}" id="plTraffic">${SVG(IC.car)}${t('pl_traffic')}</button>`:''}</div></div>
  <div class="pd-tabs">${pl.days.map((d,i)=>`<button data-pd="${i}" aria-pressed="${i===di}"><b>${t('pl_day',{n:i+1})}</b><small>${new Date(planDate(pl,i)+'T00:00').toLocaleDateString(state.lang,{weekday:'short',day:'numeric'})}</small><span class="pd-wx">${wxChip(w,planDate(pl,i),false)}</span></button>`).join('')}</div>
  <div id="plWx">${wxChip(w,planDate(pl,di),true)}</div>
  <div class="pl-start"><label for="plDs">${SVG(IC.clock)}${t('pl_start')}</label><select class="input sm" id="plDs">${TIMES.map(x=>`<option${x===(day.start||'08:30')?' selected':''}>${x}</option>`).join('')}</select><span class="pl-sum">${t('pl_sum',{n:real.length,k:km.toFixed(1),m:durTxt(drive)})}</span></div>
  <ol class="pl-tl">`;
  let n=0;
  tl.forEach((r,i)=>{const s=r.s,c=s.pid?placeCache[pl.prov+':'+s.pid]||{}:{},by=acct(s.by),voted=s.votes.includes('me');
    if(r.leg)h+=`<li class="pl-leg ${r.leg.lv}">${SVG(IC.car)}<span>${t('pl_leg',{k:r.leg.km.toFixed(1),m:r.leg.min})}</span><b>${t('tr_'+r.leg.lv)}</b></li>`;
    h+=`<li class="pl-stop${r.sug?' sug':''}" data-sid="${s.id}"><span class="ps-n">${r.sug?'?':++n}</span>
      <span class="ps-th">${c.img?`<img alt="" loading="lazy" referrerpolicy="no-referrer" src="${esc(c.img)}">`:SVG(IC[STYPE_IC[s.type]]||IC.pin,1.6)}</span>
      <span class="ps-main"><b>${esc(stopName(pl,s))}</b><small class="ps-type t-${s.type}">${t('st_'+s.type)}${r.sug?'':` · ${fromMin(r.arr)}${s.dur?'–'+fromMin(r.dep):''}`}</small>
      <small class="ps-by">${avHTML(by,'xs')}${esc(t(r.sug?'pl_sug_by':'pl_by',{n:by.id==='me'?t('you'):by.name.split(' ')[0]}))}</small>
      ${r.sug?`<span class="ps-acts"><button class="btn primary sm" data-ps="ok">${t('pl_accept')}</button><button class="btn line sm" data-ps="no">${t('pl_reject')}</button></span>`:
      `<span class="ps-acts"><select class="input xs" data-ps="dur" aria-label="${t('pl_dur')}">${[0,15,30,45,60,90,120,180,240].map(m=>`<option value="${m}"${m===s.dur?' selected':''}>${m?durTxt(m):t('pl_pass')}</option>`).join('')}</select>
      <button class="vote${voted?' on':''}" data-ps="vote" aria-pressed="${voted}">${SVG(IC.thumb)}${s.votes.length}</button>
      ${i>0?`<button class="icon-btn xs" data-ps="up" aria-label="${t('pl_up')}">${SVG('<path d="m18 15-6-6-6 6" />',2)}</button>`:''}
      <button class="icon-btn xs" data-ps="rm" aria-label="${t('remove')}">${SVG(IC.trash)}</button></span>`}</span></li>`});
  h+=`</ol><p class="note pl-note">${SVG(IC.info)}${t(MAP.traffic?'pl_route_note_g':'pl_route_note')}</p><button class="btn line block" id="plAdd">${SVG(IC.plus,2.2)}${t('pl_add')}</button>`;
  if(pl.log.length)h+=`<div class="pl-log"><span class="sec-label">${t('pl_activity')}</span>${pl.log.slice(-5).reverse().map(l=>{const a=acct(l.by);return `<p>${avHTML(a,'xs')}<span><b>${esc(a.id==='me'?t('you'):a.name.split(' ')[0])}</b> ${esc(t(l.k,l.v))}</span><small>${rel(l.at)}</small></p>`}).join('')}</div>`;
  el.innerHTML=h;hydrateMedia(el);
  ft.hidden=false;ft.innerHTML=`<span class="ft-tot"><small>${t('pl_day',{n:di+1})} · ${t('pl_stops',{n:real.length})}</small><b>${real.length?fromMin(real[0].arr)+'–'+fromMin(real[real.length-1].dep):'–'}</b></span><button class="btn line" id="plGuide">${SVG(IC.mappinned)}${t('pl_find_guide')}</button><button class="btn primary" id="plShare">${SVG(IC.share)}${t('share')}</button>`;
  const q=x=>el.querySelector(x)||ft.querySelector(x);
  q('#plBack').onclick=leavePlan;
  q('#plDs').onchange=e=>{day.start=e.target.value;plSave();renderPlanPanel()};
  q('#plAdd').onclick=()=>addStopSheet(pl,di);
  q('#plRename').onclick=()=>openSheet(t('pl_rename'),`<form id="rnF"><input class="input" id="rnI" maxlength="50" value="${esc(pl.name)}"><button class="btn primary block" style="margin-top:12px">${t('save')}</button></form>`,()=>{$('#rnF').onsubmit=e=>{e.preventDefault();pl.name=$('#rnI').value.trim()||pl.name;plSave();closeSheet();renderPlanPanel()}});
  q('#plInvite').onclick=()=>inviteSheet(pl);
  q('#plTraffic')&&(q('#plTraffic').onclick=()=>{state.trafficOn=!state.trafficOn;MAP.traffic(state.trafficOn);renderPlanPanel()});
  q('#plGuide').onclick=()=>{F.kind='local';F.di=-1;state.mapMode='guides';MAP.setRoute(null);placeSig='';state._worldFor=null;show('map')};
  q('#plShare').onclick=()=>{const txt=pl.name+'\n'+pl.days.map((d,i)=>t('pl_day',{n:i+1})+': '+dayTimeline(pl,i).filter(r=>!r.sug).map(r=>fromMin(r.arr)+' '+stopName(pl,r.s)).join(' → ')).join('\n');(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast(t('copied'))).catch(()=>toast(t('copy_fail')))};
  el.querySelector('.pd-tabs').onclick=e=>{const b=e.target.closest('[data-pd]');if(b){state.pday=+b.dataset.pd;placeSig='';renderPlanPanel();planMapRefresh(true)}};
  el.querySelector('.pl-tl').onclick=e=>{const b=e.target.closest('[data-ps]');if(!b||b.tagName==='SELECT')return;const li=b.closest('[data-sid]'),i=day.stops.findIndex(s=>s.id===li.dataset.sid),s=day.stops[i],k=b.dataset.ps;
    if(k==='ok'){s.st=null;s.votes.push('me');pl.log.push({by:'me',at:Date.now(),k:'lg_accept',v:{s:stopName(pl,s)}})}
    else if(k==='no'){day.stops.splice(i,1)}
    else if(k==='vote'){const j=s.votes.indexOf('me');j>=0?s.votes.splice(j,1):s.votes.push('me')}
    else if(k==='up'&&i>0){[day.stops[i-1],day.stops[i]]=[day.stops[i],day.stops[i-1]]}
    else if(k==='rm'){day.stops.splice(i,1);pl.log.push({by:'me',at:Date.now(),k:'lg_remove',v:{s:stopName(pl,s)}})}
    plSave();renderPlanPanel();planMapRefresh()};
  el.querySelector('.pl-tl').onchange=e=>{if(e.target.dataset.ps!=='dur')return;const s=day.stops.find(x=>x.id===e.target.closest('[data-sid]').dataset.sid);s.dur=+e.target.value;plSave();renderPlanPanel()};
  setTimeout(()=>planMapRefresh(),0);
}
function addStopSheet(pl,di){
  const P2=PROV.find(p=>p.en===pl.prov);let type='see';
  const html=()=>`<div class="st-types">${STYPES.map(k=>`<button type="button" data-ty="${k}" aria-pressed="${type===k}">${SVG(IC[STYPE_IC[k]])}${t('st_'+k)}</button>`).join('')}</div>
   ${type==='see'?`<div class="as-grid">${placesOf(P2).map(x=>{const c=placeCache[pl.prov+':'+x.id]||{},inPlan=pl.days[di].stops.some(s=>s.pid===x.id);return `<button class="as-it" data-pid="${x.id}"${inPlan?' disabled':''}>${c.img?`<img alt="" referrerpolicy="no-referrer" src="${esc(c.img)}">`:`<img alt="" src="${artURL(kindArt(x.k),x.id+pl.prov,360,240)}">`}<b>${esc(placeName(x))}</b>${inPlan?`<i>${SVG(IC.tick,2.4)}</i>`:''}</button>`}).join('')}</div>`
   :`<div class="chips">${(SUGG[type]||[]).map(k=>`<button type="button" class="chip" data-sg="${k}">${t(k)}</button>`).join('')}</div><form class="add-row" id="asF"><input class="input" id="asName" maxlength="60" placeholder="${t('pl_custom_ph')}"><button class="btn primary">${t('add')}</button></form>`}`;
  const bind=()=>{const b=$('#optBody');
    b.onclick=e=>{const ty=e.target.closest('[data-ty]');if(ty){type=ty.dataset.ty;b.innerHTML=html();bind();return}
      const p=e.target.closest('[data-pid]');if(p){const x=placesOf(P2).find(y=>y.id===p.dataset.pid);push(mkStop('see',x,'me'),placeName(x));return}
      const sg=e.target.closest('[data-sg]');if(sg){push(mkStop(type,null,'me',sg.dataset.sg),t(sg.dataset.sg))}};
    const f=$('#asF');f&&(f.onsubmit=e=>{e.preventDefault();const v=$('#asName').value.trim();if(v)push(mkStop(type,null,'me',v),v)})};
  const push=(s,nm)=>{pl.days[di].stops.push(s);pl.log.push({by:'me',at:Date.now(),k:'lg_add',v:{s:nm}});plSave();closeSheet();toast(t('pl_added',{s:nm}));renderPlanPanel();planMapRefresh(true)};
  openSheet(t('pl_add'),html(),bind);
  loadPlaceInfo(P2).then(ch=>{if(ch&&!$('#optSheet').hidden&&type==='see'){const b=$('#optBody'),st=b.scrollTop;b.innerHTML=html();b.scrollTop=st;bind()}});
}
function inviteSheet(pl){
  const fr=friendsList().filter(a=>!pl.members.includes(a.id));
  openSheet(t('pl_invite'),`<div class="inv-link"><span>${SVG(IC.link)}<b>journey/plan/${pl.id.slice(2,10)}</b></span><button class="btn line sm" id="invCopy">${SVG(IC.copy)}${t('copy')}</button></div>
  <p class="note">${t('pl_invite_note')}</p>
  ${fr.length?`<div class="acc-list">${fr.map(a=>`<div class="acc-row"><span class="acc-main">${avHTML(a)}<span><b>${esc(a.name)}</b><small>@${esc(a.handle)}</small></span></span><button class="btn primary sm" data-inv="${a.id}">${t('pl_add_mem')}</button></div>`).join('')}</div>`:''}`,()=>{
    hydrateMedia($('#optBody'));
    $('#invCopy').onclick=()=>{const u=location.origin+location.pathname+'#plan-'+pl.id;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast(t('copied'))).catch(()=>toast(t('copy_fail')))};
    $('#optBody').addEventListener('click',e=>{const b=e.target.closest('[data-inv]');if(!b)return;pl.members.push(b.dataset.inv);pl.log.push({by:'me',at:Date.now(),k:'lg_invite',v:{n:acct(b.dataset.inv).name}});plSave();b.disabled=true;b.textContent=t('pl_added_mem');renderPlanPanel()});
  });
}
