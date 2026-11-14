import re, json
SP='/tmp/claude-0/-home-claude/a941acfd-1ee4-5a72-ad7b-5b47bb706bfd/scratchpad/'
F='/home/claude/journey.html'
s=open(F).read()
P=json.load(open(SP+'logo2/parts.json'))
def rep(old,new,cnt=1):
    global s
    if old not in s: raise SystemExit('MISSING: '+old[:100])
    s=s.replace(old,new,cnt)
defs=P['defs'].replace('<defs>','').replace('</defs>','').replace('\n','')
rep('<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>','<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'+defs)
icon=f'<svg viewBox="360 162 536 660" aria-hidden="true"><path d="{P["pin"]}" fill="url(#jPin)"/>{P["scene"]}</svg>'
icon=icon.replace('\n','')
ox=round(P['ox'])
word=(f'<svg class="brand-word" viewBox="-4 -190 966 256" role="img" aria-label="Journey"><path d="{P["wp"]}" fill="url(#jWord)" stroke="url(#jWord)" stroke-width="16" stroke-linejoin="round"/></svg>')
n=0
def sub(m):
    global n;n+=1
    return '<span class="brand-mark">'+icon+'</span>'+word
s=re.sub(r'<span class="brand-mark"><svg viewBox="96 92 320 362" aria-hidden="true">.*?</svg></span>Journey',sub,s)
print('brands',n)
rep('</style>','''
/* ===== new logo ===== */
.brand-mark,.brand.light .brand-mark,.home-hero .brand-mark{width:30px!important;height:37px!important}
.brand-mark svg{width:30px!important;height:37px!important}
.lang-brand .brand-mark,.lang-brand .brand-mark svg{width:38px!important;height:47px!important}
.brand{gap:8px}
.brand-word{height:26px;width:auto;display:block;overflow:visible}
.lang-brand .brand-word{height:34px}
.home-hero .brand-word path:first-child{fill:#fff;stroke:#fff}
.home-hero.tod-morning .brand-word path:first-child,.home-hero.tod-day .brand-word path:first-child{fill:url(#jWord);stroke:url(#jWord)}
/* ===== footer ===== */
.site-foot{margin-top:28px;padding:28px 0 calc(96px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);display:flex;flex-direction:column;gap:22px}
.sf-top{display:flex;flex-direction:column;gap:10px}
.sf-top .brand-word{height:30px}
.sf-brand{display:flex;align-items:center;gap:8px}
.sf-brand svg:first-child{width:32px;height:40px}
.sf-tag{margin:0;color:var(--muted);font-size:14px;line-height:1.55;max-width:46ch}
.sf-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.sf-col{display:flex;flex-direction:column;gap:2px;min-width:0}
.sf-col h3{margin:0 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);font-weight:600}
.sf-col button{border:0;background:none;padding:6px 0;text-align:left;font-size:14px;color:var(--ink);line-height:1.35}
.sf-col button:hover{color:var(--violet-ink)}
.sf-bot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-top:16px;border-top:1px solid var(--line)}
.sf-lang{position:relative;display:inline-flex;align-items:center}
.sf-lang svg{position:absolute;left:12px;width:16px;height:16px;color:var(--violet-ink);pointer-events:none}
.sf-lang select{appearance:none;-webkit-appearance:none;min-height:38px;padding:0 34px 0 36px;border:0;border-radius:999px;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6880' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") right 12px center/14px no-repeat;box-shadow:inset 0 0 0 1px var(--line);font:inherit;font-size:13.5px;color:var(--ink)}
.sf-meta{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--faint)}
@media (max-width:560px){.sf-cols{grid-template-columns:repeat(2,minmax(0,1fr))}.sf-col.help{grid-column:1/-1}}
.about-sheet{display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.about-sheet svg{width:180px;height:auto}
.about-sheet p{margin:0;line-height:1.6;color:var(--ink)}
</style>''')
globe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
foot=f'''    <footer class="site-foot" id="siteFoot">
      <div class="sf-top"><div class="sf-brand">{icon}{word}</div><p class="sf-tag" data-i18n="ft_tag"></p></div>
      <nav class="sf-cols" aria-label="Footer">
        <div class="sf-col"><h3 data-i18n="ft_trav"></h3><button data-ft="general" data-i18n="svc_general"></button><button data-ft="local" data-i18n="svc_local"></button><button data-ft="plan" data-i18n="svc_plan"></button><button data-ft="feed" data-i18n="tab_feed"></button></div>
        <div class="sf-col"><h3 data-i18n="ft_guides"></h3><button data-ft="gjoin" data-i18n="g_cta"></button><button data-ft="glogin" data-i18n="g_auth_title"></button></div>
        <div class="sf-col help"><h3 data-i18n="ft_help"></h3><button data-ft="about" data-i18n="ft_about"></button><button data-ft="privacy" data-i18n="ft_privacy"></button><button data-ft="support" data-i18n="ft_contact"></button></div>
      </nav>
      <div class="sf-bot"><label class="sf-lang">{globe}<select id="ftLang" aria-label="Language"></select></label><div class="sf-meta"><span>© <span id="ftYear"></span> Journey · <span data-i18n="ft_rights"></span></span><span data-i18n="ft_credit"></span></div></div>
    </footer>
'''
# insert footer after popular section (end of home body)
m=re.search(r'(    <section class="sec"><div class="sec-h"><h2 id="popTitle"></h2>.*?</section>\n)',s)
s=s[:m.end()]+foot+s[m.end():]
js='''
/* ----- site footer ----- */
function renderFoot(){const sel=$('#ftLang');if(!sel)return;sel.innerHTML=LANGS.map(l=>`<option value="${l.c}"${l.c===state.lang?' selected':''}>${l.n}</option>`).join('');$('#ftYear').textContent=new Date().getFullYear()}
$('#ftLang').onchange=e=>{setLang(e.target.value);renderScreen(state.screen);renderFoot()};
$('#siteFoot').addEventListener('click',e=>{const b=e.target.closest('[data-ft]');if(!b)return;const k=b.dataset.ft;
  if(k==='general'||k==='local'){F.kind=k;F.di=-1;state.listLim=30;goMap()}
  else if(k==='plan')show('plans');else if(k==='feed')show('feed');
  else if(k==='gjoin'){state.gAuthMode='register';show('gauth')}else if(k==='glogin'){state.gAuthMode='login';show('gauth')}
  else if(k==='support')openThread('support');
  else if(k==='about')openSheet(t('ft_about'),`<div class="about-sheet">${$('#siteFoot .sf-brand').innerHTML}<p>${esc(t('ft_about_b'))}</p><p class="note">${esc(t('ft_tag'))}</p></div>`);
  else if(k==='privacy')openSheet(t('ft_privacy'),`${privacyHTML()}<p class="radar-note">${SVG(IC.radar)}<span>${esc(t('radar_note2'))}</span></p><p class="note">${esc(t('ft_privacy_b'))}</p>`);
});
'''
rep("\n/* ---------------- boot ---------------- */",js+"\n/* ---------------- boot ---------------- */")
rep("  $('#nextApWrap').innerHTML=apptCardHTML();","  renderFoot();\n  $('#nextApWrap').innerHTML=apptCardHTML();")
T={
'en':{'ft_tag':'Find local guides, plan trips with friends and share the journey — all across Thailand.','ft_trav':'For travellers','ft_guides':'For guides','ft_help':'Help','ft_about':'About Journey','ft_about_b':'Journey (“jer-nee”, from the Thai “เจอนี่” — “found it here”) connects travellers with general and local guides across all 77 provinces, and helps friends plan trips together.','ft_privacy':'Privacy & safety','ft_privacy_b':'Guides’ locations are never shown on the map, and personal contact details stay hidden — chat and calls go through the app.','ft_contact':'Contact support','ft_rights':'All rights reserved','ft_credit':'Photos: Wikipedia · Weather: Open-Meteo · Maps: Google'},
'th':{'ft_tag':'หาไกด์ท้องถิ่น ชวนเพื่อนวางแผนทริป และแบ่งปันการเดินทาง ทั่วทุกจังหวัดในไทย','ft_trav':'สำหรับนักท่องเที่ยว','ft_guides':'สำหรับไกด์','ft_help':'ช่วยเหลือ','ft_about':'เกี่ยวกับ Journey','ft_about_b':'Journey (อ่านว่า “เจอนี่” — เจอตรงนี้) เชื่อมนักท่องเที่ยวกับไกด์ทั่วไปและไกด์ท้องถิ่นครบ 77 จังหวัด และช่วยให้เพื่อน ๆ วางแผนเที่ยวด้วยกันได้ง่าย','ft_privacy':'ความเป็นส่วนตัวและความปลอดภัย','ft_privacy_b':'ตำแหน่งของไกด์ไม่แสดงบนแผนที่ และข้อมูลติดต่อส่วนตัวถูกซ่อนไว้ การแชทและโทรทำผ่านแอปเท่านั้น','ft_contact':'ติดต่อฝ่ายช่วยเหลือ','ft_rights':'สงวนลิขสิทธิ์','ft_credit':'ภาพ: Wikipedia · สภาพอากาศ: Open-Meteo · แผนที่: Google'},
'hi':{'ft_tag':'स्थानीय गाइड खोजें, दोस्तों संग ट्रिप प्लान करें और सफ़र शेयर करें — पूरे थाईलैंड में।','ft_trav':'यात्रियों के लिए','ft_guides':'गाइडों के लिए','ft_help':'सहायता','ft_about':'Journey के बारे में','ft_about_b':'Journey (थाई “เจอนี่” — “यहीं मिला”) यात्रियों को सभी 77 प्रांतों के सामान्य और स्थानीय गाइडों से जोड़ता है और दोस्तों को मिलकर ट्रिप प्लान करने में मदद करता है।','ft_privacy':'गोपनीयता और सुरक्षा','ft_privacy_b':'गाइडों की जगह मैप पर कभी नहीं दिखती और निजी संपर्क छिपे रहते हैं — चैट और कॉल ऐप से ही होते हैं।','ft_contact':'सहायता से संपर्क','ft_rights':'सर्वाधिकार सुरक्षित','ft_credit':'फ़ोटो: Wikipedia · मौसम: Open-Meteo · मैप: Google'},
'ru':{'ft_tag':'Находите местных гидов, планируйте поездки с друзьями и делитесь путешествиями — по всему Таиланду.','ft_trav':'Путешественникам','ft_guides':'Гидам','ft_help':'Помощь','ft_about':'О Journey','ft_about_b':'Journey (от тайского «เจอนี่» — «нашёл здесь») соединяет путешественников с общими и местными гидами во всех 77 провинциях и помогает друзьям планировать поездки вместе.','ft_privacy':'Конфиденциальность и безопасность','ft_privacy_b':'Местоположение гидов не показывается на карте, личные контакты скрыты — чат и звонки только через приложение.','ft_contact':'Связаться с поддержкой','ft_rights':'Все права защищены','ft_credit':'Фото: Wikipedia · Погода: Open-Meteo · Карты: Google'},
'vi':{'ft_tag':'Tìm HDV địa phương, lên kế hoạch cùng bạn bè và chia sẻ hành trình — khắp Thái Lan.','ft_trav':'Cho du khách','ft_guides':'Cho HDV','ft_help':'Trợ giúp','ft_about':'Về Journey','ft_about_b':'Journey (từ tiếng Thái “เจอนี่” — “tìm thấy ở đây”) kết nối du khách với HDV chung và địa phương ở cả 77 tỉnh, và giúp bạn bè cùng lên kế hoạch chuyến đi.','ft_privacy':'Quyền riêng tư & an toàn','ft_privacy_b':'Vị trí của HDV không bao giờ hiện trên bản đồ, thông tin liên hệ riêng được ẩn — trò chuyện và gọi qua ứng dụng.','ft_contact':'Liên hệ hỗ trợ','ft_rights':'Bảo lưu mọi quyền','ft_credit':'Ảnh: Wikipedia · Thời tiết: Open-Meteo · Bản đồ: Google'},
'ja':{'ft_tag':'地元ガイドを探し、友達と旅を計画し、旅をシェア — タイ全土で。','ft_trav':'旅行者の方へ','ft_guides':'ガイドの方へ','ft_help':'ヘルプ','ft_about':'Journeyについて','ft_about_b':'Journey（タイ語「เจอนี่」＝「ここで見つけた」）は、全77県の一般ガイド・地元ガイドと旅行者をつなぎ、友達との旅の計画をサポートします。','ft_privacy':'プライバシーと安全','ft_privacy_b':'ガイドの位置は地図に表示されず、個人の連絡先も非公開。チャットと通話はアプリ内で行います。','ft_contact':'サポートに連絡','ft_rights':'無断転載禁止','ft_credit':'写真：Wikipedia · 天気：Open-Meteo · 地図：Google'},
'zh':{'ft_tag':'寻找本地导游，约朋友规划行程，分享旅途——遍及全泰国。','ft_trav':'旅行者','ft_guides':'导游','ft_help':'帮助','ft_about':'关于 Journey','ft_about_b':'Journey（源自泰语“เจอนี่”——“就在这里找到”）连接旅行者与全泰77个府的普通导游和本地导游，并帮助朋友们一起规划行程。','ft_privacy':'隐私与安全','ft_privacy_b':'导游的位置不会显示在地图上，个人联系方式也会隐藏——聊天和通话都在应用内进行。','ft_contact':'联系客服','ft_rights':'保留所有权利','ft_credit':'图片：Wikipedia · 天气：Open-Meteo · 地图：Google'},
'ko':{'ft_tag':'현지 가이드를 찾고, 친구와 여행을 계획하고, 여정을 나누세요 — 태국 전역에서.','ft_trav':'여행자','ft_guides':'가이드','ft_help':'도움말','ft_about':'Journey 소개','ft_about_b':'Journey(태국어 “เจอนี่” — “여기서 찾았다”)는 77개 주의 일반·현지 가이드와 여행자를 연결하고 친구들과 함께 여행을 계획하도록 돕습니다.','ft_privacy':'개인정보 및 안전','ft_privacy_b':'가이드 위치는 지도에 표시되지 않고 개인 연락처도 숨겨져요. 채팅과 통화는 앱에서만 가능해요.','ft_contact':'고객지원 문의','ft_rights':'All rights reserved','ft_credit':'사진: Wikipedia · 날씨: Open-Meteo · 지도: Google'}}
rep("for(const k in T11)Object.assign(T[k],T11[k]);","for(const k in T11)Object.assign(T[k],T11[k]);\nconst T12="+json.dumps(T,ensure_ascii=False)+";\nfor(const k in T12)Object.assign(T[k],T12[k]);")
open(F,'w').write(s)
print('ok')
