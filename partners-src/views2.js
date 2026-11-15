/* =====================================================================
   VIEWS (2): business modules, customers, marketing, finance, reports
   ===================================================================== */
const crudView=(key,mk)=>{Object.defineProperty(CRUD,key,{get:mk,configurable:true,enumerable:true});VIEWS[key]=()=>{const c=mk();return crud(key,c.live?Object.assign(c,c.live()):c)}};
const AMEN=['wifi','breakfast','balcony','pool','bathtub','fan','aircon','kitchen','parking','pet'];

/* ----- stay ----- */
crudView('rooms',()=>({title:T('ห้องพักและราคา','Rooms & rates'),sub:T('ประเภทห้อง จำนวนห้อง ราคาตั้งต้น และสิ่งอำนวยความสะดวก ข้อมูลนี้แสดงในแอป Journey','Room types, counts, base price and amenities — shown in the Journey app'),addL:T('เพิ่มประเภทห้อง','Add room type'),
  def:()=>({name:'',beds:'King',cap:2,units:1,price:1500,size:25,amen:['wifi'],status:'open'}),
  schema:[{k:'name',l:T('ชื่อประเภทห้อง','Room type name'),req:1},{k:'beds',l:T('เตียง','Beds'),t:'select',o:OPT.beds},{k:'cap',l:T('พักได้ (คน)','Max guests'),t:'number'},{k:'units',l:T('จำนวนห้อง','Number of rooms'),t:'number'},{k:'price',l:T('ราคาต่อคืน (บาท)','Price / night (THB)'),t:'money'},{k:'size',l:T('ขนาด (ตร.ม.)','Size (m²)'),t:'number'},{k:'amen',l:T('สิ่งอำนวยความสะดวก','Amenities'),t:'tags',ph:AMEN.slice(0,4).join(', ')},{k:'status',l:T('สถานะการขาย','Sales status'),t:'select',o:OPT.status}],
  cols:[{l:T('ประเภทห้อง','Room type'),f:r=>`<b>${esc(r.name)}</b><br><small class="muted">${esc(r.beds)} · ${r.size} m² · ${T(r.cap+' คน',r.cap+' guests')}</small>`},{l:T('ห้อง','Rooms'),r:1,f:r=>r.units},{l:T('ราคา/คืน','Price/night'),r:1,f:r=>money(r.price)},{l:T('สิ่งอำนวยความสะดวก','Amenities'),f:r=>(r.amen||[]).map(a=>`<span class="tag">${esc(a)}</span>`).join(' ')},{l:T('สถานะ','Status'),f:r=>pill(r.status)}]}));
crudView('rates',()=>({title:T('ราคาตามฤดูกาล','Seasonal rates'),sub:T('ปรับราคาขึ้นลงเป็นช่วง ระบบคำนวณราคาให้อัตโนมัติตอนลูกค้าจอง','Raise or lower prices for date ranges; applied automatically at booking'),addL:T('เพิ่มช่วงราคา','Add rate rule'),
  def:()=>({name:'',room:'all',from:iso(0),to:iso(30),adj:10,minStay:1}),
  schema:[{k:'name',l:T('ชื่อช่วงราคา','Rule name'),req:1},{k:'room',l:T('ใช้กับห้อง','Applies to'),t:'select',o:()=>[['all',T('ทุกห้อง','All rooms')]].concat((R().rooms||[]).map(r=>[r.id,r.name]))},{k:'from',l:T('ตั้งแต่','From'),t:'date'},{k:'to',l:T('ถึง','To'),t:'date'},{k:'adj',l:T('ปรับราคา (%) ติดลบ = ลด','Adjust (%) — negative = discount'),t:'number'},{k:'minStay',l:T('พักขั้นต่ำ (คืน)','Min. stay (nights)'),t:'number'}],
  cols:[{l:T('ชื่อ','Rule'),f:r=>`<b>${esc(r.name)}</b>`},{l:T('ห้อง','Rooms'),f:r=>r.room==='all'?T('ทุกห้อง','All'):esc(((R().rooms||[]).find(x=>x.id===r.room)||{}).name||'—')},{l:T('ช่วงวันที่','Dates'),f:r=>fmtD(r.from)+' – '+fmtD(r.to)},{l:T('ปรับ','Adjust'),r:1,f:r=>`<b class="${r.adj<0?'neg':'pos'}">${r.adj>0?'+':''}${r.adj}%</b>`},{l:T('พักขั้นต่ำ','Min stay'),r:1,f:r=>r.minStay}]}));
VIEWS.housekeeping=()=>{
  const hk=R().housekeeping=R().housekeeping||{},td=iso(0),bs=myBookings().filter(b=>b.kind==='stay'&&b.status!=='cancelled');
  const units=[];(R().rooms||[]).forEach(r=>{for(let i=1;i<=r.units;i++)units.push({id:r.id+'-'+i,type:r,no:(r.id.slice(1)*100+i)})});
  // assign stays to physical rooms (first free unit of that type)
  const occ={};bs.filter(b=>b.date<=td&&addDk(b.date,b.nights)>td).forEach(b=>{const u=units.find(x=>x.type.id===b.item&&!occ[x.id]);if(u)occ[u.id]=b});
  const outT={};bs.filter(b=>addDk(b.date,b.nights)===td).forEach(b=>{const u=units.find(x=>x.type.id===b.item&&!outT[x.id]&&!occ[x.id]);if(u)outT[u.id]=b});
  const st=u=>hk[u.id]||(occ[u.id]?'occupied':outT[u.id]?'dirty':'clean');
  const L={clean:[T('พร้อมขาย','Ready'),'#1F9D6B'],occupied:[T('มีแขกพัก','Occupied'),'#7A4FC8'],dirty:[T('รอทำความสะอาด','To clean'),'#D9603F'],cleaning:[T('กำลังทำความสะอาด','Cleaning'),'#C2830C'],repair:[T('แจ้งซ่อม','Maintenance'),'#6F6885']};
  const cnt=k=>units.filter(u=>st(u)===k).length;
  return `<div class="vh"><div><h1>${T('แม่บ้าน/สถานะห้อง','Housekeeping')}</h1><p class="sub">${T('สถานะห้องวันนี้ แตะห้องเพื่อเปลี่ยนสถานะ ทีมแม่บ้านเห็นข้อมูลเดียวกัน','Today’s room status. Tap a room to change it — housekeeping sees the same board.')}</p></div></div>
  <div class="hk-sum">${Object.keys(L).map(k=>`<span style="--c:${L[k][1]}"><b>${cnt(k)}</b>${L[k][0]}</span>`).join('')}</div>
  ${(R().rooms||[]).map(r=>`<section class="card"><div class="card-h"><h2>${esc(r.name)}</h2><span class="muted">${r.units} ${T('ห้อง','rooms')}</span></div><div class="hk-grid">${units.filter(u=>u.type===r).map(u=>{const s=st(u),b=occ[u.id];return `<button class="hk" data-hk="${u.id}" style="--c:${L[s][1]}"><b>${u.no}</b><span>${L[s][0]}</span>${b?`<small>${esc(cName(b.cust))} · ${T('ออก ','out ')}${fmtD(addDk(b.date,b.nights))}</small>`:''}</button>`}).join('')}</div></section>`).join('')}`;
};
BIND.housekeeping=v=>$$('[data-hk]',v).forEach(b=>b.onclick=()=>{const hk=R().housekeeping,id=b.dataset.hk;
  drawer(T('ห้อง ','Room ')+b.querySelector('b').textContent,`<div class="opts">${[['clean',T('พร้อมขาย','Ready')],['dirty',T('รอทำความสะอาด','To clean')],['cleaning',T('กำลังทำความสะอาด','Cleaning')],['repair',T('แจ้งซ่อม','Maintenance')],['',T('ตามการจอง (อัตโนมัติ)','Follow bookings (auto)')]].map(([k,l])=>`<button class="opt" data-s="${k}">${l}</button>`).join('')}</div>`,bd=>$$('[data-s]',bd).forEach(x=>x.onclick=()=>{if(x.dataset.s)hk[id]=x.dataset.s;else delete hk[id];save();closeDrawer();render()}))});

/* ----- dine ----- */
crudView('menu',()=>({title:T('เมนูอาหาร','Menu'),sub:T('เมนูแสดงในแอปพร้อมชื่อภาษาอังกฤษ ปิดเมนูที่หมดได้ทันที','Shown in the app with English names. Switch off sold-out dishes instantly.'),addL:T('เพิ่มเมนู','Add dish'),
  def:()=>({name:'',nameEn:'',cat:'main',price:100,tags:[],avail:true}),
  schema:[{k:'name',l:T('ชื่อเมนู (ไทย)','Name (Thai)'),req:1},{k:'nameEn',l:T('ชื่อเมนู (อังกฤษ)','Name (English)')},{k:'cat',l:T('หมวด','Category'),t:'select',o:OPT.cat},{k:'price',l:T('ราคา (บาท)','Price (THB)'),t:'money'},{k:'tags',l:T('ป้ายกำกับ','Tags'),t:'tags',ph:'vegetarian, spicy, halal'},{k:'avail',l:T('มีขายวันนี้','Available today'),t:'toggle'}],
  cols:[{l:T('เมนู','Dish'),f:m=>`<b>${esc(m.name)}</b><br><small class="muted">${esc(m.nameEn||'')}</small>`},{l:T('หมวด','Category'),f:m=>optL(m.cat)},{l:T('ราคา','Price'),r:1,f:m=>money(m.price)},{l:T('ป้าย','Tags'),f:m=>(m.tags||[]).map(a=>`<span class="tag">${esc(a)}</span>`).join(' ')},{l:T('สถานะ','Status'),f:m=>m.avail?pill('open'):`<span class="pill" style="--c:#A3324F">${T('หมด','Sold out')}</span>`}]}));
crudView('tables',()=>({title:T('โต๊ะและที่นั่ง','Tables'),sub:T('ผังโต๊ะใช้คำนวณที่นั่งว่างตอนลูกค้าจองโต๊ะผ่านแอป','Your table plan sets how many covers can be booked in the app'),addL:T('เพิ่มโต๊ะ','Add table'),
  def:()=>({name:'',seats:4,zone:'indoor'}),schema:[{k:'name',l:T('ชื่อ/เลขโต๊ะ','Table name'),req:1},{k:'seats',l:T('ที่นั่ง','Seats'),t:'number'},{k:'zone',l:T('โซน','Zone'),t:'select',o:OPT.zone}],
  live:()=>{const tb=R().tables||[],td=myBookings().filter(b=>b.kind==='dine'&&b.date===iso(0)&&b.status!=='cancelled');return {kpis:`<div class="kpis">${kpi(T('ที่นั่งทั้งหมด','Total seats'),tb.reduce((a,t)=>a+(+t.seats||0),0),T(tb.length+' โต๊ะ',tb.length+' tables'),'armchair')}${kpi(T('จองโต๊ะวันนี้','Reservations today'),td.length,T(td.reduce((a,b)=>a+b.party,0)+' ท่าน',td.reduce((a,b)=>a+b.party,0)+' covers'),'calcheck')}</div>`}},
  cols:[{l:T('โต๊ะ','Table'),f:t=>`<b>${esc(t.name)}</b>`},{l:T('ที่นั่ง','Seats'),r:1,f:t=>t.seats},{l:T('โซน','Zone'),f:t=>optL(t.zone)}]}));

/* ----- transport ----- */
crudView('routes',()=>({title:T('เส้นทางและรอบรถ','Routes & schedules'),sub:T('รอบรถและราคาที่ลูกค้าจองได้ในแอป พาร์ทเนอร์ที่เชื่อมต่อเห็นรอบรถเพื่อส่งต่อลูกค้า','Departures customers can book in the app; connected partners see them for hand-offs'),addL:T('เพิ่มเส้นทาง','Add route'),
  def:()=>({name:'',from:'',to:'',stops:'',times:['09:00'],dur:60,price:100,vehicle:'',seats:10}),
  schema:[{k:'name',l:T('ชื่อเส้นทาง','Route name'),req:1},{k:'from',l:T('ต้นทาง','From'),req:1},{k:'to',l:T('ปลายทาง','To'),req:1},{k:'stops',l:T('จุดจอดระหว่างทาง','Stops on the way')},{k:'times',l:T('เวลาออก','Departure times'),t:'times'},{k:'dur',l:T('ใช้เวลา (นาที)','Duration (min)'),t:'number'},{k:'price',l:T('ราคาต่อที่นั่ง','Price per seat'),t:'money'},{k:'vehicle',l:T('รถประจำเส้นทาง','Assigned vehicle'),t:'select',o:()=>(R().fleet||[]).map(v=>[v.id,v.plate+' · '+optL(v.kind)])},{k:'seats',l:T('ที่นั่งต่อรอบ','Seats per run'),t:'number'}],
  cols:[{l:T('เส้นทาง','Route'),f:r=>`<b>${esc(r.name)}</b><br><small class="muted">${esc(r.from)} → ${esc(r.to)}${r.stops?' · '+esc(r.stops):''}</small>`},{l:T('รอบ','Departures'),f:r=>(r.times||[]).map(t=>`<span class="tag">${t}</span>`).join(' ')},{l:T('เวลา','Time'),r:1,f:r=>Math.floor(r.dur/60)+T(' ชม. ','h ')+r.dur%60+T(' นาที','m')},{l:T('ราคา','Fare'),r:1,f:r=>money(r.price)},{l:T('ที่นั่ง','Seats'),r:1,f:r=>r.seats}]}));
VIEWS.manifest=()=>{
  const d=STATE.f.mfD||iso(0),rs=R().routes||[],bs=myBookings().filter(b=>b.kind==='transport'&&b.date===d&&b.status!=='cancelled');
  return `<div class="vh"><div><h1>${T('รายชื่อผู้โดยสาร','Passenger manifest')}</h1><p class="sub">${T('รายชื่อตามรอบรถ พร้อมจุดรับและปลายทางต่อไปของลูกค้า ส่งให้คนขับได้','Who is on each departure, where they go next — ready to send to the driver')}</p></div>
   <div class="vh-a"><input type="date" id="mfD" value="${d}" class="inp"></div></div>
  ${rs.map(r=>{const runs=(r.times||[]).map(t=>({t,ps:bs.filter(b=>b.route===r.id&&b.time===t)})).filter(x=>x.ps.length);if(!runs.length)return '';const veh=(R().fleet||[]).find(v=>v.id===r.vehicle);
    return `<section class="card"><div class="card-h"><div><h2>${esc(r.name)}</h2><span class="muted">${veh?esc(veh.plate)+' · ':''}${r.seats} ${T('ที่นั่ง','seats')}</span></div></div>${runs.map(x=>{const n=x.ps.reduce((a,b)=>a+b.qty,0);return `<div class="run"><div class="run-h"><b>${x.t}</b><span class="cap"><i style="width:${Math.min(100,n/r.seats*100)}%"></i></span><small>${n}/${r.seats}</small><button class="btn ghost sm" data-drv="${r.id}|${x.t}">${SVG(IC.idcard)}${T('ส่งให้คนขับ','Send to driver')}</button></div>
     <ul class="list">${x.ps.map(b=>{const c=custById(b.cust),tr=DB.trips.find(t=>t.id===b.trip),nx=tr&&c.consent?tr.legs[tr.legs.findIndex(l=>l.id===b.leg)+1]:null,pv=tr&&c.consent?tr.legs[tr.legs.findIndex(l=>l.id===b.leg)-1]:null;
      return `<li data-bk="${b.id}" tabindex="0"><span class="lm"><b>${esc(c.name)} ${flag(c.country)} · ${T(b.qty+' ที่',b.qty+' seats')}</b><small>${pv?T('รับจาก: ','Pick up: ')+esc(pv.kind==='arrive'?pv.item:orgById(pv.org)?.name||''):''}${nx&&nx.org?' → '+esc(orgById(nx.org).name):nx?' → '+esc(nx.item):''}${c.access?' · '+esc(c.access):''}</small></span>${pill(b.status)}</li>`}).join('')}</ul></div>`}).join('')}</section>`}).join('')||`<div class="empty">${SVG(IC.clipboard,1.5)}<span>${T('ไม่มีผู้โดยสารในวันนี้','No passengers on this day')}</span></div>`}`;
};
BIND.manifest=v=>{$('#mfD',v).onchange=e=>{STATE.f.mfD=e.target.value;render()};$$('[data-drv]',v).forEach(b=>b.onclick=()=>{const [rid,t]=b.dataset.drv.split('|'),r=(R().routes||[]).find(x=>x.id===rid),d=STATE.f.mfD||iso(0);
  const ps=myBookings().filter(x=>x.route===rid&&x.date===d&&x.time===t&&x.status!=='cancelled');
  const txt=`${r.name} · ${fmtD(d)} ${t}\n`+ps.map((x,i)=>`${i+1}. ${cName(x.cust)} (${x.qty})`).join('\n');
  drawer(T('ส่งให้คนขับ','Send to driver'),`<div class="fld full"><label>${T('เลือกคนขับ','Driver')}</label><select id="dSel">${(R().drivers||[]).filter(x=>x.status==='on').map(x=>`<option>${esc(x.name)} · ${esc(x.phone)}</option>`).join('')}</select></div><pre class="pre">${esc(txt)}</pre><div class="dr-foot"><span class="sp"></span><button class="btn ghost" id="dCp">${SVG(IC.copy)}${T('คัดลอก','Copy')}</button><button class="btn primary" id="dSend">${T('ส่งในแอปคนขับ','Send in driver app')}</button></div>`,bd=>{
    $('#dCp',bd).onclick=()=>{(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast(T('คัดลอกแล้ว','Copied'))).catch(()=>toast(T('เลือกข้อความแล้วคัดลอกเอง','Select the text to copy')))};
    $('#dSend',bd).onclick=()=>{closeDrawer();toast(T('ส่งรายชื่อให้คนขับแล้ว','Manifest sent to the driver'))}})})};
crudView('fleet',()=>({title:T('ยานพาหนะ','Fleet'),sub:T('ทะเบียน ประเภท ที่นั่ง และสถานะซ่อมบำรุง','Plates, types, seats and maintenance status'),addL:T('เพิ่มรถ','Add vehicle'),
  def:()=>({plate:'',kind:'van',seats:10,status:'active',year:2024}),schema:[{k:'plate',l:T('ทะเบียน','Plate'),req:1},{k:'kind',l:T('ประเภท','Type'),t:'select',o:OPT.vkind},{k:'seats',l:T('ที่นั่ง','Seats'),t:'number'},{k:'year',l:T('ปีรถ','Year'),t:'number'},{k:'status',l:T('สถานะ','Status'),t:'select',o:OPT.vstatus}],
  cols:[{l:T('ทะเบียน','Plate'),f:v=>`<b>${esc(v.plate)}</b>`},{l:T('ประเภท','Type'),f:v=>optL(v.kind)},{l:T('ที่นั่ง','Seats'),r:1,f:v=>v.seats},{l:T('ปี','Year'),r:1,f:v=>v.year},{l:T('สถานะ','Status'),f:v=>pill(v.status)}]}));
crudView('drivers',()=>({title:T('คนขับ','Drivers'),sub:T('ข้อมูลใบขับขี่และภาษาที่สื่อสารได้ ใช้จับคู่กับลูกค้าต่างชาติ','Licences and languages, used to match drivers with international guests'),addL:T('เพิ่มคนขับ','Add driver'),
  def:()=>({name:'',phone:'',license:'',langs:['th'],status:'on'}),schema:[{k:'name',l:T('ชื่อ','Name'),req:1},{k:'phone',l:T('โทร','Phone')},{k:'license',l:T('เลขใบขับขี่','Licence no.')},{k:'langs',l:T('ภาษา','Languages'),t:'tags',ph:'th, en'},{k:'status',l:T('สถานะ','Status'),t:'select',o:OPT.dstatus}],
  cols:[{l:T('ชื่อ','Name'),f:d=>`<b>${esc(d.name)}</b><br><small class="muted">${esc(d.phone)}</small>`},{l:T('ใบขับขี่','Licence'),f:d=>esc(d.license)},{l:T('ภาษา','Languages'),f:d=>(d.langs||[]).map(l=>`<span class="tag">${esc(l)}</span>`).join(' ')},{l:T('สถานะ','Status'),f:d=>pill(d.status)}]}));

/* ----- tour / attraction ----- */
crudView('products',()=>({title:T('ทัวร์และกิจกรรม','Tours & activities'),sub:T('รอบเวลา จำนวนที่รับได้ ภาษา และจุดนัดพบ ลูกค้าจองได้ในแอป และไกด์ท้องถิ่นนำไปรวมในแผนได้','Times, capacity, languages and meeting point — bookable in the app and addable to guides’ plans'),addL:T('เพิ่มกิจกรรม','Add activity'),
  def:()=>({name:'',kind:'tour',dur:2,times:['09:00'],cap:10,price:500,langs:['th','en'],meet:''}),
  schema:[{k:'name',l:T('ชื่อกิจกรรม','Name'),req:1},{k:'kind',l:T('ประเภท','Type'),t:'select',o:OPT.pkind},{k:'dur',l:T('ระยะเวลา (ชม.)','Duration (h)'),t:'number'},{k:'times',l:T('รอบเวลา','Start times'),t:'times'},{k:'cap',l:T('รับได้ต่อรอบ','Capacity per slot'),t:'number'},{k:'price',l:T('ราคาต่อคน','Price per person'),t:'money'},{k:'langs',l:T('ภาษา','Languages'),t:'tags'},{k:'meet',l:T('จุดนัดพบ','Meeting point')}],
  cols:[{l:T('กิจกรรม','Activity'),f:p=>`<b>${esc(p.name)}</b><br><small class="muted">${optL(p.kind)} · ${p.dur} ${T('ชม.','h')} · ${esc(p.meet||'')}</small>`},{l:T('รอบ','Times'),f:p=>(p.times||[]).map(t=>`<span class="tag">${t}</span>`).join(' ')},{l:T('รับได้','Capacity'),r:1,f:p=>p.cap},{l:T('ราคา','Price'),r:1,f:p=>money(p.price)},{l:T('ภาษา','Languages'),f:p=>(p.langs||[]).join(', ').toUpperCase()}]}));
crudView('tickets',()=>({title:T('บัตรเข้าชม','Tickets'),sub:T('ประเภทบัตร ราคา และโควตาต่อวัน','Ticket types, prices and daily quota'),addL:T('เพิ่มประเภทบัตร','Add ticket type'),
  def:()=>({name:'',kind:'adult',price:100,quota:300}),schema:[{k:'name',l:T('ชื่อบัตร','Ticket name'),req:1},{k:'kind',l:T('กลุ่มผู้ซื้อ','Visitor group'),t:'select',o:OPT.tkind},{k:'price',l:T('ราคา','Price'),t:'money'},{k:'quota',l:T('โควตาต่อวัน','Daily quota'),t:'number'}],
  cols:[{l:T('บัตร','Ticket'),f:t=>`<b>${esc(t.name)}</b>`},{l:T('กลุ่ม','Group'),f:t=>optL(t.kind)},{l:T('ราคา','Price'),r:1,f:t=>money(t.price)},{l:T('โควตา/วัน','Quota/day'),r:1,f:t=>num(t.quota)}]}));
VIEWS.crowd=()=>{
  const bs=myBookings().filter(b=>b.kind==='attraction'&&b.status!=='cancelled'),hrs=[...Array(11)].map((_,i)=>8+i),d=iso(0);
  const by=hrs.map(h=>({l:pad(h)+':00',v:bs.filter(b=>b.date===d&&+b.time.slice(0,2)===h).reduce((a,b)=>a+b.party,0)}));
  const days=[...Array(14)].map((_,i)=>({l:fmtD(iso(i)),v:bs.filter(b=>b.date===iso(i)).reduce((a,b)=>a+b.party,0)}));
  return `<div class="vh"><div><h1>${T('ความหนาแน่นผู้เข้าชม','Visitor flow')}</h1><p class="sub">${T('คาดการณ์จากการจองล่วงหน้า ใช้จัดคนและแนะนำเวลาที่คนน้อยให้ลูกค้าในแอป','Forecast from advance bookings — plan staff and suggest quiet times in the app')}</p></div></div>
  <div class="grid2"><section class="card"><div class="card-h"><h2>${T('วันนี้รายชั่วโมง','Today by hour')}</h2></div>${bars(by,{label:'hourly'})}</section><section class="card"><div class="card-h"><h2>${T('14 วันข้างหน้า','Next 14 days')}</h2></div>${bars(days,{label:'daily'})}</section></div>`;
};

/* ----- customers (CRM) ----- */
VIEWS.customers=()=>{
  const ids=[...new Set(myBookings().map(b=>b.cust))],q=(STATE.q.cu||'').toLowerCase();
  let cs=ids.map(id=>{const c=custById(id),bs=myBookings().filter(b=>b.cust===id&&b.status!=='cancelled');return {c,n:bs.length,spend:bs.reduce((a,b)=>a+b.amount,0),last:bs.map(b=>b.date).sort().pop()||''}});
  if(q)cs=cs.filter(x=>(x.c.name+' '+x.c.country+' '+x.c.tags.join(' ')).toLowerCase().includes(q));
  cs.sort((a,b)=>b.spend-a.spend);
  const ctry={};cs.forEach(x=>ctry[x.c.country]=(ctry[x.c.country]||0)+1);
  return `<div class="vh"><div><h1>${T('ลูกค้า (CRM)','Customers (CRM)')}</h1><p class="sub">${T('ประวัติการจอง ยอดใช้จ่าย ภาษา และความต้องการพิเศษของลูกค้าทุกคน','Booking history, spend, language and special needs for every customer')}</p></div><div class="vh-a"><button class="btn ghost" id="cuCsv">${SVG(IC.download)}CSV</button></div></div>
  <div class="grid2 g31"><div>
  <div class="toolbar"><label class="search">${SVG(IC.search)}<input id="cuQ" value="${esc(STATE.q.cu||'')}" placeholder="${T('ค้นหาชื่อ ประเทศ หรือแท็ก','Search name, country or tag')}"></label><span class="count">${cs.length} ${T('คน','people')}</span></div>
  ${table([{l:T('ลูกค้า','Customer'),f:x=>`<b>${esc(x.c.name)}</b> ${flag(x.c.country)}${x.c.tags.map(t=>` <span class="tag">${esc(t)}</span>`).join('')}<br><small class="muted">${x.c.lang.toUpperCase()}${x.c.diet?' · '+esc(x.c.diet):''}${x.c.access?' · '+esc(x.c.access):''}</small>`},{l:T('ครั้ง','Visits'),r:1,f:x=>x.n},{l:T('ยอดใช้จ่าย','Spend'),r:1,f:x=>money(x.spend)},{l:T('ล่าสุด','Last'),f:x=>x.last?fmtD(x.last):'—'}],cs,{rowAttr:x=>`data-cu="${x.c.id}" tabindex="0"`})}</div>
  <section class="card"><div class="card-h"><h2>${T('ลูกค้ามาจากไหน','Where they’re from')}</h2></div>${hbars(Object.entries(ctry).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>({l:flag(k)+' '+k,v})))}</section></div>`;
};
BIND.customers=v=>{let qt;$('#cuQ',v).oninput=e=>{STATE.q.cu=e.target.value;clearTimeout(qt);qt=setTimeout(()=>{render();const i=$('#cuQ');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
  $$('[data-cu]',v).forEach(r=>r.onclick=()=>custDetail(r.dataset.cu));
  $('#cuCsv',v).onclick=()=>csv('customers',[['name','country','language','diet','access','tags']].concat([...new Set(myBookings().map(b=>b.cust))].map(id=>{const c=custById(id);return [c.name,c.country,c.lang,c.diet,c.access,c.tags.join(' ')]})))};
function custDetail(id){const c=custById(id),bs=myBookings().filter(b=>b.cust===id).sort((a,b)=>b.date.localeCompare(a.date));
  drawer(c.name,`<div class="bd-grid"><div><small>${T('ประเทศ / ภาษา','Country / language')}</small><b>${flag(c.country)} ${c.country} · ${c.lang.toUpperCase()}</b></div><div><small>${T('ผู้ร่วมเดินทาง','Party')}</small><b>${c.party}</b></div><div><small>${T('อาหาร','Diet')}</small><b>${esc(c.diet||'—')}</b></div><div><small>${T('การเข้าถึง','Accessibility')}</small><b>${esc(c.access||'—')}</b></div></div>
   <div class="fld full"><label>${T('บันทึกภายใน (ลูกค้าไม่เห็น)','Internal notes (customer can’t see)')}</label><textarea id="cuN" rows="3">${esc(c.notes||'')}</textarea></div>
   <label class="fld tog"><span>VIP</span><input type="checkbox" class="sw" id="cuV"${c.tags.includes('VIP')?' checked':''}></label>
   <h3 class="h3">${T('ประวัติการจอง','Booking history')}</h3><ul class="list">${bs.map(b=>`<li data-bk="${b.id}" tabindex="0"><span class="when"><b>${fmtD(b.date)}</b></span><span class="lm"><b>${esc(itemName(b))}</b><small>${money(b.amount)}</small></span>${pill(b.status)}</li>`).join('')}</ul>
   <div class="dr-foot"><button class="btn ghost" id="cuM">${SVG(IC.chat)}${T('ส่งข้อความ','Message')}</button><span class="sp"></span><button class="btn primary" id="cuS">${T('บันทึก','Save')}</button></div>`,bd=>{
    $('#cuS',bd).onclick=()=>{c.notes=$('#cuN',bd).value;const v=$('#cuV',bd).checked;c.tags=c.tags.filter(t=>t!=='VIP').concat(v?['VIP']:[]);save();closeDrawer();render();toast(T('บันทึกแล้ว','Saved'))};
    $('#cuM',bd).onclick=()=>{closeDrawer();openThread(threadFor('customer',id).id)}},true)}

/* ----- reviews ----- */
VIEWS.reviews=()=>{
  const rv=DB.reviews.filter(r=>r.org===me().id).sort((a,b)=>b.at-a.at),avg=rv.length?rv.reduce((a,r)=>a+r.stars,0)/rv.length:0;
  const dist=[5,4,3,2,1].map(s=>({l:'★'.repeat(s),v:rv.filter(r=>r.stars===s).length,c:'#E6A23C'}));
  return `<div class="vh"><div><h1>${T('รีวิว','Reviews')}</h1><p class="sub">${T('รีวิวจากลูกค้าที่ใช้บริการจริงผ่าน Journey ตอบกลับได้ คำตอบแสดงในแอป','Reviews from verified Journey customers. Your replies appear in the app.')}</p></div></div>
  <div class="grid2 g13"><section class="card rv-sum"><b class="big">${avg?avg.toFixed(1):'–'}</b><span class="stars">${'★'.repeat(Math.round(avg))}${'☆'.repeat(5-Math.round(avg))}</span><small>${T(rv.length+' รีวิว',rv.length+' reviews')} · ${T('ยังไม่ตอบ ','unanswered ')}${rv.filter(r=>!r.reply).length}</small>${hbars(dist)}</section>
  <div class="rv-list">${rv.map(r=>{const c=custById(r.cust)||{name:'Guest',country:''};return `<article class="card rv"><div class="rv-h"><b>${esc(c.name)} ${flag(c.country)}</b><span class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span><small class="muted">${rel(r.at)}</small></div><p>${esc(r.text)}</p>${r.reply?`<div class="rv-rep"><small>${T('คำตอบของคุณ','Your reply')}</small><p>${esc(r.reply)}</p></div>`:`<div class="rv-form"><textarea data-rvt="${r.id}" rows="2" placeholder="${T('ตอบกลับอย่างสุภาพ…','Write a reply…')}"></textarea><button class="btn primary sm" data-rv="${r.id}">${T('ตอบกลับ','Reply')}</button></div>`}</article>`}).join('')||`<div class="empty">${SVG(IC.star,1.5)}<span>${T('ยังไม่มีรีวิว','No reviews yet')}</span></div>`}</div></div>`;
};
BIND.reviews=v=>$$('[data-rv]',v).forEach(b=>b.onclick=()=>{const t=$(`[data-rvt="${b.dataset.rv}"]`,v).value.trim();if(!t)return;DB.reviews.find(r=>r.id===b.dataset.rv).reply=t;save();render();toast(T('ตอบกลับแล้ว','Reply posted'))});

/* ----- promotions ----- */
crudView('promos',()=>({title:T('โปรโมชัน','Promotions'),sub:T('โค้ดส่วนลดที่ลูกค้าใช้ในแอป Journey','Discount codes customers use in the Journey app'),addL:T('สร้างโค้ด','New code'),
  def:()=>({code:'',pct:10,from:iso(0),to:iso(30),applies:'all',uses:0,active:true}),
  schema:[{k:'code',l:T('โค้ด','Code'),req:1},{k:'pct',l:T('ส่วนลด (%)','Discount (%)'),t:'number'},{k:'from',l:T('เริ่ม','Starts'),t:'date'},{k:'to',l:T('สิ้นสุด','Ends'),t:'date'},{k:'applies',l:T('ใช้กับ','Applies to'),t:'select',o:OPT.applies},{k:'active',l:T('เปิดใช้งาน','Active'),t:'toggle'}],
  cols:[{l:T('โค้ด','Code'),f:p=>`<b class="mono">${esc(p.code)}</b>`},{l:T('ส่วนลด','Discount'),r:1,f:p=>p.pct+'%'},{l:T('ช่วงเวลา','Dates'),f:p=>fmtD(p.from)+' – '+fmtD(p.to)},{l:T('ใช้กับ','Applies'),f:p=>optL(p.applies)},{l:T('ใช้ไป','Used'),r:1,f:p=>p.uses||0},{l:T('สถานะ','Status'),f:p=>pill(p.active&&p.to>=iso(0)?'active':'closed')}]}));

/* ----- shared packages (built from partners' offers) ----- */
VIEWS.packages=()=>{
  const mine=DB.packages.filter(p=>p.owner===me().id||p.items.some(i=>(DB.offers.find(o=>o.id===i)||{}).org===me().id));
  return `<div class="vh"><div><h1>${T('แพ็กเกจร่วม','Shared packages')}</h1><p class="sub">${T('รวมบริการของคุณกับพาร์ทเนอร์เป็นแพ็กเกจเดียว ลูกค้าจ่ายครั้งเดียว ระบบแบ่งเงินให้แต่ละรายอัตโนมัติ','Bundle your services with partners’. One payment from the customer, split to each partner automatically.')}</p></div><div class="vh-a"><button class="btn primary" id="pkNew">${SVG(IC.plus,2.2)}${T('สร้างแพ็กเกจ','New package')}</button></div></div>
  <div class="pk-grid">${mine.map(p=>{const its=p.items.map(i=>DB.offers.find(o=>o.id===i)).filter(Boolean),cost=its.reduce((a,o)=>a+o.price,0),orgs=[...new Set(its.map(o=>o.org))];
   return `<article class="card pk"><div class="card-h"><h2>${esc(p.name)}</h2>${pill(p.status)}</div><ul class="pk-it">${its.map(o=>`<li><span>${esc(o.name)}</span><small>${esc(orgById(o.org).name)}</small><b>${money(o.price)}</b></li>`).join('')}</ul>
    <div class="pk-f"><span>${T('ราคาขาย','Price')} <b>${money(p.price)}</b></span><span>${T('ต้นทุนรวม','Partner cost')} ${money(cost)}</span><span>${T('ขายแล้ว','Sold')} <b>${p.sold||0}</b></span></div>
    <div class="pk-org">${orgs.map(id=>{const o=orgById(id);return `<span class="org-av sm" title="${esc(o.name)}" style="background:${o.color}">${esc(o.name[0])}</span>`}).join('')}<button class="btn ghost sm" data-pk="${p.id}">${T('แก้ไข','Edit')}</button></div></article>`}).join('')||`<div class="empty">${SVG(IC.package,1.5)}<span>${T('ยังไม่มีแพ็กเกจ','No packages yet')}</span></div>`}</div>`;
};
BIND.packages=v=>{$('#pkNew',v).onclick=()=>pkEdit();$$('[data-pk]',v).forEach(b=>b.onclick=()=>pkEdit(b.dataset.pk))};
function pkEdit(id){
  const p=id?DB.packages.find(x=>x.id===id):{id:uid('pk'),name:'',items:[],price:0,status:'draft',owner:me().id,sold:0};
  const linked=new Set(DB.links.filter(l=>(l.a===me().id||l.b===me().id)&&l.status==='active').map(l=>l.a===me().id?l.b:l.a).concat([me().id]));
  const offers=DB.offers.filter(o=>linked.has(o.org)).concat(myOwnOffers());
  const paint=()=>{const its=p.items.map(i=>offers.find(o=>o.id===i)||DB.offers.find(o=>o.id===i)).filter(Boolean),cost=its.reduce((a,o)=>a+o.price,0);
    drawer(id?T('แก้ไขแพ็กเกจ','Edit package'):T('สร้างแพ็กเกจ','New package'),`<div class="form"><div class="fld full"><label>${T('ชื่อแพ็กเกจ','Package name')}</label><input id="pkN" value="${esc(p.name)}"></div></div>
     <h3 class="h3">${T('บริการที่เลือกได้ (จากพาร์ทเนอร์ที่เชื่อมต่อ)','Available services (from connected partners)')}</h3>
     <ul class="list">${offers.map(o=>`<li><span class="lm"><b>${esc(o.name)}</b><small>${esc(orgById(o.org).name)}</small></span><b>${money(o.price)}</b><button class="btn ghost sm" data-add="${o.id}">${SVG(IC.plus,2.2)}</button></li>`).join('')}</ul>
     <h3 class="h3">${T('ในแพ็กเกจ','In this package')} (${its.length})</h3>
     <ul class="list">${its.map((o,i)=>`<li><span class="lm"><b>${esc(o.name)}</b><small>${esc(orgById(o.org).name)}</small></span><b>${money(o.price)}</b><button class="btn ghost sm" data-rm="${i}">${SVG(IC.trash)}</button></li>`).join('')||`<li class="muted">${T('ยังไม่ได้เลือก','Nothing added')}</li>`}</ul>
     <div class="form"><div class="fld"><label>${T('ราคาขาย (บาท)','Selling price (THB)')}</label><input id="pkP" type="number" value="${p.price||cost}"></div><div class="fld"><label>${T('สถานะ','Status')}</label><select id="pkS"><option value="draft"${p.status==='draft'?' selected':''}>${T('ฉบับร่าง','Draft')}</option><option value="published"${p.status==='published'?' selected':''}>${T('เผยแพร่ในแอป','Published in app')}</option></select></div></div>
     <p class="note">${SVG(IC.info)}${T('ต้นทุนพาร์ทเนอร์รวม ','Partner cost ')}${money(cost)} · ${T('ส่วนต่างของคุณ ','your margin ')}<b>${money((p.price||cost)-cost)}</b></p>
     <div class="dr-foot">${id?`<button class="btn ghost danger" id="pkD">${SVG(IC.trash)}</button>`:''}<span class="sp"></span><button class="btn primary" id="pkSv">${T('บันทึก','Save')}</button></div>`,bd=>{
      const keep=()=>{p.name=$('#pkN',bd).value;p.price=+$('#pkP',bd).value;p.status=$('#pkS',bd).value};
      $$('[data-add]',bd).forEach(b=>b.onclick=()=>{keep();p.items.push(b.dataset.add);paint()});
      $$('[data-rm]',bd).forEach(b=>b.onclick=()=>{keep();p.items.splice(+b.dataset.rm,1);paint()});
      $('#pkSv',bd).onclick=()=>{keep();if(!p.name.trim()){toast(T('ตั้งชื่อแพ็กเกจก่อน','Give the package a name'));return}if(!id)DB.packages.push(p);save();closeDrawer();render();toast(T('บันทึกแล้ว','Saved'))};
      $('#pkD',bd)&&($('#pkD',bd).onclick=()=>confirmBox(T('ลบแพ็กเกจนี้?','Delete this package?'),()=>{DB.packages=DB.packages.filter(x=>x!==p);save();closeDrawer();render()},true));
    },true)};
  paint();
}
function myOwnOffers(){const o=me().id,out=[];
  (R().rooms||[]).forEach(r=>out.push({id:'own_'+r.id,org:o,name:r.name+T(' (1 คืน)',' (1 night)'),price:r.price}));
  (R().products||[]).forEach(p=>out.push({id:'own_'+p.id,org:o,name:p.name,price:p.price}));
  (R().routes||[]).forEach(r=>out.push({id:'own_'+r.id,org:o,name:r.name,price:r.price}));
  out.forEach(x=>{if(!DB.offers.find(y=>y.id===x.id))DB.offers.push(x)});return out}

/* ----- finance ----- */
VIEWS.finance=()=>{
  if(!can('finance'))return noAccess();
  const bs=myBookings().filter(b=>b.status==='done'||b.status==='inprogress'),m0=iso(-29);
  const gross=bs.filter(b=>b.date>=m0).reduce((a,b)=>a+b.amount,0),fee=gross*.12;
  const refIn=DB.links.filter(l=>(l.a===me().id||l.b===me().id)&&l.status==='active');
  const refEarn=myBookings().filter(b=>b.src==='partner'&&b.date>=m0).reduce((a,b)=>a+b.amount*.08,0);
  const po=DB.payouts.filter(p=>p.org===me().id).sort((a,b)=>b.date.localeCompare(a.date));
  const weeks=[...Array(8)].map((_,i)=>{const a=iso(-7*(7-i)-6),z=iso(-7*(7-i));return {l:fmtD(a),v:myBookings().filter(b=>b.status!=='cancelled'&&b.date>=a&&b.date<=z).reduce((s,b)=>s+b.amount,0)}});
  return `<div class="vh"><div><h1>${T('การเงินและการจ่ายเงิน','Finance & payouts')}</h1><p class="sub">${T('ยอดขาย ค่าบริการแพลตฟอร์ม ค่าแนะนำระหว่างพาร์ทเนอร์ และรอบโอนเงินรายสัปดาห์','Sales, platform fees, partner referral shares and weekly payouts')}</p></div><div class="vh-a"><button class="btn ghost" id="fiCsv">${SVG(IC.download)}CSV</button></div></div>
  <div class="kpis">${kpi(T('ยอดขาย 30 วัน','Gross, 30 days'),money(gross),'','wallet','acc')}${kpi(T('ค่าบริการแพลตฟอร์ม (12%)','Platform fee (12%)'),money(fee),'','percent')}${kpi(T('ค่าแนะนำที่จ่ายพาร์ทเนอร์','Referral shares paid'),money(refEarn),T(refIn.length+' พาร์ทเนอร์',refIn.length+' partners'),'network')}${kpi(T('ยอดสุทธิ','Net'),money(gross-fee-refEarn),T('รอโอน ','pending ')+money((po.find(p=>p.status==='pending')||{amount:0}).amount),'chart')}</div>
  <div class="grid2"><section class="card"><div class="card-h"><h2>${T('ยอดขายรายสัปดาห์','Weekly sales')}</h2></div>${bars(weeks,{money:true,label:'weekly'})}</section>
  <section class="card"><div class="card-h"><h2>${T('รอบการโอนเงิน','Payouts')}</h2><span class="muted">${T('โอนทุกวันจันทร์','Every Monday')}</span></div>${table([{l:T('วันที่','Date'),f:p=>fmtD(p.date)},{l:T('ยอด','Amount'),r:1,f:p=>money(p.amount)},{l:T('สถานะ','Status'),f:p=>pill(p.status)}],po)}</section></div>`;
};
BIND.finance=v=>{const b=$('#fiCsv',v);b&&(b.onclick=()=>csv('finance',[['booking','date','customer','amount','platform_fee','status']].concat(myBookings().map(x=>[x.id,x.date,cName(x.cust),x.amount,Math.round(x.amount*.12),x.status]))))};
const noAccess=()=>`<div class="empty">${SVG(IC.lock,1.5)}<span>${T('บทบาทของคุณดูส่วนนี้ไม่ได้ ติดต่อเจ้าของบัญชี','Your role can’t open this section. Ask the account owner.')}</span></div>`;

/* ----- reports: customer → destination funnel and data ----- */
VIEWS.reports=()=>{
  const o=me().id,tr=DB.trips.filter(t=>t.legs.some(l=>l.org===o));
  const src={};myBookings().forEach(b=>src[b.src]=(src[b.src]||0)+1);
  const ctry={};tr.forEach(t=>{const c=custById(t.cust).country;ctry[c]=(ctry[c]||0)+1});
  const lead=[];DB.bookings.filter(b=>b.org===o&&b.created).forEach(b=>lead.push(Math.max(0,Math.round((new Date(b.date+'T00:00')-b.created)/864e5))));
  const leadB=[['0–3',0,3],['4–7',4,7],['8–14',8,14],['15–30',15,30],['30+',31,999]].map(([l,a,z])=>({l,v:lead.filter(x=>x>=a&&x<=z).length}));
  // what customers do before/after us, across partners
  const before={},after={};tr.forEach(t=>{const i=t.legs.findIndex(l=>l.org===o);const p=t.legs[i-1],n=t.legs[i+1];if(p){const k=p.org?orgById(p.org).name:kLbl(p.kind);before[k]=(before[k]||0)+1}if(n){const k=n.org?orgById(n.org).name:kLbl(n.kind);after[k]=(after[k]||0)+1}});
  const stage=[[T('เดินทางมาถึง','Arrived'),tr.length],[T('ใช้รถรับส่ง','Took a transfer'),tr.filter(t=>t.legs.some(l=>l.kind==='transport')).length],[T('เข้าพัก','Stayed'),tr.filter(t=>t.legs.some(l=>l.kind==='stay')).length],[T('ทานอาหาร','Dined'),tr.filter(t=>t.legs.some(l=>l.kind==='dine')).length],[T('ทำกิจกรรม/ทัวร์','Did an activity'),tr.filter(t=>t.legs.some(l=>l.kind==='tour')).length],[T('เข้าชมสถานที่','Visited an attraction'),tr.filter(t=>t.legs.some(l=>l.kind==='attraction')).length]];
  const avgN=tr.length?(tr.reduce((a,t)=>a+(new Date(t.depart)-new Date(t.arrive))/864e5,0)/tr.length).toFixed(1):0;
  const spend=tr.length?DB.bookings.filter(b=>tr.some(t=>t.id===b.trip)&&b.status!=='cancelled').reduce((a,b)=>a+b.amount,0)/tr.length:0;
  return `<div class="vh"><div><h1>${T('รายงานและข้อมูล','Reports & data')}</h1><p class="sub">${T('ข้อมูลตั้งแต่ลูกค้ามาถึงจนเดินทางกลับ รวมจากทุกพาร์ทเนอร์ที่ลูกค้าใช้บริการ (เฉพาะข้อมูลที่ยินยอม ไม่ระบุตัวตน)','From arrival to departure, combined across every partner the customer used (consented, anonymised)')}</p></div></div>
  <div class="kpis">${kpi(T('ลูกค้าที่ผ่านธุรกิจคุณ','Trips through you'),num(tr.length),'','users')}${kpi(T('พักเฉลี่ยในจังหวัด','Avg. nights in destination'),avgN,T('คืน','nights'),'bed')}${kpi(T('ใช้จ่ายเฉลี่ยต่อทริป (ทุกพาร์ทเนอร์)','Avg. spend per trip (all partners)'),money(spend),'','wallet','acc')}${kpi(T('จองล่วงหน้าเฉลี่ย','Avg. lead time'),lead.length?Math.round(lead.reduce((a,b)=>a+b,0)/lead.length):0,T('วัน','days'),'calendar')}</div>
  <section class="card"><div class="card-h"><h2>${T('เส้นทางลูกค้า: มาถึง → จุดหมาย','Journey funnel: arrival → destination')}</h2></div><div class="funnel">${stage.map(([l,v],i)=>`<div class="fn" style="--w:${tr.length?v/tr.length*100:0}%"><span>${l}</span><i></i><b>${v}</b><small>${tr.length?Math.round(v/tr.length*100):0}%</small></div>`).join('')}</div></section>
  <div class="grid2"><section class="card"><div class="card-h"><h2>${T('ก่อนมาหาคุณ ลูกค้ามาจาก','Before you, customers came from')}</h2></div>${hbars(Object.entries(before).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([l,v])=>({l:esc(l),v})))}</section>
  <section class="card"><div class="card-h"><h2>${T('หลังจากคุณ ลูกค้าไปต่อที่','After you, customers went to')}</h2></div>${hbars(Object.entries(after).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([l,v])=>({l:esc(l),v})))}</section></div>
  <div class="grid2"><section class="card"><div class="card-h"><h2>${T('ช่องทางการจอง','Booking channels')}</h2></div>${hbars(Object.entries(src).map(([k,v])=>({l:esc(T(...SRC[k])),v})))}</section>
  <section class="card"><div class="card-h"><h2>${T('จองล่วงหน้ากี่วัน','Booking lead time (days)')}</h2></div>${bars(leadB,{label:'lead',h:140})}</section></div>
  <section class="card"><div class="card-h"><h2>${T('สัญชาติลูกค้า','Customer nationalities')}</h2></div>${hbars(Object.entries(ctry).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>({l:flag(k)+' '+k,v})))}</section>`;
};
