/* =====================================================================
   STORIES — 24 h, photo or video (≤ 60 s), portrait or landscape,
   fill/fit + zoom + pan.  Viewer: tap left/right, hold to pause,
   swipe sideways to change person, swipe down to close.
   Owners see who viewed; others can repost.  No likes or reactions.
   ===================================================================== */
const DAY=864e5,IMG_MS=5000;
let SEEDS=null;
function seedStories(){
  if(SEEDS)return SEEDS;const now=Date.now(),R=rng(hash('stories'+Math.floor(now/DAY))),out=[];
  const accs=['u4','u2','g:G1','u3','u5','g:Chiang Mai:'+((guideAccounts().find(a=>a.prov==='Chiang Mai')||{}).g||{}).id,'u8','u10','g:G3'].filter(x=>!x.endsWith('undefined'));
  accs.forEach((id,i)=>{const n=1+Math.floor(R()*3),provs=Object.keys(PLACES),pv=provs[Math.floor(R()*provs.length)],pl=PLACES[pv];
    for(let j=0;j<n;j++){const x=pl[Math.floor(R()*pl.length)],land=R()<.3;out.push({id:`ss${i}_${j}`,author:id,at:now-Math.floor((1+i*2+j*.4+R())*36e5),type:'image',wiki:x[3],art:kindArt(x[2]),seed:'st'+i+j,w:land?4:9,h:land?3:16,fit:land?'fit':'fill',z:1,x:0,y:0,cap:R()<.5?(R()<.5?x[0]:x[1]):'',viewers:[]})}});
  return SEEDS=out;
}
function activeStories(){const now=Date.now();SOC.stories=SOC.stories.filter(s=>{if(now-s.at<DAY)return true;if(s.mid&&!s.repostOf)MED.del(s.mid);return false});return SOC.stories.concat(seedStories()).filter(s=>now-s.at<DAY)}
function storyGroups(){
  const all=activeStories(),by={};all.forEach(s=>{(by[s.author]=by[s.author]||[]).push(s)});
  Object.values(by).forEach(l=>l.sort((a,b)=>a.at-b.at));
  const me=myId(),ids=Object.keys(by).filter(id=>id!==me);
  const unseen=id=>by[id].some(s=>!SOC.seenS[s.id]);
  ids.sort((a,b)=>(unseen(b)-unseen(a))||((isFollow(b)?1:0)-(isFollow(a)?1:0))||(by[b][by[b].length-1].at-by[a][by[a].length-1].at));
  return (by[me]?[me]:[]).concat(ids).map(id=>({id,items:by[id],unseen:unseen(id)}));
}
const hasStory=id=>activeStories().some(s=>s.author===id);
function storyRailHTML(){
  const gs=storyGroups(),me=acct(myId()),mine=gs.find(g=>g.id===myId());
  return `<button class="st-item me" id="stNew"><span class="st-ring${mine?' has':''}">${avHTML(me)}<i class="st-plus">${SVG(IC.plus,2.6)}</i></span><small>${t('st_yours')}</small></button>`+
   gs.filter(g=>g.id!==myId()).map(g=>{const a=acct(g.id);return `<button class="st-item" data-st="${esc(g.id)}"><span class="st-ring${g.unseen?' new':''}">${avHTML(a)}</span><small>${esc(a.name.split(' ')[0])}</small></button>`}).join('');
}
$('#feedBody').addEventListener('click',e=>{
  if(e.target.closest('#stNew')){const mine=storyGroups().find(g=>g.id===myId());if(mine&&!e.target.closest('.st-plus'))openStories(myId());else newStory();return}
  const s=e.target.closest('[data-st]');if(s)openStories(s.dataset.st);
});

/* ----- layout helper shared by composer and viewer ----- */
function placeIn(el,mw,mh,FW,FH,s){
  const k=(s.fit==='fit'?Math.min(FW/mw,FH/mh):Math.max(FW/mw,FH/mh))*(s.z||1),w=mw*k,h=mh*k;
  el.style.width=w+'px';el.style.height=h+'px';el.style.left=(FW-w)/2+(s.x||0)*FW+'px';el.style.top=(FH-h)/2+(s.y||0)*FH+'px';
}
function clampPan(s,mw,mh,FW,FH){const k=(s.fit==='fit'?Math.min(FW/mw,FH/mh):Math.max(FW/mw,FH/mh))*(s.z||1),mx=Math.abs(mw*k-FW)/2/FW,my=Math.abs(mh*k-FH)/2/FH;s.x=Math.max(-mx,Math.min(mx,s.x));s.y=Math.max(-my,Math.min(my,s.y))}

/* ----- composer ----- */
function newStory(){const i=document.createElement('input');i.type='file';i.accept='image/*,video/*';i.onchange=()=>{const f=i.files[0];if(f)storyComposer(f)};i.click()}
function storyComposer(file){
  const isV=file.type.startsWith('video/');
  if(file.size>200*1024*1024){toast(t('st_too_big'));return}
  const ov=$('#stc'),fr=$('#stcFrame'),url=URL.createObjectURL(file);
  const S={fit:'fill',z:1,x:0,y:0,start:0,end:0,dur:0,cap:'',aud:PV().storyAud,reply:PV().storyReply};let mw=0,mh=0,el;
  const bg=$('#stcBg');bg.innerHTML='';$('#stcM').innerHTML='';
  if(isV){el=document.createElement('video');el.muted=true;el.playsInline=true;el.loop=false;el.autoplay=true;el.src=url;
    el.onloadedmetadata=()=>{mw=el.videoWidth;mh=el.videoHeight;S.dur=el.duration;S.end=Math.min(60,el.duration);ready()};
    el.ontimeupdate=()=>{if(el.currentTime>=S.end||el.currentTime<S.start-.3){el.currentTime=S.start;el.play().catch(()=>{})}};
    el.onerror=()=>{toast(t('st_bad'));close()}}
  else{el=new Image();el.onload=()=>{mw=el.naturalWidth;mh=el.naturalHeight;ready()};el.onerror=()=>{toast(t('st_bad'));close()};el.src=url;
    const b=new Image();b.src=url;bg.appendChild(b)}
  el.className='stc-media';el.draggable=false;$('#stcM').appendChild(el);
  function lay(){const r=fr.getBoundingClientRect();clampPan(S,mw,mh,r.width,r.height);placeIn(el,mw,mh,r.width,r.height,S);bg.hidden=S.fit!=='fit'}
  function tools(){
    const land=mw>mh;
    $('#stcTools').innerHTML=`<div class="stc-info">${SVG(land?IC.rectH:IC.rectV)}${t(land?'st_land':'st_port')}${isV?` · ${Math.round(S.dur)} s`:''}</div>
    <div class="seg2 stc-fit"><button type="button" data-fit="fill" aria-pressed="${S.fit==='fill'}">${SVG(IC.max)}${t('st_fill')}</button><button type="button" data-fit="fit" aria-pressed="${S.fit==='fit'}">${SVG(IC.min)}${t('st_fit')}</button></div>
    <label class="ed-sl">${SVG(IC.zoomin)}<input type="range" id="stcZ" min="1" max="3" step=".01" value="${S.z}" aria-label="${t('ed_zoom')}"></label>
    ${isV&&S.dur>60?`<label class="ed-sl trim"><span>${t('st_trim')}</span><input type="range" id="stcTrim" min="0" max="${Math.floor(S.dur-60)}" step="1" value="${S.start}"><output>${fmtSec(S.start)}–${fmtSec(S.end)}</output></label><p class="stc-note">${t('st_trim_note')}</p>`:''}
    <div class="stc-pv"><span>${t('cp_aud')}</span>${pvSeg('stcAud',AUD_S,S.aud,'aud_')}<span>${t('pv_reply')}</span>${pvSeg('stcRp',REPLY,S.reply,'rp_')}</div>
    <input class="input stc-cap" id="stcCap" maxlength="80" placeholder="${t('st_cap_ph')}" value="${esc(S.cap)}">
    <button class="btn primary block" id="stcShare">${t('st_share')}</button>`;
  }
  function ready(){ov.hidden=false;document.body.classList.add('ed-open');tools();requestAnimationFrame(lay);addEventListener('resize',lay)}
  function close(){ov.hidden=true;document.body.classList.remove('ed-open');removeEventListener('resize',lay);if(isV)el.pause();URL.revokeObjectURL(url)}
  $('#stcTools').addEventListener('click',e=>{const b=e.target.closest('#stcAud [data-v],#stcRp [data-v]');if(!b)return;const g=b.parentElement;$$('button',g).forEach(x=>x.setAttribute('aria-pressed',x===b));if(g.id==='stcAud')S.aud=b.dataset.v;else S.reply=b.dataset.v});
  $('#stcTools').onclick=e=>{const f=e.target.closest('[data-fit]');if(f){S.fit=f.dataset.fit;S.z=1;S.x=S.y=0;lay();tools()}if(e.target.id==='stcShare')share()};
  $('#stcTools').oninput=e=>{if(e.target.id==='stcZ'){S.z=+e.target.value;lay()}else if(e.target.id==='stcTrim'){S.start=+e.target.value;S.end=S.start+60;el.currentTime=S.start;e.target.nextElementSibling.textContent=fmtSec(S.start)+'–'+fmtSec(S.end)}else if(e.target.id==='stcCap')S.cap=e.target.value};
  let last=null;
  fr.onpointerdown=e=>{fr.setPointerCapture(e.pointerId);last=[e.clientX,e.clientY]};
  fr.onpointermove=e=>{if(!last)return;const r=fr.getBoundingClientRect();S.x+=(e.clientX-last[0])/r.width;S.y+=(e.clientY-last[1])/r.height;last=[e.clientX,e.clientY];lay()};
  fr.onpointerup=fr.onpointercancel=()=>{last=null};
  fr.onwheel=e=>{e.preventDefault();S.z=Math.max(1,Math.min(3,S.z*(e.deltaY<0?1.05:.95)));const z=$('#stcZ');if(z)z.value=S.z;lay()};
  $('#stcCancel').onclick=close;
  async function share(){
    $('#stcShare').disabled=true;const mid=await MED.put(file);
    SOC.stories.push({id:'st'+Date.now().toString(36),author:myId(),at:Date.now(),type:isV?'video':'image',mid,w:mw,h:mh,fit:S.fit,z:S.z,x:S.x,y:S.y,start:S.start,end:isV?S.end:0,cap:S.cap.trim(),aud:S.aud,reply:S.reply,viewers:[]});
    socSave();close();toast(t('st_posted'));if(state.screen==='feed')renderFeed();
  }
}
const fmtSec=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');

/* ----- viewer ----- */
const SV={groups:[],gi:0,ii:0,t0:0,paused:false,raf:0,el:null,muted:true,held:0};
function openStories(id){
  SV.groups=storyGroups();SV.gi=Math.max(0,SV.groups.findIndex(g=>g.id===id));
  const g=SV.groups[SV.gi];if(!g)return;SV.ii=Math.max(0,g.items.findIndex(s=>!SOC.seenS[s.id]));if(g.id===myId())SV.ii=0;
  $('#sv').hidden=false;document.body.classList.add('ed-open');showItem();
}
function closeStories(){cancelAnimationFrame(SV.raf);$('#sv').hidden=true;document.body.classList.remove('ed-open');const v=$('#svMedia video');if(v)v.pause();$('#svMedia').innerHTML='';if(state.screen==='feed')renderFeed();else if(state.screen==='uprof')renderUProf()}
function svItem(){const g=SV.groups[SV.gi];return g&&g.items[SV.ii]}
function showItem(dir){
  cancelAnimationFrame(SV.raf);const g=SV.groups[SV.gi],s=svItem();if(!s){closeStories();return}
  const A=acct(g.id),own=g.id===myId();
  SOC.seenS[s.id]=Date.now();if(!own&&s.author!=='me'&&s.author!=='meg'){}socSave();
  $('#svBars').innerHTML=g.items.map((_,i)=>`<i><b style="width:${i<SV.ii?100:0}%"></b></i>`).join('');
  const RA=s.repostOf?acct(s.repostOf):null;
  $('#svHead').innerHTML=`<button class="sv-who" data-svu="${g.id}">${avHTML(A,'sm')}<span><b>${esc(A.name)}</b><small>${rel(s.at)}${RA?` · ${SVG(IC.repost)}@${esc(RA.handle)}`:''}${own&&s.aud&&s.aud!=='all'?` · ${SVG(AUD_IC[s.aud])}${t('aud_'+s.aud)}`:''}</small></span></button>${own?`<button class="sv-ib" id="svMore" aria-label="${t('st_settings')}">${SVG(IC.dots,2.4)}</button>`:''}
   ${s.type==='video'?`<button class="sv-ib" id="svMute" aria-label="${t('st_sound')}">${SVG(SV.muted?IC.mute:IC.vol)}</button>`:''}<button class="sv-ib" id="svPause" aria-label="${t('st_pause')}">${SVG(IC.pause)}</button><button class="sv-ib" id="svClose" aria-label="${t('close')}">${SVG(IC.x,2.2)}</button>`;
  const stage=$('#svMedia');stage.innerHTML='';
  const bg=document.createElement('div');bg.className='sv-bg';stage.appendChild(bg);
  let el;
  if(s.type==='video'){el=document.createElement('video');el.playsInline=true;el.muted=SV.muted;el.preload='auto';el.dataset.mid=s.mid;MED.url(s.mid).then(u=>{if(u){el.src=u;el.currentTime=s.start||0;el.play().catch(()=>{})}})}
  else{el=document.createElement('img');el.alt=s.cap||'';el.referrerPolicy='no-referrer';el.draggable=false;
    if(s.mid)MED.url(s.mid).then(u=>{if(u){el.src=u;bg.style.backgroundImage=`url("${u}")`}});
    else{const a=artURL(s.art,s.seed,s.w>s.h?960:720,s.w>s.h?720:1280);el.src=a;bg.style.backgroundImage=`url("${a}")`;if(s.wiki)wikiPhoto(s.wiki).then(u=>{if(u&&svItem()===s){const im=new Image();im.referrerPolicy='no-referrer';im.onload=()=>{el.src=u;bg.style.backgroundImage=`url("${u}")`};im.src=u}})}}
  el.className='sv-m';stage.appendChild(el);SV.el=el;
  const lay=()=>{const r=stage.getBoundingClientRect();placeIn(el,s.w||9,s.h||16,r.width,r.height,s);bg.hidden=s.fit!=='fit'};lay();SV.lay=lay;
  $('#svCap').textContent=s.cap||'';$('#svCap').hidden=!s.cap;
  $('#svFoot').innerHTML=own?`<button class="sv-views" id="svViews">${SVG(IC.eye)}<span>${t('st_viewers',{n:viewersOf(s).length})}</span></button><button class="sv-ib" id="svDel" aria-label="${t('post_del')}">${SVG(IC.trash)}</button>`
    :(s.reply||'all')==='off'?`<span class="sv-noreact">${SVG(IC.eyeoff)}${t('st_reply_off')}</span>`:`<form class="sv-reply" id="svReply"><input id="svRin" maxlength="300" autocomplete="off" enterkeyhint="send" placeholder="${esc(t('st_reply_ph',{n:A.name.split(' ')[0]}))}"><button aria-label="${t('reply_send')}">${SVG('<path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />',2)}</button></form>`;
  const rf=$('#svReply');if(rf){const ri=$('#svRin');ri.onfocus=()=>pause(true);ri.onblur=()=>{if(!ri.value.trim())pause(false)};
    rf.onsubmit=e=>{e.preventDefault();const v=ri.value.trim();if(!v)return;const c=sendDM(g.id,v,{kind:'story',id:s.id,author:g.id,title:s.cap||'',m:s.type==='video'?null:{mid:s.mid,art:s.art,seed:s.seed,wiki:s.wiki}});closeStories();toast(t('reply_sent'));openThread(c.id)}}
  SV.t0=performance.now();SV.paused=false;SV.pausedAt=0;
  if(dir){const c=$('#svCard');c.classList.remove('in-l','in-r');void c.offsetWidth;c.classList.add(dir>0?'in-r':'in-l')}
  tick();
}
function viewersOf(s){if(s.author!==myId())return [];const P=PV(),pool=PEOPLE.filter(p=>!P.hideFrom.includes(p.id)&&(s.aud!=='close'||P.close.includes(p.id))),R=rng(hash(s.id)),n=Math.min(pool.length,Math.floor((Date.now()-s.at)/6e5)+Math.floor(R()*3));const v=pool.slice().sort(()=>R()-.5).slice(0,n).map((p,i)=>({id:p.id,at:s.at+(i+1)*Math.floor(4e5+R()*3e6)})).filter(x=>x.at<Date.now());return v}
function durOf(s){return s.type==='video'?Math.max(1,(s.end||60)-(s.start||0))*1000:IMG_MS}
function tick(){
  const s=svItem();if(!s)return;
  let p;
  if(s.type==='video'&&SV.el&&SV.el.readyState>1){p=(SV.el.currentTime-(s.start||0))/((s.end||SV.el.duration)-(s.start||0));if(SV.el.ended)p=1}
  else p=SV.paused?SV.pausedAt:(performance.now()-SV.t0)/durOf(s);
  const b=$$('#svBars b')[SV.ii];if(b)b.style.width=Math.min(100,p*100)+'%';
  if(p>=1){next();return}
  SV.raf=requestAnimationFrame(tick);
}
function pause(on){const s=svItem();if(!s||SV.paused===on)return;SV.paused=on;
  if(on){SV.pausedAt=(performance.now()-SV.t0)/durOf(s);if(SV.el&&SV.el.pause)SV.el.pause()}
  else{SV.t0=performance.now()-SV.pausedAt*durOf(s);if(SV.el&&SV.el.play)SV.el.play().catch(()=>{})}
  const pb=$('#svPause');if(pb)pb.innerHTML=SVG(on?IC.play:IC.pause)}
function next(){const g=SV.groups[SV.gi];if(SV.ii<g.items.length-1){SV.ii++;showItem()}else nextGroup(1)}
function prev(){if(SV.ii>0){SV.ii--;showItem()}else if(SV.gi>0)nextGroup(-1,true);else{SV.t0=performance.now();showItem()}}
function nextGroup(d,toEnd){const ng=SV.gi+d;if(ng<0||ng>=SV.groups.length){closeStories();return}SV.gi=ng;const g=SV.groups[ng];SV.ii=d<0&&toEnd?0:Math.max(0,g.items.findIndex(s=>!SOC.seenS[s.id]));showItem(d)}
(function svGestures(){
  const card=$('#svCard');let st=null;
  card.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,form'))return;st={x:e.clientX,y:e.clientY,t:performance.now()};SV.held=setTimeout(()=>pause(true),220)});
  card.addEventListener('pointermove',e=>{if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;if(Math.abs(dx)>12||Math.abs(dy)>12)clearTimeout(SV.held);card.style.transform=dy>0&&Math.abs(dy)>Math.abs(dx)?`translateY(${dy}px) scale(${1-Math.min(.15,dy/2000)})`:Math.abs(dx)>Math.abs(dy)?`translateX(${dx*.6}px)`:''});
  const end=e=>{if(!st)return;clearTimeout(SV.held);const dx=e.clientX-st.x,dy=e.clientY-st.y,dt=performance.now()-st.t;card.style.transform='';const was=SV.paused;st=null;
    if(dy>90&&Math.abs(dy)>Math.abs(dx)){closeStories();return}
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)){nextGroup(dx<0?1:-1);return}
    if(was){pause(false);if(dt>220)return}
    if(Math.abs(dx)<12&&Math.abs(dy)<12&&dt<400){const r=card.getBoundingClientRect();(e.clientX-r.left<r.width*.33?prev:next)()}};
  card.addEventListener('pointerup',end);card.addEventListener('pointercancel',()=>{st=null;card.style.transform='';clearTimeout(SV.held);pause(false)});
  document.addEventListener('keydown',e=>{if($('#sv').hidden||e.target.id==='svRin')return;if(e.key==='ArrowRight')next();else if(e.key==='ArrowLeft')prev();else if(e.key==='Escape')closeStories();else if(e.key===' '){e.preventDefault();pause(!SV.paused)}});
  addEventListener('resize',()=>{if(!$('#sv').hidden&&SV.lay)SV.lay()});
  $('#sv').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.id==='svClose')closeStories();
    else if(b.id==='svPause')pause(!SV.paused);
    else if(b.id==='svMute'){SV.muted=!SV.muted;if(SV.el)SV.el.muted=SV.muted;b.innerHTML=SVG(SV.muted?IC.mute:IC.vol)}
    else if(b.dataset.svu){const id=b.dataset.svu;closeStories();openProfile(id)}
    else if(b.id==='svRp'){const s=svItem();const c=Object.assign({},s,{id:'st'+Date.now().toString(36),author:myId(),at:Date.now(),repostOf:s.repostOf||s.author,viewers:[]});SOC.stories.push(c);socSave();toast(t('st_reposted'));b.disabled=true}
    else if(b.id==='svViews'){pause(true);const s=svItem(),v=viewersOf(s);openSheet(t('st_viewers',{n:v.length}),v.length?`<div class="acc-list">${v.sort((a,b)=>b.at-a.at).map(x=>{const a=acct(x.id);return `<div class="acc-row"><button class="acc-main" data-u="${a.id}">${avHTML(a)}<span><b>${esc(a.name)}</b><small>${rel(x.at)}</small></span></button></div>`}).join('')}</div>`:`<p class="note">${t('st_noviews')}</p>`,()=>{$('#optBody').onclick=e2=>{const u=e2.target.closest('[data-u]');if(u){closeSheet();closeStories();openProfile(u.dataset.u)}}});const ob=$('#optSheet');const resume=()=>{if(ob.hidden){pause(false)}else setTimeout(resume,300)};setTimeout(resume,300)}
    else if(b.id==='svMore'){pause(true);const s=svItem();storySettingsSheet(s,act=>{if(act==='del'){SV.groups=storyGroups();const g=SV.groups.find(x=>x.id===myId());if(!g){closeStories();return}SV.gi=SV.groups.indexOf(g);SV.ii=Math.min(SV.ii,g.items.length-1)}showItem()});const ob=$('#optSheet');const resume=()=>{if(ob.hidden){if(!$('#sv').hidden)pause(false)}else setTimeout(resume,300)};setTimeout(resume,300)}
    else if(b.id==='svDel'){if(!b.dataset.sure){b.dataset.sure=1;b.classList.add('warn');toast(t('st_del_again'));return}const s=svItem();SOC.stories=SOC.stories.filter(x=>x.id!==s.id);if(s.mid&&!s.repostOf&&!SOC.stories.some(x=>x.mid===s.mid))MED.del(s.mid);socSave();SV.groups=storyGroups();const g=SV.groups.find(x=>x.id===myId());if(!g){closeStories();return}SV.gi=SV.groups.indexOf(g);SV.ii=Math.min(SV.ii,g.items.length-1);showItem()}
  });
})();
