/* =====================================================================
   PROFILES — travellers (simple, social) vs guides (cover photo,
   accent colour, gallery, tours, booking).  Both editable.
   ===================================================================== */
const ACCENTS=['#7A68D4','#E2708C','#D48A3C','#2FA36B','#3B82C4','#9B5DE5','#C2410C','#0F766E'];
const FLAGS={JP:'🇯🇵',FR:'🇫🇷',IN:'🇮🇳',KR:'🇰🇷',TH:'🇹🇭',RU:'🇷🇺',VN:'🇻🇳',CN:'🇨🇳',GB:'🇬🇧',US:'🇺🇸',DE:'🇩🇪',AU:'🇦🇺'};
function openProfile(id){state.prof=id;state.profTab='posts';state.profFrom=state.screen==='uprof'?state.profFrom:state.screen;show('uprof')}
function postsBy(id){return allPosts().filter(p=>p.author===id&&!p.repostOf).sort((a,b)=>b.at-a.at)}
function repostsBy(id){return allPosts().filter(p=>p.author===id&&p.repostOf).sort((a,b)=>b.at-a.at)}
function gridHTML(list){return list.length?`<div class="p-grid">${list.map(p=>`<button class="pg-it" data-open-post="${p.id}">${p.media&&p.media.length?mediaTag(p.media[0]):`<span class="pg-txt">${esc(p.title||p.body.slice(0,80))}</span>`}${p.media&&p.media.length>1?`<i>${SVG(IC.images,2)}</i>`:''}</button>`).join('')}</div>`:`<div class="empty-state sm">${SVG(IC.image,1.5)}<span>${t('no_posts')}</span></div>`}
function renderUProf(){
  const el=$('#upBody');if(!el)return;const A=acct(state.prof);
  el.innerHTML=A.kind==='guide'?guideProfHTML(A):travProfHTML(A);
  hydrateMedia(el);
}
function travProfHTML(A){
  const own=!!A.own,posts=postsBy(A.id),tab=state.profTab;
  return `<header class="page-h sub"><button class="icon-btn" data-up="back" aria-label="Back">${SVG('<path d="m15 18-6-6 6-6" />',2)}</button><h1 class="up-handle">@${esc(A.handle)}</h1>${own?`<button class="icon-btn" data-up="edit" aria-label="${t('pe_title')}">${SVG(IC.pencil)}</button>`:'<span></span>'}</header>
  <section class="tp-head"><button class="tp-av st-ring${hasStory(A.id)?(storyGroups().find(g=>g.id===A.id)||{}).unseen?' new':' has':''}" data-up="story" aria-label="${t('st_open')}">${avHTML(A,'xl')}</button>
   <div class="tp-stats"><div><b>${posts.length}</b><span>${t('st_posts')}</span></div><div><b>${compact(followers(A))}</b><span>${t('followers')}</span></div><div><b>${A.own?SOC.follow.length:40+hash(A.id)%300}</b><span>${t('following')}</span></div></div></section>
  <div class="tp-id"><b>${esc(A.name)}</b>${A.country?`<span class="tp-c">${FLAGS[A.country]||''} ${esc(A.country)}</span>`:''}<span class="kpill trav">${t('k_traveler')}</span></div>
  ${A.bio?`<p class="tp-bio">${esc(A.bio)}</p>`:own?`<p class="tp-bio muted">${t('pe_bio_empty')}</p>`:''}
  ${A.interests&&A.interests.length?`<div class="chips tp-int">${A.interests.map(a=>`<span class="tag">${SVG(ACT_IC[a]||IC.spark)}${t('sp_'+a)}</span>`).join('')}</div>`:''}
  <div class="tp-btns">${own?`<button class="btn line" data-up="edit">${t('pe_title')}</button><button class="btn primary" data-up="post">${SVG(IC.plus,2)}${t('cp_title')}</button>`:`<button class="btn ${isFollow(A.id)?'line':'primary'}" data-up="follow">${t(isFollow(A.id)?'following':'follow')}</button>`}</div>
  <div class="seg2 up-tabs"><button type="button" data-pt="posts" aria-pressed="${tab==='posts'}">${SVG(IC.images)}${t('st_posts')}</button><button type="button" data-pt="reposts" aria-pressed="${tab==='reposts'}">${SVG(IC.repost)}${t('reposts')}</button></div>
  ${tab==='posts'?gridHTML(posts):(()=>{const r=repostsBy(A.id);return r.length?`<div class="post-list">${r.map(p=>postHTML(p,{noWhy:true})).join('')}</div>`:`<div class="empty-state sm">${SVG(IC.repost,1.5)}<span>${t('no_reposts')}</span></div>`})()}`;
}
function guideProfHTML(A){
  const own=!!A.own,g=A.g,posts=postsBy(A.id),P2=PROV.find(x=>x.en===A.prov),tab=state.profTab;
  const kindTxt=A.gk==='local'?(g?t('k_dist',{d:dname(P2,g.di)})+' · '+pname(P2):P2?pname(P2):''):t('k_cover',{n:g?g.covered:77});
  const rating=g?g.rating:'5.0',reviews=g?g.reviews:0,price=g?g.price:A.rate,langs=g?g.langs:['th','en'];
  const gallery=`<section class="gp-sec"><div class="gp-sh"><h2>${t('gallery')}</h2>${own?`<button class="link" data-up="gedit">${t('ge_manage')}</button>`:''}</div>${A.gallery.length?`<div class="gp-gal">${A.gallery.map((m,i)=>`<button class="gg-it" data-gal="${i}">${mediaTag(m)}</button>`).join('')}</div>`:`<div class="empty-state sm">${SVG(IC.image,1.5)}<span>${t('gal_empty')}</span></div>`}</section>`;
  const p0=PROV.find(x=>x.en===(PLACES[A.prov]?A.prov:state.province&&PLACES[state.province.en]?state.province.en:'Bangkok')),tours=A.gk==='local'&&g&&g.tours&&g.tours.length?g.tours:makeTours(p0,A.interests&&A.interests.length?A.interests:['food'],rng(hash(A.id+p0.en)));
  const tourSec=`<section class="gp-sec"><div class="gp-sh"><h2>${t('gp_tours')}</h2></div><div class="gp-tours">${tours.map(tr=>`<div class="gp-tour"><b>${t('tour_'+tr.k)} · ${t('hrs',{n:tr.hours})}</b><small>${esc(tr.stops.map(id=>{const x=placesOf(p0).find(y=>y.id===id);return x?placeName(x):id}).join(' → '))}</small></div>`).join('')}</div></section>`;
  return `<div class="gp" style="--acc:${A.accent}">
  <div class="gp-cover">${mediaTag(A.cover,'',t('cover'))}<button class="icon-btn gp-back" data-up="back" aria-label="Back">${SVG('<path d="m15 18-6-6 6-6" />',2)}</button>${own?`<button class="btn light sm gp-editc" data-up="gedit">${SVG(IC.pencil)}${t('ge_title')}</button>`:''}</div>
  <div class="gp-head"><button class="gp-av st-ring${hasStory(A.id)?' new':''}" data-up="story">${avHTML(A,'xl')}<span class="gp-vb">${SVG(IC.badge,2.2)}</span></button>
   <div class="gp-id"><h1>${esc(A.name)}</h1><small>@${esc(A.handle)}</small></div></div>
  <div class="gp-kind"><span class="kpill ${A.gk}">${t(A.gk==='local'?'k_local':'k_general')}</span><span>${SVG(A.gk==='local'?IC.mappinned:IC.route)}${esc(kindTxt)}</span></div>
  ${A.headline?`<p class="gp-hl">${esc(A.headline)}</p>`:''}
  <div class="gp-facts"><div><b>${STAR}${rating}</b><span>${t('n_reviews',{n:reviews})}</span></div><div><b>${money(price)}</b><span>${t('per_hour').replace('/','')}</span></div><div><b>${compact(followers(A))}</b><span>${t('followers')}</span></div><div><b>${langs.map(c=>c.toUpperCase()).join(' ')}</b><span>${t('languages_spoken')}</span></div></div>
  <div class="tp-btns">${own?`<button class="btn primary acc" data-up="gedit">${SVG(IC.pencil)}${t('ge_title')}</button><button class="btn line" data-up="post">${SVG(IC.plus,2)}${t('cp_title')}</button>`:`<button class="btn primary acc" data-up="book">${t('book_guide')}</button><button class="btn line ic-only" data-up="msg" aria-label="${t('chat')}">${SVG(IC.chat)}</button><button class="btn line" data-up="follow">${t(isFollow(A.id)?'following':'follow')}</button>`}</div>
  ${A.bio?`<p class="tp-bio">${esc(A.bio)}</p>`:''}
  <div class="chips tp-int">${(A.interests||[]).map(a=>`<span class="tag">${SVG(ACT_IC[a]||IC.spark)}${t('sp_'+a)}</span>`).join('')}</div>
  ${A.layout==='tours'?tourSec+gallery:gallery+tourSec}
  <section class="gp-sec"><div class="gp-sh"><h2>${t('st_posts')}</h2></div>${gridHTML(posts)}</section></div>`;
}
$('#upBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-up],[data-open-post],[data-gal],[data-u]');if(!b)return;
  if(b.dataset.openPost){openPostView(b.dataset.openPost);return}
  if(b.dataset.u&&!b.dataset.up){if(b.dataset.u!==state.prof)openProfile(b.dataset.u);return}
  const A=acct(state.prof);
  if(b.dataset.gal!=null){lightbox(A.gallery,+b.dataset.gal);return}
  const k=b.dataset.up;
  if(k==='back')show(state.profFrom&&state.profFrom!=='uprof'?state.profFrom:'feed');
  else if(k==='edit')editMyProfile();
  else if(k==='gedit')show('gedit');
  else if(k==='post')openCompose();
  else if(k==='story'){if(hasStory(A.id))openStories(A.id);else if(A.own)newStory()}
  else if(k==='follow'){toggleFollow(A.id);renderUProf()}
  else if(k==='msg'||k==='book'){const g=A.g;if(!g)return;const p=PROV.find(x=>x.en===(A.gk==='local'?A.prov:(state.province||{}).en||A.prov))||PROV[0];state.province=p;if(k==='msg'){const id=p.en+':'+g.id;if(!chats.find(c=>c.id===id)){chats.unshift({id,name:g.name,initials:g.initials,color:g.color,prov:p.en,msgs:[{me:false,k:'chat_hello',at:Date.now()}],unread:0});save()}openThread(id)}else{F.kind=g.kind;F.di=-1;state.pendingGuide=g.id;goMap()}}
  else if(b.dataset.pt){}
});
$('#upBody').addEventListener('click',e=>{const b=e.target.closest('[data-pt]');if(b){state.profTab=b.dataset.pt;renderUProf()}});
bindPostList($('#upBody'),()=>renderUProf());

/* ----- single post + lightbox ----- */
function openPostView(id){const p=postById(id);if(!p)return;bump(p,.5);openSheet(p.title||t('st_posts'),`<div class="post-list one">${postHTML(p,{noWhy:true})}</div>`,()=>{const b=$('#optBody');hydrateMedia(b);if(!b._bound){b._bound=1;bindPostList(b,()=>{})}})}
function lightbox(list,i){
  const ov=$('#lightbox');ov.innerHTML=`<button class="sv-ib lb-x" aria-label="${t('close')}">${SVG(IC.x,2.2)}</button><div class="lb-track">${list.map(m=>`<div class="lb-s">${mediaTag(m)}</div>`).join('')}</div><span class="lb-n">${i+1}/${list.length}</span>`;
  ov.hidden=false;hydrateMedia(ov);const tr=ov.querySelector('.lb-track');requestAnimationFrame(()=>{tr.scrollLeft=i*tr.clientWidth});
  tr.onscroll=()=>{ov.querySelector('.lb-n').textContent=(Math.round(tr.scrollLeft/tr.clientWidth)+1)+'/'+list.length};
  ov.onclick=e=>{if(e.target.closest('.lb-x')||e.target===ov)ov.hidden=true};
}

/* ----- edit traveller profile ----- */
let peCb=null;
function editMyProfile(cb){peCb=cb||null;state.peFrom=state.screen;state.pe=Object.assign({},acct('me'),{interests:[...(ME.interests||[])]});show('pedit')}
function renderPEdit(){
  const el=$('#peBody');if(!el)return;const D=state.pe;
  el.innerHTML=`<header class="page-h sub"><button class="icon-btn" id="peBack" aria-label="Back">${SVG(IC.x,2)}</button><h1>${t('pe_title')}</h1><button class="btn primary sm" id="peSave">${t('save')}</button></header>
  <div class="pe-av"><label class="pe-avb">${avHTML(D,'xl')}<span class="cam">${SVG(IC.camera)}</span><input type="file" accept="image/*" id="peAv" hidden></label><small>${t('pe_photo')}</small></div>
  <div class="field"><label for="peName">${t('fullname')}</label><input class="input" id="peName" maxlength="40" value="${esc(ME.name||(state.user&&state.user.name)||'')}"></div>
  <div class="field"><label for="peHandle">${t('pe_handle')}</label><div class="pre-in"><span>@</span><input class="input" id="peHandle" maxlength="24" value="${esc(ME.handle||D.handle)}" autocapitalize="off" spellcheck="false"></div><small class="hint-s" id="peHErr">${t('pe_handle_rule')}</small></div>
  <div class="field"><label for="peBio">${t('pe_bio')}</label><textarea class="input" id="peBio" rows="3" maxlength="150">${esc(ME.bio||'')}</textarea></div>
  <div class="field"><label for="peCountry">${t('pe_country')}</label><select class="input" id="peCountry"><option value="">—</option>${Object.keys(FLAGS).map(c=>`<option value="${c}"${ME.country===c?' selected':''}>${FLAGS[c]} ${(()=>{try{return new Intl.DisplayNames([state.lang],{type:'region'}).of(c)}catch(e){return c}})()}</option>`).join('')}</select></div>
  <div class="field"><span class="sec-label">${t('pe_interests')}</span><div class="chips" id="peInt">${ACTS.map(a=>`<button type="button" class="chip act" data-a="${a}" aria-pressed="${D.interests.includes(a)}">${SVG(ACT_IC[a])}${t('sp_'+a)}</button>`).join('')}</div></div>
  <p class="note">${t('pe_note')}</p>`;
  hydrateMedia(el);
  $('#peBack').onclick=()=>show(state.peFrom&&state.peFrom!=='pedit'?state.peFrom:'profile');
  $('#peInt').onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,l=D.interests;l.includes(a)?l.splice(l.indexOf(a),1):l.push(a);b.setAttribute('aria-pressed',l.includes(a))};
  $('#peAv').onchange=async e=>{const f=e.target.files[0];if(!f)return;const r=await openEditor(f,{aspects:['1:1'],circle:true,maxSide:480,adjust:true,title:t('pe_photo')});if(r){if(ME.avatar&&ME.avatar.mid)MED.del(ME.avatar.mid);ME.avatar={mid:await MED.put(r.blob)};meSave();D.avatar=ME.avatar;renderPEdit()}};
  $('#peSave').onclick=()=>{
    const h=$('#peHandle').value.trim().toLowerCase();if(!/^[a-z0-9._]{3,24}$/.test(h)){$('#peHErr').classList.add('bad');$('#peHandle').focus();return}
    const nm=$('#peName').value.trim();if(!nm){$('#peName').classList.add('bad');return}
    Object.assign(ME,{name:nm,handle:h,bio:$('#peBio').value.trim(),country:$('#peCountry').value,interests:D.interests,setup:true});meSave();
    if(state.user){state.user.name=nm;store.set('user',state.user)}
    toast(t('saved'));const cb=peCb;peCb=null;if(cb)cb();else openProfile('me');
  };
}

/* ----- customise guide profile ----- */
function renderGEdit(){
  const el=$('#geBody');if(!el)return;gd.profile=gd.profile||{};const pf=gd.profile;pf.gallery=pf.gallery||[];const A=meGuideAcct();
  el.innerHTML=`<header class="page-h sub"><button class="icon-btn" id="geBack" aria-label="Back">${SVG('<path d="m15 18-6-6 6-6" />',2)}</button><h1>${t('ge_title')}</h1><button class="btn line sm" id="gePrev">${SVG(IC.eye)}${t('ge_preview')}</button></header>
  <div class="ge-cover" style="--acc:${A.accent}">${mediaTag(A.cover)}<label class="btn light sm">${SVG(IC.camera)}${t('ge_cover')}<input type="file" accept="image/*" id="geCover" hidden></label>
   <label class="ge-av">${avHTML(A,'xl')}<span class="cam">${SVG(IC.camera)}</span><input type="file" accept="image/*" id="geAv" hidden></label></div>
  <div class="field"><span class="sec-label">${t('ge_accent')}</span><div class="sw-row" id="geAcc">${ACCENTS.map(c=>`<button type="button" class="sw" data-c="${c}" style="background:${c}" aria-pressed="${A.accent===c}" aria-label="${c}"></button>`).join('')}</div></div>
  <div class="field"><label for="geHl">${t('ge_headline')}</label><input class="input" id="geHl" maxlength="70" value="${esc(pf.headline||'')}" placeholder="${t('ge_headline_ph')}"></div>
  <div class="field"><label for="geBio">${t('pe_bio')}</label><textarea class="input" id="geBio" rows="4" maxlength="400" placeholder="${t('ge_bio_ph')}">${esc(pf.bio||'')}</textarea></div>
  <div class="field"><span class="sec-label">${t('gallery')} · ${A.gallery.length}/12</span><div class="ge-gal">${A.gallery.map((m,i)=>`<div class="ge-g">${mediaTag(m)}<button class="cp-x" data-gx="${i}" aria-label="${t('remove')}">${SVG(IC.x,2.4)}</button>${i?`<button class="ge-mv" data-gm="${i}" aria-label="${t('ge_move')}">${SVG('<path d="m15 18-6-6 6-6" />',2.4)}</button>`:''}</div>`).join('')}${A.gallery.length<12?`<label class="cp-add">${SVG(IC.imgplus,1.6)}<span>${t('cp_add_photo')}</span><input type="file" accept="image/*" multiple id="geGal" hidden></label>`:''}</div></div>
  <div class="field"><span class="sec-label">${t('ge_layout')}</span><div class="seg2" id="geLay"><button type="button" data-l="gallery" aria-pressed="${A.layout==='gallery'}">${t('ge_lay_gal')}</button><button type="button" data-l="tours" aria-pressed="${A.layout==='tours'}">${t('ge_lay_tours')}</button></div></div>
  <button class="btn primary block" id="geSave">${t('save')}</button>`;
  hydrateMedia(el);
  const keep=()=>{pf.headline=$('#geHl').value.trim();pf.bio=$('#geBio').value.trim()};
  $('#geBack').onclick=()=>{keep();gsave();show('gprof')};
  $('#gePrev').onclick=()=>{keep();gsave();openProfile('meg')};
  $('#geAcc').onclick=e=>{const b=e.target.closest('[data-c]');if(b){keep();pf.accent=b.dataset.c;gsave();renderGEdit()}};
  $('#geLay').onclick=e=>{const b=e.target.closest('[data-l]');if(b){keep();pf.layout=b.dataset.l;gsave();renderGEdit()}};
  $('#geCover').onchange=async e=>{const f=e.target.files[0];if(!f)return;keep();const r=await openEditor(f,{aspects:['3:1'],maxSide:1500,title:t('ge_cover')});if(r){if(pf.cover&&pf.cover.mid)MED.del(pf.cover.mid);pf.cover={mid:await MED.put(r.blob)};gsave()}renderGEdit()};
  $('#geAv').onchange=async e=>{const f=e.target.files[0];if(!f)return;keep();const r=await openEditor(f,{aspects:['1:1'],circle:true,maxSide:480,title:t('pe_photo')});if(r){if(pf.avatar&&pf.avatar.mid)MED.del(pf.avatar.mid);pf.avatar={mid:await MED.put(r.blob)};gsave()}renderGEdit()};
  $('#geGal').onchange=async e=>{keep();pf.gallery=pf.gallery||[];for(const f of [...e.target.files].slice(0,12-pf.gallery.length)){const r=await openEditor(f,{aspects:['1:1','4:5','16:9','orig'],title:t('gallery')});if(r)pf.gallery.push({mid:await MED.put(r.blob),w:r.w,h:r.h})}gsave();renderGEdit()};
  el.onclick=e=>{const x=e.target.closest('[data-gx]');if(x){keep();const m=pf.gallery.splice(+x.dataset.gx,1)[0];if(m&&m.mid)MED.del(m.mid);gsave();renderGEdit();return}
    const mv=e.target.closest('[data-gm]');if(mv){keep();const i=+mv.dataset.gm;[pf.gallery[i-1],pf.gallery[i]]=[pf.gallery[i],pf.gallery[i-1]];gsave();renderGEdit()}};
  $('#geSave').onclick=()=>{keep();gsave();toast(t('saved'));openProfile('meg')};
}
