import json,re
F='/home/claude/journey.html'
s=open(F).read()
LU='/tmp/claude-0/-home-claude/a941acfd-1ee4-5a72-ad7b-5b47bb706bfd/scratchpad/logo/node_modules/lucide-static/icons/'
def lu(n):
    t=open(LU+n+'.svg').read();i=re.search(r'<svg[^>]*>(.*)</svg>',t,re.S).group(1);return re.sub(r'\s+',' ',re.sub(r'<!--.*?-->','',i,flags=re.S)).strip()
def rep(old,new,cnt=1):
    global s
    if old not in s: raise SystemExit('MISSING: '+old[:100])
    s=s.replace(old,new,cnt)
PURL='https://claude.ai/artifact/97Ejxemi3EsYpke6Y3aYHE'
# header: slider replaces the big "where to this evening?" title
rep('<div class="hh-greet"><small id="hiName"></small><h1 id="homeTitle"></h1></div>',
    '<div class="hh-greet"><small id="hiName"></small><h1 id="homeTitle" class="vh-only"></h1></div>\n      <div class="hero-ads" id="heroAds" role="region" aria-roledescription="carousel"><div class="ha-track" id="haTrack"></div><div class="ha-dots" id="haDots"></div></div>')
# the guide banner moves up into the slider
m=re.search(r'    <button class="g-promo" id="gPromo">.*?</button>\n',s,re.S); s=s[:m.start()]+s[m.end():]
rep("$('#gPromo').onclick=()=>goGuide();","")
rep("  renderGovNote();","  renderGovNote();renderHeroAds();")
ICS={k:lu(v) for k,v in dict(brief='briefcase-business',pin='map-pin-house',store='store',building='hotel',landmark='landmark',chart='chart-no-axes-combined',users='users',route='route',arrow='arrow-right').items()}
js='''
/* ----- home header: sliding banners ----- */
const HA_IC='''+json.dumps(ICS,ensure_ascii=False)+''';
const haSvg=(k,w)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${HA_IC[k]}</svg>`;
const partnersURL=()=>/workers\\.dev$|^localhost$/.test(location.hostname)?'/partners/':'''+json.dumps(PURL)+''';
function renderHeroAds(){
  const tr=$('#haTrack');if(!tr)return;const pu=partnersURL(),same=pu[0]==='/';
  const A=[
    {id:'guide',c:'ha-guide',k:t('rc_kicker'),ki:'brief',h:t('g_hero'),p:t('g_hero_sub'),cta:t('g_cta'),art:'pin'},
    {id:'biz',c:'ha-biz',k:t('ft_biz'),ki:'store',h:t('ad_b_t'),p:t('ad_b_s'),cta:t('ad_b_c'),art:'building',href:pu},
    {id:'plan',c:'ha-plan',k:t('svc_plan'),ki:'users',h:t('ad_p_t'),p:t('ad_p_s'),cta:t('ad_p_c'),art:'route'},
    {id:'gov',c:'ha-gov',k:t('ft_gov'),ki:'landmark',h:t('ad_g_t'),p:t('ad_g_s'),cta:t('ad_g_c'),art:'chart',href:pu}];
  tr.innerHTML=A.map((a,i)=>{const tag=a.href?'a':'button',at=a.href?`href="${a.href}"${same?'':' target="_blank" rel="noopener"'}`:'type="button"';
    return `<${tag} class="ha-slide ${a.c}" data-ad="${a.id}" ${at} role="group" aria-roledescription="slide" aria-label="${i+1} / ${A.length}"><span class="gp-txt"><small>${haSvg(a.ki)}<span>${esc(a.k)}</span></small><b>${esc(a.h)}</b><span class="gp-sub">${esc(a.p)}</span><span class="gp-cta"><span>${esc(a.cta)}</span>${haSvg('arrow')}</span></span><span class="gp-art" aria-hidden="true"><i></i><i></i><i></i>${haSvg(a.art,1.6)}</span></${tag}>`}).join('');
  $('#haDots').innerHTML=A.map((a,i)=>`<button type="button" aria-label="${i+1}" data-hd="${i}"${i===0?' aria-current="true"':''}></button>`).join('');
  haBind();
}
let HA={i:0,timer:0,bound:false,paused:false};
function haGo(i,smooth=true){const tr=$('#haTrack');if(!tr)return;const n=tr.children.length;HA.i=(i+n)%n;const e=tr.children[HA.i];tr.scrollTo({left:e.offsetLeft-tr.offsetLeft,behavior:smooth&&!matchMedia('(prefers-reduced-motion:reduce)').matches?'smooth':'auto'})}
function haDots(){$$('#haDots button').forEach((b,j)=>b.toggleAttribute('aria-current',j===HA.i))}
function haAuto(){clearInterval(HA.timer);if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;HA.timer=setInterval(()=>{if(HA.paused||document.hidden||state.screen!=='home')return;haGo(HA.i+1)},5200)}
function haBind(){const tr=$('#haTrack');HA.i=0;tr.scrollLeft=0;haDots();haAuto();if(HA.bound)return;HA.bound=true;
  let st;tr.addEventListener('scroll',()=>{clearTimeout(st);st=setTimeout(()=>{const w=tr.clientWidth||1;HA.i=Math.round(tr.scrollLeft/w);haDots()},60)},{passive:true});
  const pause=()=>{HA.paused=true},resume=()=>{HA.paused=false};
  ['pointerenter','touchstart','focusin'].forEach(ev=>tr.addEventListener(ev,pause,{passive:true}));['pointerleave','touchend','focusout'].forEach(ev=>tr.addEventListener(ev,()=>{setTimeout(resume,2500)},{passive:true}));
  tr.addEventListener('click',e=>{const s=e.target.closest('[data-ad]');if(!s||s.tagName==='A')return;const k=s.dataset.ad;if(k==='guide')goGuide();else if(k==='plan')show('plans')});
  $('#haDots').addEventListener('click',e=>{const b=e.target.closest('[data-hd]');if(b){haGo(+b.dataset.hd);haAuto()}});
  tr.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){haGo(HA.i+1);e.preventDefault()}else if(e.key==='ArrowLeft'){haGo(HA.i-1);e.preventDefault()}});
}
'''
rep("/* ----- link to Journey Partners: shared data on the same site ----- */",js+"\n/* ----- link to Journey Partners: shared data on the same site ----- */")
css='''
/* ===== home header slider ===== */
.vh-only{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.hero-ads{position:relative;z-index:1;margin-top:12px;display:flex;flex-direction:column;gap:10px}
.ha-track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;border-radius:28px;overscroll-behavior-x:contain}
.ha-track::-webkit-scrollbar{display:none}
.ha-slide{flex:0 0 100%;scroll-snap-align:start;scroll-snap-stop:always;position:relative;display:grid;grid-template-columns:minmax(0,1fr) 120px;align-items:center;gap:16px;min-height:208px;padding:22px 22px 22px 24px;border:0;border-radius:28px;overflow:hidden;text-align:left;color:#fff;text-decoration:none;font:inherit;cursor:pointer;
  background:radial-gradient(70% 120% at 100% 100%,rgba(255,203,174,.55) 0%,rgba(255,203,174,0) 60%),radial-gradient(60% 90% at 85% 0%,rgba(245,184,203,.45) 0%,rgba(245,184,203,0) 65%),linear-gradient(140deg,#2E2650 0%,#4B3D9E 58%,#7A68D4 100%)}
.ha-slide.ha-biz{background:radial-gradient(70% 120% at 100% 100%,rgba(255,214,150,.5) 0%,rgba(255,214,150,0) 60%),radial-gradient(60% 90% at 85% 0%,rgba(255,170,190,.4) 0%,rgba(255,170,190,0) 65%),linear-gradient(140deg,#4A1E4E 0%,#8A3F86 55%,#D9708C 100%)}
.ha-slide.ha-plan{background:radial-gradient(70% 120% at 100% 100%,rgba(190,240,215,.45) 0%,rgba(190,240,215,0) 60%),radial-gradient(60% 90% at 85% 0%,rgba(170,215,255,.4) 0%,rgba(170,215,255,0) 65%),linear-gradient(140deg,#123A4A 0%,#1E6B78 55%,#3FA59A 100%)}
.ha-slide.ha-gov{background:radial-gradient(70% 120% at 100% 100%,rgba(255,224,170,.45) 0%,rgba(255,224,170,0) 60%),radial-gradient(60% 90% at 85% 0%,rgba(180,190,255,.4) 0%,rgba(180,190,255,0) 65%),linear-gradient(140deg,#1C2350 0%,#33408F 55%,#6274C9 100%)}
.ha-slide:focus-visible{outline:3px solid #fff;outline-offset:-5px}
.ha-dots{display:flex;justify-content:center;gap:6px}
.ha-dots button{width:7px;height:7px;padding:0;border:0;border-radius:99px;background:currentColor;opacity:.3;transition:width .25s,opacity .25s}
.ha-dots button[aria-current]{width:22px;opacity:.85}
.hh-greet{margin-top:2px}
@media (max-width:520px){.ha-slide{grid-template-columns:minmax(0,1fr) 72px;padding:20px 18px 20px 20px;min-height:236px}.ha-slide .gp-art{width:72px;height:72px;align-self:start}.ha-slide .gp-art i:nth-child(2){inset:11px}.ha-slide .gp-art i:nth-child(3){inset:22px}.ha-slide .gp-art svg{width:26px;height:26px}}
'''
rep('</style>',css+'</style>')
T={'en':{'ad_b_t':'Run a stay, restaurant or tour? Get found by travellers','ad_b_s':'Bookings, availability, partners and customer journeys in one place.','ad_b_c':'Open partner portal','ad_p_t':'Plan a trip together','ad_p_s':'Stops, times, traffic and weather on one shared map with your friends.','ad_p_c':'Start planning','ad_g_t':'Tourism offices: see how visitors move through your province','ad_g_s':'Post notices and events straight to travellers’ home screens.','ad_g_c':'Learn more'},
'th':{'ad_b_t':'มีที่พัก ร้านอาหาร หรือทัวร์? ให้นักท่องเที่ยวเจอคุณ','ad_b_s':'จัดการการจอง ห้องว่าง พาร์ทเนอร์ และเส้นทางลูกค้าในที่เดียว','ad_b_c':'เข้าพอร์ทัลพาร์ทเนอร์','ad_p_t':'ชวนเพื่อนวางแผนทริปด้วยกัน','ad_p_s':'จุดแวะ เวลา รถติด และสภาพอากาศ บนแผนที่เดียวกับเพื่อน','ad_p_c':'เริ่มวางแผน','ad_g_t':'หน่วยงานท่องเที่ยว: ดูการเดินทางของนักท่องเที่ยวในจังหวัด','ad_g_s':'ส่งประกาศและกิจกรรมขึ้นหน้าแรกของนักท่องเที่ยวได้ทันที','ad_g_c':'ดูรายละเอียด'},
'hi':{'ad_b_t':'होटल, रेस्टोरेंट या टूर चलाते हैं? यात्रियों तक पहुँचें','ad_b_s':'बुकिंग, उपलब्धता, पार्टनर और ग्राहक यात्रा एक ही जगह।','ad_b_c':'पार्टनर पोर्टल खोलें','ad_p_t':'दोस्तों के साथ ट्रिप प्लान करें','ad_p_s':'पड़ाव, समय, ट्रैफ़िक और मौसम एक साझा नक्शे पर।','ad_p_c':'प्लान शुरू करें','ad_g_t':'पर्यटन कार्यालय: अपने प्रांत में यात्रियों की आवाजाही देखें','ad_g_s':'सूचनाएँ और कार्यक्रम सीधे यात्रियों की होम स्क्रीन पर भेजें।','ad_g_c':'और जानें'},
'ru':{'ad_b_t':'Отель, ресторан или туры? Пусть путешественники найдут вас','ad_b_s':'Бронирования, наличие мест, партнёры и маршруты клиентов в одном месте.','ad_b_c':'Открыть портал партнёров','ad_p_t':'Планируйте поездку вместе','ad_p_s':'Остановки, время, пробки и погода на общей карте с друзьями.','ad_p_c':'Начать план','ad_g_t':'Туристическим офисам: как гости перемещаются по провинции','ad_g_s':'Публикуйте объявления и события прямо на главном экране туристов.','ad_g_c':'Подробнее'},
'vi':{'ad_b_t':'Có chỗ ở, nhà hàng hay tour? Để du khách tìm thấy bạn','ad_b_s':'Đặt chỗ, phòng trống, đối tác và hành trình khách ở một nơi.','ad_b_c':'Mở cổng đối tác','ad_p_t':'Cùng bạn bè lên kế hoạch','ad_p_s':'Điểm dừng, giờ, kẹt xe và thời tiết trên một bản đồ chung.','ad_p_c':'Bắt đầu lên kế hoạch','ad_g_t':'Cơ quan du lịch: xem du khách di chuyển trong tỉnh','ad_g_s':'Gửi thông báo và sự kiện thẳng tới màn hình chính của du khách.','ad_g_c':'Tìm hiểu thêm'},
'ja':{'ad_b_t':'宿・飲食店・ツアーを運営中？旅行者に見つけてもらおう','ad_b_s':'予約、空き状況、パートナー、お客様の旅程をひとつの場所で。','ad_b_c':'パートナーポータルへ','ad_p_t':'友だちと一緒に旅を計画','ad_p_s':'立ち寄り先、時間、渋滞、天気をみんなの地図で共有。','ad_p_c':'計画を始める','ad_g_t':'観光行政の方へ：県内の旅行者の動きを把握','ad_g_s':'お知らせやイベントを旅行者のホーム画面に直接配信。','ad_g_c':'詳しく見る'},
'zh':{'ad_b_t':'经营住宿、餐厅或旅游？让游客找到你','ad_b_s':'预订、空房、合作伙伴和客户行程，一站式管理。','ad_b_c':'进入合作伙伴平台','ad_p_t':'和朋友一起规划行程','ad_p_s':'停靠点、时间、路况和天气，共享在同一张地图上。','ad_p_c':'开始规划','ad_g_t':'旅游部门：了解游客在本府的流动','ad_g_s':'将通知和活动直接推送到游客的首页。','ad_g_c':'了解更多'},
'ko':{'ad_b_t':'숙소·식당·투어 운영 중이세요? 여행자에게 알리세요','ad_b_s':'예약, 객실 현황, 파트너, 고객 여정을 한곳에서 관리하세요.','ad_b_c':'파트너 포털 열기','ad_p_t':'친구와 함께 여행 계획하기','ad_p_s':'경유지, 시간, 교통, 날씨를 함께 보는 지도 하나로.','ad_p_c':'계획 시작','ad_g_t':'관광 기관: 지역 내 여행자 이동 파악','ad_g_s':'공지와 행사를 여행자 홈 화면에 바로 전달하세요.','ad_g_c':'자세히 보기'}}
rep("for(const k in T15)Object.assign(T[k],T15[k]);","for(const k in T15)Object.assign(T[k],T15[k]);\nconst T16="+json.dumps(T,ensure_ascii=False)+";\nfor(const k in T16)Object.assign(T[k],T16[k]);")
open(F,'w').write(s)
print('patch17 ok')
