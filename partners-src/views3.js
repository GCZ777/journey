/* =====================================================================
   VIEWS (3): inbox & trip rooms, network, team, settings, government
   ===================================================================== */
function threadFor(kind,withId){let t=DB.threads.find(x=>x.org===me().id&&x.kind===kind&&x.with===withId);if(!t){t={id:uid('th'),org:me().id,kind,with:withId,msgs:[],unread:0};DB.threads.push(t);save()}return t}
function tripRoom(tr){let t=DB.threads.find(x=>x.kind==='trip'&&x.with===tr.id);
  if(!t){const orgs=[...new Set(tr.legs.filter(l=>l.org).map(l=>l.org))];t={id:uid('th'),org:'*',kind:'trip',with:tr.id,members:orgs,msgs:[{from:'sys',text:T('ห้องแชทสำหรับประสานงานทริปนี้ ลูกค้าและพาร์ทเนอร์ทุกรายในทริปเห็นข้อความเดียวกัน','Coordination room for this trip — the customer and every partner on it see the same messages'),at:Date.now()}],unread:0};DB.threads.push(t);save()}return t}
const thVisible=t=>t.org===me().id||(t.kind==='trip'&&(t.members||[]).includes(me().id));
function thTitle(t){if(t.kind==='customer'){const c=custById(t.with);return c?c.name+' '+flag(c.country):'—'}if(t.kind==='trip'){const tr=DB.trips.find(x=>x.id===t.with);return T('ทริปของ ','Trip: ')+(tr?cName(tr.cust):'')}const o=orgById(t.with);return o?o.name:'—'}
function thSub(t){if(t.kind==='trip'){const tr=DB.trips.find(x=>x.id===t.with);return tr?fmtD(tr.arrive)+' – '+fmtD(tr.depart)+' · '+(t.members||[]).length+T(' พาร์ทเนอร์',' partners'):''}if(t.kind==='customer')return T('ลูกค้า','Customer');const o=orgById(t.with);return o?o.types.map(kName).join(' · '):''}
const TH_IC={customer:'users',partner:'network',gov:'landmark',trip:'route'};
VIEWS.inbox=()=>{
  const f=STATE.f.ib||'all',ths=DB.threads.filter(thVisible).filter(t=>f==='all'||t.kind===f).sort((a,b)=>((b.msgs.at(-1)||{}).at||0)-((a.msgs.at(-1)||{}).at||0));
  const sel=ths.find(t=>t.id===STATE.sel)||null;
  return `<div class="vh"><div><h1>${T('กล่องข้อความ','Inbox')}</h1><p class="sub">${T('คุยกับลูกค้า พาร์ทเนอร์ หน่วยงานรัฐ และห้องแชทของแต่ละทริป ในที่เดียว','Customers, partners, government and per-trip rooms in one place')}</p></div><div class="vh-a"><button class="btn primary" id="ibNew">${SVG(IC.plus,2.2)}${T('ข้อความใหม่','New message')}</button></div></div>
  <div class="toolbar"><div class="seg">${[['all',T('ทั้งหมด','All')],['customer',T('ลูกค้า','Customers')],['partner',T('พาร์ทเนอร์','Partners')],['trip',T('ห้องทริป','Trip rooms')],['gov',T('หน่วยงานรัฐ','Government')]].map(([k,l])=>`<button data-ib="${k}" aria-pressed="${f===k}">${l}</button>`).join('')}</div></div>
  <div class="chat-wrap${sel?' has-sel':''}"><ul class="th-list">${ths.map(t=>{const m=t.msgs.at(-1)||{};return `<li><button data-th="${t.id}" class="${sel===t?'on':''}${t.unread?' unread':''}"><span class="th-ic">${SVG(IC[TH_IC[t.kind]])}</span><span class="lm"><b>${thTitle(t)}</b><small>${esc((m.text||'').slice(0,70))}</small></span><em>${m.at?rel(m.at):''}</em></button></li>`}).join('')||`<li class="muted pad">${T('ยังไม่มีข้อความ','No conversations')}</li>`}</ul>
  <section class="chat">${sel?chatHTML(sel):`<div class="empty">${SVG(IC.chat,1.5)}<span>${T('เลือกบทสนทนา','Pick a conversation')}</span></div>`}</section></div>`;
};
function chatHTML(t){
  const who=m=>m.from==='me'||m.from===me().id?'me':m.from==='sys'?'sys':'them';
  const nm=m=>{if(m.from==='sys')return '';if(who(m)==='me')return '';const o=orgById(m.from);if(o)return o.name;const c=custById(m.from);return c?c.name:''};
  const tr=t.kind==='trip'?DB.trips.find(x=>x.id===t.with):null;
  const quick=t.kind==='customer'?[T('ยินดีต้อนรับค่ะ แจ้งเวลาถึงโดยประมาณได้เลยนะคะ','Welcome! Let us know your arrival time.'),T('รถรับส่งรออยู่หน้าประตู 3 ค่ะ','Your driver is waiting at Gate 3.'),T('เช็กเอาต์ได้ถึง 12:00 ค่ะ','Check-out is until 12:00.')]:t.kind==='trip'?[T('ลูกค้าถึงแล้ว','Customer has arrived'),T('ลูกค้าออกเดินทางแล้ว กำลังไปหาคุณ','Customer has left, on the way to you'),T('ล่าช้าประมาณ 20 นาที','Running about 20 min late')]:[T('รับทราบครับ','Noted, thanks'),T('ยืนยันการจองครับ','Booking confirmed')];
  return `<div class="ch-h"><button class="btn ghost sm ch-back" id="chBack" aria-label="${T('กลับ','Back')}">${SVG(IC.chevl)}</button><span class="th-ic">${SVG(IC[TH_IC[t.kind]])}</span><span class="lm"><b>${thTitle(t)}</b><small>${esc(thSub(t))}</small></span>${tr&&t.kind==='trip'?`<button class="btn ghost sm" id="chTrip">${SVG(IC.route)}${T('ดูเส้นทาง','Itinerary')}</button>`:''}</div>
  ${t.kind==='trip'?`<div class="ch-mem">${(t.members||[]).map(id=>{const o=orgById(id);return `<span class="kchip" style="--c:${o.color}">${esc(o.name)}</span>`}).join('')}<span class="kchip" style="--c:#6F6885">${T('ลูกค้า','Customer')}</span></div>`:''}
  <div class="msgs" id="msgs">${t.msgs.map(m=>`<div class="msg ${who(m)}">${nm(m)?`<small>${esc(nm(m))}</small>`:''}<p>${esc(m.text)}</p><em>${new Date(m.at).toLocaleTimeString(loc(),{hour:'2-digit',minute:'2-digit'})}</em></div>`).join('')}</div>
  <div class="quick">${quick.map(q=>`<button data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
  <form class="ch-in" id="chF"><input id="chT" placeholder="${T('พิมพ์ข้อความ…','Type a message…')}" autocomplete="off"><button class="btn primary" aria-label="${T('ส่ง','Send')}">${SVG(IC.send)}</button></form>`;
}
function openThread(id){STATE.sel=id;if(STATE.view!=='inbox'){STATE.view='inbox';try{history.replaceState(null,'','#inbox')}catch(e){}}render();}
BIND.inbox=v=>{
  $$('[data-ib]',v).forEach(b=>b.onclick=()=>{STATE.f.ib=b.dataset.ib;STATE.sel=null;render()});
  $$('[data-th]',v).forEach(b=>b.onclick=()=>{STATE.sel=b.dataset.th;const t=DB.threads.find(x=>x.id===b.dataset.th);t.unread=0;save();render()});
  $('#ibNew',v).onclick=newMessage;
  const t=DB.threads.find(x=>x.id===STATE.sel);if(!t)return;if(t.unread){t.unread=0;save();renderNav()}
  const ms=$('#msgs',v);ms.scrollTop=ms.scrollHeight;
  const send=txt=>{if(!txt.trim())return;t.msgs.push({from:'me',text:txt.trim(),at:Date.now()});save();render();setTimeout(()=>autoReply(t),1400)};
  $('#chF',v).onsubmit=e=>{e.preventDefault();send($('#chT',v).value)};
  $$('[data-q]',v).forEach(b=>b.onclick=()=>send(b.dataset.q));
  $('#chBack',v).onclick=()=>{STATE.sel=null;render()};
  $('#chTrip',v)&&($('#chTrip',v).onclick=()=>{const tr=DB.trips.find(x=>x.id===t.with);drawer(thTitle(t),journeyTimeline(tr),null,true)});
  if(innerWidth>720)$('#chT',v).focus();
};
function autoReply(t){if(t._r)return;t._r=1;
  const from=t.kind==='customer'?t.with:t.kind==='trip'?(t.members||[]).find(x=>x!==me().id)||'sys':t.with;
  t.msgs.push({from,text:t.kind==='customer'?'Thank you! 🙏':T('รับทราบครับ','Noted, thank you'),at:Date.now()});save();if(STATE.view==='inbox'&&STATE.sel===t.id)render()}
function newMessage(){
  const linked=DB.links.filter(l=>(l.a===me().id||l.b===me().id)).map(l=>l.a===me().id?l.b:l.a);
  const custs=[...new Set(myBookings().map(b=>b.cust))].slice(0,40);
  drawer(T('ข้อความใหม่','New message'),`<h3 class="h3">${T('พาร์ทเนอร์และหน่วยงาน','Partners & agencies')}</h3><ul class="list">${linked.map(id=>{const o=orgById(id);return `<li data-nm="${o.types.includes('gov')?'gov':'partner'}|${id}" tabindex="0"><span class="org-av sm" style="background:${o.color}">${esc(o.name[0])}</span><span class="lm"><b>${esc(o.name)}</b><small>${o.types.map(kName).join(' · ')}</small></span></li>`}).join('')}</ul>
   <h3 class="h3">${T('ลูกค้า','Customers')}</h3><ul class="list">${custs.map(id=>{const c=custById(id);return `<li data-nm="customer|${id}" tabindex="0"><span class="lm"><b>${esc(c.name)} ${flag(c.country)}</b></span></li>`}).join('')}</ul>`,bd=>$$('[data-nm]',bd).forEach(x=>x.onclick=()=>{const [k,id]=x.dataset.nm.split('|');closeDrawer();openThread(threadFor(k,id).id)}));
}

/* ----- partner network ----- */
VIEWS.network=()=>{
  const o=me(),q=(STATE.q.nw||'').toLowerCase(),fk=STATE.f.nw||'all';
  const link=id=>DB.links.find(l=>(l.a===o.id&&l.b===id)||(l.b===o.id&&l.a===id));
  let all=DB.orgs.concat(DB.net).filter(x=>x.id!==o.id&&!x.types.includes('gov'));
  if(fk!=='all')all=all.filter(x=>x.types.includes(fk));if(q)all=all.filter(x=>(x.name+' '+x.district+' '+x.prov).toLowerCase().includes(q));
  all.sort((a,b)=>(link(b.id)?1:0)-(link(a.id)?1:0)||(a.prov===o.prov?-1:1));
  const act=DB.links.filter(l=>(l.a===o.id||l.b===o.id)&&l.status==='active').length;
  return `<div class="vh"><div><h1>${T('เครือข่ายพาร์ทเนอร์','Partner network')}</h1><p class="sub">${T('เชื่อมกับที่พัก ร้านอาหาร ขนส่ง ทัวร์ และสถานที่ท่องเที่ยว เพื่อส่งต่อลูกค้า แชร์แผนการเดินทาง และทำแพ็กเกจร่วม','Connect with stays, restaurants, transport, tours and attractions to hand off customers, share itineraries and build packages')}</p></div></div>
  <div class="kpis">${kpi(T('เชื่อมต่อแล้ว','Connected'),act,'','network')}${kpi(T('ลูกค้าที่ส่งต่อกัน 30 วัน','Referred customers, 30 days'),myBookings().filter(b=>b.src==='partner').length,'','route')}</div>
  <div class="toolbar"><label class="search">${SVG(IC.search)}<input id="nwQ" value="${esc(STATE.q.nw||'')}" placeholder="${T('ค้นหาธุรกิจหรือพื้นที่','Search business or area')}"></label><select id="nwK"><option value="all">${T('ทุกประเภท','All types')}</option>${['stay','dine','transport','tour','attraction'].map(k=>`<option value="${k}"${fk===k?' selected':''}>${kName(k)}</option>`).join('')}</select></div>
  ${all.length?'':`<div class="empty">${SVG(IC.network,1.5)}<span>${T('ยังไม่มีธุรกิจอื่นในระบบตามตัวกรองนี้ เมื่อเชื่อมฐานข้อมูลจริงจะเห็นธุรกิจในจังหวัดของคุณที่นี่','No other businesses match yet. Once the live database is connected you\u2019ll see businesses in your province here.')}</span></div>`}<div class="nw-grid">${all.map(x=>{const l=link(x.id);return `<article class="card nw"><div class="nw-h"><span class="org-av" style="background:${x.color}">${esc(x.name[0])}</span><span class="lm"><b>${esc(x.name)}${x.verified?SVG(IC.badge,2,'vf'):''}</b><small>${esc(x.district)}, ${esc(pName(x.prov))}</small></span></div><div class="nw-k">${x.types.map(kChip).join('')}</div><div class="nw-m"><span>★ ${x.rating}</span><span>${num(x.reviews)} ${T('รีวิว','reviews')}</span>${l&&l.status==='active'?`<span>${T('ค่าแนะนำ ','referral ')}${l.comm}%</span>`:''}</div>
   <div class="nw-a">${l?l.status==='active'?`<span class="pill" style="--c:#1F9D6B">${T('เชื่อมต่อแล้ว','Connected')}</span><button class="btn ghost sm" data-nwc="${x.id}">${SVG(IC.chat)}</button><button class="btn ghost sm" data-nws="${x.id}">${SVG(IC.gear)}</button>`:`<span class="pill" style="--c:#C2830C">${T('รอตอบรับ','Pending')}</span>`:`<button class="btn primary sm" data-nwa="${x.id}">${SVG(IC.plus,2.2)}${T('ขอเชื่อมต่อ','Connect')}</button>`}</div></article>`}).join('')}</div>`;
};
BIND.network=v=>{let qt;$('#nwQ',v).oninput=e=>{STATE.q.nw=e.target.value;clearTimeout(qt);qt=setTimeout(()=>{render();const i=$('#nwQ');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
  $('#nwK',v).onchange=e=>{STATE.f.nw=e.target.value;render()};
  $$('[data-nwc]',v).forEach(b=>b.onclick=()=>openThread(threadFor('partner',b.dataset.nwc).id));
  $$('[data-nwa]',v).forEach(b=>b.onclick=()=>linkForm(b.dataset.nwa));
  $$('[data-nws]',v).forEach(b=>b.onclick=()=>linkForm(b.dataset.nws,true))};
function linkForm(id,edit){const o=orgById(id),l=DB.links.find(x=>(x.a===me().id&&x.b===id)||(x.b===me().id&&x.a===id))||{a:me().id,b:id,comm:10,status:'pending',share:true};
  drawer(edit?T('ข้อตกลงกับ ','Agreement with ')+o.name:T('ขอเชื่อมต่อกับ ','Connect with ')+o.name,`<div class="form"><div class="fld"><label>${T('ค่าแนะนำเมื่อส่งลูกค้าให้กัน (%)','Referral share when you send each other customers (%)')}</label><input type="number" id="lkC" min="0" max="30" value="${l.comm}"></div>
   <label class="fld tog"><span>${T('แชร์แผนการเดินทางของลูกค้าที่ยินยอม เพื่อประสานงานรับส่ง','Share consented customer itineraries for hand-offs')}</span><input type="checkbox" class="sw" id="lkS"${l.share!==false?' checked':''}></label>
   <div class="fld full"><label>${T('ข้อความถึงพาร์ทเนอร์','Message to partner')}</label><textarea id="lkM" rows="3" placeholder="${T('แนะนำธุรกิจของคุณสั้น ๆ','Introduce your business briefly')}"></textarea></div></div>
   <div class="dr-foot">${edit?`<button class="btn ghost danger" id="lkX">${T('ยกเลิกการเชื่อมต่อ','Disconnect')}</button>`:''}<span class="sp"></span><button class="btn primary" id="lkOk">${edit?T('บันทึก','Save'):T('ส่งคำขอ','Send request')}</button></div>`,bd=>{
    $('#lkOk',bd).onclick=()=>{l.comm=+$('#lkC',bd).value;l.share=$('#lkS',bd).checked;if(!DB.links.includes(l))DB.links.push(l);const m=$('#lkM',bd).value.trim();if(m)threadFor('partner',id).msgs.push({from:'me',text:m,at:Date.now()});
      if(!edit){setTimeout(()=>{l.status='active';DB.notifs.unshift({id:uid('nf'),org:me().id,text:o.name+T(' ตอบรับการเชื่อมต่อแล้ว',' accepted your connection'),at:Date.now(),read:false});save();if(STATE.view==='network')render();else renderNav()},2500)}
      save();closeDrawer();render();toast(edit?T('บันทึกแล้ว','Saved'):T('ส่งคำขอแล้ว','Request sent'))};
    $('#lkX',bd)&&($('#lkX',bd).onclick=()=>confirmBox(T('ยกเลิกการเชื่อมต่อ?','Disconnect?'),()=>{DB.links=DB.links.filter(x=>x!==l);save();closeDrawer();render()},true))});
}

/* ----- team ----- */
VIEWS.team=()=>{
  if(!can('team'))return noAccess();
  const ms=me().members||[];
  const perm=[[T('ดูข้อมูล การจอง ปฏิทิน','View bookings & calendar'),1,1,1,1],[T('จัดการการจองและข้อความ','Manage bookings & messages'),1,1,1,0],[T('แก้ไขห้อง เมนู เส้นทาง','Edit rooms, menus, routes'),1,1,1,0],[T('การเงินและการจ่ายเงิน','Finance & payouts'),1,1,0,0],[T('ทีมและตั้งค่าธุรกิจ','Team & business settings'),1,1,0,0]];
  return `<div class="vh"><div><h1>${T('ทีมและสิทธิ์','Team & roles')}</h1><p class="sub">${T('เชิญพนักงานและกำหนดสิทธิ์ตามหน้าที่','Invite staff and give each person the right access')}</p></div><div class="vh-a"><button class="btn primary" id="tmAdd">${SVG(IC.plus,2.2)}${T('เชิญสมาชิก','Invite member')}</button></div></div>
  ${table([{l:T('ชื่อ','Name'),f:m=>`<b>${esc(m.name)}</b><br><small class="muted">${esc(m.email)}</small>`},{l:T('บทบาท','Role'),f:m=>`<span class="tag">${optL(m.role)}</span>`},{l:'',r:1,f:(m)=>m.role==='owner'?'':`<button class="btn ghost sm" data-tm="${esc(m.email)}">${T('แก้ไข','Edit')}</button>`}],ms)}
  <section class="card"><div class="card-h"><h2>${T('สิทธิ์ของแต่ละบทบาท','What each role can do')}</h2></div><div class="tbl-wrap"><table class="tbl perm"><thead><tr><th></th>${OPT.role.map(r=>`<th>${optL(r)}</th>`).join('')}</tr></thead><tbody>${perm.map(p=>`<tr><td>${p[0]}</td>${p.slice(1).map(x=>`<td class="c">${x?SVG(IC.check,2.4,'ok'):'–'}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
};
BIND.team=v=>{const a=$('#tmAdd',v);if(!a)return;a.onclick=()=>tmEdit();$$('[data-tm]',v).forEach(b=>b.onclick=()=>tmEdit(b.dataset.tm))};
function tmEdit(email){const ms=me().members,m=email?ms.find(x=>x.email===email):{name:'',email:'',role:'staff'};
  const sch=[{k:'name',l:T('ชื่อ','Name'),req:1},{k:'email',l:T('อีเมล','Email'),t:'email',req:1},{k:'role',l:T('บทบาท','Role'),t:'select',o:OPT.role.filter(r=>r!=='owner')}];
  drawer(email?T('แก้ไขสมาชิก','Edit member'):T('เชิญสมาชิก','Invite member'),formHTML(sch,m)+`<div class="dr-foot">${email?`<button class="btn ghost danger" id="tmX">${T('นำออก','Remove')}</button>`:''}<span class="sp"></span><button class="btn primary" id="tmS">${email?T('บันทึก','Save'):T('ส่งคำเชิญ','Send invite')}</button></div>`,bd=>{
    $('#tmS',bd).onclick=()=>{if(!readForm(bd,sch,m))return;if(!email)ms.push(m);save();closeDrawer();render();toast(email?T('บันทึกแล้ว','Saved'):T('ส่งคำเชิญแล้ว','Invite sent'))};
    $('#tmX',bd)&&($('#tmX',bd).onclick=()=>{me().members=ms.filter(x=>x!==m);save();closeDrawer();render()})})}

/* ----- settings ----- */
const DOCS={stay:[['biz',T('ใบอนุญาตประกอบธุรกิจโรงแรม หรือหนังสือแจ้งที่พัก','Hotel licence or lodging notification')],['tax',T('ภ.พ.20 / เลขผู้เสียภาษี','VAT / tax ID')]],dine:[['food',T('ใบอนุญาตจำหน่ายอาหาร','Food sales permit')],['tax',T('เลขผู้เสียภาษี','Tax ID')]],transport:[['trans',T('ใบอนุญาตประกอบการขนส่ง','Transport operator licence')],['ins',T('กรมธรรม์ประกันภัยผู้โดยสาร','Passenger insurance')]],tour:[['tat',T('ใบอนุญาตประกอบธุรกิจนำเที่ยว','Tour operator licence')],['ins',T('ประกันอุบัติเหตุลูกค้า','Customer accident insurance')]],attraction:[['op',T('เอกสารสิทธิ์/อนุญาตเปิดสถานที่','Site operating permit')]],gov:[['letter',T('หนังสือยืนยันจากหน่วยงานต้นสังกัด','Agency confirmation letter')]]};
VIEWS.settings=()=>{
  if(!can('settings'))return noAccess();
  const o=me(),docs=[...new Map(o.types.flatMap(k=>DOCS[k]||[]).map(d=>[d[0],d])).values()],tab=STATE.f.st||'profile';
  const tabs=[['profile',T('ข้อมูลธุรกิจ','Profile')],['verify',T('ยืนยันตัวตน','Verification')],['payout',T('บัญชีรับเงิน','Payout account')],['api',T('เชื่อมระบบ (API)','Integrations (API)')],['data',T('ข้อมูลและความเป็นส่วนตัว','Data & privacy')]];
  let body='';
  if(tab==='profile')body=formHTML(profSchema(),o)+`<div class="kset"><span class="sec-l">${T('ประเภทธุรกิจ (เลือกได้หลายอย่าง)','Business lines (pick any)')}</span><div class="kpick">${Object.keys(KINDS).filter(k=>k!=='gov'||o.types.includes('gov')).map(k=>`<label class="kp" style="--c:${KINDS[k].c}"><input type="checkbox" data-kind="${k}"${o.types.includes(k)?' checked':''}${k==='gov'?' disabled':''}>${SVG(IC[KINDS[k].ic])}<span>${kName(k)}</span></label>`).join('')}</div></div><div class="dr-foot"><span class="sp"></span><button class="btn primary" id="stSave">${T('บันทึก','Save')}</button></div>`;
  if(tab==='verify')body=`<p class="muted">${T('เอกสารที่ต้องใช้ตามประเภทธุรกิจ ทีม Journey ตรวจภายใน 2 วันทำการ ธุรกิจที่ยืนยันแล้วจะมีเครื่องหมายในแอป','Documents for your business lines. Journey reviews them within 2 working days; verified businesses get a badge in the app.')}</p><ul class="list docs">${docs.map(([k,l])=>{const s=o.docs[k];return `<li><span class="lm"><b>${esc(l)}</b><small>${s?esc(s.name)+' · '+rel(s.at):T('ยังไม่อัปโหลด','Not uploaded')}</small></span>${s?pill(s.ok?'active':'pending'):''}<label class="btn ghost sm">${SVG(IC.upload)}${s?T('เปลี่ยน','Replace'):T('อัปโหลด','Upload')}<input type="file" hidden data-doc="${k}" accept=".pdf,image/*"></label></li>`}).join('')}</ul>`;
  if(tab==='payout')body=`<p class="note">${SVG(IC.lock)}${T('ข้อมูลบัญชีธนาคารกรอกได้หลังเชื่อมระบบชำระเงินจริง เพื่อความปลอดภัยจะไม่เก็บไว้ในเบราว์เซอร์','Bank details can be added once real payments are connected — for safety they are never stored in the browser.')}</p><div class="bd-grid"><div><small>${T('รอบการโอน','Schedule')}</small><b>${T('ทุกวันจันทร์','Every Monday')}</b></div><div><small>${T('ค่าบริการแพลตฟอร์ม','Platform fee')}</small><b>12%</b></div><div><small>${T('ยอดขั้นต่ำต่อรอบ','Minimum payout')}</small><b>฿500</b></div></div>`;
  if(tab==='api'){const key=o.apiKey||'';body=`<p class="muted">${T('เชื่อมระบบที่ใช้อยู่ (PMS ร้านอาหาร POS ระบบขายตั๋ว) ให้การจองและที่ว่างตรงกันอัตโนมัติ','Connect your PMS, POS or ticketing system so bookings and availability stay in sync')}</p>
   <div class="int">${[['ical',T('ปฏิทิน iCal','iCal calendar'),T('ซิงก์ห้องว่างกับ OTA อื่น','Sync availability with other OTAs')],['webhook','Webhook',T('ส่งการจองใหม่ไปยังระบบของคุณ','Push new bookings to your system')],['pos','POS',T('ส่งยอดขายหน้าร้านเข้ารายงาน','Bring in-store sales into reports')],['line','LINE OA',T('แจ้งเตือนการจองใหม่ทาง LINE','Get booking alerts on LINE')]].map(([k,n,d])=>`<div class="card int-c"><b>${n}</b><small>${d}</small><label class="sw-l"><input type="checkbox" class="sw" data-int="${k}"${(o.int||{})[k]?' checked':''}></label></div>`).join('')}</div>
   <div class="fld full"><label>${T('คีย์ทดสอบ (แสดงครั้งเดียว)','Test key (shown once)')}</label><div class="row"><input readonly class="mono" value="${key?key.slice(0,10)+'••••••••':''}" placeholder="${T('ยังไม่ได้สร้าง','Not created')}"><button class="btn ghost" id="apiGen">${key?T('สร้างใหม่','Regenerate'):T('สร้างคีย์ทดสอบ','Create test key')}</button></div></div>`}
  if(tab==='data')body=`<ul class="list"><li><span class="lm"><b>${T('ส่งออกข้อมูลทั้งหมด (JSON)','Export all data (JSON)')}</b><small>${T('การจอง ลูกค้า ห้อง เมนู เส้นทาง','Bookings, customers, rooms, menus, routes')}</small></span><button class="btn ghost sm" id="dxJ">${SVG(IC.download)}</button></li>
   <li><span class="lm"><b>${T('ข้อมูลลูกค้าตาม PDPA','Customer data & PDPA')}</b><small>${T('แผนการเดินทางแชร์เฉพาะลูกค้าที่ยินยอม และลบอัตโนมัติ 90 วันหลังจบทริป','Itineraries are shared only with consent and deleted 90 days after the trip')}</small></span></li>
   <li><span class="lm"><b>${T('ล้างข้อมูลในเบราว์เซอร์นี้','Clear data in this browser')}</b><small>${T('ใช้เมื่อทดลองเสร็จ ข้อมูลตัวอย่างจะหายทั้งหมด','Removes all demo data here')}</small></span><button class="btn ghost danger sm" id="dxC">${SVG(IC.trash)}</button></li></ul>`;
  return `<div class="vh"><div><h1>${T('ตั้งค่าธุรกิจ','Business settings')}</h1><p class="sub">${esc(o.name)}</p></div></div><div class="tabs">${tabs.map(([k,l])=>`<button data-st="${k}" aria-pressed="${tab===k}">${l}</button>`).join('')}</div><section class="card">${body}</section>`;
};
const profSchema=()=>[{k:'name',l:T('ชื่อธุรกิจ','Business name'),req:1},{k:'prov',l:T('จังหวัด','Province'),t:'select',o:()=>PROVS.map(p=>[p[0],T(p[1],p[0])])},{k:'district',l:T('อำเภอ/เขต','District')},{k:'phone',l:T('โทรศัพท์','Phone')},{k:'email',l:T('อีเมลธุรกิจ','Business email'),t:'email'},{k:'hours',l:T('เวลาทำการ','Opening hours')},{k:'price',l:T('ราคาเริ่มต้น (บาท)','Starting price (THB)'),t:'money'},{k:'desc',l:T('คำอธิบาย (แสดงในแอป)','Description (shown in the app)'),t:'textarea'},{k:'listed',l:T('แสดงในแอป Journey','Listed in the Journey app'),t:'toggle'}];
BIND.settings=v=>{const o=me();
  $$('[data-st]',v).forEach(b=>b.onclick=()=>{STATE.f.st=b.dataset.st;render()});
  const s=$('#stSave',v);s&&(s.onclick=()=>{if(!readForm(v,profSchema(),o))return;const ks=$$('[data-kind]:checked',v).map(x=>x.dataset.kind);if(!ks.length){toast(T('เลือกอย่างน้อย 1 ประเภท','Pick at least one'));return}o.types=ks;o.color=KINDS[ks[0]].c;save();render();toast(T('บันทึกแล้ว','Saved'))});
  $$('[data-doc]',v).forEach(i=>i.onchange=()=>{const f=i.files[0];if(!f)return;o.docs[i.dataset.doc]={name:f.name,at:Date.now(),ok:false};save();render();toast(T('อัปโหลดแล้ว รอตรวจสอบ','Uploaded, awaiting review'))});
  $$('[data-int]',v).forEach(i=>i.onchange=()=>{o.int=o.int||{};o.int[i.dataset.int]=i.checked;save();toast(i.checked?T('เปิดการเชื่อมต่อแล้ว','Integration on'):T('ปิดแล้ว','Integration off'))});
  const g=$('#apiGen',v);g&&(g.onclick=()=>{const k='jyp_test_'+[...crypto.getRandomValues(new Uint8Array(12))].map(x=>x.toString(16).padStart(2,'0')).join('');o.apiKey=k;save();drawer(T('คีย์ทดสอบ','Test key'),`<p class="muted">${T('คัดลอกเก็บไว้ จะไม่แสดงเต็มอีก','Copy it now — it won’t be shown in full again')}</p><pre class="pre">${k}</pre>`);render()});
  const j=$('#dxJ',v);j&&(j.onclick=()=>{const data=JSON.stringify({org:o,res:R(),bookings:myBookings(),customers:DB.customers.filter(c=>myBookings().some(b=>b.cust===c.id))},null,1);
    if(/workers\.dev$/.test(location.hostname)||location.protocol==="file:"){const u=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='journey-partner-'+iso(0)+'.json';document.body.appendChild(a);a.click();a.remove();toast(T('ดาวน์โหลดแล้ว','Downloaded'))}else{(navigator.clipboard?navigator.clipboard.writeText(data):Promise.reject()).then(()=>toast(T('คัดลอก JSON แล้ว','JSON copied'))).catch(()=>toast(T('ดาวน์โหลดได้บนเว็บจริง','Download works on the live site')))}});
  const c=$('#dxC',v);c&&(c.onclick=()=>confirmBox(T('ล้างข้อมูลทั้งหมดในเบราว์เซอร์นี้?','Clear all data in this browser?'),()=>{try{localStorage.removeItem(KEY);localStorage.removeItem('jy_partner_pub')}catch(e){}DB=null;location.hash='';showAuth()},true));
};

/* ===================== government ===================== */
const provTrips=()=>DB.trips.filter(t=>(custById(t.cust)||{}).consent);
VIEWS.gdash=()=>{
  const o=me(),tr=provTrips(),td=iso(0),inNow=tr.filter(t=>t.arrive<=td&&t.depart>=td);
  const biz=DB.orgs.concat(DB.net).filter(x=>!x.types.includes('gov')&&x.prov===o.prov);
  const pax=inNow.reduce((a,t)=>a+custById(t.cust).party,0);
  const arr=[...Array(14)].map((_,i)=>({l:fmtD(iso(i-6)),v:tr.filter(t=>t.arrive===iso(i-6)).reduce((a,t)=>a+custById(t.cust).party,0),hi:i===6}));
  const spend=DB.bookings.filter(b=>b.status!=='cancelled'&&b.date>=iso(-29)&&b.date<=td);
  const byK={};spend.forEach(b=>byK[b.kind]=(byK[b.kind]||0)+b.amount);
  const open=DB.incidents.filter(i=>i.status!=='resolved').length;
  return `<div class="vh"><div><h1>${T('แดชบอร์ดจังหวัด','Province dashboard')} · ${esc(pName(o.prov))}</h1><p class="sub">${T('ภาพรวมนักท่องเที่ยวจากข้อมูลที่ไม่ระบุตัวตนของผู้ประกอบการในระบบ','Anonymised overview from businesses on Journey')}</p></div><div class="vh-a"><button class="btn primary" data-go="ann">${SVG(IC.megaphone)}${T('ออกประกาศ','New notice')}</button></div></div>
  <div class="kpis">${kpi(T('นักท่องเที่ยวในพื้นที่ตอนนี้','Visitors in the province now'),num(pax),T(inNow.length+' ทริป',inNow.length+' trips'),'users')}${kpi(T('ผู้ประกอบการในระบบ','Businesses on Journey'),biz.length,T(biz.filter(b=>b.verified).length+' ยืนยันแล้ว',biz.filter(b=>b.verified).length+' verified'),'shield')}${kpi(T('การใช้จ่าย 30 วัน','Visitor spend, 30 days'),money(spend.reduce((a,b)=>a+b.amount,0)),T('ผ่านระบบ','through Journey'),'wallet','acc')}${kpi(T('เหตุที่ยังเปิดอยู่','Open incidents'),open,'','siren',open?'warn':'')}</div>
  <div class="grid2"><section class="card"><div class="card-h"><h2>${T('ผู้มาถึงรายวัน (คน)','Arrivals per day (people)')}</h2><span class="muted">${T('7 วันที่ผ่านมา + 7 วันข้างหน้า','Past 7 + next 7 days')}</span></div>${bars(arr,{label:'arrivals'})}</section>
  <section class="card"><div class="card-h"><h2>${T('การใช้จ่ายตามประเภท','Spend by sector')}</h2></div>${hbars(Object.entries(byK).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({l:esc(kName(k)),v,c:KINDS[k].c})),{money:true})}</section></div>
  <section class="card"><div class="card-h"><h2>${T('ประกาศที่กำลังแสดงในแอป','Notices live in the app')}</h2><a class="lnk" href="#ann" data-go="ann">${T('จัดการ','Manage')}</a></div>${(R().ann||[]).filter(a=>a.pub&&a.to>=td).map(a=>`<div class="gn ${a.level}">${SVG(IC[a.level==='info'?'info':'alert'])}<span><b>${esc(a.title)}</b><small>${esc(a.body)}</small></span></div>`).join('')||`<p class="muted">${T('ไม่มี','None')}</p>`}</section>`;
};
VIEWS.flows=()=>{
  const tr=provTrips(),ctry={},nights={},seq={},legs={};
  tr.forEach(t=>{const c=custById(t.cust);ctry[c.country]=(ctry[c.country]||0)+c.party;const n=Math.round((new Date(t.depart)-new Date(t.arrive))/864e5);nights[n]=(nights[n]||0)+1;
    const path=t.legs.map(l=>l.kind).filter((k,i,a)=>a[i-1]!==k).join(' → ');seq[path]=(seq[path]||0)+1;
    t.legs.filter(l=>l.org).forEach(l=>{const o=orgById(l.org);legs[o.district]=(legs[o.district]||0)+c.party})});
  const exits={};tr.forEach(t=>{const last=[...t.legs].reverse().find(l=>l.kind==='transport'&&l.route);const k=last?(last.route==='rt_cr'?T('ไปต่อเชียงราย','On to Chiang Rai'):T('สนามบิน','Airport')):T('เดินทางเอง/ไม่ระบุ','Own way / unknown');exits[k]=(exits[k]||0)+1});
  return `<div class="vh"><div><h1>${T('ข้อมูลเส้นทางนักท่องเที่ยว','Visitor journey data')}</h1><p class="sub">${T('นักท่องเที่ยวมาจากไหน ไปที่ไหนต่อ อยู่กี่วัน ใช้ข้อมูลรวมที่ไม่ระบุตัวตน สำหรับวางแผนและจัดการพื้นที่','Where visitors come from, where they go and how long they stay — aggregated and anonymised for planning')}</p></div><div class="vh-a"><button class="btn ghost" id="flCsv">${SVG(IC.download)}CSV</button></div></div>
  <section class="card"><div class="card-h"><h2>${T('ลำดับการเดินทางที่พบบ่อย','Most common journey sequences')}</h2></div><ol class="seq">${Object.entries(seq).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([p,v])=>`<li><span>${p.split(' → ').map(k=>`<i style="--c:${(KINDS[k]||{c:'#6F6885'}).c}">${SVG(IC[KIND_IC[k]])}${esc(kLbl(k))}</i>`).join(SVG(IC.chevr,2,'sep'))}</span><b>${v}</b></li>`).join('')}</ol></section>
  <div class="grid2"><section class="card"><div class="card-h"><h2>${T('สัญชาติ (คน)','Nationality (people)')}</h2></div>${hbars(Object.entries(ctry).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>({l:flag(k)+' '+k,v})))}</section>
  <section class="card"><div class="card-h"><h2>${T('พื้นที่ที่ใช้บริการ (คน-ครั้ง)','Areas visited (person-visits)')}</h2></div>${hbars(Object.entries(legs).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>({l:esc(k),v})))}</section></div>
  <div class="grid2"><section class="card"><div class="card-h"><h2>${T('จำนวนคืนที่พัก','Length of stay (nights)')}</h2></div>${bars(Object.keys(nights).sort((a,b)=>a-b).map(k=>({l:k,v:nights[k]})),{h:140})}</section>
  <section class="card"><div class="card-h"><h2>${T('ออกจากพื้นที่ทาง','How visitors leave')}</h2></div>${hbars(Object.entries(exits).map(([l,v])=>({l:esc(l),v})))}</section></div>`;
};
BIND.flows=v=>{$('#flCsv',v).onclick=()=>csv('visitor-flows',[['trip','country','party','arrive','depart','sequence']].concat(provTrips().map(t=>{const c=custById(t.cust);return ['T'+t.id.slice(2),c.country,c.party,t.arrive,t.depart,t.legs.map(l=>l.kind).join('>')]})))};
crudView('ann',()=>({title:T('ประกาศถึงนักท่องเที่ยว','Traveller notices'),sub:T('ประกาศที่เผยแพร่จะแสดงในหน้าแรกของแอป Journey สำหรับคนที่อยู่ในจังหวัด และส่งถึงผู้ประกอบการทุกรายในพื้นที่','Published notices appear on the Journey home screen for people in the province, and go to every local business'),addL:T('ออกประกาศ','New notice'),
  def:()=>({title:'',body:'',level:'info',prov:me().prov,from:iso(0),to:iso(3),pub:true}),
  schema:[{k:'title',l:T('หัวข้อ','Title'),req:1},{k:'level',l:T('ระดับ','Level'),t:'select',o:OPT.level},{k:'body',l:T('รายละเอียด','Details'),t:'textarea',req:1},{k:'prov',l:T('จังหวัด','Province'),t:'select',o:()=>PROVS.map(p=>[p[0],T(p[1],p[0])])},{k:'from',l:T('เริ่มแสดง','Show from'),t:'date'},{k:'to',l:T('ถึง','Until'),t:'date'},{k:'pub',l:T('เผยแพร่ในแอป','Publish in the app'),t:'toggle'}],
  cols:[{l:T('ประกาศ','Notice'),f:a=>`<b>${esc(a.title)}</b><br><small class="muted">${esc(a.body.slice(0,90))}</small>`},{l:T('ระดับ','Level'),f:a=>`<span class="pill lv-${a.level}">${optL(a.level)}</span>`},{l:T('ช่วงเวลา','Dates'),f:a=>fmtD(a.from)+' – '+fmtD(a.to)},{l:T('สถานะ','Status'),f:a=>pill(a.pub?(a.to>=iso(0)?'published':'closed'):'draft')}]}));
crudView('events',()=>({title:T('เทศกาลและกิจกรรม','Events & festivals'),sub:T('ปฏิทินกิจกรรมของจังหวัด แสดงในแอปและผู้ประกอบการนำไปทำแพ็กเกจได้','Provincial events calendar — shown in the app, and businesses can build packages around them'),addL:T('เพิ่มกิจกรรม','Add event'),
  def:()=>({name:'',from:iso(7),to:iso(9),place:'',desc:'',pub:true}),
  schema:[{k:'name',l:T('ชื่องาน','Event name'),req:1},{k:'place',l:T('สถานที่','Venue')},{k:'from',l:T('เริ่ม','Starts'),t:'date'},{k:'to',l:T('สิ้นสุด','Ends'),t:'date'},{k:'desc',l:T('รายละเอียด','Details'),t:'textarea'},{k:'pub',l:T('เผยแพร่','Published'),t:'toggle'}],
  cols:[{l:T('งาน','Event'),f:e=>`<b>${esc(e.name)}</b><br><small class="muted">${esc(e.place)}</small>`},{l:T('วันที่','Dates'),f:e=>fmtD(e.from)+' – '+fmtD(e.to)},{l:T('สถานะ','Status'),f:e=>pill(e.pub?'published':'draft')}]}));
VIEWS.registry=()=>{
  const o=me(),q=(STATE.q.rg||'').toLowerCase(),fk=STATE.f.rg||'all';
  let biz=DB.orgs.concat(DB.net).filter(x=>!x.types.includes('gov'));
  if(fk==='unv')biz=biz.filter(x=>!x.verified);else if(fk!=='all')biz=biz.filter(x=>x.types.includes(fk));
  if(q)biz=biz.filter(x=>(x.name+' '+x.district).toLowerCase().includes(q));
  return `<div class="vh"><div><h1>${T('ทะเบียนผู้ประกอบการ','Business registry')}</h1><p class="sub">${T('ผู้ประกอบการท่องเที่ยวในระบบ สถานะการยืนยันเอกสาร และช่องทางติดต่อ','Tourism businesses on Journey, their verification status and contacts')}</p></div><div class="vh-a"><button class="btn ghost" id="rgCsv">${SVG(IC.download)}CSV</button></div></div>
  <div class="toolbar"><label class="search">${SVG(IC.search)}<input id="rgQ" value="${esc(STATE.q.rg||'')}" placeholder="${T('ค้นหา','Search')}"></label><select id="rgK"><option value="all">${T('ทุกประเภท','All types')}</option><option value="unv"${fk==='unv'?' selected':''}>${T('ยังไม่ยืนยัน','Not verified')}</option>${['stay','dine','transport','tour','attraction'].map(k=>`<option value="${k}"${fk===k?' selected':''}>${kName(k)}</option>`).join('')}</select><span class="count">${biz.length}</span></div>
  ${table([{l:T('ธุรกิจ','Business'),f:x=>`<b>${esc(x.name)}</b><br><small class="muted">${esc(x.district)}, ${esc(pName(x.prov))}</small>`},{l:T('ประเภท','Lines'),f:x=>x.types.map(kChip).join(' ')},{l:T('ติดต่อ','Contact'),f:x=>`<span class="mono">${esc(x.phone)}</span>`},{l:T('คะแนน','Rating'),r:1,f:x=>'★ '+x.rating},{l:T('ยืนยัน','Verified'),f:x=>x.verified?pill('active'):pill('pending')},{l:'',r:1,f:x=>`<button class="btn ghost sm" data-rgm="${x.id}">${SVG(IC.chat)}</button>`}],biz)}`;
};
BIND.registry=v=>{let qt;$('#rgQ',v).oninput=e=>{STATE.q.rg=e.target.value;clearTimeout(qt);qt=setTimeout(()=>{render();const i=$('#rgQ');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)};
  $('#rgK',v).onchange=e=>{STATE.f.rg=e.target.value;render()};$$('[data-rgm]',v).forEach(b=>b.onclick=()=>openThread(threadFor('partner',b.dataset.rgm).id));
  $('#rgCsv',v).onclick=()=>csv('registry',[['name','types','district','province','phone','verified']].concat(DB.orgs.concat(DB.net).filter(x=>!x.types.includes('gov')).map(x=>[x.name,x.types.join(' '),x.district,x.prov,x.phone,x.verified?'yes':'no'])))};
VIEWS.safety=()=>{
  const inc=[...DB.incidents].sort((a,b)=>b.at-a.at),K={lost:T('พลัดหลง','Lost visitor'),scam:T('ร้องเรียนราคา/หลอกลวง','Overcharging / scam'),weather:T('ภัยธรรมชาติ','Weather / hazard'),accident:T('อุบัติเหตุ','Accident'),health:T('สุขภาพ','Health')};
  return `<div class="vh"><div><h1>${T('เหตุและความปลอดภัย','Safety & incidents')}</h1><p class="sub">${T('รับแจ้งเหตุจากนักท่องเที่ยวและผู้ประกอบการ ติดตามสถานะ และแจ้งเตือนในพื้นที่','Reports from visitors and businesses, status tracking and local alerts')}</p></div><div class="vh-a"><button class="btn primary" id="sfAdd">${SVG(IC.plus,2.2)}${T('บันทึกเหตุ','Log incident')}</button></div></div>
  ${table([{l:T('เหตุ','Incident'),f:i=>`<b>${esc(i.title)}</b><br><small class="muted">${esc(K[i.kind]||i.kind)} · ${esc(i.place)}</small>`},{l:T('เวลา','When'),f:i=>rel(i.at)},{l:T('สถานะ','Status'),f:i=>pill(i.status)},{l:'',r:1,f:i=>`<button class="btn ghost sm" data-sf="${i.id}">${T('อัปเดต','Update')}</button>`}],inc)}
  <p class="note">${SVG(IC.info)}${T('เหตุฉุกเฉินจริง ให้นักท่องเที่ยวโทรสายด่วนท่องเที่ยว 1155 หรือ 191 ระบบนี้ใช้ติดตามและประสานงาน','For real emergencies visitors should call the Tourist Police on 1155 or 191. This board is for tracking and coordination.')}</p>`;
};
BIND.safety=v=>{
  const K=[['lost',T('พลัดหลง','Lost visitor')],['scam',T('ร้องเรียนราคา/หลอกลวง','Overcharging / scam')],['weather',T('ภัยธรรมชาติ','Weather / hazard')],['accident',T('อุบัติเหตุ','Accident')],['health',T('สุขภาพ','Health')]];
  const sch=[{k:'title',l:T('หัวข้อ','Title'),req:1},{k:'kind',l:T('ประเภท','Type'),t:'select',o:()=>K},{k:'place',l:T('สถานที่','Place')},{k:'status',l:T('สถานะ','Status'),t:'select',o:()=>['open','investigating','resolved'].map(s=>[s,optL(s)])}];
  const ed=i=>{const o=i||{id:uid('i'),title:'',kind:'lost',place:'',status:'open',at:Date.now()};drawer(i?T('อัปเดตเหตุ','Update incident'):T('บันทึกเหตุ','Log incident'),formHTML(sch,o)+`<label class="fld tog"><span>${T('ส่งแจ้งเตือนถึงผู้ประกอบการในพื้นที่','Alert local businesses')}</span><input type="checkbox" class="sw" id="sfN"></label><div class="dr-foot"><span class="sp"></span><button class="btn primary" id="sfS">${T('บันทึก','Save')}</button></div>`,bd=>{
    $('#sfS',bd).onclick=()=>{if(!readForm(bd,sch,o))return;if(!i)DB.incidents.unshift(o);if($('#sfN',bd).checked)DB.orgs.filter(x=>!x.types.includes('gov')).forEach(x=>{const th=DB.threads.find(t=>t.org===x.id&&t.kind==='gov'&&t.with===me().id)||(DB.threads.push({id:uid('th'),org:x.id,kind:'gov',with:me().id,msgs:[],unread:0}),DB.threads.at(-1));th.msgs.push({from:me().id,text:T('แจ้งเตือน: ','Alert: ')+o.title+' · '+o.place,at:Date.now()});th.unread=(th.unread||0)+1});save();closeDrawer();render();toast(T('บันทึกแล้ว','Saved'))}})};
  $('#sfAdd',v).onclick=()=>ed();$$('[data-sf]',v).forEach(b=>b.onclick=()=>ed(DB.incidents.find(x=>x.id===b.dataset.sf)));
};
