import json
F='/home/claude/journey.html'
s=open(F).read()
def rep(old,new,cnt=1):
    global s
    if old not in s: raise SystemExit('MISSING: '+old[:100])
    s=s.replace(old,new,cnt)
PURL='https://claude.ai/artifact/97Ejxemi3EsYpke6Y3aYHE'
# 1) footer column for businesses (real link so it opens even inside an artifact)
rep('<div class="sf-col help"><h3 data-i18n="ft_help"></h3>','<div class="sf-col"><h3 data-i18n="ft_biz"></h3><a class="sf-a" id="ftPartners" href="/partners/" target="_blank" rel="noopener" data-i18n="ft_partners"></a><a class="sf-a" id="ftGov" href="/partners/" target="_blank" rel="noopener" data-i18n="ft_gov"></a></div>\n        <div class="sf-col help"><h3 data-i18n="ft_help"></h3>')
rep("function renderFoot(){","function renderFoot(){const pu=/workers\\.dev$|^localhost$/.test(location.hostname)?'/partners/':'"+PURL+"';['ftPartners','ftGov'].forEach(id=>{const a=$('#'+id);if(a){a.href=pu;a.target=pu[0]==='/'?'_self':'_blank'}});")
# 2) government notices on home (published from the partner portal, same site)
rep('<div id="nextApWrap"></div>','<div id="govNote"></div><div id="nextApWrap"></div>')
rep("  $('#nextApWrap').innerHTML=apptCardHTML();","  renderGovNote();\n  $('#nextApWrap').innerHTML=apptCardHTML();")
js='''
/* ----- link to Journey Partners: shared data on the same site ----- */
function partnerPub(){try{return JSON.parse(localStorage.getItem('jy_partner_pub')||'{}')}catch(e){return {}}}
function renderGovNote(){const el=$('#govNote');if(!el)return;const td=new Date().toISOString().slice(0,10),hid=store.get('govHide')||[];
  const ann=(partnerPub().ann||[]).filter(a=>a.to>=td&&a.from<=td&&!hid.includes(a.id)).slice(0,2);
  el.innerHTML=ann.map(a=>`<div class="gov-n ${a.level}" data-gid="${esc(a.id)}"><span class="gn-ic">${SVG(IC[a.level==='info'?'info':'alert'])}</span><span class="gn-t"><b>${esc(a.title)}</b><small>${esc(a.body)}</small><em>${esc(t('gn_from',{o:a.org}))}</em></span><button class="gn-x" aria-label="${esc(t('close'))}">${SVG(IC.close||IC.x||'<path d="M18 6 6 18M6 6l12 12"/>')}</button></div>`).join('');
  el.onclick=e=>{const x=e.target.closest('.gn-x');if(!x)return;const id=x.closest('[data-gid]').dataset.gid;store.set('govHide',hid.concat([id]));renderGovNote()}}
function partnerPlaces(prov,type){return (partnerPub().places||[]).filter(p=>p.prov===prov&&p.kind===type)}
'''
rep("/* ----- site footer ----- */",js+"\n/* ----- site footer ----- */")
# 3) planner add-stop: partner businesses for that province and stop type
rep("""  const html=()=>`<div class="st-types">""","""  const pp=()=>{const L=partnerPlaces(pl.prov,type);return L.length?`<div class="pp-sec"><h4>${t('pl_partners')}</h4><div class="pp-list">${L.map(p=>`<button type="button" class="pp-it" data-pp="${esc(p.id)}"><b>${esc(p.name)}${p.verified?SVG(IC.badge):''}</b><small>${p.rating?'★ '+p.rating:''}${p.price?' · ฿'+Number(p.price).toLocaleString():''}</small></button>`).join('')}</div></div>`:''};
  const html=()=>`<div class="st-types">""")
rep("""   ${type==='see'?`<div class="as-grid">""","""   ${pp()}${type==='see'?`<div class="as-grid">""")
rep("""      const sg=e.target.closest('[data-sg]');if(sg){push(mkStop(type,null,'me',sg.dataset.sg),t(sg.dataset.sg))}};""","""      const sg=e.target.closest('[data-sg]');if(sg){push(mkStop(type,null,'me',sg.dataset.sg),t(sg.dataset.sg));return}
      const q=e.target.closest('[data-pp]');if(q){const x=partnerPlaces(pl.prov,type).find(y=>y.id===q.dataset.pp);if(x){const st=mkStop(type,null,'me',x.name);st.partner=x.org;push(st,x.name)}}};""")
css='''
/* ===== partner links ===== */
.sf-a{display:block;padding:6px 0;font-size:14px;color:var(--ink);text-decoration:none;line-height:1.35}.sf-a:hover{color:var(--violet-ink)}
#govNote{display:flex;flex-direction:column;gap:8px}#govNote:empty{display:none}
.gov-n{display:flex;gap:10px;align-items:flex-start;padding:12px 12px 12px 14px;border-radius:16px;background:#EAF2FB;color:#1E3A5C}
.gov-n.warn{background:#FCF1DE;color:#6B4806}.gov-n.alert{background:#FBE5EA;color:#7A1F35}
.gn-ic svg{width:20px;height:20px;margin-top:1px}.gn-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.gn-t b{font-size:14px}.gn-t small{font-size:12.5px;opacity:.85;line-height:1.45}.gn-t em{font-style:normal;font-size:11.5px;opacity:.7}
.gn-x{border:0;background:none;padding:2px;color:inherit;opacity:.6}.gn-x svg{width:16px;height:16px}
.pp-sec{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}.pp-sec h4{margin:0;font-size:13px;color:var(--muted);font-weight:600}
.pp-list{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px}.pp-it{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:10px 12px;border:0;border-radius:14px;background:var(--lav-50);box-shadow:inset 0 0 0 1px var(--line);text-align:left;max-width:220px}
.pp-it b{font-size:13.5px;display:flex;align-items:center;gap:4px}.pp-it b svg{width:14px;height:14px;color:var(--lav-600)}.pp-it small{font-size:12px;color:var(--muted)}
'''
rep('</style>',css+'</style>')
T={'en':{'ft_biz':'For businesses','ft_partners':'Partner portal','ft_gov':'Government agencies','pl_partners':'Businesses on Journey','gn_from':'Notice from {o}'},
'th':{'ft_biz':'สำหรับผู้ประกอบการ','ft_partners':'พอร์ทัลพาร์ทเนอร์','ft_gov':'หน่วยงานรัฐ','pl_partners':'ธุรกิจในระบบ Journey','gn_from':'ประกาศจาก {o}'},
'hi':{'ft_biz':'व्यवसायों के लिए','ft_partners':'पार्टनर पोर्टल','ft_gov':'सरकारी एजेंसियाँ','pl_partners':'Journey पर व्यवसाय','gn_from':'{o} की सूचना'},
'ru':{'ft_biz':'Для бизнеса','ft_partners':'Портал партнёров','ft_gov':'Госорганы','pl_partners':'Компании в Journey','gn_from':'Объявление: {o}'},
'vi':{'ft_biz':'Dành cho doanh nghiệp','ft_partners':'Cổng đối tác','ft_gov':'Cơ quan nhà nước','pl_partners':'Doanh nghiệp trên Journey','gn_from':'Thông báo từ {o}'},
'ja':{'ft_biz':'事業者の方へ','ft_partners':'パートナーポータル','ft_gov':'行政機関','pl_partners':'Journey 掲載事業者','gn_from':'{o}からのお知らせ'},
'zh':{'ft_biz':'商家合作','ft_partners':'合作伙伴平台','ft_gov':'政府机构','pl_partners':'Journey 合作商家','gn_from':'来自{o}的通知'},
'ko':{'ft_biz':'비즈니스용','ft_partners':'파트너 포털','ft_gov':'정부 기관','pl_partners':'Journey 입점 업체','gn_from':'{o} 공지'}}
rep("for(const k in T14)Object.assign(T[k],T14[k]);","for(const k in T14)Object.assign(T[k],T14[k]);\nconst T15="+json.dumps(T,ensure_ascii=False)+";\nfor(const k in T15)Object.assign(T[k],T15[k]);")
open(F,'w').write(s)
print('patch16 ok')
