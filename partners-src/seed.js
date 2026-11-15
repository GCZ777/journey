/* ----- demo data: a small connected destination (Chiang Mai) ----- */
function seedDB(user){
  const Rn=rng(20261115),pick=a=>a[Math.floor(Rn()*a.length)],ri=(a,b)=>a+Math.floor(Rn()*(b-a+1));
  const db={v:1,user,cur:'o_resort',demo:true,orgs:[],net:[],res:{},bookings:[],customers:[],trips:[],links:[],packages:[],threads:[],reviews:[],payouts:[],notifs:[],blocks:{},offers:[],incidents:[]};
  const O=(id,name,types,prov,district,extra)=>Object.assign({id,name,types,prov,district,phone:'0'+ri(53,99)+'-'+ri(100,999)+'-'+ri(1000,9999),email:id.slice(2)+'@example.com',desc:'',rating:+(4.3+Rn()*.6).toFixed(1),reviews:ri(40,900),verified:true,listed:true,color:KINDS[types[0]].c,members:[{name:user.name,email:user.email,role:'owner'}],hours:'08:00–22:00',docs:{}},extra||{});
  db.orgs.push(O('o_resort','บ้านสวนดอย รีสอร์ต',['stay','dine','tour'],'Chiang Mai','แม่ริม',{desc:'รีสอร์ตริมเขา 21 ห้อง ร้านอาหารพื้นเมือง และทริปเดินป่าน้ำตก',price:2400,members:[{name:user.name,email:user.email,role:'owner'},{name:'สมศรี ใจดี',email:'front@example.com',role:'admin'},{name:'ต้น ครัวล้านนา',email:'kitchen@example.com',role:'staff'},{name:'แพร บัญชี',email:'acc@example.com',role:'viewer'}]}));
  db.orgs.push(O('o_trans','เหนือสุด ทรานสปอร์ต',['transport'],'Chiang Mai','เมืองเชียงใหม่',{desc:'รถรับส่งสนามบิน รถตู้ระหว่างจังหวัด และรถเช่าพร้อมคนขับ',price:180}));
  db.orgs.push(O('o_gov','หน่วยงานท่องเที่ยวจังหวัด (ตัวอย่าง)',['gov'],'Chiang Mai','เมืองเชียงใหม่',{desc:'บัญชีตัวอย่างสำหรับหน่วยงานรัฐ',listed:false}));
  const N=[['n_khrua','ครัวล้านนา',['dine'],'เมืองเชียงใหม่',350],['n_cafe','คาเฟ่ปลายดอย',['dine'],'แม่ริม',120],['n_park','อุทยานผาเงิน',['attraction'],'แม่ริม',200],['n_elephant','ปางช้างร่มไม้ (ดูแลอย่างรับผิดชอบ)',['attraction','tour'],'แม่แตง',1500],
    ['n_home','เรือนไม้โฮมสเตย์',['stay'],'แม่แตง',900],['n_city','นิมมาน ซิตี้ โฮเทล',['stay'],'เมืองเชียงใหม่',1800],['n_pai','ปายวิว รีสอร์ต',['stay'],'ปาย',1600],['n_food','เชียงใหม่ ไนท์ฟู้ดวอล์ก',['tour'],'เมืองเชียงใหม่',890],
    ['n_van','ล้านนา วันทริป รถตู้',['transport'],'เมืองเชียงใหม่',250],['n_boat','ล่องเรือแม่ปิง',['tour','transport'],'เมืองเชียงใหม่',550],['n_market','ตลาดจริงใจ (ร้านค้ารวม)',['dine','attraction'],'เมืองเชียงใหม่',0],['n_spa','ภูดอย เวลเนส สปา',['tour'],'แม่ริม',1200],
    ['n_cr','เชียงราย ฮิลล์ โฮเทล',['stay'],'เมืองเชียงราย',1500],['n_crt','ไวท์เทมเปิล ทัวร์',['tour'],'เมืองเชียงราย',700]];
  N.forEach(([id,name,types,d,price])=>db.net.push(O(id,name,types,id==='n_pai'?'Mae Hong Son':id.startsWith('n_cr')?'Chiang Rai':'Chiang Mai',d,{price,verified:Rn()<.85,members:[]})));
  // resources of my orgs
  db.res.o_resort={
    rooms:[{id:'r1',name:'Deluxe Garden',beds:'King',cap:2,units:8,price:2400,size:32,amen:['wifi','breakfast','balcony'],status:'open'},{id:'r2',name:'Pool Villa',beds:'King',cap:2,units:4,price:5900,size:58,amen:['wifi','breakfast','pool'],status:'open'},{id:'r3',name:'Family Suite',beds:'Twin',cap:4,units:3,price:4200,size:64,amen:['wifi','breakfast','bathtub'],status:'open'},{id:'r4',name:'Hillside Cottage',beds:'Queen',cap:2,units:6,price:1900,size:26,amen:['wifi','fan'],status:'open'}],
    rates:[{id:'rt1',name:T('ไฮซีซั่นหน้าหนาว','Cool-season peak'),room:'all',from:iso(10),to:iso(80),adj:25,minStay:2},{id:'rt2',name:T('ส่วนลดจองล่วงหน้า','Early bird'),room:'r1',from:iso(0),to:iso(120),adj:-10,minStay:1}],
    menu:[['ข้าวซอยไก่','Khao soi chicken',120,['signature','spicy']],['แกงฮังเล','Hang le curry',160,['signature']],['น้ำพริกหนุ่ม ผักลวก','Nam prik noom',110,['vegetarian','spicy']],['ไส้อั่ว','Sai ua sausage',140,[]],['ลาบหมูคั่ว','Northern larb',130,['spicy']],['ข้าวเหนียวมะม่วง','Mango sticky rice',90,['vegan']],['ผัดไทยเต้าหู้','Tofu pad thai',120,['vegetarian']],['แกงเขียวหวานไก่','Green curry chicken',150,['halal']],['ส้มตำ','Som tam',90,['vegan','spicy']],['ชาไทยเย็น','Thai iced tea',60,[]],['กาแฟดอยช้าง','Doi Chang coffee',70,['vegan']],['น้ำผลไม้ปั่น','Fruit smoothie',80,['vegan']]].map((m,i)=>({id:'m'+i,cat:i<9?'main':'drink',name:m[0],nameEn:m[1],price:m[2],tags:m[3],avail:i!==3})),
    tables:[...Array(10)].map((_,i)=>({id:'t'+i,name:'T'+(i+1),seats:[2,2,4,4,4,6,2,4,8,2][i],zone:i<4?'indoor':i<8?'terrace':'private'})),
    products:[{id:'p1',name:T('เดินป่าน้ำตกแม่สา ครึ่งวัน','Mae Sa waterfall half-day hike'),kind:'tour',dur:4,times:['08:00','13:00'],cap:12,price:950,langs:['th','en'],meet:T('ล็อบบี้รีสอร์ต','Resort lobby')},{id:'p2',name:T('คลาสทำอาหารล้านนา','Lanna cooking class'),kind:'class',dur:3,times:['10:00','16:00'],cap:8,price:1200,langs:['th','en','zh'],meet:T('ครัวสวน','Garden kitchen')},{id:'p3',name:T('ปั่นจักรยานชมสวน','Countryside bike ride'),kind:'activity',dur:2,times:['07:00','16:30'],cap:10,price:600,langs:['th','en'],meet:T('ล็อบบี้รีสอร์ต','Resort lobby')}],
    promos:[{id:'pr1',code:'COOLSEASON',pct:12,from:iso(-5),to:iso(60),applies:'stay',uses:37,active:true},{id:'pr2',code:'JOURNEY10',pct:10,from:iso(-30),to:iso(30),applies:'all',uses:112,active:true}],
    ann:[],events:[],housekeeping:{}
  };
  db.res.o_trans={
    fleet:[['ชม 1234','van',10],['ชม 5678','van',10],['ชม 9012','van',13],['1กข 345','bus',40],['ชม 7788','songthaew',12],['ชม 4455','sedan',3]].map((v,i)=>({id:'v'+i,plate:v[0],kind:v[1],seats:v[2],status:i===4?'maintenance':'active',year:2018+i%6})),
    drivers:[['สมชาย ขับดี','th, en'],['ประยุทธ ทางไกล','th'],['วิชัย ใจเย็น','th, zh'],['มานพ สุขใจ','th, en'],['อรุณ รุ่งเรือง','th'],['บุญมี มีสุข','th, en']].map((d,i)=>({id:'d'+i,name:d[0],phone:'08'+ri(1,9)+'-'+ri(100,999)+'-'+ri(1000,9999),license:T('ท.2','Public B2')+'-'+ri(10000,99999),langs:d[1].split(', '),status:i===4?'leave':'on'})),
    routes:[{id:'rt_air',name:T('สนามบินเชียงใหม่ → ในเมือง/แม่ริม','CNX airport → city / Mae Rim'),from:T('สนามบินเชียงใหม่','CNX airport'),to:T('แม่ริม','Mae Rim'),stops:T('ประตูท่าแพ, นิมมาน','Tha Phae Gate, Nimman'),times:['09:00','12:00','15:00','18:00','21:00'],dur:45,price:180,vehicle:'v0',seats:10},
      {id:'rt_cr',name:T('เชียงใหม่ → เชียงราย','Chiang Mai → Chiang Rai'),from:T('อาเขต','Arcade terminal'),to:T('เชียงราย (หอนาฬิกา)','Chiang Rai clock tower'),stops:T('แม่ขะจาน','Mae Khachan'),times:['08:00','11:00','14:00'],dur:200,price:320,vehicle:'v2',seats:13},
      {id:'rt_pai',name:T('เชียงใหม่ → ปาย','Chiang Mai → Pai'),from:T('อาเขต','Arcade terminal'),to:T('ปาย','Pai'),stops:'',times:['07:30','10:30','13:30'],dur:180,price:250,vehicle:'v1',seats:10},
      {id:'rt_doi',name:T('ในเมือง → ดอยสุเทพ','City → Doi Suthep'),from:T('มช.','CMU gate'),to:T('วัดพระธาตุดอยสุเทพ','Wat Phra That Doi Suthep'),stops:'',times:['08:00','09:00','10:00','11:00','13:00','14:00','15:00'],dur:35,price:80,vehicle:'v4',seats:12}],
    promos:[{id:'pr3',code:'AIRPORT50',pct:20,from:iso(-10),to:iso(20),applies:'transport',uses:58,active:true}],ann:[],events:[]
  };
  db.res.o_gov={
    ann:[{id:'a1',title:T('ฝุ่น PM2.5 ช่วงเช้าสูง','High PM2.5 in the mornings'),body:T('ช่วงนี้ค่าฝุ่นสูงช่วง 06:00–10:00 แนะนำสวมหน้ากากและเลี่ยงกิจกรรมกลางแจ้งตอนเช้า','PM2.5 is high from 06:00–10:00. Wear a mask and avoid outdoor activity early.'),level:'warn',prov:'Chiang Mai',from:iso(-1),to:iso(6),pub:true,at:Date.now()-36e5*5},
      {id:'a2',title:T('ปิดถนนขบวนแห่ วันเสาร์นี้','Road closure for parade this Saturday'),body:T('ถนนท่าแพปิด 16:00–22:00 กรุณาเผื่อเวลาเดินทาง','Tha Phae Rd closed 16:00–22:00, allow extra travel time.'),level:'info',prov:'Chiang Mai',from:iso(0),to:iso(5),pub:true,at:Date.now()-36e5*30}],
    events:[{id:'e1',name:T('เทศกาลดอกไม้บานหน้าหนาว','Winter flower festival'),from:iso(20),to:iso(30),place:T('สวนหลวง','Royal park'),desc:'',pub:true},{id:'e2',name:T('ตลาดงานคราฟต์ล้านนา','Lanna craft fair'),from:iso(6),to:iso(8),place:T('ข่วงประตูท่าแพ','Tha Phae Gate square'),desc:'',pub:true}]
  };
  // customers + journeys that cross several partners
  const FN=[['Emma','GB'],['Liam','US'],['Yuki','JP'],['Minh','VN'],['Olga','RU'],['Arjun','IN'],['Wei','CN'],['Ji-woo','KR'],['Sofia','DE'],['Noah','AU'],['Hana','JP'],['Lucas','FR'],['Priya','IN'],['Mai','TH'],['Chen','CN'],['Anna','RU'],['Tom','GB'],['Sara','SE'],['Ken','JP'],['Nina','DE'],['Ploy','TH'],['Leo','IT'],['Mia','US'],['Ravi','IN'],['Linh','VN'],['Jun','KR'],['Eva','NL'],['Omar','AE'],['Lea','FR'],['Ben','AU'],['Ari','IL'],['Zoe','CA'],['Kai','SG'],['Ivy','HK'],['Max','DE'],['Ana','ES']];
  const LN=['Brooks','Carter','Sato','Nguyen','Ivanova','Rao','Liu','Park','Weber','Smith','Kim','Moreau','Shah','Srisuk','Zhang','Petrova','Hill','Berg','Ito','Klein','Wong','Rossi','Lee','Iyer','Tran','Choi','Visser','Haddad','Dubois','Taylor','Levi','Martin','Tan','Ho','Fischer','Garcia'];
  const LANGS={GB:'en',US:'en',JP:'ja',VN:'vi',RU:'ru',IN:'hi',CN:'zh',KR:'ko',DE:'en',AU:'en',FR:'en',TH:'th',SE:'en',IT:'en',NL:'en',AE:'en',IL:'en',CA:'en',SG:'en',HK:'zh',ES:'en'};
  FN.forEach(([f,c],i)=>db.customers.push({id:'c'+i,name:f+' '+LN[i],country:c,lang:LANGS[c]||'en',party:ri(1,4),diet:pick(['', '', 'vegetarian','halal','no spicy','vegan']),access:Rn()<.08?T('ใช้วีลแชร์','wheelchair'):'',consent:Rn()<.9,tags:Rn()<.2?['VIP']:[],notes:''}));
  const tz=today();
  db.customers.forEach((c,i)=>{
    const arr=ri(-12,14),nights=ri(2,5),A=addD(tz,arr),D=addD(A,nights),flight=pick(['FD','TG','PG','VZ','DD'])+ri(100,999);
    const legs=[];const L=(org,kind,day,time,item,amount,extra)=>legs.push(Object.assign({id:uid('l'),org,kind,date:dKey(addD(A,day)),time,item,amount},extra||{}));
    L(null,'arrive',0,pad(ri(8,19))+':'+pick(['05','20','35','50']),T('ลงเครื่อง ','Lands ')+flight+' · CNX',0);
    const arrT=legs[0].time,pick1=addMinutes(arrT,40);
    if(Rn()<.8)L('o_trans','transport',0,nearestTime(['09:00','12:00','15:00','18:00','21:00'],pick1),'rt_air',180*c.party,{route:'rt_air',seats:c.party});
    const stayOrg=Rn()<.62?'o_resort':pick(['n_city','n_home']);
    L(stayOrg,'stay',0,'14:00',stayOrg==='o_resort'?pick(['r1','r1','r2','r3','r4']):'room',0,{nights,checkout:dKey(D)});
    if(Rn()<.7)L(Rn()<.55&&stayOrg==='o_resort'?'o_resort':'n_khrua','dine',ri(0,1),pick(['18:30','19:00','19:30','12:00']),'table',ri(300,1400));
    if(Rn()<.65)L(Rn()<.6?'o_resort':pick(['n_food','n_spa']),'tour',ri(1,Math.max(1,nights-1)),pick(['08:00','10:00','13:00','16:00']),'p'+ri(1,3),0);
    if(Rn()<.55)L('n_park','attraction',ri(1,nights),pick(['09:00','10:30','14:00']),'ticket',200*c.party);
    if(Rn()<.25)L('o_trans','transport',nights,pick(['08:00','11:00','14:00']),'rt_cr',320*c.party,{route:'rt_cr',seats:c.party});
    else if(Rn()<.5)L('o_trans','transport',nights,pick(['09:00','12:00','15:00']),'rt_air_back',180*c.party,{route:'rt_air',seats:c.party,back:true});
    L(null,'depart',nights,pad(ri(10,21))+':'+pick(['00','15','30','45']),T('บินกลับ ','Flies out ')+pick(['FD','TG','PG'])+ri(100,999),0);
    const trip={id:'tr'+i,cust:c.id,arrive:dKey(A),depart:dKey(D),legs};db.trips.push(trip);
    legs.forEach(l=>{if(!l.org)return;
      const st=l.date<dKey(tz)?(Rn()<.06?'cancelled':'done'):l.date===dKey(tz)?pick(['confirmed','inprogress','confirmed']):(Rn()<.15?'new':'confirmed');
      let amount=l.amount;
      if(l.kind==='stay'){const rm=(db.res.o_resort.rooms.find(r=>r.id===l.item)||{price:1500}).price;amount=rm*l.nights}
      if(l.kind==='tour'){const p=(db.res.o_resort.products.find(x=>x.id===l.item)||{price:900});amount=p.price*c.party}
      l.amount=amount;l.status=st;
      db.bookings.push({id:'b'+db.bookings.length,org:l.org,kind:l.kind,cust:c.id,trip:trip.id,leg:l.id,item:l.item,date:l.date,time:l.time,nights:l.nights||0,route:l.route||null,qty:l.kind==='stay'?1:c.party,party:c.party,amount,status:st,src:pick(['app','app','app','partner','package','walkin','app']),created:Date.now()-ri(1,40)*864e5,notes:c.diet?T('อาหาร: ','Diet: ')+c.diet:''});
    });
  });
  // reviews
  const RV=[[5,'Beautiful garden rooms and the khao soi was the best we had in Thailand.'],[5,'ห้องสะอาด วิวสวย พนักงานใจดีมาก'],[4,'Lovely stay, a bit far from the old city but the shuttle helped.'],[5,'The cooking class was the highlight of our trip!'],[3,'Good food but service was slow on a busy night.'],[4,'静かで素敵なリゾートでした。'],[5,'Airport pickup was on time, driver spoke English.'],[2,'Van was late by 30 minutes on the way to Chiang Rai.']];
  RV.forEach(([s,tx],i)=>db.reviews.push({id:'rv'+i,org:i>=6?'o_trans':'o_resort',cust:'c'+(i*3),stars:s,text:tx,at:Date.now()-ri(1,30)*864e5,reply:i===1?T('ขอบคุณมากครับ ไว้มาพักอีกนะครับ','Thank you, hope to host you again!'):''}));
  // payouts
  for(let w=1;w<=6;w++)['o_resort','o_trans'].forEach(o=>db.payouts.push({id:uid('po'),org:o,date:iso(-w*7),amount:ri(o==='o_resort'?38000:9000,o==='o_resort'?96000:26000),status:w===1?'pending':'paid'}));
  // network links
  db.links=[{a:'o_resort',b:'o_trans',status:'active',comm:8},{a:'o_resort',b:'n_khrua',status:'active',comm:10},{a:'o_resort',b:'n_park',status:'active',comm:5},{a:'o_resort',b:'n_spa',status:'pending',comm:10},{a:'o_trans',b:'n_city',status:'active',comm:8},{a:'o_trans',b:'n_pai',status:'active',comm:8},{a:'o_resort',b:'o_gov',status:'active',comm:0},{a:'o_trans',b:'o_gov',status:'active',comm:0}];
  // offers partners put on the network (for packages)
  db.offers=[['o_trans',T('รับส่งสนามบิน (ต่อคน)','Airport transfer (per person)'),180],['o_trans',T('รถตู้ไปเชียงราย','Van to Chiang Rai'),320],['n_khrua',T('ชุดขันโตก','Khantoke dinner set'),450],['n_park',T('บัตรเข้าอุทยาน','Park entry'),200],['n_spa',T('นวดไทย 90 นาที','Thai massage 90 min'),900],['n_food',T('ทัวร์ฟู้ดกลางคืน','Night food walk'),890],['n_boat',T('ล่องเรือแม่ปิง','Ping river cruise'),550],['o_resort',T('ห้อง Deluxe 1 คืน','Deluxe room 1 night'),2400],['o_resort',T('คลาสทำอาหาร','Cooking class'),1200],['o_resort',T('เดินป่าน้ำตก','Waterfall hike'),950]].map((x,i)=>({id:'of'+i,org:x[0],name:x[1],price:x[2]}));
  db.packages=[{id:'pk1',name:T('3 วัน 2 คืน ล้านนาสโลว์ไลฟ์','3D2N Lanna slow life'),items:['of0','of7','of7','of8','of2','of0'],price:6900,status:'published',owner:'o_resort',sold:23,split:null}];
  // inbox
  db.threads.push({id:'th_c1',org:'o_resort',kind:'customer',with:'c2',msgs:[{from:'c2',text:'Hello! Can we get a late check-out on our last day?',at:Date.now()-36e5*3},{from:'me',text:T('ได้ครับ ถึง 14:00 ไม่มีค่าใช้จ่ายเพิ่ม','Sure, until 14:00 at no extra charge.'),at:Date.now()-36e5*2.5},{from:'c2',text:'Thank you so much!',at:Date.now()-36e5*2}],unread:1});
  db.threads.push({id:'th_c2',org:'o_resort',kind:'customer',with:'c5',msgs:[{from:'c5',text:'Do you have vegetarian options for dinner?',at:Date.now()-6e5*7}],unread:1});
  db.threads.push({id:'th_p1',org:'o_resort',kind:'partner',with:'o_trans',msgs:[{from:'o_trans',text:T('รถรอบ 15:00 มีลูกค้าของรีสอร์ต 3 คน จะถึงประมาณ 15:50 ครับ','3 of your guests are on the 15:00 shuttle, arriving around 15:50.'),at:Date.now()-36e5}],unread:1});
  db.threads.push({id:'th_p2',org:'o_resort',kind:'partner',with:'n_khrua',msgs:[{from:'me',text:T('คืนนี้จองโต๊ะ 6 ที่ให้ลูกค้าเราได้ไหมครับ','Can we book a table for 6 tonight for our guests?'),at:Date.now()-36e5*6},{from:'n_khrua',text:T('ได้ค่ะ 19:00 โต๊ะริมสวนนะคะ','Yes, 19:00 by the garden.'),at:Date.now()-36e5*5}],unread:0});
  db.threads.push({id:'th_g1',org:'o_resort',kind:'gov',with:'o_gov',msgs:[{from:'o_gov',text:T('แจ้งผู้ประกอบการ: ค่าฝุ่นสูงช่วงเช้า โปรดแจ้งลูกค้าที่มีกิจกรรมกลางแจ้ง','Notice: high PM2.5 in the mornings — please inform guests with outdoor plans.'),at:Date.now()-36e5*5}],unread:1});
  db.threads.push({id:'th_t1',org:'o_trans',kind:'partner',with:'o_resort',msgs:[{from:'o_resort',text:T('พรุ่งนี้มีลูกค้าเช็กเอาต์ไปสนามบิน 4 ท่าน รอบ 12:00 นะครับ','4 guests checking out to the airport tomorrow, 12:00 run.'),at:Date.now()-36e5*2}],unread:1});
  // safety incidents (gov)
  db.incidents=[{id:'i1',kind:'lost',title:T('นักท่องเที่ยวพลัดหลงบนเส้นทางเดินป่า','Hiker lost on a trail'),place:T('ดอยปุย','Doi Pui'),at:Date.now()-36e5*20,status:'resolved'},{id:'i2',kind:'scam',title:T('แจ้งราคาค่าโดยสารเกินจริง','Overcharging report'),place:T('ประตูท่าแพ','Tha Phae Gate'),at:Date.now()-36e5*8,status:'investigating'},{id:'i3',kind:'weather',title:T('น้ำป่าไหลหลาก ปิดน้ำตกชั่วคราว','Flash flood, waterfall closed'),place:T('แม่สา','Mae Sa'),at:Date.now()-36e5*2,status:'open'}];
  db.notifs=[{id:'nf1',org:'o_resort',text:T('มีการจองใหม่ 3 รายการจากแอป Journey','3 new bookings from the Journey app'),at:Date.now()-6e5*4,read:false},{id:'nf2',org:'o_resort',text:T('เหนือสุด ทรานสปอร์ต แจ้งเวลาส่งลูกค้า','Nuea Sut Transport shared an arrival time'),at:Date.now()-36e5,read:false},{id:'nf3',org:'o_resort',text:T('ประกาศใหม่จากหน่วยงานท่องเที่ยวจังหวัด','New notice from the provincial tourism office'),at:Date.now()-36e5*5,read:true}];
  return db;
}
function addMinutes(t,m){const [h,mm]=t.split(':').map(Number),x=h*60+mm+m;return pad(Math.floor(x/60)%24)+':'+pad(x%60)}
function nearestTime(list,t){return list.find(x=>x>=t)||list[list.length-1]}
