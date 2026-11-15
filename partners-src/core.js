/* =====================================================================
   JOURNEY PARTNERS — core: helpers, language, storage, data model
   ===================================================================== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let LANG=(()=>{try{return localStorage.getItem('jyp_lang')||((localStorage.getItem('jy_lang')||'"th"').includes('th')?'th':'en')}catch(e){return 'th'}})();
const T=(th,en)=>LANG==='th'?th:en;
const SVG=(d,w=1.8,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC=__IC__;
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h};
const rng=seed=>{let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}};
const uid=p=>(p||'x')+Date.now().toString(36)+Math.floor(Math.random()*1e5).toString(36);
const pad=n=>String(n).padStart(2,'0');
const dKey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const iso=n=>dKey(addD(today(),n));
const loc=()=>LANG==='th'?'th-TH':'en-GB';
const fmtD=k=>new Date(k+'T00:00').toLocaleDateString(loc(),{day:'numeric',month:'short'});
const fmtDW=k=>new Date(k+'T00:00').toLocaleDateString(loc(),{weekday:'short',day:'numeric',month:'short'});
const money=n=>'฿'+Math.round(n).toLocaleString('en-US');
const num=n=>Math.round(n).toLocaleString('en-US');
const rel=t=>{const m=Math.round((Date.now()-t)/6e4);if(m<1)return T('เมื่อสักครู่','just now');if(m<60)return T(m+' นาทีที่แล้ว',m+' min ago');const h=Math.round(m/60);if(h<24)return T(h+' ชม.ที่แล้ว',h+' h ago');return new Date(t).toLocaleDateString(loc(),{day:'numeric',month:'short'})};
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('on'),2200)};

/* ----- business lines ----- */
const KINDS={
  stay:{th:'ที่พัก',en:'Accommodation',sub:[T('รีสอร์ต','Resort'),T('โรงแรม','Hotel'),T('โฮมสเตย์','Homestay'),T('โฮสเทล','Hostel')],ic:'bed',c:'#7A4FC8'},
  dine:{th:'ร้านอาหาร / คาเฟ่',en:'Restaurant / café',ic:'utensils',c:'#D9603F'},
  transport:{th:'ขนส่ง',en:'Transport',ic:'bus',c:'#2F7FC1'},
  tour:{th:'ทัวร์ / กิจกรรม',en:'Tours / activities',ic:'compass',c:'#1F9D6B'},
  attraction:{th:'สถานที่ท่องเที่ยว',en:'Attraction',ic:'ticket',c:'#C2830C'},
  gov:{th:'หน่วยงานรัฐ',en:'Government',ic:'landmark',c:'#3B3F8F'}
};
const kName=k=>T(KINDS[k].th,KINDS[k].en);
const kChip=k=>`<span class="kchip" style="--c:${KINDS[k].c}">${SVG(IC[KINDS[k].ic])}${esc(kName(k))}</span>`;
const PROVS=[['Bangkok','กรุงเทพฯ'],['Chiang Mai','เชียงใหม่'],['Chiang Rai','เชียงราย'],['Phuket','ภูเก็ต'],['Krabi','กระบี่'],['Surat Thani','สุราษฎร์ธานี'],['Chon Buri','ชลบุรี'],['Ayutthaya','พระนครศรีอยุธยา'],['Kanchanaburi','กาญจนบุรี'],['Mae Hong Son','แม่ฮ่องสอน'],['Nan','น่าน'],['Loei','เลย'],['Phang Nga','พังงา'],['Prachuap Khiri Khan','ประจวบคีรีขันธ์'],['Khon Kaen','ขอนแก่น'],['Udon Thani','อุดรธานี'],['Sukhothai','สุโขทัย'],['Trat','ตราด'],['Songkhla','สงขลา'],['Nakhon Ratchasima','นครราชสีมา']];
const pName=en=>{const p=PROVS.find(x=>x[0]===en);return p?T(p[1],p[0]):en};

/* ----- storage ----- */
const KEY='jyp_db';
let DB=null;
function load(){try{DB=JSON.parse(localStorage.getItem(KEY))}catch(e){DB=null}}
let saveT=0;
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}publish()},120)}
/* things other parts of Journey read (same site): partner places and public announcements */
function publish(){
  if(!DB)return;
  const places=[],ann=[];
  for(const o of DB.orgs.concat(DB.net)){
    if(o.types.includes('gov'))continue;
    if(!o.listed)continue;
    o.types.forEach(k=>{const map={stay:'stay',dine:'eat',tour:'see',attraction:'see',transport:'stop'};places.push({id:o.id+':'+k,org:o.id,name:o.name,kind:map[k],ptype:k,prov:o.prov,price:o.price||0,rating:o.rating||0,verified:o.verified})});
  }
  for(const o of DB.orgs){const R=DB.res[o.id]||{};(R.ann||[]).filter(a=>a.pub).forEach(a=>ann.push({id:a.id,org:o.name,prov:a.prov,title:a.title,body:a.body,level:a.level,from:a.from,to:a.to,at:a.at||Date.now()}))}
  try{localStorage.setItem('jy_partner_pub',JSON.stringify({places,ann,at:Date.now()}))}catch(e){}
}
const me=()=>DB.orgs.find(o=>o.id===DB.cur)||DB.orgs[0];
const R=()=>{const o=me();DB.res[o.id]=DB.res[o.id]||{};return DB.res[o.id]};
const has=k=>me().types.includes(k);
const orgById=id=>DB.orgs.find(o=>o.id===id)||DB.net.find(o=>o.id===id);
const custById=id=>DB.customers.find(c=>c.id===id);
const myBookings=()=>DB.bookings.filter(b=>b.org===me().id);
const can=act=>{const m=(me().members||[]).find(x=>x.email===DB.user.email);const role=m?m.role:'owner';return role==='owner'||role==='admin'||(role==='staff'&&act!=='settings'&&act!=='finance'&&act!=='team')||(role==='viewer'&&act==='view')};
