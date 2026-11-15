/* =====================================================================
   UI kit: drawer, modal, table, form builder, charts, shell, router
   ===================================================================== */
const STATUS={new:['ใหม่','New','#7A4FC8'],confirmed:['ยืนยันแล้ว','Confirmed','#2F7FC1'],inprogress:['กำลังให้บริการ','In progress','#C2830C'],done:['เสร็จสิ้น','Completed','#1F9D6B'],cancelled:['ยกเลิก','Cancelled','#A3324F'],noshow:['ไม่มาตามนัด','No-show','#6F6885'],pending:['รอดำเนินการ','Pending','#C2830C'],paid:['จ่ายแล้ว','Paid','#1F9D6B'],active:['ใช้งาน','Active','#1F9D6B'],open:['เปิด','Open','#1F9D6B'],closed:['ปิด','Closed','#6F6885'],maintenance:['ซ่อมบำรุง','Maintenance','#C2830C'],off:['ไม่ใช้งาน','Off','#6F6885'],on:['พร้อมงาน','On duty','#1F9D6B'],leave:['ลา','On leave','#C2830C'],investigating:['กำลังตรวจสอบ','Investigating','#C2830C'],resolved:['แก้ไขแล้ว','Resolved','#1F9D6B'],published:['เผยแพร่แล้ว','Published','#1F9D6B'],draft:['ฉบับร่าง','Draft','#6F6885']};
const pill=s=>{const x=STATUS[s]||[s,s,'#6F6885'];return `<span class="pill" style="--c:${x[2]}">${esc(T(x[0],x[1]))}</span>`};
const KIND_LBL={stay:['เข้าพัก','Stay'],dine:['จองโต๊ะ','Table'],transport:['เดินทาง','Ride'],tour:['ทัวร์/กิจกรรม','Tour'],attraction:['บัตรเข้าชม','Ticket'],arrive:['ถึงเชียงใหม่','Arrival'],depart:['เดินทางกลับ','Departure']};
const KIND_IC={stay:'bed',dine:'utensils',transport:'bus',tour:'compass',attraction:'ticket',arrive:'landing',depart:'takeoff'};
const kLbl=k=>T(...(KIND_LBL[k]||[k,k]));
const SRC={app:['แอป Journey','Journey app'],partner:['พาร์ทเนอร์ส่งต่อ','Partner referral'],package:['แพ็กเกจร่วม','Shared package'],walkin:['วอล์กอิน/โทร','Walk-in / phone']};

/* ----- drawer & modal ----- */
function drawer(title,html,bind,wide){
  const d=$('#drawer');d.classList.toggle('wide',!!wide);$('#drTitle').textContent=title;$('#drBody').innerHTML=html;d.hidden=false;requestAnimationFrame(()=>d.classList.add('on'));
  document.body.classList.add('lock');bind&&bind($('#drBody'));setTimeout(()=>{const f=$('#drBody input,#drBody textarea,#drBody select');if(f&&innerWidth>720)f.focus()},60);
}
function closeDrawer(){const d=$('#drawer');d.classList.remove('on');document.body.classList.remove('lock');setTimeout(()=>{d.hidden=true;$('#drBody').innerHTML=''},220)}
function confirmBox(msg,yes,danger){
  const m=$('#modal');m.innerHTML=`<div class="mbox" role="dialog" aria-modal="true"><p>${esc(msg)}</p><div class="mbtns"><button class="btn ghost" data-m="no">${T('ยกเลิก','Cancel')}</button><button class="btn ${danger?'danger':'primary'}" data-m="yes">${T('ยืนยัน','Confirm')}</button></div></div>`;m.hidden=false;
  m.onclick=e=>{const b=e.target.closest('[data-m]');if(!b&&e.target!==m)return;m.hidden=true;if(b&&b.dataset.m==='yes')yes()};
}

/* ----- table ----- */
function table(cols,rows,opt={}){
  if(!rows.length)return `<div class="empty">${SVG(IC[opt.emptyIc||'inbox'],1.5)}<span>${esc(opt.empty||T('ยังไม่มีข้อมูล','Nothing here yet'))}</span>${opt.emptyBtn||''}</div>`;
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${cols.map(c=>`<th${c.r?' class="r"':''}${c.w?` style="width:${c.w}"`:''}>${esc(c.l)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr${opt.rowAttr?' '+opt.rowAttr(r):''}>${cols.map(c=>`<td${c.r?' class="r"':''} data-l="${esc(c.l)}">${c.f(r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
/* ----- forms from a schema ----- */
const OPT={beds:['King','Queen','Twin','Bunk'],status:['open','closed'],cat:['main','starter','dessert','drink'],zone:['indoor','terrace','outdoor','private'],vkind:['van','bus','songthaew','boat','sedan'],vstatus:['active','maintenance','off'],dstatus:['on','off','leave'],pkind:['tour','class','activity'],tkind:['adult','child','foreigner','senior'],level:['info','warn','alert'],applies:['all','stay','dine','tour','transport'],role:['owner','admin','staff','viewer']};
const OPT_L={main:['จานหลัก','Main'],starter:['ของว่าง','Starter'],dessert:['ของหวาน','Dessert'],drink:['เครื่องดื่ม','Drink'],indoor:['ในร้าน','Indoor'],terrace:['ระเบียง','Terrace'],outdoor:['กลางแจ้ง','Outdoor'],private:['ห้องส่วนตัว','Private room'],van:['รถตู้','Van'],bus:['รถบัส','Bus'],songthaew:['สองแถว','Songthaew'],boat:['เรือ','Boat'],sedan:['รถเก๋ง','Sedan'],tour:['ทัวร์','Tour'],class:['คลาสเรียน','Class'],activity:['กิจกรรม','Activity'],adult:['ผู้ใหญ่ (ไทย)','Adult (Thai)'],child:['เด็ก','Child'],foreigner:['ชาวต่างชาติ','Foreign visitor'],senior:['ผู้สูงอายุ','Senior'],info:['ข้อมูล','Info'],warn:['เฝ้าระวัง','Advisory'],alert:['เตือนภัย','Alert'],all:['ทั้งหมด','All'],stay:['ที่พัก','Stay'],dine:['อาหาร','Dining'],transport:['ขนส่ง','Transport'],owner:['เจ้าของ','Owner'],admin:['ผู้ดูแล','Admin'],staff:['พนักงาน','Staff'],viewer:['ดูอย่างเดียว','Viewer']};
const optL=v=>OPT_L[v]?T(...OPT_L[v]):(STATUS[v]?T(STATUS[v][0],STATUS[v][1]):v);
function field(f,v){
  const id='f_'+f.k,lab=`<label for="${id}">${esc(f.l)}</label>`;
  if(f.t==='select'){const opts=typeof f.o==='function'?f.o():f.o.map(x=>[x,optL(x)]);return `<div class="fld">${lab}<select id="${id}" data-k="${f.k}">${opts.map(([val,l])=>`<option value="${esc(val)}"${String(v)===String(val)?' selected':''}>${esc(l)}</option>`).join('')}</select></div>`}
  if(f.t==='toggle')return `<label class="fld tog" for="${id}"><span>${esc(f.l)}</span><input type="checkbox" class="sw" id="${id}" data-k="${f.k}"${v?' checked':''}></label>`;
  if(f.t==='textarea')return `<div class="fld full">${lab}<textarea id="${id}" data-k="${f.k}" rows="3">${esc(v||'')}</textarea></div>`;
  if(f.t==='tags'||f.t==='times')return `<div class="fld${f.t==='times'?' full':''}">${lab}<input id="${id}" data-k="${f.k}" data-arr="1" value="${esc((v||[]).join(', '))}" placeholder="${esc(f.ph||(f.t==='times'?'08:00, 13:00':''))}"><small>${T('คั่นด้วยเครื่องหมายจุลภาค','Separate with commas')}</small></div>`;
  return `<div class="fld">${lab}<input id="${id}" data-k="${f.k}" type="${f.t==='money'||f.t==='number'?'number':f.t||'text'}"${f.t==='money'?' min="0" step="10"':''} value="${esc(v??'')}"${f.req?' required':''}${f.ph?` placeholder="${esc(f.ph)}"`:''}></div>`;
}
function formHTML(schema,obj){return `<div class="form">${schema.filter(f=>!f.ro).map(f=>field(f,obj[f.k])).join('')}</div>`}
function readForm(root,schema,obj){let ok=true;
  schema.filter(f=>!f.ro).forEach(f=>{const el=$('[data-k="'+f.k+'"]',root);if(!el)return;let v;
    if(el.type==='checkbox')v=el.checked;else if(el.dataset.arr)v=el.value.split(',').map(x=>x.trim()).filter(Boolean);else if(el.type==='number')v=el.value===''?'':+el.value;else v=el.value.trim();
    if(f.req&&(v===''||v==null)){el.classList.add('bad');ok=false}else el.classList.remove('bad');obj[f.k]=v});
  return ok}

/* ----- CRUD list for any resource ----- */
function crud(key,cfg){
  const list=(R()[key]=R()[key]||[]);
  const q=(STATE.q[key]||'').toLowerCase();
  const rows=list.filter(r=>!q||JSON.stringify(r).toLowerCase().includes(q));
  const head=`<div class="vh"><div><h1>${esc(cfg.title)}</h1>${cfg.sub?`<p class="sub">${esc(cfg.sub)}</p>`:''}</div><div class="vh-a">${cfg.extra||''}<button class="btn primary" data-crud-add="${key}">${SVG(IC.plus,2.2)}${esc(cfg.addL||T('เพิ่ม','Add'))}</button></div></div>
  ${cfg.kpis||''}<div class="toolbar"><label class="search">${SVG(IC.search)}<input data-crud-q="${key}" value="${esc(STATE.q[key]||'')}" placeholder="${T('ค้นหา…','Search…')}"></label><span class="count">${rows.length} ${T('รายการ','items')}</span></div>`;
  return head+table(cfg.cols,rows,{rowAttr:r=>`data-crud-row="${key}" data-id="${r.id}" tabindex="0"`,empty:cfg.empty,emptyBtn:`<button class="btn primary" data-crud-add="${key}">${SVG(IC.plus,2.2)}${esc(cfg.addL||T('เพิ่ม','Add'))}</button>`});
}
const CRUD={};
function crudEdit(key,id){
  const cfg=CRUD[key],list=R()[key],obj=id?list.find(x=>x.id===id):Object.assign({id:uid(key[0])},cfg.def?cfg.def():{});
  drawer(id?T('แก้ไข','Edit')+' · '+(obj.name||obj.title||obj.code||obj.plate||''):cfg.addL||T('เพิ่ม','Add'),formHTML(cfg.schema,obj)+`<div class="dr-foot">${id?`<button class="btn danger ghost" id="crDel">${SVG(IC.trash)}${T('ลบ','Delete')}</button>`:''}<span class="sp"></span><button class="btn ghost" id="crCancel">${T('ยกเลิก','Cancel')}</button><button class="btn primary" id="crSave">${T('บันทึก','Save')}</button></div>`,b=>{
    $('#crCancel',b).onclick=closeDrawer;
    $('#crSave',b).onclick=()=>{if(!readForm(b,cfg.schema,obj)){toast(T('กรอกช่องที่จำเป็น','Fill in the required fields'));return}if(!id)list.unshift(obj);if(key==='ann'&&obj.pub)obj.at=Date.now();save();closeDrawer();toast(T('บันทึกแล้ว','Saved'));render()};
    const d=$('#crDel',b);d&&(d.onclick=()=>confirmBox(T('ลบรายการนี้?','Delete this item?'),()=>{R()[key]=list.filter(x=>x.id!==id);save();closeDrawer();toast(T('ลบแล้ว','Deleted'));render()},true));
  });
}

/* ----- charts (SVG, no library) ----- */
function bars(data,opt={}){
  const W=opt.w||640,H=opt.h||180,P=24,max=Math.max(1,...data.map(d=>d.v)),bw=(W-P)/data.length;
  return `<svg class="chart" viewBox="0 0 ${W} ${H+22}" role="img" aria-label="${esc(opt.label||'')}">${[0,.5,1].map(g=>`<line x1="${P}" x2="${W}" y1="${H-(H-10)*g}" y2="${H-(H-10)*g}" class="grid"/><text x="0" y="${H-(H-10)*g+4}" class="ax">${opt.money?compactM(max*g):Math.round(max*g)}</text>`).join('')}
  ${data.map((d,i)=>{const h=Math.max(2,(H-10)*d.v/max);return `<g><rect x="${P+i*bw+bw*.18}" y="${H-h}" width="${bw*.64}" height="${h}" rx="${Math.min(6,bw*.2)}" class="${d.hi?'hi':''}" style="${d.c?'fill:'+d.c:''}"><title>${esc(d.l)}: ${opt.money?money(d.v):num(d.v)}</title></rect>${data.length<=16||i%Math.ceil(data.length/12)===0?`<text x="${P+i*bw+bw/2}" y="${H+16}" text-anchor="middle" class="ax">${esc(d.l)}</text>`:''}</g>`}).join('')}</svg>`;
}
const compactM=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?Math.round(n/1e3)+'k':Math.round(n);
function hbars(data,opt={}){const max=Math.max(1,...data.map(d=>d.v));return `<div class="hbars">${data.map(d=>`<div class="hb"><span class="hb-l">${d.l}</span><span class="hb-t"><i style="width:${d.v/max*100}%;${d.c?'background:'+d.c:''}"></i></span><b>${opt.money?money(d.v):num(d.v)}${opt.suf||''}</b></div>`).join('')}</div>`}
function kpi(l,v,sub,ic,tone){return `<div class="kpi${tone?' '+tone:''}"><span class="kpi-ic">${SVG(IC[ic]||IC.chart)}</span><span class="kpi-m"><small>${esc(l)}</small><b>${v}</b>${sub?`<em>${sub}</em>`:''}</span></div>`}

/* ----- shell + router ----- */
const STATE={view:'dash',q:{},f:{},sel:null};
function navItems(){
  const o=me(),g=o.types.includes('gov'),items=[];
  const S=(sec,arr)=>items.push({sec,arr:arr.filter(Boolean)});
  if(g){
    S(T('ภาพรวมจุดหมายปลายทาง','Destination'),[['gdash','dash',T('แดชบอร์ดจังหวัด','Province dashboard')],['flows','flow',T('ข้อมูลเส้นทางนักท่องเที่ยว','Visitor journey data')],['ann','megaphone',T('ประกาศถึงนักท่องเที่ยว','Traveller notices')],['events','calendar',T('เทศกาลและกิจกรรม','Events & festivals')]]);
    S(T('กำกับดูแล','Oversight'),[['registry','shield',T('ทะเบียนผู้ประกอบการ','Business registry')],['safety','siren',T('เหตุและความปลอดภัย','Safety & incidents')]]);
  }else{
    S(T('ภาพรวม','Overview'),[['dash','dash',T('แดชบอร์ด','Dashboard')],['bookings','calcheck',T('การจองทั้งหมด','Bookings')],['calendar','calendar',T('ปฏิทินและห้องว่าง','Calendar & availability')],['journeys','route',T('เส้นทางลูกค้า','Customer journeys')]]);
    const biz=[];
    if(o.types.includes('stay'))biz.push(['rooms','bed',T('ห้องพักและราคา','Rooms & rates')],['rates','tag',T('ราคาตามฤดูกาล','Seasonal rates')],['housekeeping','sparkle',T('แม่บ้าน/สถานะห้อง','Housekeeping')]);
    if(o.types.includes('dine'))biz.push(['menu','utensils',T('เมนูอาหาร','Menu')],['tables','armchair',T('โต๊ะและที่นั่ง','Tables')]);
    if(o.types.includes('transport'))biz.push(['routes','route2',T('เส้นทางและรอบรถ','Routes & schedules')],['manifest','clipboard',T('รายชื่อผู้โดยสาร','Passenger manifest')],['fleet','bus',T('ยานพาหนะ','Fleet')],['drivers','idcard',T('คนขับ','Drivers')]);
    if(o.types.includes('tour'))biz.push(['products','compass',T('ทัวร์และกิจกรรม','Tours & activities')]);
    if(o.types.includes('attraction'))biz.push(['tickets','ticket',T('บัตรเข้าชม','Tickets')],['crowd','users',T('ความหนาแน่นผู้เข้าชม','Visitor flow')]);
    S(T('งานของธุรกิจ','Operations'),biz);
    S(T('ลูกค้าและการตลาด','Customers & marketing'),[['customers','users',T('ลูกค้า (CRM)','Customers (CRM)')],['reviews','star',T('รีวิว','Reviews')],['promos','percent',T('โปรโมชัน','Promotions')],['packages','package',T('แพ็กเกจร่วม','Shared packages')]]);
    S(T('การเงินและรายงาน','Finance & reports'),[['finance','wallet',T('การเงินและการจ่ายเงิน','Finance & payouts')],['reports','chart',T('รายงานและข้อมูล','Reports & data')]]);
  }
  S(T('สื่อสารและเครือข่าย','Communication'),[['inbox','chat',T('กล่องข้อความ','Inbox')],['network','network',T('เครือข่ายพาร์ทเนอร์','Partner network')]]);
  S(T('จัดการ','Manage'),[['team','team',T('ทีมและสิทธิ์','Team & roles')],['settings','gear',T('ตั้งค่าธุรกิจ','Business settings')]]);
  return items;
}
function unreadCount(){return DB.threads.filter(t=>t.org===me().id&&t.unread).length}
function renderNav(){
  const o=me(),u=unreadCount();
  $('#orgBtn').innerHTML=`<span class="org-av" style="background:${o.color}">${esc(o.name[0])}</span><span class="org-n"><b>${esc(o.name)}</b><small>${o.types.map(kName).join(' · ')}</small></span>${SVG(IC.chevd)}`;
  $('#nav').innerHTML=navItems().map(g=>`<div class="nv-sec"><span>${esc(g.sec)}</span>${g.arr.map(([k,ic,l])=>`<a href="#${k}" class="nv${STATE.view===k?' on':''}" data-v="${k}"${STATE.view===k?' aria-current="page"':''}>${SVG(IC[ic])}<span>${esc(l)}</span>${k==='inbox'&&u?`<i class="dot">${u}</i>`:''}</a>`).join('')}</div>`).join('');
  const n=DB.notifs.filter(x=>x.org===o.id&&!x.read).length;$('#bellN').textContent=n;$('#bellN').hidden=!n;
  $('#langBtn').textContent=LANG==='th'?'EN':'ไทย';
  $('#userAv').textContent=(DB.user.name||'?')[0].toUpperCase();
  $('#demoBar').hidden=!DB.demo;
}
const VIEWS={};
function render(){
  if(!DB||!DB.user){showAuth();return}
  const allowed=navItems().flatMap(g=>g.arr.map(x=>x[0]));
  if(!allowed.includes(STATE.view))STATE.view=allowed[0];
  renderNav();
  const v=$('#view');v.innerHTML=(VIEWS[STATE.view]||(()=>''))();v.focus({preventScroll:true});
  const t=navItems().flatMap(g=>g.arr).find(x=>x[0]===STATE.view);document.title=(t?t[2]+' · ':'')+'Journey Partners';
  (BIND[STATE.view]||(()=>{}))(v);
}
const BIND={};
function go(v){STATE.view=v;try{if(location.hash!=='#'+v)history.replaceState(null,'','#'+v)}catch(e){}$('#side').classList.remove('open');render();scrollTo(0,0)}
