/* =====================================================================
   PRIVACY — per-post and per-story audience / replies / delete,
   plus account-wide defaults (private account, hide story from,
   close friends, hide likes, bulk delete).
   ===================================================================== */
const PRIV_DEF={privateAcct:false,postAud:'all',postReply:'all',storyAud:'all',storyReply:'all',hideFrom:[],close:[],hideLikesAll:false};
SOC.priv=Object.assign({},PRIV_DEF,SOC.priv||{});
const PV=()=>SOC.priv;
const AUD_P=['all','followers','me'],AUD_S=['all','followers','close'],REPLY=['all','following','off'];
const AUD_IC={all:IC.globe,followers:IC.users,me:IC.lock,close:IC.star,following:IC.userplus,off:IC.eyeoff};
const replyOf=x=>(x&&x.reply)||(x&&x.rp===false?'off':'all');
function pvSeg(id,opts,cur,pfx){return `<div class="pv-seg" id="${id}" role="radiogroup">${opts.map(o=>`<button type="button" role="radio" data-v="${o}" aria-checked="${cur===o}" aria-pressed="${cur===o}">${SVG(AUD_IC[o]||IC.chat)}<span>${t(pfx+o)}</span></button>`).join('')}</div>`}
function bindSeg(root,id,cb){const el=$('#'+id,root);if(!el)return;el.onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;$$('button',el).forEach(x=>{x.setAttribute('aria-pressed',x===b);x.setAttribute('aria-checked',x===b)});cb(b.dataset.v)}}
const audBadge=v=>v&&v!=='all'?`<span class="aud-b a-${v}">${SVG(AUD_IC[v])}${t('aud_'+v)}</span>`:'';

/* ----- one post ----- */
function postPrivacySheet(p,done){
  const st={aud:p.set.aud||'all',reply:replyOf(p.set),hideLikes:!!p.set.hideLikes,archived:!!p.set.archived};
  openSheet(t('pm_privacy'),`<div class="pv-form">
    <div class="pv-sec"><span class="sec-label">${t('cp_aud')}</span>${pvSeg('ppAud',AUD_P,st.aud,'aud_')}</div>
    <div class="pv-sec"><span class="sec-label">${t('pv_reply')}</span>${pvSeg('ppRp',REPLY,st.reply,'rp_')}</div>
    <div class="list-card"><label class="row" for="ppHl"><span class="r-ic">${SVG(IC.heart)}</span><span class="row-main"><b>${t('cp_hide_likes')}</b><small>${t('cp_hide_likes_s')}</small></span><input type="checkbox" class="switch" id="ppHl"${st.hideLikes?' checked':''}></label>
    <label class="row" for="ppAr"><span class="r-ic">${SVG(IC.eyeoff)}</span><span class="row-main"><b>${t('pm_archive')}</b><small>${t('pm_archive_s')}</small></span><input type="checkbox" class="switch" id="ppAr"${st.archived?' checked':''}></label></div>
    <button class="btn primary block" id="ppSave">${t('save')}</button></div>`,()=>{
    const b=$('#optBody');bindSeg(b,'ppAud',v=>st.aud=v);bindSeg(b,'ppRp',v=>st.reply=v);
    $('#ppSave').onclick=()=>{Object.assign(p.set,{aud:st.aud,reply:st.reply,rp:st.reply!=='off',hideLikes:$('#ppHl').checked,archived:$('#ppAr').checked});socSave();closeSheet();toast(t('saved'));done&&done()}});
}
function postEditSheet(p,done){
  openSheet(t('pm_edit'),`<form class="pv-form" id="peF"><div class="field"><label for="pfT">${t('cp_head')}</label><input class="input pv-in" id="pfT" maxlength="90" value="${esc(p.title||'')}"></div>
    <div class="field"><label for="pfB">${t('cp_body')}</label><textarea class="input pv-in" id="pfB" rows="5" maxlength="2200">${esc(p.body||'')}</textarea></div>
    <button class="btn primary block">${t('save')}</button></form>`,()=>{
    $('#peF').onsubmit=e=>{e.preventDefault();const old=tagsOf(p.body||''),manual=(p.tags||[]).filter(x=>!old.includes(x));p.title=$('#pfT').value.trim();p.body=$('#pfB').value.trim();p.tags=[...new Set(manual.concat(tagsOf(p.body)))];p.edited=Date.now();socSave();closeSheet();toast(t('saved'));done&&done()}});
}
function deletePost(id){const x=SOC.posts.find(q=>q.id===id);if(x){(x.media||[]).forEach(m=>m.mid&&MED.del(m.mid));if(x.repostOf)SOC.reposted=SOC.reposted.filter(r=>r!==x.repostOf)}SOC.posts=SOC.posts.filter(q=>q.id!==id);socSave()}

/* ----- one story ----- */
function storySettingsSheet(s,done){
  const st={aud:s.aud||'all',reply:s.reply||'all'};
  openSheet(t('st_settings'),`<div class="pv-form">
    <div class="pv-sec"><span class="sec-label">${t('cp_aud')}</span>${pvSeg('ssAud',AUD_S,st.aud,'aud_')}${st.aud==='close'?'':''}<p class="note">${t('aud_close_n',{n:PV().close.length})}</p></div>
    <div class="pv-sec"><span class="sec-label">${t('pv_reply')}</span>${pvSeg('ssRp',REPLY,st.reply,'rp_')}</div>
    <div class="list-card"><button class="row" id="ssHide"><span class="r-ic">${SVG(IC.eyeoff)}</span><span class="row-main"><b>${t('pv_hide_from')}</b><small>${t('pv_n_people',{n:PV().hideFrom.length})}</small></span>${SVG(IC.chev,2,'chev')}</button>
    <button class="row danger" id="ssDel"><span class="r-ic">${SVG(IC.trash)}</span><span class="row-main"><b>${t('post_del')}</b></span></button></div>
    <button class="btn primary block" id="ssSave">${t('save')}</button></div>`,()=>{
    const b=$('#optBody');bindSeg(b,'ssAud',v=>st.aud=v);bindSeg(b,'ssRp',v=>st.reply=v);
    $('#ssSave').onclick=()=>{s.aud=st.aud;s.reply=st.reply;socSave();closeSheet();toast(t('saved'));done&&done('save')};
    $('#ssHide').onclick=()=>pickPeople('hideFrom',t('pv_hide_from'),()=>storySettingsSheet(s,done));
    $('#ssDel').onclick=e=>{const r=e.currentTarget;if(!r.dataset.sure){r.dataset.sure=1;r.querySelector('b').textContent=t('pv_del_sure');return}
      SOC.stories=SOC.stories.filter(x=>x.id!==s.id);if(s.mid&&!s.repostOf&&!SOC.stories.some(x=>x.mid===s.mid))MED.del(s.mid);socSave();closeSheet();toast(t('pv_deleted'));done&&done('del')};
  });
}

/* ----- choose people (hide story from / close friends) ----- */
function pickPeople(key,title,back){
  const list=PEOPLE.concat(guideAccounts()).filter(a=>a.id!=='me'&&a.id!=='meg').sort((a,b)=>(isFollow(b.id)-isFollow(a.id))||a.name.localeCompare(b.name));
  const sel=new Set(PV()[key]);
  openSheet(title,`<div class="pv-form"><input class="input pv-in" id="ppQ" type="search" placeholder="${t('pv_search')}"><div class="acc-list pick tall" id="ppL">${list.map(a=>`<label class="acc-row" data-n="${esc((a.name+' '+a.handle).toLowerCase())}"><span class="acc-main">${avHTML(a)}<span><b>${esc(a.name)}</b><small>@${esc(a.handle)}</small></span></span><input type="checkbox" class="switch" value="${a.id}"${sel.has(a.id)?' checked':''}></label>`).join('')}</div>
    <button class="btn primary block" id="ppDone">${t('done')}</button></div>`,()=>{
    hydrateMedia($('#optBody'),true);
    $('#ppQ').oninput=e=>{const q=e.target.value.toLowerCase().trim();$$('#ppL .acc-row').forEach(r=>r.hidden=q&&!r.dataset.n.includes(q))};
    $('#ppDone').onclick=()=>{PV()[key]=$$('#ppL input:checked').map(i=>i.value);socSave();closeSheet();toast(t('saved'));if(back)back();else if(state.screen==='privset')renderPrivSet()}});
}

/* ----- account-wide privacy screen ----- */
function renderPrivSet(){
  const el=$('#pvBody');if(!el)return;const P=PV(),me=myId();
  const myPosts=SOC.posts.filter(p=>p.author===me),arch=myPosts.filter(p=>p.set&&p.set.archived),myStories=SOC.stories.filter(s=>s.author===me);
  el.innerHTML=`<header class="page-h sub"><button class="icon-btn" id="pvBack" aria-label="Back">${SVG('<path d="m15 18-6-6 6-6" />',2)}</button><h1>${t('pv_title')}</h1></header>
  <div class="list-card"><label class="row" for="pvPriv"><span class="r-ic">${SVG(IC.lock)}</span><span class="row-main"><b>${t('pv_private')}</b><small>${t('pv_private_s')}</small></span><input type="checkbox" class="switch" id="pvPriv"${P.privateAcct?' checked':''}></label></div>
  <section class="pv-group"><h2 class="sec-t">${t('pv_posts')}</h2>
    <div class="pv-sec"><span class="sec-label">${t('pv_def_aud')}</span>${pvSeg('pvPA',AUD_P,P.postAud,'aud_')}</div>
    <div class="pv-sec"><span class="sec-label">${t('pv_reply')}</span>${pvSeg('pvPR',REPLY,P.postReply,'rp_')}</div>
    <div class="list-card"><label class="row" for="pvHL"><span class="r-ic">${SVG(IC.heart)}</span><span class="row-main"><b>${t('pv_hide_likes')}</b><small>${t('cp_hide_likes_s')}</small></span><input type="checkbox" class="switch" id="pvHL"${P.hideLikesAll?' checked':''}></label>
    <button class="row" id="pvArch"><span class="r-ic">${SVG(IC.eyeoff)}</span><span class="row-main"><b>${t('pv_archived')}</b><small>${arch.length?t('n_posts',{n:arch.length}):t('pv_none')}</small></span>${SVG(IC.chev,2,'chev')}</button></div></section>
  <section class="pv-group"><h2 class="sec-t">${t('pv_stories')}</h2>
    <div class="pv-sec"><span class="sec-label">${t('pv_def_aud')}</span>${pvSeg('pvSA',AUD_S,P.storyAud,'aud_')}</div>
    <div class="pv-sec"><span class="sec-label">${t('pv_reply')}</span>${pvSeg('pvSR',REPLY,P.storyReply,'rp_')}</div>
    <div class="list-card"><button class="row" id="pvHide"><span class="r-ic">${SVG(IC.eyeoff)}</span><span class="row-main"><b>${t('pv_hide_from')}</b><small>${t('pv_n_people',{n:P.hideFrom.length})}</small></span>${SVG(IC.chev,2,'chev')}</button>
    <button class="row" id="pvClose"><span class="r-ic">${SVG(IC.star)}</span><span class="row-main"><b>${t('aud_close')}</b><small>${t('pv_n_people',{n:P.close.length})}</small></span>${SVG(IC.chev,2,'chev')}</button></div></section>
  <section class="pv-group"><h2 class="sec-t">${t('pv_delete')}</h2><div class="list-card">
    <button class="row danger" id="pvDelP"><span class="r-ic">${SVG(IC.trash)}</span><span class="row-main"><b>${t('pv_del_posts')}</b><small>${t('n_posts',{n:myPosts.length})}</small></span></button>
    <button class="row danger" id="pvDelS"><span class="r-ic">${SVG(IC.trash)}</span><span class="row-main"><b>${t('pv_del_stories')}</b><small>${t('pv_n_stories',{n:myStories.length})}</small></span></button></div></section>
  <p class="note">${t('pv_note')}</p>`;
  const sv=()=>socSave();
  $('#pvBack').onclick=()=>show(state.pvFrom&&state.pvFrom!=='privset'?state.pvFrom:'settings');
  $('#pvPriv').onchange=e=>{P.privateAcct=e.target.checked;if(P.privateAcct){if(P.postAud==='all')P.postAud='followers';if(P.storyAud==='all')P.storyAud='followers'}sv();renderPrivSet()};
  bindSeg(el,'pvPA',v=>{P.postAud=v;sv()});bindSeg(el,'pvPR',v=>{P.postReply=v;sv()});bindSeg(el,'pvSA',v=>{P.storyAud=v;sv()});bindSeg(el,'pvSR',v=>{P.storyReply=v;sv()});
  $('#pvHL').onchange=e=>{P.hideLikesAll=e.target.checked;SOC.posts.filter(p=>p.author===me).forEach(p=>p.set.hideLikes=P.hideLikesAll);sv()};
  $('#pvHide').onclick=()=>pickPeople('hideFrom',t('pv_hide_from'));
  $('#pvClose').onclick=()=>pickPeople('close',t('aud_close'));
  $('#pvArch').onclick=()=>{if(!arch.length)return;openSheet(t('pv_archived'),`<div class="post-list one">${arch.map(p=>postHTML(p,{noWhy:true})).join('')}</div>`,()=>{const b=$('#optBody');hydrateMedia(b,true);if(!b._bound){b._bound=1;bindPostList(b,()=>{closeSheet();renderPrivSet()})}})};
  const bulk=(id,fn)=>{$('#'+id).onclick=e=>{const r=e.currentTarget;if(!r.dataset.sure){r.dataset.sure=1;r.querySelector('small').textContent=t('pv_del_sure');return}fn();sv();toast(t('pv_deleted'));renderPrivSet()}};
  bulk('pvDelP',()=>{myPosts.forEach(p=>deletePost(p.id))});
  bulk('pvDelS',()=>{myStories.forEach(s=>{if(s.mid&&!s.repostOf)MED.del(s.mid)});SOC.stories=SOC.stories.filter(s=>s.author!==me)});
}
function openPrivSet(){state.pvFrom=state.screen;show('privset')}
