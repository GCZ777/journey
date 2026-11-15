import json,re,sys,math
D='/home/claude/journey/src/spots/'
sys.path.insert(0,D)
from soft import SOFT
allp=json.load(open(D+'all_places.json'))
R=json.load(open(D+'resolved.json'));TT=json.load(open(D+'titles_resolved.json'))
src=open('/home/claude/journey.html').read() if len(sys.argv)<2 else open(sys.argv[1]).read()
a=src.index('const PROV_RAW=');b=src.index('];',a)
PR={r[0]:(float(r[2]),float(r[3])) for r in re.findall(r"\['([^']+)','([^']+)',([\d.]+),([\d.]+)",src[a:b])}
BAD=re.compile(r'\.svg$|Amphoe|Lunch at|[Hh]otel|Macaca|border checkpoint|Municipal Hall|City Hall|Dani Pedrosa|Museum für|Thesabahn|Logbook|Isan, Mueang Buri Ram|Cyornis|Yasothon Municipal|Nonthaburi1|Hua Khwang|Elephants_in_lampang|Landform|BANLAEM',re.I)
def km(a,b):return math.hypot((a[0]-b[0])*111,(a[1]-b[1])*111*math.cos(math.radians(a[0])))
OUT={};i=0
for prov,rows in allp.items():
    lst=[]
    for j,r in enumerate(rows):
        ll,img=R[i];we,wt=TT[i];i+=1
        if ll and prov in PR and km(ll,PR[prov])>160: ll=0
        if img and BAD.search(img): img=''
        lst.append({'th':r[0],'en':r[1],'k':r[2],'ll':ll or None,'img':img or None,'we':we or r[3],'wt':wt or None})
    OUT[prov]=lst
assert i==len(R)
# Kalasin: curated geopark sites (+ Phra That Ya Khu)
kal=open('/home/claude/journey/src/hl/kalasin.js').read()
KIMG={'sirindhorn':'Dinosaur @พิพิธภัณฑ์สิรินธร ,Sirindhorn Museum ,Kalasin,Thailand - panoramio.jpg','bridge':'Lam Pao Dam 06.jpg','phunoi':'Minimocursor Skeletal.jpg','banphon':'Phrae Wa.png'}
KWT={'sirindhorn':'ศูนย์ศึกษาวิจัยและพิพิธภัณฑ์ไดโนเสาร์ภูกุ้มข้าว','bridge':'สะพานเทพสุดา','phunoi':'มินิโมเคอร์เซอร์'}
KK={'geo':'geo','nature':'nature','faith':'temple','culture':'culture'}
import subprocess
js='const HL={};const T=(a,b)=>a;'+kal+';console.log(JSON.stringify(HL.Kalasin.places))'
places=json.loads(subprocess.run(['node','-e',js],capture_output=True,text=True).stdout)
kl=[]
for p in sorted(places,key=lambda p:-(p.get('star') or 0)):
    o={'th':p['th'],'en':p['en'],'k':KK[p['t']],'ll':[p['lat'],p['lng']],'img':KIMG.get(p['id']),'we':None,'wt':KWT.get(p['id']),'s':p['s'],'ap':1 if p.get('approx') else 0}
    if p.get('d'):o['d']=p['d']
    if p.get('f'):o['f']=p['f']
    if p.get('tip'):o['tip']=p['tip']
    if p.get('age'):o['age']=p['age']
    kl.append(o)
kl.insert(4,{'th':'พระธาตุยาคู เมืองฟ้าแดดสงยาง','en':'Phra That Ya Khu, Fa Daet Song Yang','k':'temple','ll':[16.31917,103.52028],'img':'พระธาตุยาคู.JPG','we':None,'wt':'พระธาตุยาคู','ap':0,'d':{'th':'กมลาไสย','en':'Kamalasai'},'s':{'th':'เจดีย์สมัยทวารวดีกลางเมืองโบราณฟ้าแดดสงยาง หนึ่งในแหล่งโบราณคดีสำคัญของอีสาน','en':'A Dvaravati-era stupa in the ancient town of Fa Daet Song Yang, one of Isan’s key archaeological sites.'}})
OUT['Kalasin']=kl
S={k:[v[0],v[1],[list(x) for x in v[2]]] for k,v in SOFT.items()}
missing=[p for p in PR if p not in S];assert not missing,missing
nll=sum(1 for v in OUT.values() for s in v if s['ll']);n=sum(len(v) for v in OUT.values());nim=sum(1 for v in OUT.values() for s in v if s['img'])
out='const SPOT_DATA='+json.dumps(OUT,ensure_ascii=False,separators=(',',':'))+';\nconst SOFT='+json.dumps(S,ensure_ascii=False,separators=(',',':'))+';\n'
open(D+'spots_data.js','w').write(out)
print('provinces',len(OUT),'spots',n,'with coords',nll,'with img',nim,'bytes',len(out))
