/* =====================================================================
   LOCAL-GUIDE PLAN — several district guides, each with a date, start
   time and meeting point; checked for clashes before confirming.
   Confirmed items become appointments with reminders.
   ===================================================================== */
const LP={items:store.get('lplan')||[]};
const lpSave=()=>store.set('lplan',LP.items);
const toMin=s=>{const [h,m]=s.split(':').map(Number);return h*60+m};
const fromMin=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const lpHours=it=>it.mode==='hour'?it.hours:it.mode==='half'?4:8;
const lpEnd=it=>toMin(it.time)+lpHours(it)*60;
const lpPrice=it=>it.mode==='hour'?it.price*it.hours:it.mode==='half'?Math.round(it.price*4*.9/10)*10:Math.round(it.price*8*.8/10)*10;
const TIMES=(()=>{const a=[];for(let m=6*60;m<=20*60;m+=30)a.push(fromMin(m));return a})();
const durTxt=m=>{const h=Math.floor(m/60),mm=m%60;return h&&mm?t('dur_hm',{h,m:mm}):h?t('dur_h',{h}):t('dur_m',{m:mm})};
state.lb={mode:'hour',date:isoDay(1),time:'09:00',hours:3,meet:''};

function lpIssues(it,list){
  const out=[],same=list.filter(x=>x!==it&&x.date===it.date);
  const s=toMin(it.time),e=lpEnd(it);
  for(const o of same){const os=toMin(o.time),oe=lpEnd(o);
    if(s<oe&&os<e)out.push({lv:'bad',m:t('lp_overlap',{n:o.name,a:o.time,b:fromMin(oe)})});
    else if(o.prov+o.di!==it.prov+it.di){const gap=s>=oe?s-oe:os-e;if(gap<60)out.push({lv:'warn',m:t('lp_gap',{n:o.name})})}
  }
  if(e>22*60)out.push({lv:'warn',m:t('lp_late')});
  return out;
}
function lpItemFrom(g,lb){return {uid:'i'+Date.now().toString(36)+Math.floor(Math.random()*1e4),gid:g.id,prov:state.province.en,di:g.di,name:g.name,initials:g.initials,color:g.color,price:g.price,mode:lb.mode,date:lb.date,time:lb.time,hours:lb.hours,meet:lb.meet.trim()}}
function localBookHTML(g){
  const lb=state.lb,it=lpItemFrom(g,lb),iss=lpIssues(it,LP.items),tr=g.tours;
  return `<div class="seg3" id="lbMode">${['hour','half','full'].map(m=>`<button type="button" data-lm="${m}" aria-pressed="${lb.mode===m}">${t('lb_'+m)}</button>`).join('')}</div>
  ${lb.mode!=='hour'?`<p class="note">${esc((tr.find(x=>x.k===lb.mode)||tr[0]).stops.map(id=>{const x=placesOf(state.province).find(y=>y.id===id);return x?placeName(x):id}).join(' → '))}</p>`:''}
  <div class="lb-grid"><div class="field"><label for="lbDate">${t('lp_date')}</label><input class="input" type="date" id="lbDate" min="${isoDay(0)}" value="${lb.date}"></div>
  <div class="field"><label for="lbTime">${t('lp_time')}</label><select class="input" id="lbTime">${TIMES.map(x=>`<option${x===lb.time?' selected':''}>${x}</option>`).join('')}</select></div></div>
  ${lb.mode==='hour'?`<div class="stepper"><span class="sec-label">${t('hours')}</span><span class="ctr"><button id="lbMinus" aria-label="−">−</button><output>${lb.hours}</output><button id="lbPlus" aria-label="+">+</button></span></div>`:''}
  <div class="field"><label for="lbMeet">${t('lp_meet')}</label><input class="input" id="lbMeet" maxlength="80" value="${esc(lb.meet)}" placeholder="${esc(t('lp_meet_ph',{d:dname(state.province,g.di)}))}"></div>
  <div class="lb-sum">${SVG(IC.clock)}<span><b>${fmtDate(lb.date)} · ${lb.time}–${fromMin(lpEnd(it))}</b><small>${t('k_dist',{d:esc(dname(state.province,g.di))})}</small></span></div>
  ${iss.map(i=>`<p class="lp-iss ${i.lv}">${SVG(i.lv==='bad'?IC.alert:IC.clock)}<span>${esc(i.m)}</span></p>`).join('')}
  <p class="note">${t('lp_add_note')}</p>`;
}
function localFootHTML(g){const it=lpItemFrom(g,state.lb);return `<span class="ft-tot"><small>${t('total')} · ${t('lb_'+it.mode)}</small><b>${money(lpPrice(it))}</b></span><button class="btn primary" id="bookBtn">${state.gtab==='book'?t('lp_add'):t('continue')}</button>`}
function bindLocalBook(el,g){
  const q=x=>el.querySelector(x),lb=state.lb;
  q('#lbMode')&&(q('#lbMode').onclick=e=>{const b=e.target.closest('[data-lm]');if(b){lb.mode=b.dataset.lm;renderPanel()}});
  q('#lbDate')&&(q('#lbDate').onchange=e=>{lb.date=e.target.value||isoDay(1);renderPanel()});
  q('#lbTime')&&(q('#lbTime').onchange=e=>{lb.time=e.target.value;renderPanel()});
  q('#lbMinus')&&(q('#lbMinus').onclick=()=>{lb.hours=Math.max(1,lb.hours-1);renderPanel()});
  q('#lbPlus')&&(q('#lbPlus').onclick=()=>{lb.hours=Math.min(10,lb.hours+1);renderPanel()});
  q('#lbMeet')&&(q('#lbMeet').oninput=e=>{lb.meet=e.target.value.slice(0,80)});
}
function lpAddFromPanel(g){
  const it=lpItemFrom(g,state.lb);
  if(lpIssues(it,LP.items).some(i=>i.lv==='bad')){toast(t('lp_fix'));return}
  LP.items.push(it);lpSave();
  const last=state.lb;state.lb={mode:'hour',date:last.date,time:fromMin(Math.min(20*60,lpEnd(it)+60)),hours:3,meet:''};
  toast(t('lp_added',{n:g.name}));
  state.selected=null;MAP.select(null);renderPanel();
}

/* ----- plan screen ----- */
function renderLPlan(){
  const el=$('#lpBody');if(!el)return;
  const items=LP.items.slice().sort((a,b)=>a.date.localeCompare(b.date)||toMin(a.time)-toMin(b.time));
  const bad=items.some(it=>lpIssues(it,items).some(i=>i.lv==='bad'));
  const total=items.reduce((a,it)=>a+lpPrice(it),0);
  const days=[...new Set(items.map(i=>i.date))];
  let h=`<header class="page-h sub"><button class="icon-btn" data-go="map" aria-label="Back">${SVG('<path d="m15 18-6-6 6-6" />',2)}</button><h1>${t('lp_title')}</h1></header>
  <p class="lp-lead">${t('lp_lead')}</p>`;
  if(!items.length)h+=`<div class="empty-state">${SVG(IC.mappinned,1.5)}<span>${t('lp_empty')}</span><button class="btn primary" data-lp="pick">${t('lp_pick')}</button></div>`;
  for(const d of days){
    const list=items.filter(i=>i.date===d);
    h+=`<section class="lp-day"><h2>${fmtDate(d)}</h2><ol class="lp-tl">`;
    list.forEach((it,i)=>{
      const P2=PROV.find(p=>p.en===it.prov)||state.province,iss=lpIssues(it,items);
      if(i){const pv=list[i-1],gap=toMin(it.time)-lpEnd(pv);h+=`<li class="lp-gap${gap<0?' bad':''}">${SVG(gap<60&&pv.di!==it.di?IC.car:IC.clock)}<span>${gap>=0?t('lp_free',{d:durTxt(gap)}):t('lp_clash')}</span></li>`}
      h+=`<li class="lp-it${iss.some(x=>x.lv==='bad')?' bad':''}"><span class="lp-t"><b>${it.time}</b><small>${fromMin(lpEnd(it))}</small></span>
      <div class="lp-card"><div class="lp-top"><span class="av" style="background:${it.color}">${it.initials}</span><span class="lp-id"><b>${esc(it.name)}</b><small>${esc(t('k_dist',{d:dname(P2,it.di)}))} · ${pname(P2)}</small></span><b class="lp-pr">${money(lpPrice(it))}</b></div>
      <div class="lp-ctl"><select class="input sm" data-lpf="mode" data-u="${it.uid}">${['hour','half','full'].map(m=>`<option value="${m}"${it.mode===m?' selected':''}>${t('lb_'+m)}</option>`).join('')}</select>
      <input class="input sm" type="date" data-lpf="date" data-u="${it.uid}" min="${isoDay(0)}" value="${it.date}">
      <select class="input sm" data-lpf="time" data-u="${it.uid}">${TIMES.map(x=>`<option${x===it.time?' selected':''}>${x}</option>`).join('')}</select>
      ${it.mode==='hour'?`<select class="input sm" data-lpf="hours" data-u="${it.uid}">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option value="${n}"${n===it.hours?' selected':''}>${t('hrs',{n})}</option>`).join('')}</select>`:''}</div>
      <label class="lp-meet">${SVG(IC.pin)}<input class="input sm" data-lpf="meet" data-u="${it.uid}" maxlength="80" value="${esc(it.meet)}" placeholder="${esc(t('lp_meet_ph',{d:dname(P2,it.di)}))}"></label>
      ${iss.map(x=>`<p class="lp-iss ${x.lv}">${SVG(x.lv==='bad'?IC.alert:IC.clock)}<span>${esc(x.m)}</span></p>`).join('')}
      <button class="lp-rm" data-lp="rm" data-u="${it.uid}">${SVG(IC.trash)}${t('remove')}</button></div></li>`;
    });
    h+=`</ol></section>`;
  }
  if(items.length)h+=`<button class="btn line block" data-lp="pick">${SVG(IC.userplus)}${t('lp_more')}</button>
    <div class="lp-foot"><span class="ft-tot"><small>${t('lp_n',{n:items.length})}</small><b>${money(total)}</b></span><button class="btn primary" data-lp="ok"${bad?' disabled':''}>${t('lp_confirm')}</button></div>
    ${bad?`<p class="lp-iss bad">${SVG(IC.alert)}<span>${t('lp_fix')}</span></p>`:''}`;
  el.innerHTML=h;
}
$('#lpBody').addEventListener('change',e=>{const f=e.target.dataset.lpf;if(!f)return;const it=LP.items.find(x=>x.uid===e.target.dataset.u);if(!it)return;it[f]=f==='hours'?+e.target.value:e.target.value;lpSave();renderLPlan()});
$('#lpBody').addEventListener('input',e=>{if(e.target.dataset.lpf==='meet'){const it=LP.items.find(x=>x.uid===e.target.dataset.u);if(it){it.meet=e.target.value.slice(0,80);lpSave()}}});
$('#lpBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-lp]');if(!b)return;const k=b.dataset.lp;
  if(k==='pick'){F.kind='local';show('map')}
  else if(k==='rm'){LP.items=LP.items.filter(x=>x.uid!==b.dataset.u);lpSave();renderLPlan()}
  else if(k==='ok')lpConfirm();
});
function lpConfirm(){
  const items=LP.items.slice();if(!items.length)return;
  for(const it of items){
    APPTS.push(Object.assign({},it,{id:'a'+it.uid,end:fromMin(lpEnd(it)),total:lpPrice(it),status:'ok',r24:false,r60:false,at:Date.now()}));
    const p=PROV.find(x=>x.en===it.prov),cid=it.prov+':'+it.gid;let c=chats.find(x=>x.id===cid);
    if(!c){c={id:cid,name:it.name,initials:it.initials,color:it.color,prov:it.prov,msgs:[{me:false,k:'chat_hello',at:Date.now()}],unread:0};chats.unshift(c)}
    c.msgs.push({me:true,text:t('lp_msg',{d:fmtDate(it.date),a:it.time,b:fromMin(lpEnd(it)),m:it.meet||t('lp_meet_ph',{d:dname(p,it.di)})}),at:Date.now()});
    c.msgs.push({me:false,text:t('lp_reply',{a:it.time}),at:Date.now()+1});c.unread=(c.unread||0)+1;
  }
  apSave();save();LP.items=[];lpSave();
  addNotif('appt',{n:items.length},'cal');renderBadges();toast(t('lp_done'));show('appts');checkReminders();
}

/* ----- appointments + reminders ----- */
let APPTS=store.get('appts')||[];
const apSave=()=>store.set('appts',APPTS);
const apStart=a=>new Date(a.date+'T'+a.time).getTime();
function untilTxt(ms){const m=Math.round(ms/60000);if(m<60)return t('in_m',{m:Math.max(1,m)});const h=Math.floor(m/60);if(h<24)return t('in_h',{h,m:m%60});return t('in_d',{d:Math.round(h/24)})}
function nextAppt(){const now=Date.now();return APPTS.filter(a=>a.status==='ok'&&apStart(a)+lpHours(a)*36e5>now).sort((a,b)=>apStart(a)-apStart(b))[0]}
function checkReminders(){
  const now=Date.now();let ch=false;
  for(const a of APPTS){if(a.status!=='ok')continue;const d=apStart(a)-now;
    if(d>0&&d<=24*36e5&&!a.r24&&d>60*6e4){a.r24=true;ch=true;addNotif('rem24',{n:a.name,a:a.time,m:a.meet||'-'},'clock')}
    if(d>0&&d<=60*6e4&&!a.r60){a.r60=true;a.r24=true;ch=true;addNotif('rem60',{n:a.name,a:a.time,m:a.meet||'-'},'clock');toast(t('n_rem60_t',{n:a.name,a:a.time}))}}
  if(ch){apSave();if(state.screen==='notif')renderNotif()}
}
setInterval(checkReminders,30000);
const canDownload=()=>/workers\.dev$|^localhost$|^127\./.test(location.hostname);
function icsFor(a){
  const P2=PROV.find(p=>p.en===a.prov),f=(d,tm)=>d.replace(/-/g,'')+'T'+tm.replace(':','')+'00';
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Journey//TH','BEGIN:VEVENT','UID:'+a.id+'@journey','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z',
    'DTSTART;TZID=Asia/Bangkok:'+f(a.date,a.time),'DTEND;TZID=Asia/Bangkok:'+f(a.date,a.end),'SUMMARY:'+t('ics_sum',{n:a.name}),'LOCATION:'+(a.meet||dname(P2,a.di)+', '+pname(P2)),
    'BEGIN:VALARM','TRIGGER:-PT60M','ACTION:DISPLAY','DESCRIPTION:Journey','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
}
function renderAppts(){
  const el=$('#apBody');if(!el)return;const now=Date.now();
  const up=APPTS.filter(a=>a.status==='ok'&&apStart(a)+lpHours(a)*36e5>now).sort((a,b)=>apStart(a)-apStart(b));
  const past=APPTS.filter(a=>!up.includes(a)).sort((a,b)=>apStart(b)-apStart(a)).slice(0,20);
  const card=(a,isUp)=>{const P2=PROV.find(p=>p.en===a.prov)||PROV[0],st=apStart(a);
    return `<div class="ap-card${isUp?'':' past'}"><div class="ap-when"><b>${new Date(st).getDate()}</b><small>${new Date(st).toLocaleDateString(state.lang,{month:'short'})}</small></div>
    <div class="ap-main"><b>${a.time}–${a.end} · ${esc(a.name)}</b><small>${esc(t('k_dist',{d:dname(P2,a.di)}))} · ${pname(P2)}</small><small>${SVG(IC.pin)}${esc(a.meet||t('lp_meet_ph',{d:dname(P2,a.di)}))}</small>
    ${isUp?`<span class="ap-cd">${SVG(IC.alarm)}${st>now?untilTxt(st-now):t('ap_now')}</span>`:`<span class="ap-st">${t(a.status==='cancel'?'ap_cancelled':'ap_done')}</span>`}
    ${isUp?`<div class="ap-acts"><button class="btn line sm" data-ap="chat" data-id="${a.id}">${SVG(IC.chat)}${t('chat')}</button>${canDownload()?`<button class="btn line sm" data-ap="ics" data-id="${a.id}">${SVG(IC.calplus)}${t('ap_cal')}</button>`:''}<button class="btn line sm danger" data-ap="cancel" data-id="${a.id}">${t('cancel')}</button></div>`:''}</div></div>`};
  el.innerHTML=`<header class="page-h sub"><button class="icon-btn" id="apBack" aria-label="Back">${SVG('<path d="m15 18-6-6 6-6" />',2)}</button><h1>${t('ap_title')}</h1></header>
  ${up.length?`<section class="g-sec"><h2 class="sec-t">${t('ap_up')}</h2>${up.map(a=>card(a,true)).join('')}</section>`:`<div class="empty-state">${SVG(IC.cal,1.5)}<span>${t('ap_none')}</span><button class="btn primary" data-ap="new">${t('lp_pick')}</button></div>`}
  ${past.length?`<section class="g-sec"><h2 class="sec-t">${t('ap_past')}</h2>${past.map(a=>card(a,false)).join('')}</section>`:''}`;
  $('#apBack').onclick=()=>show(state.apFrom&&state.apFrom!=='appts'?state.apFrom:'profile');
}
$('#apBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-ap]');if(!b)return;const k=b.dataset.ap,a=APPTS.find(x=>x.id===b.dataset.id);
  if(k==='new'){F.kind='local';goMap();return}
  if(!a)return;
  if(k==='chat')openThread(a.prov+':'+a.gid);
  else if(k==='ics'){const u=URL.createObjectURL(new Blob([icsFor(a)],{type:'text/calendar'}));const l=document.createElement('a');l.href=u;l.download='journey-'+a.date+'.ics';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
  else if(k==='cancel'){if(b.dataset.sure){a.status='cancel';apSave();toast(t('ap_cancelled'));renderAppts()}else{b.dataset.sure=1;b.textContent=t('ap_sure')}}
});
function openAppts(){state.apFrom=state.screen;show('appts')}
function apptCardHTML(){const a=nextAppt();if(!a)return '';const P2=PROV.find(p=>p.en===a.prov)||PROV[0],st=apStart(a);
  return `<button class="next-ap" id="nextAp"><span class="na-ic">${SVG(IC.alarm)}</span><span class="na-main"><small>${t('ap_next')} · ${st>Date.now()?untilTxt(st-Date.now()):t('ap_now')}</small><b>${fmtDate(a.date)} ${a.time} · ${esc(a.name)}</b><span>${esc(a.meet||t('k_dist',{d:dname(P2,a.di)}))}</span></span>${SVG(IC.chev,2,'chev')}</button>`}
