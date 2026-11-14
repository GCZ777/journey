/* ---------------- guides: general (all Thailand) + local (per district) ---------------- */
const ACTS=['hike','temple','food','nature','photo','history','culture','night','dive','island','boat','market','cafe','shop','bike','family','wellness','art'];
const POOLS={beach:['dive','island','boat','food','night','photo','wellness','nature','market'],temple:['temple','history','culture','photo','food','market','art','bike'],mountain:['hike','nature','temple','photo','culture','bike','cafe','market','wellness'],city:['food','night','temple','shop','cafe','history','art','market','culture','family']};
function pickN(R,arr,n){const a=arr.slice(),o=[];while(o.length<n&&a.length)o.push(a.splice(Math.floor(R()*a.length),1)[0]);return o}
function mkPerson(R){
  const first=FIRST[Math.floor(R()*FIRST.length)],last=LAST[Math.floor(R()*LAST.length)];
  return {name:`${first} ${last}.`,initials:first[0]+last,gender:FEM.includes(first)?'f':'m',
    color:`hsl(${[252,266,288,326,346,16,200,170][Math.floor(R()*8)]} ${46+Math.floor(R()*14)}% ${60+Math.floor(R()*7)}%)`,
    age:22+Math.floor(R()*30),years:1+Math.floor(R()*14),licensed:R()<.72,
    styles:[...new Set([STYLES[Math.floor(R()*5)],STYLES[Math.floor(R()*5)]])].slice(0,R()<.5?1:2),
    rating:(4.4+R()*.6).toFixed(1),reviews:12+Math.floor(R()*700)};
}
function mkLangs(R,base){const l=base.slice(),ex=['ja','zh','ko','ru','hi','vi'];const n=Math.floor(R()*2.4);for(let i=0;i<n;i++){const c=ex[Math.floor(R()*6)];if(!l.includes(c))l.push(c)}return l}
const distOf=p=>DIST[p.en]||[[p.th,p.en]];
const dname=(p,di)=>{const d=distOf(p)[di];return d?(state.lang==='th'?d[0]:d[1]):''};
function genLocal(p){
  const R=rng(hash(p.en+'local')),out=[],pool=POOLS[p.type]||POOLS.city;
  distOf(p).forEach((d,di)=>{
    const n=di===0?3:2;
    for(let j=0;j<n;j++){
      const per=mkPerson(R),specs=pickN(R,pool,2+Math.floor(R()*2));
      out.push(Object.assign(per,{id:`L${di}_${j}`,kind:'local',prov:p.en,di,langs:mkLangs(R,R()<.82?['th','en']:['th']),specs,price:250+Math.round(R()*8)*50,tours:makeTours(p,specs,R)}));
    }
  });
  return out;
}
let GEN=null;
function genGeneral(){
  if(GEN)return GEN;
  const R=rng(hash('journey-general-guides')),pool=['temple','food','history','shop','photo','culture','night','market','nature','island','cafe','family','wellness'];GEN=[];
  for(let i=0;i<24;i++){
    const per=mkPerson(R);
    GEN.push(Object.assign(per,{id:'G'+i,kind:'general',home:PROV[Math.floor(R()*PROV.length)].en,langs:mkLangs(R,['th','en']),specs:pickN(R,pool,3),
      price:350+Math.round(R()*5)*50,dayRate:2000+Math.round(R()*16)*100,covered:18+Math.floor(R()*59),tours:[]}));
  }
  return GEN;
}
function genGuides(p){return genLocal(p).concat(genGeneral())}
/* positions are private: only used to animate an accepted guide coming to you */
function placeGuides(p,list){
  const R=rng(hash(p.en+'pos')),pool=[];let tries=0;
  while(pool.length<18&&tries++<900){
    const k=Math.round((R()*2-1)*6),along=Math.round((R()*2-1)*780);let x,y;if(R()<.5){x=k*C;y=along}else{x=along;y=k*C}
    if(Math.hypot(x,y)<180||!Map3D.isLand(x,y)||pool.some(q=>Math.hypot(q[0]-x,q[1]-y)<120))continue;pool.push([x,y]);
  }
  if(!pool.length)pool.push([C*2,300]);
  list.forEach((g,i)=>{
    const [x,y]=pool[hash(g.id+p.en)%pool.length];
    const path=x%C===0&&Math.abs(x)>0&&y%C!==0?[[x,y],[x,0],[0,0]]:[[x,y],[0,y],[0,0]],dist=Math.abs(x)+Math.abs(y);
    Object.assign(g,{x,y,ox:x,oy:y,path,dist,eta:Math.max(3,Math.round(dist/230)+(g.kind==='general'?6:0))});
    if(g.kind==='general')g.tours=makeTours(p,g.specs,rng(hash(g.id+p.en)));
  });
}

/* ----- filters: exact matches first, then close ones; the rest are hidden ----- */
const DEF_F={kind:'all',di:-1,acts:[],lang:'all',gender:'any',styles:[],maxPrice:0,minRating:0,licensed:false};
let F=Object.assign({},DEF_F,{acts:[],styles:[]},store.get('filters')||{});
function fFromPrefs(){F.lang=prefs.lang&&prefs.lang!=='any'?prefs.lang:'all';F.gender=prefs.gender||'any';F.styles=[...(prefs.styles||[])];if(prefs.interests&&prefs.interests.length&&!F.acts.length)F.acts=prefs.interests.filter(a=>ACTS.includes(a)).slice(0,2)}
const fCount=()=>(F.di>=0)+(F.acts.length>0)+(F.lang!=='all')+(F.gender!=='any')+(F.styles.length>0)+(F.maxPrice>0)+(F.minRating>0)+F.licensed;
function fitOf(g){
  if(F.kind!=='all'&&g.kind!==F.kind)return null;
  if(F.di>=0&&!(g.kind==='local'&&g.di===F.di))return null;
  if(F.gender!=='any'&&g.gender!==F.gender)return null;
  if(F.lang!=='all'&&!g.langs.includes(F.lang))return null;
  const miss=[];
  if(F.acts.length){const no=F.acts.filter(a=>!g.specs.includes(a));if(no.length===F.acts.length)return null;if(no.length)miss.push(t('f_m_acts',{s:no.map(a=>t('sp_'+a)).join(', ')}))}
  if(F.styles.length&&!F.styles.some(s=>g.styles.includes(s)))miss.push(t('f_m_style'));
  if(F.maxPrice&&g.price>F.maxPrice){if(g.price>F.maxPrice*1.25)return null;miss.push(t('f_m_price',{n:money(g.price-F.maxPrice)}))}
  if(F.minRating&&+g.rating<F.minRating){if(+g.rating<F.minRating-.15)return null;miss.push(t('f_m_rating'))}
  if(F.licensed&&!g.licensed)miss.push(t('f_m_lic'));
  return miss.length>1?null:{miss};
}
function applyFilter(){store.set('filters',F);state.guides.forEach(g=>{g.fit=fitOf(g);g.visible=!!g.fit||(state.selected===g.id&&state.trip!=='idle')})}
function refilter(){applyFilter();if(MAP.refresh)MAP.refresh(state.guides);else MAP.invalidate();renderPanel()}

function openFilters(){
  const p=state.province,D=distOf(p);
  const chip=(grp,v,l,on)=>`<button type="button" class="chip" data-f="${grp}" data-v="${v}" aria-pressed="${on}">${l}</button>`;
  const count=()=>state.guides.filter(g=>fitOf(g)).length;
  const html=()=>`<div class="fl">
    <div class="fl-sec"><span class="sec-label">${t('f_kind')}</span><div class="seg3">${['all','general','local'].map(k=>`<button type="button" data-f="kind" data-v="${k}" aria-pressed="${F.kind===k}">${t('k_'+k)}</button>`).join('')}</div></div>
    ${F.kind!=='general'?`<div class="fl-sec"><label class="sec-label" for="fDi">${t('f_district')}</label><select class="input" id="fDi"><option value="-1">${t('f_all_dist',{n:D.length})}</option>${D.map((d,i)=>`<option value="${i}"${F.di===i?' selected':''}>${esc(state.lang==='th'?d[0]:d[1])}</option>`).join('')}</select></div>`:''}
    <div class="fl-sec"><span class="sec-label">${t('f_acts')}</span><div class="chips">${ACTS.map(a=>`<button type="button" class="chip act" data-f="acts" data-v="${a}" aria-pressed="${F.acts.includes(a)}">${SVG(ACT_IC[a])}${t('sp_'+a)}</button>`).join('')}</div></div>
    <div class="fl-sec"><label class="sec-label" for="fLang">${t('f_lang')}</label><select class="input" id="fLang"><option value="all">${t('all_lang')}</option>${LANGS.map(l=>`<option value="${l.c}"${F.lang===l.c?' selected':''}>${l.n}</option>`).join('')}</select></div>
    <div class="fl-sec"><span class="sec-label">${t('f_gender')}</span><div class="chips">${chip('gender','any',t('f_anyone'),F.gender==='any')}${chip('gender','f',t('female'),F.gender==='f')}${chip('gender','m',t('male'),F.gender==='m')}</div></div>
    <div class="fl-sec"><span class="sec-label">${t('style_label')}</span><div class="chips">${STYLES.map(s=>chip('styles',s,t('st_'+s),F.styles.includes(s))).join('')}</div></div>
    <div class="fl-sec"><span class="sec-label">${t('f_price')} <b id="fPv">${F.maxPrice?t('f_upto',{n:money(F.maxPrice)}):t('f_any')}</b></span><input type="range" id="fPrice" min="0" max="800" step="50" value="${F.maxPrice}" aria-label="${t('f_price')}"></div>
    <div class="fl-sec"><span class="sec-label">${t('f_rating')}</span><div class="chips">${[[0,t('f_any')],[4.5,'4.5+'],[4.8,'4.8+']].map(([v,l])=>chip('minRating',v,v?STAR+l:l,F.minRating===v)).join('')}</div></div>
    <label class="row fl-sw" for="fLic"><span class="row-main"><b>${t('f_lic')}</b></span><input type="checkbox" class="switch" id="fLic"${F.licensed?' checked':''}></label>
    <div class="fl-foot"><button type="button" class="btn line" id="fClear">${t('f_clear')}</button><button type="button" class="btn primary" id="fApply">${t('f_show',{n:count()})}</button></div></div>`;
  const bind=()=>{
    const body=$('#optBody');
    body.onclick=e=>{const b=e.target.closest('[data-f]');if(b){const k=b.dataset.f,v=b.dataset.v;
      if(k==='kind'){F.kind=v;if(v==='general')F.di=-1}
      else if(k==='acts'||k==='styles'){const a=F[k];a.includes(v)?a.splice(a.indexOf(v),1):a.push(v)}
      else if(k==='minRating')F.minRating=+v;else F[k]=v;
      const st=body.scrollTop;body.innerHTML=html();body.scrollTop=st;bind();return}
      if(e.target.id==='fClear'){F=Object.assign({},DEF_F,{acts:[],styles:[]});body.innerHTML=html();bind()}
      if(e.target.id==='fApply'){closeSheet();refilter()}};
    const upd=()=>{$('#fApply').textContent=t('f_show',{n:count()})};
    $('#fDi')&&($('#fDi').onchange=e=>{F.di=+e.target.value;upd()});
    $('#fLang').onchange=e=>{F.lang=e.target.value;upd()};
    $('#fPrice').oninput=e=>{F.maxPrice=+e.target.value;$('#fPv').textContent=F.maxPrice?t('f_upto',{n:money(F.maxPrice)}):t('f_any');upd()};
    $('#fLic').onchange=e=>{F.licensed=e.target.checked;upd()};
  };
  openSheet(t('filters'),html(),bind);
}

/* ----- list items ----- */
function kindMeta(g){return g.kind==='local'?`<span class="kb loc">${SVG(IC.mappinned)}${esc(t('k_dist',{d:dname(state.province,g.di)}))}</span>`:`<span class="kb gen">${SVG(IC.route)}${t('k_general')}</span>`}
function itemHTML(g){
  const miss=g.fit&&g.fit.miss.length?`<span class="g-miss">${SVG(IC.info)}${esc(g.fit.miss[0])}</span>`:'';
  return `<button class="g-item" data-g="${g.id}" aria-pressed="${state.selected===g.id}"><span class="av on" style="background:${g.color}">${g.initials}</span>
  <span class="g-main"><span class="g-name">${g.name}<span class="rating">${STAR}${g.rating}</span></span>
  <span class="g-sub">${kindMeta(g)}<span class="g-meta">${g.specs.slice(0,2).map(s=>t('sp_'+s)).join(' · ')}</span></span>${miss}</span>
  <span class="g-price">${money(g.price)}<small>${t('per_hour')}</small></span></button>`;
}
function listHTML(){
  const vis=state.guides.filter(x=>x.visible&&x.fit),ex=vis.filter(g=>!g.fit.miss.length).sort((a,b)=>matchScore(b)-matchScore(a)),cl=vis.filter(g=>g.fit.miss.length).sort((a,b)=>matchScore(b)-matchScore(a));
  const lim=state.listLim||30,fc=fCount(),n=LP.items.length;
  let h=`<div class="panel-head"><h2>${t('guides_near')}</h2><span class="ph-r">${vis.length}</span></div>
  <div class="seg3 kind-seg" id="kindSeg">${['all','general','local'].map(k=>`<button type="button" data-k="${k}" aria-pressed="${F.kind===k}">${t('k_'+k)}</button>`).join('')}</div>
  <div class="ph-tools"><button class="f-btn${fc?' on':''}" id="fBtn">${SVG(IC.filter)}${t('filters')}${fc?`<i>${fc}</i>`:''}</button>${F.kind!=='general'&&F.di>=0?`<button class="f-btn on" id="fDiClr">${SVG(IC.mappinned)}${esc(dname(state.province,F.di))}${SVG(IC.x,2.2,'xi')}</button>`:''}<button class="ph-link" id="editPrefs">${t('edit_prefs')}</button></div>
  ${F.kind==='local'||F.kind==='all'?`<p class="kind-note">${SVG(F.kind==='local'?IC.mappinned:IC.info)}<span>${t(F.kind==='local'?'k_local_note':'k_all_note')}</span></p>`:`<p class="kind-note">${SVG(IC.route)}<span>${t('k_general_note')}</span></p>`}
  ${n?`<button class="lp-bar" id="lpOpen"><span class="lp-avs">${LP.items.slice(0,4).map(s=>`<span class="av" style="background:${s.color}">${s.initials}</span>`).join('')}</span><span class="lp-txt"><b>${t('lp_title')}</b><small>${t('lp_n',{n})}</small></span>${SVG(IC.chev,2,'chev')}</button>`:''}
  <p class="radar-note">${SVG(IC.radar)}<span>${t('radar_note2')}</span></p>`;
  if(!vis.length)return h+`<div class="empty-state sm">${SVG(IC.filter,1.5)}<span>${t('f_none')}</span><button class="btn line" id="fReset">${t('f_clear')}</button></div>`;
  if(ex.length)h+=`<div class="g-grp"><span class="sec-label">${t('f_exact',{n:ex.length})}</span><div class="glist">${ex.slice(0,lim).map(itemHTML).join('')}</div></div>`;
  if(cl.length)h+=`<div class="g-grp"><span class="sec-label">${t('f_close',{n:cl.length})}</span><div class="glist">${cl.slice(0,Math.max(10,lim-ex.length)).map(itemHTML).join('')}</div></div>`;
  if(ex.length>lim)h+=`<button class="btn line block" id="moreG">${t('show_more')}</button>`;
  return h;
}
function bindList(el){
  const q=x=>el.querySelector(x);
  q('#kindSeg').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;F.kind=b.dataset.k;if(F.kind==='general')F.di=-1;state.listLim=30;refilter()};
  q('#fBtn').onclick=openFilters;
  q('#fDiClr')&&(q('#fDiClr').onclick=()=>{F.di=-1;refilter()});
  q('#fReset')&&(q('#fReset').onclick=()=>{const k=F.kind;F=Object.assign({},DEF_F,{acts:[],styles:[],kind:k});refilter()});
  q('#moreG')&&(q('#moreG').onclick=()=>{state.listLim=(state.listLim||30)+30;renderPanel()});
  q('#editPrefs').onclick=()=>{state.prefFrom='map';show('prefs')};
  q('#lpOpen')&&(q('#lpOpen').onclick=()=>show('lplan'));
}
