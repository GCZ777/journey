/* =====================================================================
   COMMUNITY — media store, accounts, posts, feed ranking, search,
   composer + photo editor.  Everything lives on this device for now
   (IndexedDB for photos/videos, localStorage for the rest); swap the
   SOC/MED functions for API calls when a backend is connected.
   ===================================================================== */

/* ----- media: IndexedDB blobs ----- */
const MED=(()=>{
  let dbp=null;const urls={};
  const db=()=>dbp||(dbp=new Promise((res,rej)=>{try{const r=indexedDB.open('journey-media',1);r.onupgradeneeded=()=>r.result.createObjectStore('m');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}}));
  const tx=(mode,fn)=>db().then(d=>new Promise((res,rej)=>{const s=d.transaction('m',mode).objectStore('m');const q=fn(s);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}));
  const mem={};
  return {
    async put(blob){const id='m'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);mem[id]=blob;try{await tx('readwrite',s=>s.put(blob,id))}catch(e){}return id},
    async url(id){if(urls[id])return urls[id];let b=mem[id];if(!b){try{b=await tx('readonly',s=>s.get(id))}catch(e){}}if(!b)return null;return urls[id]=URL.createObjectURL(b)},
    del(id){delete mem[id];if(urls[id]){URL.revokeObjectURL(urls[id]);delete urls[id]}tx('readwrite',s=>s.delete(id)).catch(()=>{})}
  };
})();

/* ----- generated scene art (used when there is no photo, e.g. offline preview) ----- */
const ARTC={};
const ART_PAL=[['#FFD3BC','#F2BBD3','#BFADF3','#7A68D4'],['#FFE7C2','#FFC1A6','#E79AB8','#6B5BC2'],['#CDEBFF','#B6D8F5','#E7CFF3','#8C7BE0'],['#FFDAB8','#F9B9A3','#B593E6','#433A86'],['#D8F3E6','#BFE3F2','#C8B8F2','#5E57B8']];
function artURL(kind,seed,w=600,h=750){
  const key=kind+':'+seed+':'+w+'x'+h;if(ARTC[key])return ARTC[key];
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d'),R=rng(hash(key)),pal=ART_PAL[hash(seed+'')%ART_PAL.length];
  const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,pal[3]);sky.addColorStop(.45,pal[2]);sky.addColorStop(.75,pal[1]);sky.addColorStop(1,pal[0]);c.fillStyle=sky;c.fillRect(0,0,w,h);
  const sx=w*(.2+R()*.6),sy=h*(.38+R()*.12);const sg=c.createRadialGradient(sx,sy,0,sx,sy,w*.32);sg.addColorStop(0,'rgba(255,250,240,.95)');sg.addColorStop(.25,'rgba(255,236,214,.7)');sg.addColorStop(1,'rgba(255,236,214,0)');c.fillStyle=sg;c.fillRect(0,0,w,h);
  c.beginPath();c.arc(sx,sy,w*.07,0,7);c.fillStyle='#FFF6EA';c.fill();
  const layer=(y0,amp,col,jag)=>{c.beginPath();c.moveTo(0,h);let x=0;c.lineTo(0,y0);while(x<w){x+=w*(jag?(.05+R()*.08):(.12+R()*.1));c.lineTo(x,y0-R()*amp)}c.lineTo(w,h);c.closePath();c.fillStyle=col;c.fill()};
  const ink=a=>`rgba(46,38,80,${a})`;
  if(kind==='beach'){c.fillStyle='rgba(122,104,212,.35)';c.fillRect(0,h*.6,w,h*.4);for(let i=0;i<7;i++){c.beginPath();const y=h*(.64+i*.05);for(let x=0;x<=w;x+=20)c.lineTo(x,y+Math.sin(x/40+i)*3);c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;c.stroke()}
    c.fillStyle=ink(.85);c.fillRect(w*.8,h*.4,8,h*.6);for(let i=0;i<6;i++){c.save();c.translate(w*.8+4,h*.4);c.rotate(-2.6+i*.55);c.beginPath();c.ellipse(55,0,60,10,0,0,7);c.fill();c.restore()}
    c.fillStyle=ink(.5);c.beginPath();c.moveTo(w*.05,h*.6);c.quadraticCurveTo(w*.18,h*.4,w*.3,h*.6);c.fill()}
  else if(kind==='temple'){layer(h*.72,h*.04,ink(.25),false);const bx=w*(.35+R()*.3);c.fillStyle=ink(.85);c.beginPath();c.moveTo(bx,h*.28);c.lineTo(bx+w*.06,h*.55);c.lineTo(bx+w*.12,h*.6);c.lineTo(bx+w*.14,h*.8);c.lineTo(bx-w*.14,h*.8);c.lineTo(bx-w*.12,h*.6);c.lineTo(bx-w*.06,h*.55);c.closePath();c.fill();
    for(const dx of [-.28,.28]){const x=bx+w*dx;c.beginPath();c.moveTo(x,h*.46);c.lineTo(x+w*.04,h*.66);c.lineTo(x+w*.07,h*.8);c.lineTo(x-w*.07,h*.8);c.lineTo(x-w*.04,h*.66);c.closePath();c.fill()}
    c.fillStyle=ink(.95);c.fillRect(0,h*.8,w,h*.2)}
  else if(kind==='city'){layer(h*.7,h*.05,ink(.2),false);let x=0;while(x<w){const bw=w*(.06+R()*.08),bh=h*(.15+R()*.38);c.fillStyle=ink(.55+R()*.35);c.fillRect(x,h*.88-bh,bw-3,bh);c.fillStyle='rgba(255,236,190,.55)';for(let y=h*.88-bh+10;y<h*.86;y+=16)for(let k=x+6;k<x+bw-10;k+=12)if(R()<.4)c.fillRect(k,y,5,7);x+=bw}c.fillStyle=ink(.95);c.fillRect(0,h*.88,w,h*.12)}
  else if(kind==='food'){c.fillStyle='rgba(255,247,238,.9)';c.fillRect(0,h*.55,w,h*.45);for(let i=0;i<4;i++){const x=w*(.2+.6*R()),y=h*(.65+.25*R()),r=w*(.1+.06*R());c.beginPath();c.ellipse(x,y,r,r*.55,0,0,7);c.fillStyle='#fff';c.fill();c.strokeStyle='rgba(122,104,212,.35)';c.lineWidth=3;c.stroke();c.beginPath();c.ellipse(x,y,r*.7,r*.36,0,0,7);c.fillStyle=['#F2A65A','#E2708C','#7DBE8C','#E9C46A'][i];c.fill()}}
  else {layer(h*.55,h*.18,ink(.3),true);layer(h*.68,h*.14,ink(.5),true);layer(h*.8,h*.1,ink(.8),true);for(let i=0;i<14;i++){const x=R()*w,y=h*(.84+R()*.14),s=10+R()*18;c.beginPath();c.moveTo(x,y-s*2);c.lineTo(x+s*.6,y);c.lineTo(x-s*.6,y);c.closePath();c.fillStyle=ink(.95);c.fill()}}
  return ARTC[key]=cv.toDataURL('image/jpeg',.78);
}
const kindArt=k=>({temple:'temple',nature:'mountain',dive:'beach',food:'food',night:'city',photo:'city'}[k]||'mountain');

/* ----- Wikipedia photos for seeded posts (real site only; falls back to art) ----- */
const WT=(()=>{try{return JSON.parse(localStorage.getItem('jy_wt'))||{}}catch(e){return {}}})();const WTP={};
function wikiPhoto(title){
  if(title in WT)return Promise.resolve(WT[title]);if(WTP[title])return WTP[title];
  return WTP[title]=fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(title.replace(/ /g,'_'))).then(r=>r.ok?r.json():null).then(j=>{
    const u=j&&j.thumbnail?j.thumbnail.source.replace(/\/\d+px-/,'/960px-'):'';WT[title]=u;try{localStorage.setItem('jy_wt',JSON.stringify(WT))}catch(e){}return u}).catch(()=>'');
}
/* media ref → <img>/<video> markup; hydrateMedia() fills real sources */
function mediaTag(m,cls='',alt=''){
  if(!m)return '';
  if(m.type==='video')return `<video class="${cls}" data-mid="${m.mid}" playsinline muted loop preload="metadata"></video>`;
  return `<img class="${cls}" alt="${esc(alt)}" draggable="false" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="${m.mid?` data-mid="${m.mid}"`:''}${m.art&&!m.mid?` data-art="${esc(m.art+'|'+(m.seed||0))}"`:''}${m.wiki?` data-wiki="${esc(m.wiki)}"`:''} referrerpolicy="no-referrer">`;
}
function hydrateMedia(root){
  $$('img[data-art]',root).forEach(el=>{if(el._a)return;el._a=1;const [k,sd]=el.dataset.art.split('|');el.src=artURL(k,sd)});
  $$('[data-mid]',root).forEach(el=>{if(el._h)return;el._h=1;MED.url(el.dataset.mid).then(u=>{if(u)el.src=u})});
  $$('img[data-wiki]',root).forEach(el=>{if(el._w)return;el._w=1;wikiPhoto(el.dataset.wiki).then(u=>{if(!u)return;const im=new Image();im.referrerPolicy='no-referrer';im.onload=()=>{el.src=u};im.src=u})});
}

/* ----- accounts ----- */
const PEOPLE=[
 ['u1','Mai Tanaka','mai.wanders','JP','Slow travel, temples and tiny cafés.',['cafe','temple','photo']],
 ['u2','Lucas Moreau','lucas.on.trails','FR','Weekend trail runner. Collecting summits in the north.',['hike','nature']],
 ['u3','Ananya Rao','ananya.eats','IN','Eating my way through every night market.',['food','market','night']],
 ['u4','Kim Seo-yeon','seoyeon.k','KR','Island hopping with a film camera.',['island','photo','dive']],
 ['u5','Ploy Siriwan','ploy.sw','TH','คนเชียงใหม่ ชอบขับรถเที่ยวเมืองรอง',['culture','cafe','hike']],
 ['u6','Ivan Petrov','ivan.dives','RU','Dive log: Similan, Tao, Lanta.',['dive','island']],
 ['u7','Linh Nguyen','linh.goes','VN','Backpacking SEA on a budget.',['market','food','history']],
 ['u8','Chen Wei','chenwei.photo','CN','Architecture and old towns.',['history','photo','art']],
 ['u9','Emma Brooks','emma.b','GB','Family trips with two little explorers.',['family','nature','wellness']],
 ['u10','Narin Kaewdee','narin.travel','TH','รีวิวที่เที่ยวสายธรรมชาติ ทั่วไทย',['nature','hike','boat']]
].map(([id,name,handle,country,bio,interests])=>({id,kind:'traveler',name,handle,country,bio,interests,initials:name.split(' ').map(x=>x[0]).join('').slice(0,2),color:`hsl(${hash(id)%360} 52% 64%)`}));
const SOC_PROV=['Chiang Mai','Phuket','Krabi','Bangkok','Chiang Rai','Nan','Mae Hong Son','Phang Nga','Kanchanaburi','Loei','Ayutthaya','Surat Thani'];
let GACC=null;
function guideAccounts(){
  if(GACC)return GACC;GACC=[];
  genGeneral().slice(0,6).forEach(g=>GACC.push({id:'g:'+g.id,kind:'guide',gk:'general',g,prov:g.home}));
  SOC_PROV.forEach((en,i)=>{const p=PROV.find(x=>x.en===en);if(!p)return;const L=genLocal(p);const g=L[(i*3)%L.length];GACC.push({id:'g:'+en+':'+g.id,kind:'guide',gk:'local',g,prov:en})});
  GACC.forEach(decoG);
  return GACC;
}
function decoG(a){const g=a.g;Object.assign(a,{name:g.name,initials:g.initials,color:g.color,handle:g.name.toLowerCase().replace(/[^a-z]/g,'')+'.guide',bio:'',interests:g.specs,
    cover:{art:kindArt(g.specs[0]==='hike'?'nature':g.specs[0]),seed:a.id},accent:['#7A68D4','#E2708C','#2FA36B','#D48A3C','#3B82C4'][hash(a.id)%5],
    gallery:(PLACES[a.prov]||PLACES[Object.keys(PLACES)[hash(a.id)%Object.keys(PLACES).length]]).slice(0,6).map((x,j)=>({wiki:x[3],art:kindArt(x[2]),seed:a.id+j}))});return a}
const GX={};
function guideAcctById(id){if(GX[id])return GX[id];const p=id.split(':');let g,prov;
  if(p.length===2){g=genGeneral().find(x=>x.id===p[1]);prov=g&&g.home}else{prov=p[1];const P2=PROV.find(x=>x.en===prov);g=P2&&(gcache[prov]||genLocal(P2)).find(x=>x.id===p[2])}
  return g?GX[id]=decoG({id,kind:'guide',gk:g.kind,g,prov}):null}
const SOC=Object.assign({liked:[],reposted:[],follow:['u5','u2'],hidden:[],seenS:{},posts:[],stories:[],views:{}},store.get('soc')||{});
const socSave=()=>store.set('soc',SOC);
const ME_DEF={id:'me',kind:'traveler',name:'',handle:'',bio:'',country:'',interests:[],avatar:null,setup:false};
let ME=Object.assign({},ME_DEF,store.get('me')||{});
const meSave=()=>store.set('me',ME);
const guideMode=()=>store.get('mode')==='guide';
const myId=()=>guideMode()?'meg':'me';
function meGuideAcct(){
  const pf=gd.profile||{},u=gd.user,a=store.get('application');
  return {id:'meg',kind:'guide',gk:a&&a.kind==='local'?'local':'general',name:(u&&u.name)||t('g_badge'),handle:pf.handle||((u&&u.name)||'guide').toLowerCase().replace(/[^a-z0-9]/g,'')+'.guide',initials:((u&&u.name)||'G')[0].toUpperCase(),
    color:'hsl(262 55% 64%)',bio:pf.bio||'',headline:pf.headline||'',avatar:pf.avatar||null,cover:pf.cover||{art:'mountain',seed:'meg'},accent:pf.accent||'#7A68D4',gallery:pf.gallery||[],layout:pf.layout||'gallery',
    interests:(a&&a.specs)||[],prov:(a&&a.area)||(state.province&&state.province.en)||'Bangkok',rate:gRate(),own:true};
}
function acct(id){
  if(id==='me'){const u=state.user;return Object.assign({},ME,{name:ME.name||(u&&u.name)||t('guest'),handle:ME.handle||((u&&u.email)||'traveler').split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g,''),initials:(ME.name||(u&&u.name)||'?')[0].toUpperCase(),color:'hsl(262 55% 64%)',own:true})}
  if(id==='meg')return meGuideAcct();
  return PEOPLE.find(p=>p.id===id)||guideAccounts().find(a=>a.id===id)||(id.startsWith('g:')&&guideAcctById(id))||{id,kind:'traveler',name:'?',handle:'unknown',initials:'?',color:'#bbb',interests:[]};
}
function avHTML(a,cls=''){return a.avatar?`<span class="av img ${cls}">${mediaTag(a.avatar)}</span>`:`<span class="av ${cls}" style="background:${a.color}">${esc(a.initials)}</span>`}
const followers=a=>a.id==='me'||a.id==='meg'?SOC.posts.length*3+(a.id==='meg'?24:2):120+hash(a.id)%4800;
const isFollow=id=>SOC.follow.includes(id);
function toggleFollow(id){const i=SOC.follow.indexOf(id);i>=0?SOC.follow.splice(i,1):SOC.follow.push(id);socSave()}

/* ----- seeded posts ----- */
const TPL={
 temple:[['ตื่นเช้ามาไหว้พระที่ {p}','ไปถึงก่อน 7 โมง คนน้อยมาก แสงเช้าสวยสุด ๆ แต่งกายสุภาพด้วยนะ','#ไหว้พระ #สายมู #{tag}'],['Golden hour at {p}','Go before the tour buses. Cover shoulders and knees, bring a scarf.','#temples #thailand #{tag}']],
 nature:[['เดินป่าขึ้น {p}','ทางชันช่วงท้าย แต่วิวข้างบนคุ้มมาก แนะนำรองเท้าดี ๆ กับน้ำ 2 ลิตร','#เดินป่า #ธรรมชาติ #{tag}'],['Trail day: {p}','3 hours up, mist the whole way, then it cleared at the top. Local guide knew every shortcut.','#hiking #nature #{tag}']],
 dive:[['น้ำใสมากที่ {p}','ดำน้ำตื้นก็เห็นปลาเยอะ ไปช่วงเช้าคลื่นน้อย อย่าลืมครีมกันแดดแบบไม่ทำร้ายปะการัง','#ทะเล #ดำน้ำ #{tag}'],['Blue water at {p}','Visibility 25m today. Reef-safe sunscreen only please!','#diving #islandlife #{tag}']],
 food:[['ตะลุยกินที่ {p}','ร้านที่คนท้องถิ่นพามา อร่อยกว่าที่คิด ราคาไม่แพง','#ของกิน #สตรีทฟู้ด #{tag}'],['What I ate at {p}','Let a local pick for you. Best meal of the trip and under 200 baht.','#foodtrip #streetfood #{tag}']],
 night:[['เดินเล่นยามค่ำที่ {p}','บรรยากาศดี ไฟสวย ของกินเพียบ ไปหลัง 6 โมงเย็น','#เที่ยวกลางคืน #ตลาด #{tag}'],['Nights at {p}','Music, food stalls and lanterns. Bring cash.','#nightmarket #{tag}']],
 photo:[['มุมถ่ายรูปที่ {p}','มุมนี้ต้องมาตอนแดดอ่อน ๆ ไกด์บอกจุดลับให้ด้วย','#มุมถ่ายรูป #{tag}'],['Photo walk: {p}','Shot on a cloudy afternoon — soft light everywhere.','#photography #{tag}']]
};
function seedPosts(){
  const now=Date.now(),R=rng(hash('journey-feed-v1')),accs=PEOPLE.map(p=>p.id).concat(guideAccounts().map(a=>a.id)),out=[];
  const provs=Object.keys(PLACES);
  for(let i=0;i<38;i++){
    const author=accs[Math.floor(R()*accs.length)],ga=author.startsWith('g:')?guideAccounts().find(a=>a.id===author):null;
    const prov=ga&&ga.gk==='local'?ga.prov:provs[Math.floor(R()*provs.length)],pl=PLACES[prov],x=pl[Math.floor(R()*pl.length)];
    const k=TPL[x[2]]?x[2]:'photo',tp=TPL[k][R()<.5?0:1],th=tp[0].startsWith('ตื่น')||/[฀-๿]/.test(tp[0]);
    const pName=th?x[0]:x[1],P2=PROV.find(p=>p.en===prov),tag=(th?P2.th:P2.en.replace(/\s/g,'')).replace(/\s/g,'');
    const n=1+Math.floor(R()*3),media=[];for(let j=0;j<n;j++){const y=j?pl[Math.floor(R()*pl.length)]:x;media.push({wiki:y[3],art:kindArt(y[2]),seed:'s'+i+j,w:4,h:R()<.5?5:3})}
    const body=tp[1]+'\n\n'+tp[2].replace('{tag}',tag);
    out.push({id:'s'+i,author,at:now-Math.floor(R()*5*864e5)-6e5,title:tp[0].replace('{p}',pName),body,tags:tagsOf(body),media,prov,acts:[{temple:'temple',nature:'hike',dive:'dive',food:'food',night:'night',photo:'photo'}[k]],
      likes:Math.floor(R()*R()*900),reposts:Math.floor(R()*R()*60),views:200+Math.floor(R()*8000),set:{aud:'all',rp:true,hideLikes:false}});
  }
  return out;
}
let SEEDP=null;
const tagsOf=s=>[...new Set((s.match(/#[\p{L}\p{M}\p{N}_]+/gu)||[]).map(x=>x.toLowerCase()))];
function allPosts(){if(!SEEDP)SEEDP=seedPosts();return SOC.posts.concat(SEEDP).filter(p=>!SOC.hidden.includes(p.id))}
const postById=id=>SOC.posts.find(p=>p.id===id)||(SEEDP||[]).find(p=>p.id===id);
const likesOf=p=>p.likes+(SOC.liked.includes(p.id)?1:0);
const repostsOf=p=>p.reposts+(SOC.reposted.includes(p.id)?1:0)+SOC.posts.filter(x=>x.repostOf===p.id&&!SOC.reposted.includes(p.id)).length*0;

/* ----- ranking: quality × freshness × affinity, then author diversity ----- */
const AFF=Object.assign({tags:{},authors:{},prov:{}},store.get('aff')||{});
function bump(p,w){if(!p)return;(p.tags||[]).forEach(tg=>AFF.tags[tg]=(AFF.tags[tg]||0)+w);AFF.authors[p.author]=(AFF.authors[p.author]||0)+w;if(p.prov)AFF.prov[p.prov]=(AFF.prov[p.prov]||0)+w;store.set('aff',AFF)}
function rankInfo(p,now){
  const age=Math.max(0,(now-p.at)/36e5),eng=likesOf(p)+2*repostsOf(p)+(p.views||0)*.01;
  const quality=Math.log2(2+eng),fresh=1/Math.pow(1+age/10,1.2);
  let aff=1,why=null;
  if(isFollow(p.author)){aff+=.6;why=['r_follow']}
  const tagA=(p.tags||[]).map(tg=>[tg,AFF.tags[tg]||0]).sort((a,b)=>b[1]-a[1])[0];
  if(tagA&&tagA[1]>0){aff+=Math.min(.8,Math.log1p(tagA[1])*.3);why=why||['r_tag',{t:tagA[0]}]}
  const ints=(guideMode()?[]:prefs.interests||[]).concat(ME.interests||[]);
  if((p.acts||[]).some(a=>ints.includes(a))){aff+=.3;why=why||['r_int']}
  aff+=Math.min(.4,Math.log1p(AFF.authors[p.author]||0)*.2);
  if(state.province&&p.prov===state.province.en){aff+=.25;why=why||['r_prov',{p:pname(state.province)}]}
  if(p.author===myId()&&age<2)aff+=2;
  if(SOC.views[p.id])aff*=.7;
  if(!why&&eng>400)why=['r_pop'];
  return {s:quality*fresh*aff,why};
}
function rankFeed(list){
  const now=Date.now(),sc=list.map(p=>{const r=rankInfo(p,now);p._why=r.why;return [p,r.s]}).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const out=sc.filter(p=>p.author===myId()&&Date.now()-p.at<36e5);out.forEach(p=>sc.splice(sc.indexOf(p),1));while(sc.length){let i=sc.findIndex(p=>!out.slice(-2).some(q=>q.author===p.author));if(i<0)i=0;out.push(sc.splice(i,1)[0])}
  return out;
}

/* ----- search: text relevance × popularity × recency ----- */
const norm=s=>String(s||'').toLowerCase().normalize('NFKC');
function searchAll(q){
  q=norm(q).trim();if(!q)return {posts:[],people:[],guides:[],tags:[]};
  const toks=q.split(/\s+/).filter(Boolean),now=Date.now();
  const posts=allPosts().filter(p=>!p.repostOf).map(p=>{
    const A=acct(p.author),P2=PROV.find(x=>x.en===p.prov);let s=0;
    for(const tk of toks){const t2=tk.replace(/^#/,'');let m=0;
      for(const tg of p.tags){if(tg==='#'+t2)m=Math.max(m,6);else if(tg.includes(t2))m=Math.max(m,3)}
      if(norm(p.title).includes(t2))m=Math.max(m,3.5);if(norm(p.body).includes(t2))m=Math.max(m,1.5);
      if(norm(A.name).includes(t2)||norm(A.handle).includes(t2))m=Math.max(m,2);
      if(P2&&(norm(P2.en).includes(t2)||P2.th.includes(t2)))m=Math.max(m,2.5);
      if(!m)return [p,0];s+=m}
    const eng=likesOf(p)+2*repostsOf(p);
    return [p,s*(1+Math.log10(1+eng))*Math.pow(1/(1+(now-p.at)/864e5/14),.5)*(1+Math.min(.5,(AFF.authors[p.author]||0)*.05))];
  }).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const accs=PEOPLE.concat(guideAccounts());
  const scoreAcc=a=>{let s=0;for(const tk of toks){const t2=tk.replace(/^[@#]/,'');let m=0;if(norm(a.handle).startsWith(t2)||norm(a.name).startsWith(t2))m=6;else if(norm(a.handle).includes(t2)||norm(a.name).includes(t2))m=4;
    if(a.kind==='guide'){if(a.interests.some(x=>norm(t('sp_'+x)).includes(t2)||x===t2))m=Math.max(m,3);const P2=PROV.find(x=>x.en===a.prov);if(P2&&(norm(P2.en).includes(t2)||P2.th.includes(t2)))m=Math.max(m,3)}
    if(!m)return 0;s+=m}return s*(1+Math.log10(followers(a)))};
  const people=accs.filter(a=>a.kind==='traveler').map(a=>[a,scoreAcc(a)]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const guides=accs.filter(a=>a.kind==='guide').map(a=>[a,scoreAcc(a)]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const tc={};allPosts().forEach(p=>p.tags.forEach(tg=>{if(toks.some(tk=>tg.includes(tk.replace(/^#/,''))))tc[tg]=(tc[tg]||0)+1}));
  const tags=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,12);
  return {posts,people,guides,tags};
}
function trending(){const now=Date.now(),tc={};allPosts().forEach(p=>{const w=1/(1+(now-p.at)/(36e5*36));p.tags.forEach(tg=>tc[tg]=(tc[tg]||0)+w*(1+Math.log10(1+likesOf(p))))});return Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,10).map(x=>x[0])}

/* ----- post card ----- */
function bodyHTML(s){return esc(s).replace(/#([\p{L}\p{M}\p{N}_]+)/gu,(m,x)=>`<button class="tagl" data-tag="#${x.toLowerCase()}">#${x}</button>`).replace(/\n/g,'<br>')}
function mediaBox(p){
  if(!p.media||!p.media.length)return '';
  const m0=p.media[0],ar=Math.max(.8,Math.min(1.91,(m0.w||4)/(m0.h||5)));
  return `<div class="po-media" style="aspect-ratio:${ar}"><div class="pm-track">${p.media.map((m,i)=>`<div class="pm-slide">${mediaTag(m,'',p.title+' '+(i+1))}</div>`).join('')}</div>${p.media.length>1?`<span class="pm-n">1/${p.media.length}</span><span class="pm-dots">${p.media.map((_,i)=>`<i${i?'':' class="on"'}></i>`).join('')}</span>`:''}<span class="heart-pop" aria-hidden="true">${SVG(IC.heart,0)}</span></div>`;
}
function postHTML(p,opt={}){
  const src=p.repostOf?postById(p.repostOf):p;if(!src)return '';
  const A=acct(src.author),RA=p.repostOf?acct(p.author):null,P2=PROV.find(x=>x.en===src.prov),own=src.author===myId();
  const liked=SOC.liked.includes(src.id),rp=SOC.reposted.includes(src.id),lc=likesOf(src),showL=!src.set.hideLikes||own;
  return `<article class="post" data-p="${src.id}" data-wrap="${p.id}">
  ${RA?`<div class="po-rp">${SVG(IC.repost)}<button data-u="${RA.id}">${esc(t('reposted_by',{n:RA.id===myId()?t('you'):RA.name}))}</button></div>${p.body?`<p class="po-quote">${bodyHTML(p.body)}</p>`:''}`:''}
  <header class="po-h"><button class="po-av" data-u="${A.id}" aria-label="${esc(A.name)}">${avHTML(A)}</button><span class="po-id"><button data-u="${A.id}"><b>${esc(A.name)}</b>${A.kind==='guide'?`<span class="vbadge" title="${t('k_guide_badge')}">${SVG(IC.badge,2)}</span>`:''}</button><small>${A.kind==='guide'?`<span class="kpill ${A.gk}">${t(A.gk==='local'?'k_local':'k_general')}</span>`:''}${P2?esc(pname(P2))+' · ':''}${rel(src.at)}</small></span>
  <button class="icon-btn sm" data-pa="more" aria-label="${t('more')}">${SVG(IC.dots,2)}</button></header>
  ${mediaBox(src)}
  <div class="po-acts"><button class="pa${liked?' on':''}" data-pa="like" aria-pressed="${liked}" aria-label="${t('like')}">${SVG(IC.heart,1.9)}<span>${showL?compact(lc):''}</span></button>
  ${src.set.rp!==false?`<button class="pa${rp?' on rp':''}" data-pa="repost" aria-pressed="${rp}" aria-label="${t('repost')}">${SVG(IC.repost,1.9)}<span>${compact(repostsOf(src))}</span></button>`:''}
  <button class="pa" data-pa="share" aria-label="${t('share')}">${SVG(IC.share,1.9)}</button>
  ${src._why&&!opt.noWhy?`<span class="po-why">${SVG(IC.spark)}${esc(t(src._why[0],src._why[1]))}</span>`:''}</div>
  ${src.title?`<h3 class="po-title">${esc(src.title)}</h3>`:''}
  ${src.body?`<p class="po-body clamp">${bodyHTML(src.body)}</p>`:''}
  ${src.set.aud==='followers'?`<small class="po-aud">${SVG(IC.lock)}${t('aud_followers')}</small>`:''}</article>`;
}
const compact=n=>n>=1e4?(n/1e3).toFixed(0)+'k':n>=1e3?(n/1e3).toFixed(1)+'k':String(n);
function bindPostList(root,rerender){
  root.addEventListener('scroll',()=>{},{passive:true});
  root.addEventListener('click',e=>{
    const u=e.target.closest('[data-u]');if(u){openProfile(u.dataset.u);return}
    const tg=e.target.closest('[data-tag]');if(tg){openCSearch(tg.dataset.tag);return}
    const body=e.target.closest('.po-body.clamp');if(body&&!e.target.closest('button')){body.classList.remove('clamp');const p=postById(body.closest('.post').dataset.p);bump(p,.5);return}
    const b=e.target.closest('[data-pa]');if(!b)return;const card=b.closest('.post'),p=postById(card.dataset.p);if(!p)return;const k=b.dataset.pa;
    if(k==='like')toggleLike(p,card);
    else if(k==='repost')repostMenu(p,rerender);
    else if(k==='share'){const s=(p.title||'')+'\n'+location.href.split('#')[0];(navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(()=>toast(t('copied'))).catch(()=>toast(t('copy_fail')))}
    else if(k==='more')postMenu(p,card.dataset.wrap,rerender);
  });
  let lastTap=0;
  root.addEventListener('pointerup',e=>{const m=e.target.closest('.po-media');if(!m)return;const now=Date.now();if(now-lastTap<320){const card=m.closest('.post'),p=postById(card.dataset.p);if(p&&!SOC.liked.includes(p.id))toggleLike(p,card);const h=m.querySelector('.heart-pop');h.classList.remove('go');void h.offsetWidth;h.classList.add('go')}lastTap=now});
  root.addEventListener('scroll',e=>{const tr=e.target;if(!tr.classList||!tr.classList.contains('pm-track'))return;const i=Math.round(tr.scrollLeft/tr.clientWidth),box=tr.parentElement;$$('.pm-dots i',box).forEach((d,j)=>d.classList.toggle('on',i===j));const n=box.querySelector('.pm-n');if(n)n.textContent=(i+1)+'/'+tr.children.length},true);
}
function toggleLike(p,card){
  const i=SOC.liked.indexOf(p.id);if(i>=0)SOC.liked.splice(i,1);else{SOC.liked.push(p.id);bump(p,1)}socSave();
  $$(`.post[data-p="${p.id}"] [data-pa="like"]`).forEach(b=>{const on=SOC.liked.includes(p.id);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);b.querySelector('span').textContent=(!p.set.hideLikes||p.author===myId())?compact(likesOf(p)):''});
}
function repostMenu(p,rerender){
  const did=SOC.reposted.includes(p.id);
  openSheet(t('repost'),`<div class="act-list">${did?`<button class="row" data-r="undo"><span class="r-ic">${SVG(IC.repost)}</span><span class="row-main"><b>${t('repost_undo')}</b></span></button>`:`<button class="row" data-r="rp"><span class="r-ic">${SVG(IC.repost)}</span><span class="row-main"><b>${t('repost')}</b><small>${t('repost_sub')}</small></span></button>
  <div class="rp-quote"><textarea class="input" id="rpq" rows="2" maxlength="280" placeholder="${t('repost_q_ph')}"></textarea><button class="btn primary" data-r="q">${t('repost_q')}</button></div>`}</div>`,()=>{
    $('#optBody').onclick=e=>{const b=e.target.closest('[data-r]');if(!b)return;const k=b.dataset.r;
      if(k==='undo'){SOC.reposted=SOC.reposted.filter(x=>x!==p.id);SOC.posts=SOC.posts.filter(x=>!(x.repostOf===p.id&&x.author===myId()));toast(t('repost_undone'))}
      else{const q=k==='q'?($('#rpq').value||'').trim():'';SOC.reposted.push(p.id);SOC.posts.unshift({id:'r'+Date.now().toString(36),author:myId(),at:Date.now(),repostOf:p.id,body:q,tags:tagsOf(q),media:[],set:{aud:'all',rp:true},likes:0,reposts:0});bump(p,2);toast(t('reposted'))}
      socSave();closeSheet();rerender&&rerender()}});
}
function postMenu(p,wrapId,rerender){
  const own=p.author===myId()||(wrapId!==p.id&&(postById(wrapId)||{}).author===myId());const A=acct(p.author);
  const rows=own?[['del',IC.trash,t('post_del'),'danger']]:[['follow',IC.userplus,isFollow(A.id)?t('unfollow_n',{n:A.name}):t('follow_n',{n:A.name}),''],['hide',IC.eyeoff,t('not_interested'),''],['prof',IC.user,t('view_profile'),'']];
  openSheet(t('more'),`<div class="act-list">${rows.map(([k,ic,l,c])=>`<button class="row ${c}" data-m="${k}"><span class="r-ic">${SVG(ic)}</span><span class="row-main"><b>${esc(l)}</b></span></button>`).join('')}</div>`,()=>{
    $('#optBody').onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;const k=b.dataset.m;
      if(k==='del'){if(!b.dataset.sure){b.dataset.sure=1;b.querySelector('b').textContent=t('post_del_sure');return}const id=wrapId!==p.id?wrapId:p.id;const x=SOC.posts.find(q=>q.id===id);if(x){(x.media||[]).forEach(m=>m.mid&&MED.del(m.mid));if(x.repostOf)SOC.reposted=SOC.reposted.filter(r=>r!==x.repostOf)}SOC.posts=SOC.posts.filter(q=>q.id!==id);toast(t('post_deleted'))}
      else if(k==='follow'){toggleFollow(A.id);toast(isFollow(A.id)?t('following_n',{n:A.name}):t('unfollowed'))}
      else if(k==='hide'){SOC.hidden.push(p.id);bump(p,-2);toast(t('hidden_post'))}
      else if(k==='prof'){closeSheet();openProfile(A.id);return}
      socSave();closeSheet();rerender&&rerender()}});
}
function markViews(root){if(!('IntersectionObserver' in window))return;const io=new IntersectionObserver(es=>{es.forEach(en=>{if(en.isIntersecting){const id=en.target.dataset.p;if(!SOC.views[id]){SOC.views[id]=Date.now();clearTimeout(markViews._t);markViews._t=setTimeout(socSave,800)}io.unobserve(en.target)}})},{threshold:.6});$$('.post',root).forEach(el=>io.observe(el))}

/* ----- feed screen ----- */
state.feedTab='foryou';
function renderFeed(){
  const el=$('#feedBody');if(!el)return;
  const list=state.feedTab==='foryou'?rankFeed(allPosts().filter(p=>!p.repostOf||p.author===myId()||isFollow(p.author))):allPosts().filter(p=>isFollow(p.author)||p.author===myId()).sort((a,b)=>b.at-a.at);
  el.innerHTML=`<div class="stories-rail" id="storyRail">${storyRailHTML()}</div>
  <div class="seg2 feed-tabs" id="feedTabs"><button type="button" data-ft="foryou" aria-pressed="${state.feedTab==='foryou'}">${t('feed_foryou')}</button><button type="button" data-ft="following" aria-pressed="${state.feedTab==='following'}">${t('feed_following')}</button></div>
  ${list.length?`<div class="post-list">${list.map(p=>postHTML(p)).join('')}</div>`:`<div class="empty-state">${SVG(IC.users,1.5)}<span>${t('feed_empty')}</span><button class="btn line" id="feedFind">${t('find_people')}</button></div>`}`;
  hydrateMedia(el);markViews(el);
  $('#feedFind')&&($('#feedFind').onclick=()=>openCSearch(''));
}
$('#feedBody').addEventListener('click',e=>{const b=e.target.closest('[data-ft]');if(b){state.feedTab=b.dataset.ft;renderFeed()}});
bindPostList($('#feedBody'),()=>renderFeed());
$('#feedNew').onclick=()=>openCompose();
$('#feedSearch').onclick=()=>openCSearch('');

/* ----- community search screen ----- */
state.cs={q:'',tab:'all'};
const RECENT=store.get('recentQ')||[];
function openCSearch(q){state.cs={q:q||'',tab:'all'};state.csFrom=state.screen==='csearch'?state.csFrom:state.screen;show('csearch');const i=$('#csIn');i.value=q||'';if(!q)setTimeout(()=>i.focus(),60);if(q&&q.startsWith('#')){const p={tags:[q.toLowerCase()],author:''};bump(p,.5)}}
function renderCSearch(){
  const el=$('#csRes');if(!el)return;const q=state.cs.q.trim();
  if(!q){el.innerHTML=`${RECENT.length?`<div class="cs-sec"><span class="sec-label">${t('cs_recent')}</span><div class="chips">${RECENT.map(r=>`<button class="chip" data-q="${esc(r)}">${SVG(IC.clock)}${esc(r)}</button>`).join('')}</div></div>`:''}
    <div class="cs-sec"><span class="sec-label">${t('cs_trending')}</span><ol class="trend">${trending().map((tg,i)=>`<li><button data-q="${esc(tg)}"><i>${i+1}</i><b>${esc(tg)}</b><small>${t('n_posts',{n:allPosts().filter(p=>p.tags.includes(tg)).length})}</small></button></li>`).join('')}</ol></div>
    <div class="cs-sec"><span class="sec-label">${t('cs_suggest')}</span><div class="acc-list">${PEOPLE.concat(guideAccounts()).filter(a=>!isFollow(a.id)).sort((a,b)=>followers(b)-followers(a)).slice(0,6).map(accRow).join('')}</div></div>`;hydrateMedia(el);return}
  const r=searchAll(q),tab=state.cs.tab,tabs=[['all',t('cs_all')],['posts',t('cs_posts')],['people',t('cs_people')],['guides',t('cs_guides')],['tags',t('cs_tags')]];
  let h=`<div class="cs-tabs">${tabs.map(([k,l])=>`<button data-cst="${k}" aria-pressed="${tab===k}">${l}</button>`).join('')}</div>`;
  const sec=(k,l,body,n)=>body?`<div class="cs-sec"><div class="cs-sh"><span class="sec-label">${l}</span>${tab==='all'&&n>3?`<button class="link" data-cst="${k}">${t('see_all')}</button>`:''}</div>${body}</div>`:'';
  const lim=tab==='all'?3:60;
  if(tab==='all'||tab==='tags')h+=sec('tags',t('cs_tags'),r.tags.length?`<div class="chips">${r.tags.slice(0,tab==='all'?6:12).map(([tg,n])=>`<button class="chip" data-q="${esc(tg)}">${esc(tg)}<small>${n}</small></button>`).join('')}</div>`:'',r.tags.length);
  if(tab==='all'||tab==='guides')h+=sec('guides',t('cs_guides'),r.guides.length?`<div class="acc-list">${r.guides.slice(0,lim).map(accRow).join('')}</div>`:'',r.guides.length);
  if(tab==='all'||tab==='people')h+=sec('people',t('cs_people'),r.people.length?`<div class="acc-list">${r.people.slice(0,lim).map(accRow).join('')}</div>`:'',r.people.length);
  if(tab==='all'||tab==='posts')h+=sec('posts',t('cs_posts'),r.posts.length?`<div class="post-list">${r.posts.slice(0,tab==='all'?4:40).map(p=>postHTML(p,{noWhy:true})).join('')}</div>`:'',r.posts.length);
  if(!r.posts.length&&!r.people.length&&!r.guides.length&&!r.tags.length)h+=`<div class="empty-state">${SVG(IC.search,1.5)}<span>${t('cs_none',{q:esc(q)})}</span></div>`;
  el.innerHTML=h;hydrateMedia(el);
}
function accRow(a){const P2=PROV.find(x=>x.en===a.prov);return `<div class="acc-row"><button class="acc-main" data-u="${a.id}">${avHTML(a)}<span><b>${esc(a.name)}${a.kind==='guide'?`<span class="vbadge">${SVG(IC.badge,2)}</span>`:''}</b><small>@${esc(a.handle)}${a.kind==='guide'?' · '+t(a.gk==='local'?'k_local':'k_general')+(P2?' · '+esc(pname(P2)):''):''}</small></span></button>${a.id==='me'||a.id==='meg'?'':`<button class="btn sm ${isFollow(a.id)?'line':'primary'}" data-fol="${a.id}">${t(isFollow(a.id)?'following':'follow')}</button>`}</div>`}
let csT=0;
$('#csIn').addEventListener('input',e=>{state.cs.q=e.target.value;clearTimeout(csT);csT=setTimeout(renderCSearch,160)});
$('#csIn').addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.trim();if(q){const i=RECENT.indexOf(q);if(i>=0)RECENT.splice(i,1);RECENT.unshift(q);RECENT.length=Math.min(RECENT.length,8);store.set('recentQ',RECENT)}e.target.blur()}});
$('#csBack').onclick=()=>show(state.csFrom&&state.csFrom!=='csearch'?state.csFrom:'feed');
$('#csRes').addEventListener('click',e=>{
  const f=e.target.closest('[data-fol]');if(f){toggleFollow(f.dataset.fol);renderCSearch();return}
  const qb=e.target.closest('[data-q]');if(qb){state.cs.q=qb.dataset.q;$('#csIn').value=state.cs.q;state.cs.tab='all';renderCSearch();return}
  const tb=e.target.closest('[data-cst]');if(tb){state.cs.tab=tb.dataset.cst;renderCSearch();return}
});
bindPostList($('#csRes'),()=>renderCSearch());

/* =====================================================================
   PHOTO EDITOR — crop (aspect, zoom, pan, rotate) + light adjustments.
   Preview uses CSS filters; the export applies them pixel by pixel so it
   works the same in every browser.
   ===================================================================== */
const ASPECTS={orig:null,'1:1':1,'4:5':.8,'16:9':16/9,'9:16':9/16,'3:1':3};
const PRESETS={none:{b:0,c:0,s:0,w:0},dusk:{b:4,c:6,s:10,w:18},vivid:{b:2,c:14,s:30,w:0},soft:{b:8,c:-12,s:-8,w:6},mono:{b:0,c:10,s:-100,w:0},cool:{b:0,c:6,s:4,w:-20}};
function openEditor(file,opt={}){
  return new Promise(res=>{
    const ov=$('#editor'),cv=$('#edCanvas'),ctx=cv.getContext('2d');
    const aspects=opt.aspects||['orig','1:1','4:5','16:9'];
    const S={a:opt.aspect||aspects[0],rot:0,z:1,x:0,y:0,adj:{b:0,c:0,s:0,w:0},pre:'none',tool:'crop'};
    const img=new Image();const url=URL.createObjectURL(file);
    let fr={x:0,y:0,w:0,h:0},base=1;
    const iw=()=>S.rot%180?img.naturalHeight:img.naturalWidth,ih=()=>S.rot%180?img.naturalWidth:img.naturalHeight;
    function layout(){
      const r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);cv.width=r.width*dpr;cv.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      const ar=ASPECTS[S.a]||iw()/ih(),pad=24,W=r.width-pad*2,H=r.height-pad*2;
      let w=W,h=w/ar;if(h>H){h=H;w=h*ar}fr={x:(r.width-w)/2,y:(r.height-h)/2,w,h};
      base=Math.max(w/iw(),h/ih());clamp();draw();
    }
    function clamp(){const sw=iw()*base*S.z,sh=ih()*base*S.z,mx=Math.max(0,(sw-fr.w)/2),my=Math.max(0,(sh-fr.h)/2);S.x=Math.max(-mx,Math.min(mx,S.x));S.y=Math.max(-my,Math.min(my,S.y))}
    function cssFilter(a){return `brightness(${1+a.b/100}) contrast(${1+a.c/100}) saturate(${1+a.s/100}) sepia(${Math.max(0,a.w)/200}) hue-rotate(${a.w<0?a.w*.6:0}deg)`}
    function draw(grid){
      const r=cv.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);
      const cx=fr.x+fr.w/2+S.x,cy=fr.y+fr.h/2+S.y,sc=base*S.z;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(S.rot*Math.PI/180);ctx.drawImage(img,-img.naturalWidth*sc/2,-img.naturalHeight*sc/2,img.naturalWidth*sc,img.naturalHeight*sc);ctx.restore();
      ctx.fillStyle='rgba(20,17,27,.62)';ctx.beginPath();ctx.rect(0,0,r.width,r.height);
      if(opt.circle){ctx.arc(fr.x+fr.w/2,fr.y+fr.h/2,fr.w/2,0,7,true)}else ctx.rect(fr.x+fr.w,fr.y,-fr.w,fr.h);ctx.fill('evenodd');
      ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.5;if(opt.circle){ctx.beginPath();ctx.arc(fr.x+fr.w/2,fr.y+fr.h/2,fr.w/2,0,7);ctx.stroke()}else ctx.strokeRect(fr.x,fr.y,fr.w,fr.h);
      if(grid){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(fr.x+fr.w*i/3,fr.y);ctx.lineTo(fr.x+fr.w*i/3,fr.y+fr.h);ctx.moveTo(fr.x,fr.y+fr.h*i/3);ctx.lineTo(fr.x+fr.w,fr.y+fr.h*i/3);ctx.stroke()}}
      cv.style.filter=cssFilter(S.adj);
    }
    function tools(){
      const tb=$('#edTools');
      const tabs=`<div class="ed-tabs">${[['crop',IC.crop,t('ed_crop')],['adj',IC.sliders,t('ed_adjust')],['pre',IC.palette,t('ed_filters')]].filter(x=>opt.adjust!==false||x[0]==='crop').map(([k,ic,l])=>`<button data-et="${k}" aria-pressed="${S.tool===k}">${SVG(ic)}${l}</button>`).join('')}</div>`;
      let body='';
      if(S.tool==='crop')body=`<div class="ed-row">${aspects.length>1?aspects.map(a=>`<button class="ed-chip" data-ea="${a}" aria-pressed="${S.a===a}">${a==='orig'?t('ed_orig'):a}</button>`).join(''):''}<button class="ed-chip" data-er="1" aria-label="${t('ed_rotate')}">${SVG(IC.rotate)}</button></div>
        <label class="ed-sl">${SVG(IC.zoomin)}<input type="range" id="edZoom" min="1" max="4" step=".01" value="${S.z}" aria-label="${t('ed_zoom')}"></label>`;
      else if(S.tool==='adj')body=['b','c','s','w'].map(k=>`<label class="ed-sl"><span>${t('ed_'+k)}</span><input type="range" data-adj="${k}" min="-100" max="100" step="1" value="${S.adj[k]}"><output>${S.adj[k]}</output></label>`).join('');
      else body=`<div class="ed-row pre">${Object.keys(PRESETS).map(k=>`<button class="ed-pre" data-ep="${k}" aria-pressed="${S.pre===k}"><span style="filter:${cssFilter(PRESETS[k])}"></span>${t('pre_'+k)}</button>`).join('')}</div>`;
      tb.innerHTML=tabs+`<div class="ed-body">${body}</div>`;
      $$('.ed-pre span',tb).forEach(s=>{s.style.backgroundImage=`url("${url}")`});
    }
    $('#edTools').onclick=e=>{
      const a=e.target.closest('[data-et]');if(a){S.tool=a.dataset.et;tools();return}
      const as=e.target.closest('[data-ea]');if(as){S.a=as.dataset.ea;S.z=1;S.x=S.y=0;layout();tools();return}
      if(e.target.closest('[data-er]')){S.rot=(S.rot+90)%360;S.x=S.y=0;layout();return}
      const p=e.target.closest('[data-ep]');if(p){S.pre=p.dataset.ep;S.adj=Object.assign({},PRESETS[S.pre]);draw();tools()}
    };
    $('#edTools').oninput=e=>{if(e.target.id==='edZoom'){S.z=+e.target.value;clamp();draw()}else if(e.target.dataset.adj){S.adj[e.target.dataset.adj]=+e.target.value;e.target.nextElementSibling.textContent=e.target.value;draw()}};
    // gestures: drag to pan, pinch / wheel to zoom
    const pts=new Map();let last=null,pinch=null;
    cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);last=[e.clientX,e.clientY];if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:S.z}}};
    cv.onpointermove=e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);
      if(pts.size===2&&pinch){const [a,b]=[...pts.values()];S.z=Math.max(1,Math.min(4,pinch.z*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d));const zs=$('#edZoom');if(zs)zs.value=S.z}
      else if(last){S.x+=e.clientX-last[0];S.y+=e.clientY-last[1];last=[e.clientX,e.clientY]}
      clamp();draw(true)};
    cv.onpointerup=cv.onpointercancel=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size){last=null;draw()}else last=[...pts.values()][0]};
    cv.onwheel=e=>{e.preventDefault();S.z=Math.max(1,Math.min(4,S.z*(e.deltaY<0?1.06:.94)));const zs=$('#edZoom');if(zs)zs.value=S.z;clamp();draw()};
    function close(v){ov.hidden=true;document.body.classList.remove('ed-open');removeEventListener('resize',layout);URL.revokeObjectURL(url);res(v)}
    $('#edCancel').onclick=()=>close(null);
    $('#edDone').onclick=async()=>{
      const maxS=opt.maxSide||1440,sc=base*S.z;
      const srcW=fr.w/sc,srcH=fr.h/sc;let ow=Math.round(Math.min(maxS,srcW*(opt.upscale?99:1))),oh=Math.round(ow*fr.h/fr.w);if(opt.out){ow=opt.out[0];oh=opt.out[1]}
      if(oh>maxS){oh=maxS;ow=Math.round(oh*fr.w/fr.h)}
      const oc=document.createElement('canvas');oc.width=Math.max(1,ow);oc.height=Math.max(1,oh);const o=oc.getContext('2d'),k=ow/fr.w;
      o.translate(ow/2+S.x*k,oh/2+S.y*k);o.rotate(S.rot*Math.PI/180);o.drawImage(img,-img.naturalWidth*sc*k/2,-img.naturalHeight*sc*k/2,img.naturalWidth*sc*k,img.naturalHeight*sc*k);
      const a=S.adj;if(a.b||a.c||a.s||a.w){const d=o.getImageData(0,0,ow,oh),px=d.data,br=1+a.b/100,ct=1+a.c/100,sa=1+a.s/100,wm=a.w/100;
        for(let i=0;i<px.length;i+=4){let r=px[i]*br,g=px[i+1]*br,b=px[i+2]*br;r=(r-128)*ct+128;g=(g-128)*ct+128;b=(b-128)*ct+128;const l=.299*r+.587*g+.114*b;r=l+(r-l)*sa;g=l+(g-l)*sa;b=l+(b-l)*sa;r+=wm*28;g+=wm*8;b-=wm*24;px[i]=r;px[i+1]=g;px[i+2]=b}
        o.setTransform(1,0,0,1,0,0);o.putImageData(d,0,0)}
      oc.toBlob(b=>close(b?{blob:b,w:ow,h:oh}:null),'image/jpeg',.88);
    };
    img.onload=()=>{ov.hidden=false;document.body.classList.add('ed-open');$('#edTitle').textContent=opt.title||t('ed_title');tools();requestAnimationFrame(layout);addEventListener('resize',layout)};
    img.onerror=()=>{URL.revokeObjectURL(url);toast(t('ed_bad'));res(null)};
    img.src=url;
  });
}

/* ----- composer ----- */
const CP={media:[],title:'',body:'',tags:[],prov:'',set:{aud:'all',rp:true,hideLikes:false}};
function openCompose(){
  if(!guideMode()&&!ME.setup){toast(t('need_profile'));editMyProfile(()=>openCompose());return}
  Object.assign(CP,{media:[],title:'',body:'',tags:[],prov:state.province?state.province.en:'',set:{aud:'all',rp:true,hideLikes:false}});
  state.compFrom=state.screen;show('compose');
}
function renderCompose(){
  const el=$('#cpBody');if(!el)return;const A=acct(myId());
  const tags=[...new Set(CP.tags.concat(tagsOf(CP.body)))];
  el.innerHTML=`<header class="page-h sub"><button class="icon-btn" id="cpBack" aria-label="Back">${SVG(IC.x,2)}</button><h1>${t('cp_title')}</h1><button class="btn primary sm" id="cpPost"${CP.media.length||CP.body.trim()||CP.title.trim()?'':' disabled'}>${t('cp_post')}</button></header>
  <div class="cp-who">${avHTML(A)}<span><b>${esc(A.name)}</b><small>@${esc(A.handle)}</small></span></div>
  <div class="cp-media">${CP.media.map((m,i)=>`<div class="cp-th"><img alt="" src="${m.url}"><button class="cp-x" data-cx="${i}" aria-label="${t('remove')}">${SVG(IC.x,2.4)}</button><button class="cp-ed" data-ce="${i}">${SVG(IC.crop)}${t('ed_edit')}</button></div>`).join('')}
    ${CP.media.length<10?`<label class="cp-add">${SVG(IC.imgplus,1.6)}<span>${t('cp_add_photo')}</span><small>${CP.media.length}/10</small><input type="file" accept="image/*" multiple id="cpFile" hidden></label>`:''}</div>
  <div class="field"><label for="cpTitle">${t('cp_head')}</label><input class="input" id="cpTitle" maxlength="90" value="${esc(CP.title)}" placeholder="${t('cp_head_ph')}"></div>
  <div class="field"><label for="cpText">${t('cp_body')}</label><textarea class="input" id="cpText" rows="5" maxlength="2200" placeholder="${t('cp_body_ph')}">${esc(CP.body)}</textarea><small class="cnt-r">${CP.body.length}/2200</small></div>
  <div class="field"><label for="cpTag">${t('cp_tags')}</label><div class="tag-in"><span class="chips" id="cpTags">${cpTagsHTML()}</span><input class="input" id="cpTag" maxlength="40" placeholder="#${t('cp_tag_ph')}"></div>
   <div class="chips sug">${trending().filter(tg=>!tags.includes(tg)).slice(0,6).map(tg=>`<button type="button" class="chip" data-at="${esc(tg)}">${esc(tg)}</button>`).join('')}</div></div>
  <div class="field"><label for="cpProv">${t('cp_place')}</label><select class="input" id="cpProv"><option value="">${t('cp_noplace')}</option>${PROV.map(p=>`<option value="${p.en}"${CP.prov===p.en?' selected':''}>${esc(pname(p))}</option>`).join('')}</select></div>
  <div class="set-group"><span class="sec-label">${t('cp_settings')}</span><div class="list-card">
    <div class="row"><span class="r-ic">${SVG(IC.eye)}</span><span class="row-main"><b>${t('cp_aud')}</b></span><div class="mini-seg" id="cpAud"><button type="button" data-v="all" aria-pressed="${CP.set.aud==='all'}">${t('aud_all')}</button><button type="button" data-v="followers" aria-pressed="${CP.set.aud==='followers'}">${t('aud_followers')}</button></div></div>
    <label class="row" for="cpRp"><span class="r-ic">${SVG(IC.repost)}</span><span class="row-main"><b>${t('cp_allow_rp')}</b></span><input type="checkbox" class="switch" id="cpRp"${CP.set.rp?' checked':''}></label>
    <label class="row" for="cpHl"><span class="r-ic">${SVG(IC.heart)}</span><span class="row-main"><b>${t('cp_hide_likes')}</b><small>${t('cp_hide_likes_s')}</small></span><input type="checkbox" class="switch" id="cpHl"${CP.set.hideLikes?' checked':''}></label>
  </div></div>`;
  const upd=()=>{$('#cpPost').disabled=!(CP.media.length||CP.body.trim()||CP.title.trim())};
  $('#cpBack').onclick=()=>show(state.compFrom&&state.compFrom!=='compose'?state.compFrom:'feed');
  $('#cpTitle').oninput=e=>{CP.title=e.target.value;upd()};
  $('#cpText').oninput=e=>{CP.body=e.target.value;$('.cnt-r').textContent=CP.body.length+'/2200';upd()};
  let tt=0;$('#cpText').addEventListener('input',()=>{clearTimeout(tt);tt=setTimeout(()=>{$('#cpTags').innerHTML=cpTagsHTML()},250)});
  $('#cpProv').onchange=e=>{CP.prov=e.target.value};
  const addTag=(v,keep)=>{v=v.trim().replace(/^#*/,'#').replace(/\s+/g,'_').toLowerCase();if(v.length>1&&!CP.tags.includes(v)&&CP.tags.length<15){CP.tags.push(v)}$('#cpTag').value='';$('#cpTags').innerHTML=cpTagsHTML();if(keep)$('#cpTag').focus()};
  $('#cpTag').onkeydown=e=>{if(e.key==='Enter'||e.key===','||e.key===' '){e.preventDefault();addTag(e.target.value,true)}};
  $('#cpTag').onblur=e=>{if(e.target.value.trim())addTag(e.target.value)};
  $('#cpAud').onclick=e=>{const b=e.target.closest('[data-v]');if(b){CP.set.aud=b.dataset.v;$$('#cpAud button').forEach(x=>x.setAttribute('aria-pressed',x===b))}};
  $('#cpRp').onchange=e=>{CP.set.rp=e.target.checked};$('#cpHl').onchange=e=>{CP.set.hideLikes=e.target.checked};
  const fi=$('#cpFile');fi&&(fi.onchange=async e=>{const fs=[...e.target.files].slice(0,10-CP.media.length);for(const f of fs){const r=await openEditor(f,{aspects:CP.media.length?[CP.media[0].ar]:['4:5','1:1','16:9','orig'],title:t('ed_title')});if(r){CP.media.push({blob:r.blob,url:URL.createObjectURL(r.blob),w:r.w,h:r.h,ar:CP.media.length?CP.media[0].ar:nearAspect(r.w/r.h),file:f})}}renderCompose()});
  el.onclick=async e=>{
    const x=e.target.closest('[data-cx]');if(x){const m=CP.media.splice(+x.dataset.cx,1)[0];URL.revokeObjectURL(m.url);renderCompose();return}
    const ed=e.target.closest('[data-ce]');if(ed){const i=+ed.dataset.ce,m=CP.media[i];const r=await openEditor(m.file,{aspects:i?[CP.media[0].ar]:['4:5','1:1','16:9','orig']});if(r){URL.revokeObjectURL(m.url);Object.assign(m,{blob:r.blob,url:URL.createObjectURL(r.blob),w:r.w,h:r.h});if(!i)m.ar=nearAspect(r.w/r.h)}renderCompose();return}
    const rt=e.target.closest('[data-rt]');if(rt){const v=rt.dataset.rt;if(rt.dataset.auto){toast(t('cp_tag_auto'));return}CP.tags=CP.tags.filter(x=>x!==v);$('#cpTags').innerHTML=cpTagsHTML();return}
    const at=e.target.closest('[data-at]');if(at){if(!CP.tags.includes(at.dataset.at))CP.tags.push(at.dataset.at);at.remove();$('#cpTags').innerHTML=cpTagsHTML();return}
    if(e.target.closest('#cpPost'))publishPost();
  };
}
function cpTagsHTML(){const auto=tagsOf(CP.body);return [...new Set(CP.tags.concat(auto))].map(tg=>`<button type="button" class="chip on" data-rt="${esc(tg)}"${auto.includes(tg)&&!CP.tags.includes(tg)?' data-auto="1"':''}>${esc(tg)}${CP.tags.includes(tg)?SVG(IC.x,2.2,'xi'):''}</button>`).join('')}
const nearAspect=r=>Object.entries(ASPECTS).filter(([k,v])=>v&&k!=='3:1'&&k!=='9:16').sort((a,b)=>Math.abs(a[1]-r)-Math.abs(b[1]-r))[0][0];
async function publishPost(){
  const b=$('#cpPost');b.disabled=true;
  const media=[];for(const m of CP.media){const mid=await MED.put(m.blob);media.push({mid,w:m.w,h:m.h});URL.revokeObjectURL(m.url)}
  const tags=[...new Set(CP.tags.concat(tagsOf(CP.body)))];
  const p={id:'p'+Date.now().toString(36),author:myId(),at:Date.now(),title:CP.title.trim(),body:CP.body.trim(),tags,media,prov:CP.prov,acts:ACTS.filter(a=>tags.some(tg=>tg.includes(a))),likes:0,reposts:0,views:0,set:Object.assign({},CP.set)};
  SOC.posts.unshift(p);socSave();bump(p,1);toast(t('cp_done'));state.feedTab='foryou';show('feed');
}
