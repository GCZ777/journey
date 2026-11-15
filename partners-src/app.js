/* =====================================================================
   APP: sign-in / onboarding, org switcher, global events, start-up
   ===================================================================== */
function emptyDB(user){return {v:1,user,cur:null,demo:false,orgs:[],net:[],res:{},bookings:[],customers:[],trips:[],links:[],packages:[],threads:[],reviews:[],payouts:[],notifs:[],blocks:{},offers:[],incidents:[]}}
function showAuth(step){
  $('#app').hidden=true;const a=$('#auth');a.hidden=false;step=step||'start';
  const back=`<button class="btn ghost sm au-back" data-au="start">${SVG(IC.chevl)}${T('กลับ','Back')}</button>`;
  let h='';
  if(step==='start'){const had=DB&&DB.user;
    h=`<h1>${T('ระบบสำหรับผู้ให้บริการท่องเที่ยว','The workspace for travel businesses')}</h1><p class="lead">${T('ที่พัก ร้านอาหาร ขนส่ง ทัวร์ สถานที่ท่องเที่ยว และหน่วยงานรัฐ ทำงานบนข้อมูลชุดเดียวกัน ตั้งแต่ลูกค้าเดินทางมาถึงจนถึงจุดหมายปลายทาง','Stays, restaurants, transport, tours, attractions and government on one shared dataset — from the moment a customer arrives to their final destination')}</p>
    <div class="au-k">${Object.keys(KINDS).map(k=>kChip(k)).join('')}</div>
    ${had?`<button class="au-opt main" data-au="resume"><span class="au-ic">${SVG(IC.dash)}</span><span><b>${T('ใช้งานต่อในชื่อ ','Continue as ')}${esc(DB.user.name)}</b><small>${esc(me().name)}</small></span>${SVG(IC.chevr)}</button>`:''}
    <button class="au-opt${had?'':' main'}" data-au="demo"><span class="au-ic">${SVG(IC.sparkle)}</span><span><b>${T('ทดลองด้วยข้อมูลตัวอย่าง','Try it with sample data')}</b><small>${T('เมืองตัวอย่างเชียงใหม่ มีรีสอร์ต บริษัทรถ และหน่วยงานรัฐ เชื่อมกันครบ','A sample Chiang Mai with a resort, a transport company and a government office, all connected')}</small></span>${SVG(IC.chevr)}</button>
    <button class="au-opt" data-au="signup"><span class="au-ic">${SVG(IC.building)}</span><span><b>${T('ลงทะเบียนธุรกิจของคุณ','Register your business')}</b><small>${T('เริ่มจากศูนย์ ใช้เวลาไม่ถึง 2 นาที','Start fresh — takes under 2 minutes')}</small></span>${SVG(IC.chevr)}</button>
    <p class="au-note">${SVG(IC.lock)}${T('ตอนนี้ข้อมูลเก็บไว้ในเบราว์เซอร์นี้เท่านั้น จนกว่าจะเชื่อมระบบบัญชีและฐานข้อมูลจริง','For now, data stays in this browser until real accounts and a database are connected')}</p>`}
  if(step==='demo')h=`${back}<h2>${T('เลือกมุมมองที่จะลอง','Pick a view to try')}</h2><p class="lead">${T('สลับไปมาได้ทุกเมื่อจากเมนูชื่อธุรกิจ','Switch any time from the business menu')}</p>
    ${[['o_resort','stay',T('บ้านสวนดอย รีสอร์ต','Baan Suan Doi Resort'),T('ที่พัก + ร้านอาหาร + ทัวร์','Stay + restaurant + tours')],['o_trans','transport',T('เหนือสุด ทรานสปอร์ต','Nuea Sut Transport'),T('รถรับส่งสนามบินและรถตู้','Airport transfers and vans')],['o_gov','gov',T('หน่วยงานท่องเที่ยวจังหวัด (ตัวอย่าง)','Provincial tourism office (sample)'),T('ภาพรวมจังหวัด ประกาศ ความปลอดภัย','Province overview, notices, safety')]].map(([id,k,n,d])=>`<button class="au-opt" data-demo="${id}"><span class="au-ic" style="--c:${KINDS[k].c}">${SVG(IC[KINDS[k].ic])}</span><span><b>${n}</b><small>${d}</small></span>${SVG(IC.chevr)}</button>`).join('')}`;
  if(step==='signup')h=`${back}<h2>${T('ลงทะเบียนธุรกิจ','Register your business')}</h2>
    <form id="suF" class="form one"><div class="fld"><label for="suN">${T('ชื่อของคุณ','Your name')}</label><input id="suN" required autocomplete="name"></div><div class="fld"><label for="suE">${T('อีเมล','Email')}</label><input id="suE" type="email" required autocomplete="email"></div>
    <div class="fld"><label for="suB">${T('ชื่อธุรกิจหรือหน่วยงาน','Business or agency name')}</label><input id="suB" required></div>
    <div class="fld"><label for="suP">${T('จังหวัด','Province')}</label><select id="suP">${PROVS.map(p=>`<option value="${p[0]}">${T(p[1],p[0])}</option>`).join('')}</select></div>
    <div class="fld full"><label>${T('ธุรกิจของคุณให้บริการอะไรบ้าง (เลือกได้หลายอย่าง)','What do you offer? (pick any)')}</label><div class="kpick">${Object.keys(KINDS).map(k=>`<label class="kp" style="--c:${KINDS[k].c}"><input type="checkbox" value="${k}">${SVG(IC[KINDS[k].ic])}<span>${kName(k)}</span></label>`).join('')}</div><small>${T('หน่วยงานรัฐต้องได้รับคำเชิญและยืนยันตัวตนก่อนเปิดใช้งานจริง','Government accounts need an invitation and verification before going live')}</small></div>
    <button class="btn primary big">${T('สร้างบัญชีธุรกิจ','Create business account')}</button></form>`;
  a.querySelector('.au-card').innerHTML=h;
  $$('[data-au]',a).forEach(b=>b.onclick=()=>{const s=b.dataset.au;if(s==='resume'){enterApp()}else showAuth(s)});
  $$('[data-demo]',a).forEach(b=>b.onclick=()=>{const keep=DB&&DB.demo&&DB.user;DB=keep?DB:seedDB({name:T('คุณสมใจ','Somjai'),email:'demo@journey.example'});DB.cur=b.dataset.demo;save();STATE.view='';enterApp()});
  const f=$('#suF',a);f&&(f.onsubmit=e=>{e.preventDefault();const ks=$$('.kpick input:checked',f).map(x=>x.value);if(!ks.length){toast(T('เลือกอย่างน้อย 1 อย่าง','Pick at least one'));return}
    if(ks.includes('gov')&&ks.length>1){toast(T('บัญชีหน่วยงานรัฐแยกจากธุรกิจ','Government accounts are separate from businesses'));return}
    const user={name:$('#suN',f).value.trim(),email:$('#suE',f).value.trim()};DB=emptyDB(user);
    const o={id:uid('o'),name:$('#suB',f).value.trim(),types:ks,prov:$('#suP',f).value,district:'',phone:'',email:user.email,desc:'',rating:0,reviews:0,verified:false,listed:!ks.includes('gov'),color:KINDS[ks[0]].c,members:[{name:user.name,email:user.email,role:'owner'}],hours:'',docs:{},price:0};
    DB.orgs.push(o);DB.cur=o.id;DB.res[o.id]={};DB.notifs.push({id:uid('nf'),org:o.id,text:T('ยินดีต้อนรับ! เริ่มจากกรอกข้อมูลธุรกิจและอัปโหลดเอกสารยืนยันตัวตน','Welcome! Start by completing your profile and uploading verification documents'),at:Date.now(),read:false});
    save();STATE.view=ks.includes('gov')?'gdash':'settings';enterApp();setTimeout(()=>onboardTip(),400)});
}
function enterApp(){$('#auth').hidden=true;$('#app').hidden=false;const h=location.hash.slice(1);if(!STATE.view)STATE.view=h||'';render()}
function onboardTip(){const o=me(),steps=[[T('กรอกข้อมูลธุรกิจ','Complete your profile'),'settings'],[T('อัปโหลดเอกสารยืนยัน','Upload verification documents'),'settings'],...(o.types.includes('stay')?[[T('เพิ่มประเภทห้องพัก','Add room types'),'rooms']]:[]),...(o.types.includes('dine')?[[T('ใส่เมนูอาหาร','Add your menu'),'menu']]:[]),...(o.types.includes('transport')?[[T('เพิ่มรถและเส้นทาง','Add vehicles and routes'),'fleet']]:[]),...(o.types.includes('tour')?[[T('เพิ่มทัวร์/กิจกรรม','Add tours & activities'),'products']]:[]),...(o.types.includes('attraction')?[[T('ตั้งค่าบัตรเข้าชม','Set up tickets'),'tickets']]:[]),[T('เชื่อมต่อพาร์ทเนอร์ในพื้นที่','Connect with local partners'),'network']];
  if(o.types.includes('gov'))return;
  drawer(T('เริ่มต้นใช้งาน','Getting started'),`<ol class="steps">${steps.map(([l,v],i)=>`<li><button data-sv="${v}"><i>${i+1}</i><span>${l}</span>${SVG(IC.chevr)}</button></li>`).join('')}</ol>`,bd=>$$('[data-sv]',bd).forEach(b=>b.onclick=()=>{closeDrawer();go(b.dataset.sv)}))}
function orgMenu(){
  const mine=DB.orgs.filter(o=>(o.members||[]).some(m=>m.email===DB.user.email));
  drawer(T('ธุรกิจของคุณ','Your businesses'),`<ul class="list">${mine.map(o=>`<li data-org="${o.id}" tabindex="0" class="${o.id===me().id?'on':''}"><span class="org-av" style="background:${o.color}">${esc(o.name[0])}</span><span class="lm"><b>${esc(o.name)}</b><small>${o.types.map(kName).join(' · ')}</small></span>${o.id===me().id?SVG(IC.check,2.4,'ok'):''}</li>`).join('')}</ul>
   <div class="dr-foot"><button class="btn ghost" id="omAdd">${SVG(IC.plus,2.2)}${T('เพิ่มธุรกิจ/สาขา','Add business or branch')}</button><span class="sp"></span><button class="btn ghost" id="omOut">${SVG(IC.logout)}${T('ออกจากระบบ','Sign out')}</button></div>`,bd=>{
    $$('[data-org]',bd).forEach(x=>x.onclick=()=>{DB.cur=x.dataset.org;STATE.sel=null;STATE.f={};save();closeDrawer();go(me().types.includes('gov')?'gdash':'dash')});
    $('#omAdd',bd).onclick=()=>{closeDrawer();addOrg()};
    $('#omOut',bd).onclick=()=>{closeDrawer();showAuth()};
  });
}
function addOrg(){const obj={name:'',prov:me().prov};const sch=[{k:'name',l:T('ชื่อธุรกิจหรือสาขา','Business or branch name'),req:1},{k:'prov',l:T('จังหวัด','Province'),t:'select',o:()=>PROVS.map(p=>[p[0],T(p[1],p[0])])}];
  drawer(T('เพิ่มธุรกิจ/สาขา','Add business or branch'),formHTML(sch,obj)+`<div class="kpick">${Object.keys(KINDS).filter(k=>k!=='gov').map(k=>`<label class="kp" style="--c:${KINDS[k].c}"><input type="checkbox" value="${k}">${SVG(IC[KINDS[k].ic])}<span>${kName(k)}</span></label>`).join('')}</div><div class="dr-foot"><span class="sp"></span><button class="btn primary" id="aoS">${T('สร้าง','Create')}</button></div>`,bd=>{
    $('#aoS',bd).onclick=()=>{if(!readForm(bd,sch,obj))return;const ks=$$('.kpick input:checked',bd).map(x=>x.value);if(!ks.length){toast(T('เลือกอย่างน้อย 1 อย่าง','Pick at least one'));return}
      const o={id:uid('o'),name:obj.name,types:ks,prov:obj.prov,district:'',phone:'',email:'',desc:'',rating:0,reviews:0,verified:false,listed:true,color:KINDS[ks[0]].c,members:[{name:DB.user.name,email:DB.user.email,role:'owner'}],hours:'',docs:{},price:0};
      DB.orgs.push(o);DB.res[o.id]={};DB.cur=o.id;save();closeDrawer();go('settings');setTimeout(onboardTip,300)}})}
function bellMenu(){const ns=DB.notifs.filter(x=>x.org===me().id);
  drawer(T('แจ้งเตือน','Notifications'),`<ul class="list nt">${ns.map(x=>`<li class="${x.read?'':'unread'}"><span class="lm"><b>${esc(x.text)}</b><small>${rel(x.at)}</small></span></li>`).join('')||`<li class="muted">${T('ไม่มีแจ้งเตือน','Nothing new')}</li>`}</ul>`);
  ns.forEach(x=>x.read=true);save();renderNav()}

/* ----- global events ----- */
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');if(g){e.preventDefault();closeDrawerIfOpen();go(g.dataset.go);return}
  const nv=e.target.closest('#nav [data-v]');if(nv){e.preventDefault();STATE.sel=null;go(nv.dataset.v);return}
  const bk=e.target.closest('[data-bk]');if(bk){bookingDetail(bk.dataset.bk);return}
  const ca=e.target.closest('[data-crud-add]');if(ca){crudEdit(ca.dataset.crudAdd);return}
  const cr=e.target.closest('[data-crud-row]');if(cr){crudEdit(cr.dataset.crudRow,cr.dataset.id);return}
  if(e.target.closest('#drClose')||e.target.id==='drawer'){closeDrawer();return}
  if(e.target.closest('#orgBtn')){orgMenu();return}
  if(e.target.closest('#bell')){bellMenu();return}
  if(e.target.closest('#langBtn')){LANG=LANG==='th'?'en':'th';try{localStorage.setItem('jyp_lang',LANG)}catch(x){}document.documentElement.lang=LANG;closeDrawerIfOpen();render();return}
  if(e.target.closest('#menuBtn')){$('#side').classList.toggle('open');return}
  if(e.target.closest('#scrim')){$('#side').classList.remove('open');return}
  if(e.target.closest('#demoReset')){confirmBox(T('รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น?','Reset the sample data?'),()=>{const cur=DB.cur;DB=seedDB(DB.user);DB.cur=cur;save();render();toast(T('รีเซ็ตแล้ว','Reset'))});return}
});
function closeDrawerIfOpen(){if(!$('#drawer').hidden)closeDrawer()}
let cq;document.addEventListener('input',e=>{const k=e.target.dataset&&e.target.dataset.crudQ;if(!k)return;STATE.q[k]=e.target.value;clearTimeout(cq);cq=setTimeout(()=>{render();const i=$(`[data-crud-q="${k}"]`);if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(!$('#modal').hidden){$('#modal').hidden=true;return}if(!$('#drawer').hidden){closeDrawer();return}$('#side').classList.remove('open')}
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[tabindex="0"][data-bk],[tabindex="0"][data-crud-row],[tabindex="0"][data-cu],[tabindex="0"][data-org],[tabindex="0"][data-nm]')){e.preventDefault();e.target.click()}
});
addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(DB&&DB.user&&h&&h!==STATE.view&&!$('#app').hidden){STATE.sel=null;STATE.view=h;render()}});

/* ----- start ----- */
(function start(){
  document.documentElement.lang=LANG;
  load();
  if(DB&&DB.user&&DB.orgs.length){STATE.view=location.hash.slice(1)||'';enterApp();publish()}else showAuth();
  setTimeout(()=>{const s=$('#splash');if(s){s.classList.add('out');setTimeout(()=>s.remove(),400)}},250);
})();
