import re, json
SP='/tmp/claude-0/-home-claude/a941acfd-1ee4-5a72-ad7b-5b47bb706bfd/scratchpad/'
F='/home/claude/journey.html'
s=open(F).read()
P=json.load(open(SP+'logo2/parts.json'))
def rep(old,new,cnt=1):
    global s
    if old not in s: raise SystemExit('MISSING: '+old[:100])
    s=s.replace(old,new,cnt)
# ---- thread: show what a reply refers to ----
rep("""  $('#thCol').innerHTML=c.msgs.map(m=>`<div class="bub${m.me?' me':''}">${esc(msgText(m))}<time>${rel(m.at)}</time></div>`).join('');""",
    """  if(c.acct){const A=acct(c.acct);$('#thSub').textContent=(A.kind==='guide'?t('k_guide_badge'):t('k_traveler'))+' · @'+A.handle}
  $('#thCol').innerHTML=c.msgs.map(m=>`<div class="bub${m.me?' me':''}${m.ref?' has-ref':''}">${m.ref?refHTML(m.ref):''}${esc(msgText(m))}<time>${rel(m.at)}</time></div>`).join('');hydrateMedia($('#thCol'),true);""")
# ---- settings: image cache ----
rep("    grp('',[navRow('clear',IC.trash,t('clear_data'),'','danger')]","    grp('',[navRow('cache',IC.image,t('cache_clear'),'…'),navRow('clear',IC.trash,t('clear_data'),'','danger')]")
rep("  else if(k==='clear')confirmClear();","  else if(k==='cache')clearImgCache();\n  else if(k==='clear')confirmClear();")
rep("function renderSettings(){","function renderSettings(){setTimeout(showCacheSize,0);")
# ---- splash ----
full=open(SP+'logo2/journey-logo.svg').read()
full=re.sub(r'<defs>.*?</defs>','',full,flags=re.S).replace('<svg xmlns="http://www.w3.org/2000/svg" ','<svg class="sp-logo" ')
rep('<div id="toast" role="status"></div>','<div id="splash" aria-hidden="true">'+full+'<i class="sp-bar"><b></b></i></div>\n<div id="toast" role="status"></div>')
JS='''
/* ----- loading + cache ----- */
document.addEventListener('load',e=>{const el=e.target;if(el.tagName==='IMG'&&!/^data:image\\/gif/.test(el.src))el.classList.add('ld')},true);
document.addEventListener('error',e=>{const el=e.target;if(el.tagName==='IMG'){el.classList.add('ld');if(el.dataset.art&&!el._fb){el._fb=1;const [k,sd]=el.dataset.art.split('|');el.src=artURL(k,sd)}}},true);
const swOK='serviceWorker' in navigator&&location.protocol==='https:'&&!/claude|anthropic/.test(location.hostname);
if(swOK)addEventListener('load',()=>{try{navigator.serviceWorker.register('/sw.js').catch(()=>{})}catch(e){}});
addEventListener('offline',()=>toast(t('offline')));addEventListener('online',()=>toast(t('online_back')));
async function showCacheSize(){const el=$('[data-open="cache"] .r-val');if(!el)return;let b=0;
  try{if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();b=e.usage||0}}catch(e){}
  if(!b)try{b=['jy_wt','jy_pc','jy_pi'].reduce((a,k)=>a+((localStorage.getItem(k)||'').length*2),0)}catch(e){}
  el.textContent=b>1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB'}
async function clearImgCache(){
  try{if(window.caches){for(const k of await caches.keys())if(/journey-(img|data)/.test(k))await caches.delete(k)}}catch(e){}
  try{['jy_wt','jy_pi'].forEach(k=>localStorage.removeItem(k))}catch(e){}
  for(const k in ARTC)delete ARTC[k];for(const k in WT)delete WT[k];for(const k in WTP)delete WTP[k];
  toast(t('cache_cleared'));showCacheSize()}
function hideSplash(){const sp=$('#splash');if(!sp||sp.hidden)return;sp.classList.add('out');setTimeout(()=>{sp.hidden=true},380)}
Promise.race([document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve(),new Promise(r=>setTimeout(r,900))]).then(()=>setTimeout(hideSplash,200));
'''
rep("\n/* ---------------- boot ---------------- */",JS+"\n/* ---------------- boot ---------------- */")
rep('</style>','''
/* ===== image loading ===== */
.pm-slide,.pg-it,.gg-it,.ps-th,.as-it,.pl-cov,.lb-s,.cp-th,.ge-g,.mr-th,.cc-img,.rp-prev .mr-th{background-color:var(--lav-100);background-image:linear-gradient(100deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.65) 50%,rgba(255,255,255,0) 70%);background-size:250% 100%;animation:shim 1.4s linear infinite}
.pm-slide:has(>img.ld),.pg-it:has(>img.ld),.gg-it:has(>img.ld),.ps-th:has(>img.ld),.as-it:has(>img.ld),.pl-cov:has(>img.ld),.lb-s:has(>img.ld),.cp-th:has(>img.ld),.ge-g:has(>img.ld),.mr-th:has(>img.ld),.cc-img:has(>img.ld){animation:none;background-image:none}
@keyframes shim{from{background-position:150% 0}to{background-position:-100% 0}}
.pm-slide>img,.pg-it>img,.gg-it>img,.ps-th>img,.as-it>img,.pl-cov>img,.gp-cover>img,.ge-cover>img,.lb-s>img,.mr-th>img,.cc-img>img,.av.img>img{opacity:0;transition:opacity .4s ease}
img.ld{opacity:1!important}
@media (prefers-reduced-motion:reduce){.pm-slide,.pg-it,.gg-it,.ps-th,.as-it,.pl-cov,.lb-s,.cp-th,.ge-g,.mr-th,.cc-img{animation:none}}
#splash{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;background:linear-gradient(180deg,#FFF6EF,#F6EEFD);pointer-events:none;transition:opacity .35s ease}
#splash.out{opacity:0}
.sp-logo{width:min(200px,50vw);height:auto}
.sp-bar{width:120px;height:4px;border-radius:4px;background:rgba(138,79,198,.15);overflow:hidden}
.sp-bar b{display:block;width:40%;height:100%;border-radius:4px;background:var(--grad);animation:spb 1s ease-in-out infinite}
@keyframes spb{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
/* ===== replies ===== */
.up-tabs{display:none}
.pa[data-pa=reply] span{font-weight:550}
.msg-ref{display:flex;gap:8px;align-items:center;margin:-2px 0 8px;padding:6px;border-radius:12px;background:rgba(255,255,255,.22)}
.bub:not(.me) .msg-ref{background:var(--lav-50)}
.mr-th{width:42px;height:54px;flex:none;border-radius:8px;overflow:hidden}.mr-th img{width:100%;height:100%;object-fit:cover}
.mr-t{display:flex;flex-direction:column;min-width:0;line-height:1.3}.mr-t small{font-size:11.5px;opacity:.8}.mr-t b{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
.reply-f{display:flex;flex-direction:column;gap:12px}
.rp-prev{display:flex;gap:10px;align-items:center;padding:10px;border-radius:16px;background:var(--surface)}
.rp-prev>span:last-child{display:flex;flex-direction:column;min-width:0}.rp-prev small{color:var(--muted);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rp-in{display:flex;gap:8px;align-items:flex-end}.rp-in textarea{flex:1;border-radius:18px!important;background:#fff;border:1px solid var(--line);padding:12px 16px!important;min-height:52px;font-family:inherit}
.rp-in .btn{flex:none;width:52px;min-width:0;padding:0;border-radius:50%;min-height:52px}
.reply-f .note{display:flex;align-items:center;gap:6px}.reply-f .note svg{width:14px;height:14px}
.sv-reply{flex:1;display:flex;align-items:center;gap:8px}
.sv-reply input{flex:1;min-width:0;min-height:44px;padding:0 18px;border:1.5px solid rgba(255,255,255,.7);border-radius:999px;background:rgba(0,0,0,.18);color:#fff;font:inherit;font-size:14.5px;outline:none}
.sv-reply input::placeholder{color:rgba(255,255,255,.8)}
.sv-reply button{width:44px;height:44px;flex:none;border:0;border-radius:50%;background:#fff;color:var(--violet-ink);display:grid;place-items:center}.sv-reply button svg{width:19px;height:19px}
</style>''')
T={
'en':dict(reply='Reply',reply_to='Reply to {n}',reply_ph='Message {n}…',reply_send='Send',reply_sent='Sent to chat',reply_note='Goes to your private chat with {n}',qr1='Where is this?',qr2='Looks amazing!',qr3='When is the best time to go?',st_reply_ph='Reply to {n}…',ref_story='Replied to {n}’s story',ref_post='Replied to {n}’s post',dm_auto='Thanks for the message! I’ll get back to you with the details soon.',cp_allow_reply='Allow replies',cache_clear='Clear image cache',cache_cleared='Image cache cleared',offline='You’re offline — showing saved content',online_back='Back online'),
'th':dict(reply='ตอบกลับ',reply_to='ตอบกลับ {n}',reply_ph='ส่งข้อความถึง {n}…',reply_send='ส่ง',reply_sent='ส่งไปที่แชทแล้ว',reply_note='ข้อความจะส่งเข้าแชทส่วนตัวกับ {n}',qr1='ที่นี่ที่ไหนครับ/คะ?',qr2='สวยมาก!',qr3='ไปช่วงไหนดีที่สุด?',st_reply_ph='ตอบกลับ {n}…',ref_story='ตอบกลับสตอรี่ของ {n}',ref_post='ตอบกลับโพสต์ของ {n}',dm_auto='ขอบคุณที่ทักมานะ เดี๋ยวตอบรายละเอียดให้เร็ว ๆ นี้',cp_allow_reply='อนุญาตให้ตอบกลับ',cache_clear='ล้างแคชรูปภาพ',cache_cleared='ล้างแคชรูปภาพแล้ว',offline='ออฟไลน์อยู่ — แสดงข้อมูลที่บันทึกไว้',online_back='กลับมาออนไลน์แล้ว'),
'hi':dict(reply='जवाब दें',reply_to='{n} को जवाब',reply_ph='{n} को संदेश…',reply_send='भेजें',reply_sent='चैट में भेजा गया',reply_note='{n} के साथ आपकी निजी चैट में जाएगा',qr1='यह कौन सी जगह है?',qr2='बहुत सुंदर!',qr3='जाने का सबसे अच्छा समय?',st_reply_ph='{n} को जवाब…',ref_story='{n} की स्टोरी पर जवाब',ref_post='{n} की पोस्ट पर जवाब',dm_auto='संदेश के लिए धन्यवाद! जल्द ही जानकारी भेजता/भेजती हूँ।',cp_allow_reply='जवाब की अनुमति',cache_clear='इमेज कैश साफ़ करें',cache_cleared='इमेज कैश साफ़ हुआ',offline='आप ऑफ़लाइन हैं — सहेजी सामग्री दिख रही है',online_back='फिर ऑनलाइन'),
'ru':dict(reply='Ответить',reply_to='Ответ {n}',reply_ph='Сообщение для {n}…',reply_send='Отправить',reply_sent='Отправлено в чат',reply_note='Сообщение уйдёт в личный чат с {n}',qr1='Где это?',qr2='Очень красиво!',qr3='Когда лучше ехать?',st_reply_ph='Ответить {n}…',ref_story='Ответ на историю {n}',ref_post='Ответ на пост {n}',dm_auto='Спасибо за сообщение! Скоро отвечу подробно.',cp_allow_reply='Разрешить ответы',cache_clear='Очистить кеш фото',cache_cleared='Кеш фото очищен',offline='Нет сети — показаны сохранённые данные',online_back='Снова в сети'),
'vi':dict(reply='Trả lời',reply_to='Trả lời {n}',reply_ph='Nhắn cho {n}…',reply_send='Gửi',reply_sent='Đã gửi vào chat',reply_note='Tin nhắn sẽ vào cuộc chat riêng với {n}',qr1='Đây là ở đâu vậy?',qr2='Đẹp quá!',qr3='Đi lúc nào đẹp nhất?',st_reply_ph='Trả lời {n}…',ref_story='Trả lời tin của {n}',ref_post='Trả lời bài của {n}',dm_auto='Cảm ơn bạn đã nhắn! Mình sẽ trả lời chi tiết sớm.',cp_allow_reply='Cho phép trả lời',cache_clear='Xóa bộ nhớ đệm ảnh',cache_cleared='Đã xóa bộ nhớ đệm ảnh',offline='Bạn đang ngoại tuyến — hiển thị nội dung đã lưu',online_back='Đã trực tuyến lại'),
'ja':dict(reply='返信',reply_to='{n}に返信',reply_ph='{n}にメッセージ…',reply_send='送信',reply_sent='チャットに送信しました',reply_note='{n}との個別チャットに送られます',qr1='ここはどこですか？',qr2='すごくきれい！',qr3='行くならいつがベスト？',st_reply_ph='{n}に返信…',ref_story='{n}のストーリーに返信',ref_post='{n}の投稿に返信',dm_auto='メッセージありがとうございます！詳しくはすぐにお返事します。',cp_allow_reply='返信を許可',cache_clear='画像キャッシュを削除',cache_cleared='画像キャッシュを削除しました',offline='オフラインです — 保存済みの内容を表示中',online_back='オンラインに戻りました'),
'zh':dict(reply='回复',reply_to='回复 {n}',reply_ph='给 {n} 发消息…',reply_send='发送',reply_sent='已发送到聊天',reply_note='消息会发送到你和 {n} 的私聊',qr1='这是哪里？',qr2='太美了！',qr3='什么时候去最好？',st_reply_ph='回复 {n}…',ref_story='回复了 {n} 的快拍',ref_post='回复了 {n} 的帖子',dm_auto='谢谢你的消息！我很快回复你详细信息。',cp_allow_reply='允许回复',cache_clear='清除图片缓存',cache_cleared='图片缓存已清除',offline='当前离线——显示已保存的内容',online_back='已恢复在线'),
'ko':dict(reply='답장',reply_to='{n}에게 답장',reply_ph='{n}에게 메시지…',reply_send='보내기',reply_sent='채팅으로 보냈어요',reply_note='{n} 님과의 개인 채팅으로 전송돼요',qr1='여기 어디예요?',qr2='너무 예뻐요!',qr3='언제 가는 게 제일 좋아요?',st_reply_ph='{n}에게 답장…',ref_story='{n} 님의 스토리에 답장',ref_post='{n} 님의 게시물에 답장',dm_auto='메시지 고마워요! 곧 자세히 답장할게요.',cp_allow_reply='답장 허용',cache_clear='이미지 캐시 지우기',cache_cleared='이미지 캐시를 지웠어요',offline='오프라인이에요 — 저장된 내용을 보여줘요',online_back='다시 온라인이에요')}
rep("for(const k in T12)Object.assign(T[k],T12[k]);","for(const k in T12)Object.assign(T[k],T12[k]);\nconst T13="+json.dumps(T,ensure_ascii=False)+";\nfor(const k in T13)Object.assign(T[k],T13[k]);")
open(F,'w').write(s)
print('ok')
