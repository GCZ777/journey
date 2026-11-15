/* =====================================================================
   VIEWS (1): dashboard, bookings, calendar, journeys
   ===================================================================== */
const itemName=b=>{const o=orgById(b.org),Rs=DB.res[b.org]||{};
  if(b.kind==='stay'){const r=(Rs.rooms||[]).find(x=>x.id===b.item);return (r?r.name:T('ห้องพัก','Room'))+' · '+T(b.nights+' คืน',b.nights+' nights')}
  if(b.kind==='transport'){const r=(Rs.routes||[]).find(x=>x.id===b.route);return (r?r.name:T('รถรับส่ง','Transfer'))+(b.item==='rt_air_back'?T(' (ขากลับ)',' (return)'):'')}
  if(b.kind==='tour'){const p=(Rs.products||[]).find(x=>x.id===b.item);return p?p.name:T('ทัวร์','Tour')}
  if(b.kind==='dine')return T('โต๊ะ ','Table for ')+b.party+T(' ท่าน','');
  if(b.kind==='attraction')return T('บัตร ','Tickets ×')+b.party+T(' ใบ','');
  return b.item};
const cName=id=>{const c=custById(id);return c?c.name:'—'};
const flag=cc=>cc&&cc.length===2?String.fromCodePoint(...[...cc.toUpperCase()].map(c=>127397+c.charCodeAt(0))):'';

/* ----- dashboard ----- */
VIEWS.dash=()=>{
  const o=me(),bs=myBookings(),td=iso(0),live=bs.filter(b=>b.status!=='cancelled');
  const todayB=live.filter(b=>b.date===td),week=live.filter(b=>b.date>=iso(0)&&b.date<=iso(6));
  const m0=iso(-29),rev=live.filter(b=>b.date>=m0&&b.date<=td).reduce((a,b)=>a+b.amount,0);
  const rv=DB.reviews.filter(r=>r.org===o.id),avg=rv.length?(rv.reduce((a,r)=>a+r.stars,0)/rv.length).toFixed(1):'–';
  let occ='';
  if(has('stay')){const units=(R().rooms||[]).reduce((a,r)=>a+(+r.units||0),0);const inHouse=live.filter(b=>b.kind==='stay'&&b.date<=td&&addDk(b.date,b.nights)>td).length;occ=kpi(T('อัตราเข้าพักวันนี้','Occupancy today'),Math.round(inHouse/Math.max(1,units)*100)+'%',T(inHouse+' จาก '+units+' ห้อง',inHouse+' of '+units+' rooms'),'bed')}
  else if(has('transport')){const seats=todayB.filter(b=>b.kind==='transport').reduce((a,b)=>a+b.qty,0);occ=kpi(T('ผู้โดยสารวันนี้','Passengers today'),num(seats),T(todayB.filter(b=>b.kind==='transport').length+' การจอง',todayB.filter(b=>b.kind==='transport').length+' bookings'),'bus')}
  const days=[...Array(30)].map((_,i)=>{const k=iso(i-29);return {l:new Date(k+'T00:00').getDate()+'',v:live.filter(b=>b.date===k).reduce((a,b)=>a+b.amount,0),hi:k===td}});
  const next=live.filter(b=>b.date>=td&&b.status!=='done').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,7);
  const hand=handoffs().slice(0,5);
  const n=DB.notifs.filter(x=>x.org===o.id).slice(0,4);
  return `<div class="vh"><div><h1>${T('สวัสดี','Hello')}, ${esc(DB.user.name.split(' ')[0])}</h1><p class="sub">${esc(o.name)} · ${esc(pName(o.prov))} · ${new Date().toLocaleDateString(loc(),{weekday:'long',day:'numeric',month:'long'})}</p></div>
   <div class="vh-a"><button class="btn ghost" data-go="calendar">${SVG(IC.calendar)}${T('ปฏิทิน','Calendar')}</button><button class="btn primary" id="newBk">${SVG(IC.plus,2.2)}${T('เพิ่มการจอง','New booking')}</button></div></div>
  <div class="kpis">${kpi(T('การจองวันนี้','Today'),num(todayB.length),T(todayB.filter(b=>b.status==='new').length+' รายการใหม่ต้องยืนยัน',todayB.filter(b=>b.status==='new').length+' new to confirm'),'calcheck')}
   ${kpi(T('7 วันข้างหน้า','Next 7 days'),num(week.length),T(new Set(week.map(b=>b.cust)).size+' ลูกค้า',new Set(week.map(b=>b.cust)).size+' customers'),'calendar')}
   ${kpi(T('รายได้ 30 วัน','Revenue, 30 days'),money(rev),T('ก่อนหักค่าบริการ','before fees'),'wallet','acc')}
   ${occ||kpi(T('คะแนนรีวิว','Rating'),avg,T(rv.length+' รีวิว',rv.length+' reviews'),'star')}</div>
  <div class="grid2">
   <section class="card"><div class="card-h"><h2>${T('รายได้รายวัน','Daily revenue')}</h2><span class="muted">${T('30 วันล่าสุด','Last 30 days')}</span></div>${bars(days,{money:true,label:T('รายได้รายวัน','Daily revenue')})}</section>
   <section class="card"><div class="card-h"><h2>${T('ส่งต่อระหว่างพาร์ทเนอร์','Partner hand-offs')}</h2><a href="#journeys" data-go="journeys" class="lnk">${T('ดูเส้นทางลูกค้า','Journeys')}</a></div>
    ${hand.length?`<ul class="hand">${hand.map(h=>`<li><span class="hd-ic" style="--c:${KINDS[h.fromKind]?KINDS[h.fromKind].c:'#888'}">${SVG(IC[KIND_IC[h.fromKind]||'route'])}</span><span><b>${esc(h.text)}</b><small>${esc(h.sub)}</small></span><em>${h.time}</em></li>`).join('')}</ul>`:`<p class="muted">${T('ไม่มีการส่งต่อวันนี้','No hand-offs today')}</p>`}</section>
  </div>
  <div class="grid2">
   <section class="card"><div class="card-h"><h2>${T('การจองถัดไป','Coming up')}</h2><a href="#bookings" data-go="bookings" class="lnk">${T('ทั้งหมด','All')}</a></div>
    ${next.length?`<ul class="list">${next.map(b=>`<li data-bk="${b.id}" tabindex="0"><span class="when"><b>${b.time}</b><small>${fmtD(b.date)}</small></span><span class="lm"><b>${esc(cName(b.cust))} ${flag((custById(b.cust)||{}).country)}</b><small>${SVG(IC[KIND_IC[b.kind]])}${esc(itemName(b))}</small></span>${pill(b.status)}</li>`).join('')}</ul>`:`<p class="muted">${T('ยังไม่มีการจอง','No bookings')}</p>`}</section>
   <section class="card"><div class="card-h"><h2>${T('แจ้งเตือน','Notifications')}</h2></div><ul class="list nt">${n.map(x=>`<li class="${x.read?'':'unread'}"><span class="lm"><b>${esc(x.text)}</b><small>${rel(x.at)}</small></span></li>`).join('')||`<li class="muted">${T('ไม่มีแจ้งเตือน','Nothing new')}</li>`}</ul>
    ${govNotices()}</section>
  </div>`;
};
const addDk=(k,n)=>dKey(addD(new Date(k+'T00:00'),n));
function govNotices(){const pub=JSON.parse(localStorage.getItem('jy_partner_pub')||'{}').ann||[];const mine=pub.filter(a=>a.prov===me().prov&&a.to>=iso(0)).slice(0,2);
  return mine.length?`<div class="gnot">${mine.map(a=>`<div class="gn ${a.level}">${SVG(IC[a.level==='info'?'info':'alert'])}<span><b>${esc(a.title)}</b><small>${esc(a.org)} · ${esc(a.body)}</small></span></div>`).join('')}</div>`:''}
/* who is about to hand a customer to whom (today + tomorrow) */
function handoffs(){
  const o=me().id,out=[],lim=[iso(0),iso(1)];
  for(const tr of DB.trips){const L=tr.legs;for(let i=0;i<L.length;i++){const l=L[i];if(!lim.includes(l.date))continue;
    const nx=L[i+1];if(!nx)continue;
    if(nx.org===o&&l.org!==o){const from=l.org?orgById(l.org).name:T('เที่ยวบิน','Flight');out.push({time:l.time,date:l.date,fromKind:l.kind,text:T(`${cName(tr.cust)} มาจาก ${from}`,`${cName(tr.cust)} coming from ${from}`),sub:fmtD(l.date)+' · '+kLbl(l.kind)+' → '+kLbl(nx.kind)})}
    if(l.org===o&&nx.org&&nx.org!==o){out.push({time:nx.time,date:nx.date,fromKind:nx.kind,text:T(`${cName(tr.cust)} ไปต่อที่ ${orgById(nx.org).name}`,`${cName(tr.cust)} goes on to ${orgById(nx.org).name}`),sub:fmtD(nx.date)+' · '+kLbl(nx.kind)})}
  }}
  return out.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}
BIND.dash=v=>{$('#newBk',v).onclick=()=>bookingForm();};

/* ----- bookings ----- */
VIEWS.bookings=()=>{
  const f=STATE.f.bk=STATE.f.bk||{st:'all',k:'all',when:'upcoming'},q=(STATE.q.bk||'').toLowerCase();
  let bs=myBookings();
  if(f.st!=='all')bs=bs.filter(b=>b.status===f.st);if(f.k!=='all')bs=bs.filter(b=>b.kind===f.k);
  if(f.when==='today')bs=bs.filter(b=>b.date===iso(0));else if(f.when==='upcoming')bs=bs.filter(b=>b.date>=iso(0));else if(f.when==='past')bs=bs.filter(b=>b.date<iso(0));
  if(q)bs=bs.filter(b=>(cName(b.cust)+' '+itemName(b)+' '+b.id).toLowerCase().includes(q));
  bs.sort((a,b)=>f.when==='past'?(b.date+b.time).localeCompare(a.date+a.time):(a.date+a.time).localeCompare(b.date+b.time));
  const kinds=[...new Set(myBookings().map(b=>b.kind))];
  const counts=s=>myBookings().filter(b=>b.status===s&&(s==='done'?b.date>=iso(-30):b.date>=iso(0))).length;
  return `<div class="vh"><div><h1>${T('การจองทั้งหมด','Bookings')}</h1><p class="sub">${T('การจองจากแอป Journey พาร์ทเนอร์ แพ็กเกจ และวอล์กอิน รวมไว้ที่เดียว','Bookings from the Journey app, partners, packages and walk-ins in one place')}</p></div><div class="vh-a"><button class="btn ghost" id="bkCsv">${SVG(IC.download)}CSV</button><button class="btn primary" id="newBk">${SVG(IC.plus,2.2)}${T('เพิ่มการจอง','New booking')}</button></div></div>
  <div class="pipe">${['new','confirmed','inprogress','done'].map(s=>`<button data-fst="${s}" class="${f.st===s?'on':''}"><b>${counts(s)}</b>${pill(s)}</button>`).join('')}</div>
  <div class="toolbar"><label class="search">${SVG(IC.search)}<input id="bkQ" value="${esc(STATE.q.bk||'')}" placeholder="${T('ค้นหาชื่อลูกค้า รายการ หรือเลขที่จอง','Search customer, item or booking #')}"></label>
   <select id="bkWhen">${[['today',T('วันนี้','Today')],['upcoming',T('ที่จะมาถึง','Upcoming')],['past',T('ที่ผ่านมา','Past')],['all',T('ทุกวัน','All dates')]].map(([v,l])=>`<option value="${v}"${f.when===v?' selected':''}>${l}</option>`).join('')}</select>
   <select id="bkSt"><option value="all">${T('ทุกสถานะ','All statuses')}</option>${['new','confirmed','inprogress','done','cancelled','noshow'].map(s=>`<option value="${s}"${f.st===s?' selected':''}>${T(STATUS[s][0],STATUS[s][1])}</option>`).join('')}</select>
   ${kinds.length>1?`<select id="bkK"><option value="all">${T('ทุกประเภท','All types')}</option>${kinds.map(k=>`<option value="${k}"${f.k===k?' selected':''}>${kLbl(k)}</option>`).join('')}</select>`:''}<span class="count">${bs.length} ${T('รายการ','bookings')}</span></div>
  ${table([{l:T('วันเวลา','When'),f:b=>`<b>${fmtDW(b.date)}</b><br><small class="muted">${b.time}</small>`},{l:T('ลูกค้า','Customer'),f:b=>{const c=custById(b.cust);return `<b>${esc(c.name)}</b> ${flag(c.country)}<br><small class="muted">${T(b.party+' ท่าน',b.party+' pax')}${c.tags.includes('VIP')?' · VIP':''}</small>`}},
    {l:T('รายการ','Item'),f:b=>`${SVG(IC[KIND_IC[b.kind]],1.8,'ti')} ${esc(itemName(b))}`},{l:T('ช่องทาง','Source'),f:b=>`<span class="src">${esc(T(...SRC[b.src]))}</span>`},{l:T('ยอด','Amount'),r:1,f:b=>money(b.amount)},{l:T('สถานะ','Status'),f:b=>pill(b.status)}],bs.slice(0,200),{rowAttr:b=>`data-bk="${b.id}" tabindex="0"`,empty:T('ไม่มีการจองตามตัวกรองนี้','No bookings match these filters'),emptyIc:'calcheck'})}`;
};
BIND.bookings=v=>{
  const f=STATE.f.bk;let qt;
  $('#bkQ',v).oninput=e=>{STATE.q.bk=e.target.value;clearTimeout(qt);qt=setTimeout(()=>{render();const i=$('#bkQ');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
  $('#bkWhen',v).onchange=e=>{f.when=e.target.value;render()};$('#bkSt',v).onchange=e=>{f.st=e.target.value;render()};$('#bkK',v)&&($('#bkK',v).onchange=e=>{f.k=e.target.value;render()});
  $$('[data-fst]',v).forEach(b=>b.onclick=()=>{f.st=f.st===b.dataset.fst?'all':b.dataset.fst;f.when=f.st==='done'?'all':f.when;render()});
  $('#newBk',v).onclick=()=>bookingForm();
  $('#bkCsv',v).onclick=()=>csv('bookings',[['id','date','time','customer','country','item','kind','party','amount','status','source']].concat(myBookings().map(b=>{const c=custById(b.cust);return [b.id,b.date,b.time,c.name,c.country,itemName(b),b.kind,b.party,b.amount,b.status,b.src]})));
};
function csv(name,rows){
  const txt=rows.map(r=>r.map(x=>/[",\n]/.test(String(x))?'"'+String(x).replace(/"/g,'""')+'"':x).join(',')).join('\n');
  if(/workers\.dev$/.test(location.hostname)||location.protocol==="file:"){try{const u=URL.createObjectURL(new Blob(['﻿'+txt],{type:'text/csv'}));const a=document.createElement('a');a.href=u;a.download='journey-'+name+'-'+iso(0)+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);toast(T('ดาวน์โหลดแล้ว','Downloaded'));return}catch(e){}}
  (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast(T('คัดลอกข้อมูล CSV แล้ว','CSV copied to clipboard'))).catch(()=>toast(T('ดาวน์โหลดได้บนเว็บจริง','Download works on the live site')));
}
function bookingDetail(id){
  const b=DB.bookings.find(x=>x.id===id);if(!b)return;const c=custById(b.cust),tr=DB.trips.find(t=>t.id===b.trip);
  const flow={new:['confirmed','cancelled'],confirmed:['inprogress','noshow','cancelled'],inprogress:['done'],done:[],cancelled:[],noshow:[]}[b.status]||[];
  const lbl={confirmed:T('ยืนยันการจอง','Confirm'),inprogress:b.kind==='stay'?T('เช็กอิน','Check in'):b.kind==='transport'?T('รับผู้โดยสารแล้ว','Picked up'):T('เริ่มให้บริการ','Start'),done:b.kind==='stay'?T('เช็กเอาต์','Check out'):T('เสร็จสิ้น','Complete'),noshow:T('ไม่มาตามนัด','No-show'),cancelled:T('ยกเลิก','Cancel')};
  drawer(T('การจอง #','Booking #')+b.id.slice(1),`<div class="bd-top">${pill(b.status)}<span class="src">${esc(T(...SRC[b.src]))}</span></div>
   <div class="bd-grid"><div><small>${T('ลูกค้า','Customer')}</small><b>${esc(c.name)} ${flag(c.country)}</b><span>${T(b.party+' ท่าน · ภาษา ',b.party+' pax · speaks ')}${c.lang.toUpperCase()}</span></div>
   <div><small>${T('รายการ','Item')}</small><b>${esc(itemName(b))}</b><span>${fmtDW(b.date)} · ${b.time}${b.kind==='stay'?' → '+fmtD(addDk(b.date,b.nights)):''}</span></div>
   <div><small>${T('ยอดรวม','Total')}</small><b>${money(b.amount)}</b><span>${T('ค่าบริการแพลตฟอร์ม 12%: ','Platform fee 12%: ')}${money(b.amount*.12)}</span></div>
   <div><small>${T('ความต้องการพิเศษ','Special needs')}</small><b>${esc([c.diet,c.access].filter(Boolean).join(' · ')||'—')}</b><span>${c.tags.includes('VIP')?'VIP':''}</span></div></div>
   ${b.notes?`<p class="note">${SVG(IC.info)}${esc(b.notes)}</p>`:''}
   ${tr&&c.consent?`<div class="bd-sec"><h3>${T('เส้นทางของลูกค้าทริปนี้','This customer’s journey')}</h3>${journeyTimeline(tr,true)}</div>`:tr?`<p class="note">${SVG(IC.lock)}${T('ลูกค้าไม่ได้อนุญาตให้แชร์แผนการเดินทางกับพาร์ทเนอร์','Customer has not shared their itinerary with partners')}</p>`:''}
   <div class="dr-foot">${flow.map(s=>`<button class="btn ${s==='cancelled'||s==='noshow'?'ghost danger':'primary'}" data-to="${s}">${lbl[s]}</button>`).join('')}<span class="sp"></span><button class="btn ghost" id="bdMsg">${SVG(IC.chat)}${T('ข้อความ','Message')}</button>${tr&&c.consent?`<button class="btn ghost" id="bdRoom">${SVG(IC.users)}${T('ห้องแชททริป','Trip room')}</button>`:''}</div>`,bd=>{
    $$('[data-to]',bd).forEach(x=>x.onclick=()=>{const go2=()=>{b.status=x.dataset.to;const leg=tr&&tr.legs.find(l=>l.id===b.leg);if(leg)leg.status=b.status;save();toast(T('อัปเดตสถานะแล้ว','Status updated'));bookingDetail(id);render()};x.dataset.to==='cancelled'?confirmBox(T('ยกเลิกการจองนี้? ระบบจะแจ้งลูกค้าและพาร์ทเนอร์ในทริปโดยอัตโนมัติ','Cancel this booking? The customer and trip partners will be notified.'),go2,true):go2()});
    $('#bdMsg',bd).onclick=()=>{closeDrawer();openThread(threadFor('customer',b.cust).id)};
    $('#bdRoom',bd)&&($('#bdRoom',bd).onclick=()=>{closeDrawer();openThread(tripRoom(tr).id)});
  },true);
}
function bookingForm(){
  const kinds=me().types.filter(k=>k!=='gov'),items={stay:(R().rooms||[]).map(r=>[r.id,r.name]),transport:(R().routes||[]).map(r=>[r.id,r.name]),tour:(R().products||[]).map(p=>[p.id,p.name]),dine:[['table',T('จองโต๊ะ','Table')]],attraction:(R().tickets||[]).map(t=>[t.id,t.name]).concat([['ticket',T('บัตรเข้าชม','Ticket')]])};
  const obj={kind:kinds[0],cname:'',country:'TH',date:iso(0),time:'12:00',party:2,nights:1,item:'',amount:'',src:'walkin'};
  const sch=()=>[{k:'cname',l:T('ชื่อลูกค้า','Customer name'),req:1},{k:'country',l:T('ประเทศ (รหัส 2 ตัว)','Country (2-letter)')},{k:'kind',l:T('ประเภท','Type'),t:'select',o:()=>kinds.map(k=>[k,kName(k)])},{k:'item',l:T('รายการ','Item'),t:'select',o:()=>items[obj.kind]||[]},{k:'date',l:T('วันที่','Date'),t:'date'},{k:'time',l:T('เวลา','Time'),t:'time'},{k:'party',l:T('จำนวนคน','Party size'),t:'number'},...(obj.kind==='stay'?[{k:'nights',l:T('จำนวนคืน','Nights'),t:'number'}]:[]),{k:'amount',l:T('ยอด (บาท)','Amount (THB)'),t:'money'},{k:'notes',l:T('หมายเหตุ','Notes'),t:'textarea'}];
  const paint=()=>drawer(T('เพิ่มการจอง','New booking'),formHTML(sch(),obj)+`<div class="dr-foot"><span class="sp"></span><button class="btn ghost" id="bfC">${T('ยกเลิก','Cancel')}</button><button class="btn primary" id="bfS">${T('บันทึกการจอง','Save booking')}</button></div>`,b=>{
    $('[data-k="kind"]',b).onchange=e=>{readForm(b,sch(),obj);obj.kind=e.target.value;obj.item='';paint()};
    $('#bfC',b).onclick=closeDrawer;
    $('#bfS',b).onclick=()=>{if(!readForm(b,sch(),obj))return;let c=DB.customers.find(x=>x.name.toLowerCase()===obj.cname.toLowerCase());
      if(!c){c={id:uid('c'),name:obj.cname,country:(obj.country||'TH').toUpperCase().slice(0,2),lang:'en',party:obj.party,diet:'',access:'',consent:false,tags:[],notes:''};DB.customers.push(c)}
      const it=obj.item||(items[obj.kind][0]||[''])[0];let amt=+obj.amount;
      if(!amt){if(obj.kind==='stay')amt=((R().rooms||[]).find(r=>r.id===it)||{price:0}).price*obj.nights;else if(obj.kind==='transport')amt=((R().routes||[]).find(r=>r.id===it)||{price:0}).price*obj.party;else if(obj.kind==='tour')amt=((R().products||[]).find(r=>r.id===it)||{price:0}).price*obj.party}
      DB.bookings.push({id:uid('b'),org:me().id,kind:obj.kind,cust:c.id,item:it,route:obj.kind==='transport'?it:null,date:obj.date,time:obj.time,nights:obj.kind==='stay'?+obj.nights:0,qty:obj.kind==='stay'?1:+obj.party,party:+obj.party,amount:amt,status:'confirmed',src:'walkin',created:Date.now(),notes:obj.notes||''});
      save();closeDrawer();toast(T('บันทึกการจองแล้ว','Booking saved'));render()};
  });
  paint();
}

/* ----- calendar / availability ----- */
VIEWS.calendar=()=>{
  const start=STATE.f.calStart||0,days=[...Array(14)].map((_,i)=>iso(start+i)),bs=myBookings().filter(b=>b.status!=='cancelled');
  const rows=[];
  if(has('stay'))(R().rooms||[]).forEach(r=>rows.push({k:'stay',id:r.id,name:r.name,cap:+r.units||0,used:d=>bs.filter(b=>b.kind==='stay'&&b.item===r.id&&b.date<=d&&addDk(b.date,b.nights)>d).length,unit:T('ห้อง','rooms')}));
  if(has('dine')){const cap=(R().tables||[]).reduce((a,t)=>a+(+t.seats||0),0)*2;rows.push({k:'dine',id:'dine',name:T('ที่นั่งร้านอาหาร (2 รอบ)','Restaurant covers (2 sittings)'),cap,used:d=>bs.filter(b=>b.kind==='dine'&&b.date===d).reduce((a,b)=>a+b.party,0),unit:T('ที่','covers')})}
  if(has('transport'))(R().routes||[]).forEach(r=>rows.push({k:'transport',id:r.id,name:r.name,cap:(+r.seats||0)*(r.times||[]).length,used:d=>bs.filter(b=>b.kind==='transport'&&b.route===r.id&&b.date===d).reduce((a,b)=>a+b.qty,0),unit:T('ที่นั่ง','seats')}));
  if(has('tour'))(R().products||[]).forEach(p=>rows.push({k:'tour',id:p.id,name:p.name,cap:(+p.cap||0)*(p.times||[]).length,used:d=>bs.filter(b=>b.kind==='tour'&&b.item===p.id&&b.date===d).reduce((a,b)=>a+b.party,0),unit:T('ที่','spots')}));
  if(has('attraction'))(R().tickets||[{id:'ticket',name:T('บัตรเข้าชม','Tickets'),quota:400}]).forEach(t=>rows.push({k:'attraction',id:t.id,name:t.name,cap:+t.quota||0,used:d=>bs.filter(b=>b.kind==='attraction'&&b.date===d).reduce((a,b)=>a+b.party,0),unit:T('ใบ','tickets')}));
  const bl=DB.blocks[me().id]||{};
  return `<div class="vh"><div><h1>${T('ปฏิทินและห้องว่าง','Calendar & availability')}</h1><p class="sub">${T('ดูที่ว่างของทุกบริการ แตะช่องเพื่อดูการจองหรือปิดรับจอง','See availability for every service. Tap a cell to see bookings or close sales.')}</p></div>
   <div class="vh-a"><button class="btn ghost" data-cal="-7">${SVG(IC.chevl)}</button><button class="btn ghost" data-cal="0">${T('วันนี้','Today')}</button><button class="btn ghost" data-cal="7">${SVG(IC.chevr)}</button></div></div>
  <div class="legend"><span><i class="lv0"></i>${T('ว่างมาก','Open')}</span><span><i class="lv2"></i>${T('ใกล้เต็ม','Filling')}</span><span><i class="lv3"></i>${T('เต็ม','Full')}</span><span><i class="lvx"></i>${T('ปิดรับจอง','Closed')}</span></div>
  ${rows.length?`<div class="cal-wrap"><table class="cal"><thead><tr><th>${T('บริการ','Service')}</th>${days.map(d=>`<th class="${d===iso(0)?'td':''}${[0,6].includes(new Date(d+'T00:00').getDay())?' we':''}"><small>${new Date(d+'T00:00').toLocaleDateString(loc(),{weekday:'short'})}</small><b>${new Date(d+'T00:00').getDate()}</b></th>`).join('')}</tr></thead>
  <tbody>${rows.map(r=>`<tr><th><span>${SVG(IC[KIND_IC[r.k]])}${esc(r.name)}</span><small>${r.cap} ${r.unit}/${T('วัน','day')}</small></th>${days.map(d=>{const closed=bl[r.id+':'+d],u=r.used(d),p=r.cap?u/r.cap:0,lv=closed?'lvx':p>=1?'lv3':p>=.7?'lv2':p>=.35?'lv1':'lv0';return `<td><button class="cc ${lv}" data-cell="${r.id}|${d}|${r.k}" title="${esc(r.name)} ${fmtD(d)}: ${u}/${r.cap}">${closed?SVG(IC.lock):`<b>${r.cap-u}</b><small>${T('ว่าง','left')}</small>`}</button></td>`}).join('')}</tr>`).join('')}</tbody></table></div>`:`<div class="empty">${SVG(IC.calendar,1.5)}<span>${T('เพิ่มห้อง เส้นทาง หรือกิจกรรมก่อน แล้วปฏิทินจะแสดงที่ว่างให้','Add rooms, routes or activities first and availability will show here')}</span></div>`}`;
};
BIND.calendar=v=>{
  $$('[data-cal]',v).forEach(b=>b.onclick=()=>{const n=+b.dataset.cal;STATE.f.calStart=n?Math.max(0,(STATE.f.calStart||0)+n):0;render()});
  $$('[data-cell]',v).forEach(b=>b.onclick=()=>{const [id,d,k]=b.dataset.cell.split('|'),bl=DB.blocks[me().id]=DB.blocks[me().id]||{},key=id+':'+d;
    const list=myBookings().filter(x=>x.status!=='cancelled'&&x.kind===k&&(k==='stay'?(x.item===id&&x.date<=d&&addDk(x.date,x.nights)>d):(k==='transport'?x.route===id:k==='tour'?x.item===id:true)&&(k==='stay'||x.date===d)));
    drawer(fmtDW(d),`<label class="fld tog"><span>${T('ปิดรับจองวันนี้สำหรับบริการนี้','Close sales for this service on this day')}</span><input type="checkbox" class="sw" id="blk"${bl[key]?' checked':''}></label>
     <h3 class="h3">${T('การจอง','Bookings')} (${list.length})</h3>${list.length?`<ul class="list">${list.map(x=>`<li data-bk="${x.id}" tabindex="0"><span class="when"><b>${x.time}</b></span><span class="lm"><b>${esc(cName(x.cust))}</b><small>${esc(itemName(x))} · ${T(x.party+' ท่าน',x.party+' pax')}</small></span>${pill(x.status)}</li>`).join('')}</ul>`:`<p class="muted">${T('ยังไม่มีการจอง','No bookings')}</p>`}`,bd=>{$('#blk',bd).onchange=e=>{if(e.target.checked)bl[key]=1;else delete bl[key];save();render();toast(e.target.checked?T('ปิดรับจองแล้ว','Sales closed'):T('เปิดรับจองแล้ว','Sales reopened'))}})});
};

/* ----- customer journeys (consented itineraries across partners) ----- */
function journeyTimeline(tr,compact){
  const o=me().id;let shownNow=false;
  return `<ol class="tl">${tr.legs.map(l=>{const org=l.org?orgById(l.org):null,mine=l.org===o,past=(l.date+l.time)<(iso(0)+new Date().toTimeString().slice(0,5));
    const now=!past&&!shownNow;if(now)shownNow=true;
    const st=l.status==='cancelled'?'cancelled':past?'done':now?'next':'up';
    return `<li class="${st}${mine?' mine':''}"><span class="tl-dot" style="--c:${org?KINDS[org.types[0]].c:'#6F6885'}">${SVG(IC[KIND_IC[l.kind]])}</span><div class="tl-b"><small>${fmtDW(l.date)} · ${l.time}</small><b>${esc(kLbl(l.kind))}${org?' · '+esc(org.name):''}</b>${l.kind==='arrive'||l.kind==='depart'?`<span>${esc(l.item)}</span>`:mine?`<span class="mine-t">${T('บริการของคุณ','Your service')}</span>`:''}${l.status==='cancelled'?pill('cancelled'):''}</div></li>`}).join('')}</ol>`;
}
VIEWS.journeys=()=>{
  const o=me().id,q=(STATE.q.jr||'').toLowerCase(),f=STATE.f.jr=STATE.f.jr||'now';
  let trips=DB.trips.filter(t=>t.legs.some(l=>l.org===o)&&(custById(t.cust)||{}).consent);
  if(f==='now')trips=trips.filter(t=>t.arrive<=iso(1)&&t.depart>=iso(0));else if(f==='up')trips=trips.filter(t=>t.arrive>iso(1));else trips=trips.filter(t=>t.depart<iso(0));
  if(q)trips=trips.filter(t=>cName(t.cust).toLowerCase().includes(q));
  trips.sort((a,b)=>a.arrive.localeCompare(b.arrive));
  const sel=trips.find(t=>t.id===STATE.sel)||trips[0];
  return `<div class="vh"><div><h1>${T('เส้นทางลูกค้า','Customer journeys')}</h1><p class="sub">${T('ข้อมูลตั้งแต่ลูกค้าเดินทางมาถึงจนกลับ ผ่านทุกพาร์ทเนอร์ในทริป แสดงเฉพาะลูกค้าที่ยินยอมแชร์แผนการเดินทาง','From arrival to departure across every partner on the trip — only for customers who agreed to share their itinerary')}</p></div></div>
  <div class="toolbar"><div class="seg">${[['now',T('อยู่ในพื้นที่ตอนนี้','In destination now')],['up',T('กำลังจะมา','Arriving soon')],['past',T('ที่ผ่านมา','Past')]].map(([k,l])=>`<button data-jf="${k}" aria-pressed="${f===k}">${l}</button>`).join('')}</div><label class="search">${SVG(IC.search)}<input id="jrQ" value="${esc(STATE.q.jr||'')}" placeholder="${T('ค้นหาลูกค้า','Search customer')}"></label><span class="count">${trips.length} ${T('ทริป','trips')}</span></div>
  ${trips.length?`<div class="split"><ul class="jlist">${trips.map(t=>{const c=custById(t.cust);return `<li><button data-trip="${t.id}" class="${sel===t?'on':''}"><b>${esc(c.name)} ${flag(c.country)}</b><small>${fmtD(t.arrive)} – ${fmtD(t.depart)} · ${T(c.party+' ท่าน',c.party+' pax')}</small><span class="jl-ic">${t.legs.filter(l=>l.org).map(l=>`<i style="--c:${KINDS[orgById(l.org).types[0]].c}" class="${l.org===o?'mine':''}">${SVG(IC[KIND_IC[l.kind]])}</i>`).join('')}</span></button></li>`}).join('')}</ul>
   <section class="card jdet">${sel?(()=>{const c=custById(sel.cust),partners=[...new Set(sel.legs.filter(l=>l.org&&l.org!==o).map(l=>l.org))];return `<div class="card-h"><div><h2>${esc(c.name)} ${flag(c.country)}</h2><span class="muted">${fmtD(sel.arrive)} – ${fmtD(sel.depart)} · ${T(c.party+' ท่าน',c.party+' pax')} · ${T('ภาษา ','Speaks ')}${c.lang.toUpperCase()}${c.diet?' · '+esc(c.diet):''}</span></div></div>
     <p class="consent">${SVG(IC.shield)}${T('ลูกค้ายินยอมให้พาร์ทเนอร์ในทริปนี้เห็นแผนการเดินทาง เพื่อประสานงานรับส่งต่อกัน','The customer agreed to share this itinerary with partners on the trip for hand-offs')}</p>
     ${journeyTimeline(sel)}
     <div class="jp"><span class="sec-l">${T('พาร์ทเนอร์ในทริปนี้','Partners on this trip')}</span>${partners.map(id=>{const p=orgById(id);return `<div class="jp-r"><span class="org-av sm" style="background:${p.color}">${esc(p.name[0])}</span><span><b>${esc(p.name)}</b><small>${p.types.map(kName).join(' · ')}</small></span><button class="btn ghost sm" data-pmsg="${id}">${SVG(IC.chat)}</button></div>`}).join('')||`<p class="muted">${T('มีแค่คุณในทริปนี้','Only you on this trip')}</p>`}</div>
     <div class="dr-foot"><button class="btn primary" id="jRoom">${SVG(IC.users)}${T('เปิดห้องแชททริป','Open trip room')}</button><button class="btn ghost" id="jMsg">${SVG(IC.chat)}${T('ข้อความถึงลูกค้า','Message customer')}</button><button class="btn ghost" id="jAdd">${SVG(IC.plus,2.2)}${T('แนะนำบริการพาร์ทเนอร์','Suggest a partner service')}</button></div>`})():''}</section></div>`
  :`<div class="empty">${SVG(IC.route,1.5)}<span>${T('ยังไม่มีทริปในช่วงนี้','No trips in this range')}</span></div>`}`;
};
BIND.journeys=v=>{
  $$('[data-jf]',v).forEach(b=>b.onclick=()=>{STATE.f.jr=b.dataset.jf;STATE.sel=null;render()});
  let qt;$('#jrQ',v).oninput=e=>{STATE.q.jr=e.target.value;clearTimeout(qt);qt=setTimeout(()=>{render();const i=$('#jrQ');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
  $$('[data-trip]',v).forEach(b=>b.onclick=()=>{STATE.sel=b.dataset.trip;render();if(innerWidth<900)$('.jdet').scrollIntoView({behavior:'smooth'})});
  const tr=DB.trips.find(t=>t.id===(STATE.sel||($('[data-trip].on',v)||{}).dataset?.trip));
  $$('[data-pmsg]',v).forEach(b=>b.onclick=()=>openThread(threadFor('partner',b.dataset.pmsg).id));
  $('#jRoom',v)&&($('#jRoom',v).onclick=()=>openThread(tripRoom(tr).id));
  $('#jMsg',v)&&($('#jMsg',v).onclick=()=>openThread(threadFor('customer',tr.cust).id));
  $('#jAdd',v)&&($('#jAdd',v).onclick=()=>suggestService(tr));
};
function suggestService(tr){
  const linked=DB.links.filter(l=>(l.a===me().id||l.b===me().id)&&l.status==='active').map(l=>l.a===me().id?l.b:l.a);
  const offers=DB.offers.filter(x=>linked.includes(x.org));
  drawer(T('แนะนำบริการพาร์ทเนอร์ให้ลูกค้า','Suggest a partner service'),`<p class="muted">${T('ส่งข้อเสนอเข้าแชทของลูกค้า คุณได้ค่าแนะนำตามที่ตกลงกับพาร์ทเนอร์','Sends an offer to the customer’s chat. You earn the referral share agreed with that partner.')}</p>
   <ul class="list">${offers.map(x=>{const p=orgById(x.org),lk=DB.links.find(l=>(l.a===x.org||l.b===x.org)&&(l.a===me().id||l.b===me().id));return `<li><span class="lm"><b>${esc(x.name)}</b><small>${esc(p.name)} · ${T('ค่าแนะนำ ','referral ')}${lk?lk.comm:0}%</small></span><b>${money(x.price)}</b><button class="btn ghost sm" data-sug="${x.id}">${T('ส่ง','Send')}</button></li>`}).join('')||`<li class="muted">${T('ยังไม่มีพาร์ทเนอร์ที่เชื่อมต่อ','No connected partners yet')}</li>`}</ul>`,bd=>{
    $$('[data-sug]',bd).forEach(b=>b.onclick=()=>{const x=DB.offers.find(o=>o.id===b.dataset.sug),th=threadFor('customer',tr.cust);th.msgs.push({from:'me',text:T('แนะนำ: ','Suggestion: ')+x.name+' · '+orgById(x.org).name+' · '+money(x.price),at:Date.now(),offer:x.id});save();b.disabled=true;b.textContent=T('ส่งแล้ว','Sent');toast(T('ส่งข้อเสนอเข้าแชทลูกค้าแล้ว','Offer sent to the customer'))})});
}
