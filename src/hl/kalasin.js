/* Province highlight: Kalasin — "Land of fossils" (Kalasin Geopark).
   Facts come from TAT (Sept 2023), Bangkok Post (2023) and the geopark site.
   Places marked approx:1 have estimated positions until the geopark confirms them. */
HL.Kalasin={
  prov:'Kalasin',
  brand:{th:'อุทยานธรณีกาฬสินธุ์',en:'Kalasin Geopark'},
  tag:{th:'ดินแดนแห่งซากดึกดำบรรพ์',en:'Land of fossils'},
  lead:{th:'ย้อนรอยไดโนเสาร์แห่งที่ราบสูง จากแหล่งขุดค้นอายุ 150 ล้านปี สู่ผ้าไหมแพรวาและเสียงโปงลาง ของดีที่หาได้ที่กาฬสินธุ์ที่เดียว',en:'Follow the dinosaurs of the plateau — from 150-million-year-old dig sites to Phrae Wa silk and the sound of the pong lang, found only in Kalasin.'},
  site:'https://kalasin-geopark.com/',
  tour360:'https://kalasin-geopark.com/360',
  stats:[[21,{th:'แหล่งเที่ยวในอุทยานธรณี',en:'geopark sites'}],['460+',{th:'จุดชมแบบ 360°',en:'360° viewpoints'}],['150',{th:'ล้านปี อายุซากที่เก่าที่สุด',en:'million years — oldest finds'}]],
  accent:'#C8643B',
  types:{
    geo:{th:'ธรณีและไดโนเสาร์',en:'Fossils & dinosaurs',ic:'bone',c:'#C8643B',bg:'#FCE7DA'},
    nature:{th:'ผา น้ำตก และจุดชมวิว',en:'Cliffs, falls & views',ic:'mountain',c:'#2F8F6F',bg:'#DDF2E8'},
    faith:{th:'วัดและศรัทธา',en:'Temples',ic:'temple',c:'#8352C8',bg:'#EFE7FB'},
    culture:{th:'ผู้ไทยและผ้าไหมแพรวา',en:'Phu Thai & Phrae Wa silk',ic:'silk',c:'#B23A55',bg:'#FBE3EA'}
  },
  places:[
    {id:'sirindhorn',t:'geo',star:1,lat:16.69315,lng:103.52432,d:{th:'สหัสขันธ์',en:'Sahatsakhan'},th:'พิพิธภัณฑ์สิรินธร',en:'Sirindhorn Museum',age:130,
      s:{th:'พิพิธภัณฑ์ไดโนเสาร์บนภูกุ้มข้าว อาคารออกแบบให้เหมือนชั้นหิน เล่าเรื่องตั้งแต่กำเนิดโลก ยุคไดโนเสาร์ จนถึงวิวัฒนาการมนุษย์ ไฮไลต์คือหลุมขุดค้นจริงและโครงกระดูกภูเวียงโกซอรัส สิรินธรเน',en:'A dinosaur museum on Phu Kum Khao, built to look like rock strata. It tells the story from Earth’s origins through the age of dinosaurs to human evolution. Highlights are a real dig pit and a Phuwiangosaurus sirindhornae skeleton.'},
      f:[{th:'อังคาร–อาทิตย์ 09:30–16:30',en:'Tue–Sun 09:30–16:30'},{th:'ผู้ใหญ่ 50 · เด็ก 20 · ต่างชาติ 150 บาท',en:'Thai adult 50 · child 20 · foreign 150 THB'}],tip:{th:'เป็นจุดเริ่มต้นที่ดีที่สุด แวะก่อนไปแหล่งอื่น',en:'Best first stop before the field sites'},v:'cmv3x3w4p00a4xh2qnqmbiqej'},
    {id:'phunoi',t:'geo',star:1,lat:16.9266,lng:103.7274,d:{th:'คำม่วง',en:'Kham Muang'},th:'แหล่งซากดึกดำบรรพ์ภูน้อย',en:'Phu Noi fossil site',age:150,dino:1,
      s:{th:'หลุมขุดค้นขนาดราว 1,200 ตร.ม. ในตำบลดินจี่ ที่นี่ค้นพบ "มินิโมเคอร์เซอร์ ภูน้อยเอนซิส" ไดโนเสาร์กินพืชตัวเล็กวิ่งเร็ว ชนิดใหม่ของโลกเมื่อปี 2566 อายุราว 150 ล้านปี',en:'A dig of about 1,200 m² in Din Ji. In 2023 it gave the world Minimocursor phunoiensis — a small, fast, plant-eating dinosaur about 150 million years old.'},
      f:[{th:'ยุคจูแรสซิกตอนปลาย',en:'Late Jurassic'},{th:'ไดโนเสาร์ชนิดที่ 13 ของไทย',en:'Thailand’s 13th dinosaur species'}],v:'cmv7jrkd3000woumomgeorki8'},
    {id:'footprints',t:'geo',star:1,lat:16.69109,lng:103.937,d:{th:'นาคู',en:'Na Khu'},th:'รอยตีนไดโนเสาร์ วนอุทยานภูแฝก',en:'Dinosaur footprints, Phu Faek',age:140,
      s:{th:'รอยเท้าไดโนเสาร์กินเนื้อกลุ่มเทอโรพอด 7 รอย อายุราว 140 ล้านปี ปัจจุบันเห็นชัด 3 รอย อยู่ในป่าเต็งรังของวนอุทยานภูแฝก',en:'Seven theropod (meat-eater) footprints about 140 million years old, three still clearly visible, in the dry forest of Phu Faek forest park.'},
      f:[{th:'วนอุทยานตั้งปี 2540 พื้นที่ราว 4,062 ไร่',en:'Forest park since 1997, ~650 ha'}],v:'cmv2j7ck30058xh2qv2gz8rlg'},
    {id:'nakhrai',t:'geo',lat:16.5023,lng:104.1786,d:{th:'กุฉินารายณ์',en:'Kuchinarai'},th:'พิพิธภัณฑ์ไดโนเสาร์นาไคร้',en:'Na Khrai Dinosaur Museum',
      s:{th:'ค้นพบปี 2535 เป็นหนึ่งในแหล่งซากไดโนเสาร์ที่สมบูรณ์ที่สุดของไทย ขุดพบกระดูกไดโนเสาร์กินพืช 171 ชิ้น มีโมเดลภูเวียงโกซอรัสที่ขยับได้',en:'Found in 1992, one of Thailand’s most complete dinosaur sites: 171 bones of a plant-eater, plus a moving Phuwiangosaurus model.'},
      f:[{th:'อังคาร–อาทิตย์ 08:30–16:30',en:'Tue–Sun 08:30–16:30'},{th:'ผู้ใหญ่ 50 บาท',en:'Adults 50 THB'}],v:'cmv3a1199009mxh2q40cz7275'},
    {id:'phunamjan',t:'geo',lat:16.623,lng:104.0089,approx:1,d:{th:'กุฉินารายณ์',en:'Kuchinarai'},th:'พิพิธภัณฑ์ปลาภูน้ำจั้น',en:'Phu Nam Chan fossil fish',
      s:{th:'แหล่งซากปลาโบราณแห่งแรกของไทย พบมากกว่า 100 ตัว ส่วนใหญ่สมบูรณ์ทั้งตัว เป็นปลาน้ำจืดยาว 30–60 ซม. ที่อยู่ร่วมยุคกับไดโนเสาร์',en:'Thailand’s first fossil-fish site: over 100 mostly complete freshwater fish, 30–60 cm long, that lived alongside the dinosaurs.'},
      f:[{th:'แหล่งอนุรักษ์ตั้งแต่ปี 2557',en:'Protected since 2014'}],v:'cmv39m7oh008uxh2qsuhbesxa'},
    {id:'petrified',t:'geo',lat:16.9799,lng:103.5954,approx:1,d:{th:'คำม่วง',en:'Kham Muang'},th:'แหล่งไม้กลายเป็นหิน ภูปอ',en:'Petrified wood, Phu Po',age:150,
      s:{th:'ป่าแห่งยุคจูแรสซิก ไม้กลายเป็นหินทั้งลำต้นและกิ่ง อายุกว่า 150 ล้านปี เป็นญาติของสน ปรง และแปะก๊วย พืชที่ไดโนเสาร์กิน',en:'A Jurassic forest turned to stone: trunks and branches over 150 million years old, relatives of the pines, cycads and ginkgo that dinosaurs ate.'},v:'cmv7jupm20010oumorgxmrjml'},
    {id:'dinopark',t:'geo',lat:16.66311,lng:103.51738,d:{th:'สหัสขันธ์',en:'Sahatsakhan'},th:'สวนไดโนเสาร์',en:'Dinosaur park',
      s:{th:'สวนสาธารณะที่มีรูปปั้นไดโนเสาร์ขนาดเท่าจริง เดินเล่นสบายช่วงเย็น ถ่ายรูปกับครอบครัวได้ทั้งสวน',en:'A park full of life-size dinosaur statues — best for an evening stroll and family photos.'},tip:{th:'มาช่วงเย็น แสงสวย อากาศดี',en:'Come in the evening'},v:'cmv7l5xs00022oumofj4wli2t'},
    {id:'phadaeng',t:'nature',lat:16.745,lng:103.515,approx:1,d:{th:'สหัสขันธ์',en:'Sahatsakhan'},th:'ผาแดง ภูสิงห์',en:'Pha Daeng, Phu Sing',
      s:{th:'หน้าผาหินทรายสีแดงขนาดใหญ่ เห็นชั้นหินที่น้ำกัดเซาะชัดเจน มีเส้นทางเดินป่าราว 3 กม. ผ่านต้นไม้ใหญ่หายาก จุดชมวิวมองเห็นเขื่อนลำปาว',en:'A big red sandstone cliff with water-carved layers. A ~3 km forest trail passes rare big trees to views over Lam Pao.'},tip:{th:'แนะนำให้ไปกับไกด์ท้องถิ่น',en:'Go with a local guide'},v:'cmv7ix8vs000coumoy0corx4o'},
    {id:'bridge',t:'nature',star:1,lat:16.71306,lng:103.45957,d:{th:'สหัสขันธ์–หนองกุงศรี',en:'Sahatsakhan–Nong Kung Si'},th:'สะพานเทพสุดา',en:'Thep Suda Bridge',
      s:{th:'สะพานข้ามเขื่อนลำปาวจากแหลมโนนวิเศษไปเกาะมหาราช ได้ชื่อว่าสะพานข้ามน้ำจืดที่ยาวที่สุดในไทย จุดชมพระอาทิตย์ตกที่สวยที่สุดของจังหวัด',en:'Crosses Lam Pao reservoir from Non Wiset cape to Ko Maharat — called Thailand’s longest freshwater bridge, and Kalasin’s best sunset.'},tip:{th:'มาก่อนพระอาทิตย์ตก 30 นาที',en:'Arrive 30 min before sunset'},v:'cmv7kmm3x001woumoaplqrmz1'},
    {id:'parangaeng',t:'nature',lat:16.7513,lng:104.0983,approx:1,th:'ผาระแงง',en:'Pha Ra Ngaeng',s:{th:'ผาหินและจุดชมวิวในเขตอุทยานธรณีฝั่งตะวันออก ดูภาพ 360° จากโดรนก่อนไปได้',en:'A cliff viewpoint in the eastern geopark — preview it in 360° from the drone.'},v:'cmuj7kvph0010h3g1mqb0ngou'},
    {id:'phaphueng',t:'nature',lat:16.5343,lng:103.97,approx:1,th:'ภูผาผึ้ง',en:'Phu Pha Phueng',s:{th:'เส้นทางเดินป่าสั้นราว 2.2 กม. ขึ้นสู่จุดชมวิวบนยอดภู เห็นทิวทัศน์รอบด้าน',en:'A short ~2.2 km trail up to a hilltop with all-round views.'},v:'cmv3a4t9d009sxh2qodhsnv5o'},
    {id:'phali',t:'nature',lat:16.8019,lng:103.8184,approx:1,d:{th:'สมเด็จ',en:'Somdet'},th:'น้ำตกผาลี่',en:'Pha Li Waterfall',s:{th:'น้ำตกที่บ้านโคกกว้าง ตำบลมหาชัย อยู่บนเส้นทางท่องเที่ยวอุทยานธรณี สวยที่สุดช่วงฤดูฝนถึงต้นหนาว',en:'A waterfall at Ban Khok Kwang on the geopark route — best from the rainy season into early cool season.'},v:'cmv7jnunx000ooumoriog0ft2'},
    {id:'tatsung',t:'nature',lat:16.5265,lng:104.03,approx:1,th:'น้ำตกตาดสูง',en:'Tat Sung Waterfall',s:{th:'น้ำตกในเขตอุทยานธรณีฝั่งใต้ มีน้ำมากช่วงฤดูฝน',en:'A waterfall in the southern geopark, fullest in the rainy season.'},v:'cmv39xy0r009gxh2q5d0bxpc6'},
    {id:'tatyao',t:'nature',lat:16.5425,lng:104.0885,approx:1,th:'น้ำตกตาดยาว',en:'Tat Yao Waterfall',s:{th:'ลานหินยาวที่น้ำไหลผ่านเป็นชั้น ๆ ในเขตอุทยานธรณีฝั่งใต้',en:'Long rock terraces with water flowing over them, in the southern geopark.'},v:'cmvce4sbp00211k3mtvf2krcm'},
    {id:'phusing',t:'faith',star:1,lat:16.7395,lng:103.50096,d:{th:'สหัสขันธ์',en:'Sahatsakhan'},th:'วัดพุทธาวาสภูสิงห์',en:'Wat Phutthawat Phu Sing',
      s:{th:'พระพรหมภูมิปาโล พระพุทธรูปสีขาวสูง 17.80 เมตร บนยอดภูสิงห์ 346 เมตรจากระดับน้ำทะเล ขึ้นบันได 654 ขั้นหรือขับรถขึ้นได้ มองเห็นเขื่อนลำปาวและสะพานเทพสุดา',en:'A 17.8 m white Buddha on Phu Sing, 346 m above sea level. Climb 654 steps or drive up for views over Lam Pao and the Thep Suda bridge.'},tip:{th:'ด้านตะวันตกเป็นจุดชมพระอาทิตย์ตก',en:'West side is a sunset spot'},v:'cmv7ji48h000goumo2buyeblj'},
    {id:'phukhao',t:'faith',lat:16.72641,lng:103.56922,d:{th:'สหัสขันธ์',en:'Sahatsakhan'},th:'วัดพุทธนิมิต (ภูค่าว)',en:'Wat Phutthanimit (Phu Khao)',
      s:{th:'พระพุทธไสยาสน์แกะสลักบนหน้าผา อุโบสถไม้สร้างจากไม้ซุงที่กู้ขึ้นจากใต้เขื่อนลำปาว อยู่ใกล้พิพิธภัณฑ์สิรินธร',en:'A reclining Buddha carved into the cliff, and an ordination hall built from timber raised from under Lam Pao. Close to the Sirindhorn Museum.'},v:'cmv7j4k3u000eoumofwvue86h'},
    {id:'wangkham',t:'faith',lat:16.65019,lng:104.15606,d:{th:'เขาวง',en:'Khao Wong'},th:'วัดวังคำ',en:'Wat Wang Kham',s:{th:'วัดที่มีศิลปะแบบล้านช้าง คล้ายวัดในลาว ตั้งอยู่ในชุมชนผู้ไทยอำเภอเขาวง',en:'A temple in Lan Chang style, much like the temples of Laos, in Khao Wong.'},v:'cmv39hqv4008oxh2q16rdphi3'},
    {id:'phudanhai',t:'faith',lat:16.555,lng:103.93,approx:1,d:{th:'กุฉินารายณ์',en:'Kuchinarai'},th:'วัดภูดานไห',en:'Wat Phu Dan Hai',s:{th:'พุทธสถานบนภูที่มีงานแกะสลักหิน อยู่บนเส้นทางท่องเที่ยวอุทยานธรณี',en:'A hilltop Buddhist site with stone carvings on the geopark route.'},v:'cmv39slgr0090xh2qrhn2obaf'},
    {id:'pacharoen',t:'faith',lat:16.85045,lng:104.02187,approx:1,th:'วัดผาเจริญธรรม',en:'Wat Pha Charoen Tham',s:{th:'วัดบนผาหินทางตอนบนของอุทยานธรณี ดูภาพ 360° ก่อนไปได้',en:'A cliffside temple in the northern geopark — preview it in 360°.'},v:'cmv7kbin4001coumopu5bp02w'},
    {id:'banphon',t:'culture',star:1,lat:16.85939,lng:103.61052,d:{th:'คำม่วง',en:'Kham Muang'},th:'ศูนย์ศิลปาชีพทอผ้าไหมแพรวา บ้านโพน',en:'Ban Phon Phrae Wa silk centre',
      s:{th:'บ้านของ "ราชินีแห่งไหม" ชมสาวผู้ไทยทอผ้าไหมแพรวาลายขิดและจกด้วยมือ ซื้อผ้าจากกลุ่มทอโดยตรง',en:'Home of the "queen of silks": watch Phu Thai weavers make Phrae Wa by hand and buy straight from the weaving group.'},tip:{th:'ผ้าแท้ทอมือใช้เวลาหลายสัปดาห์ต่อผืน',en:'A real hand-woven piece takes weeks'},v:'cmv7l9qal0028oumo3mnsujsq'},
    {id:'phuthai',t:'culture',lat:16.8294,lng:103.7087,approx:1,th:'ศูนย์ศิลปวัฒนธรรมผู้ไทยผ้าไหมแพรวา',en:'Phu Thai & Phrae Wa culture centre',s:{th:'เรียนรู้วิถีผู้ไทย การแต่งกาย และลวดลายแพรวา ก่อนไปชมการทอจริงที่บ้านโพน',en:'Learn about Phu Thai life, dress and Phrae Wa motifs before seeing the weaving at Ban Phon.'},v:'cmv7kh5p4001ioumopcfslg2a'}
  ],
  routes:[
    {id:'r1',th:'ตามรอยไดโนเสาร์ 1 วัน',en:'Dinosaur trail in a day',sub:{th:'พิพิธภัณฑ์ → สวนไดโนเสาร์ → วัดบนภู → พระอาทิตย์ตกที่สะพานเทพสุดา',en:'Museum → dino park → hill temples → sunset at Thep Suda'},days:[['sirindhorn','dinopark','phukhao','phusing','bridge']],c:'#C8643B'},
    {id:'r2',th:'ผ้าไหมแพรวา + ไดโนเสาร์ภูน้อย',en:'Phrae Wa silk + Phu Noi dino',sub:{th:'ชมการทอแพรวา แล้วไปดูหลุมขุดค้นที่พบไดโนเสาร์ชนิดใหม่ของโลก',en:'Watch the weaving, then see where a new dinosaur was found'},days:[['banphon','phuthai','phunoi','petrified']],c:'#B23A55'},
    {id:'r3',th:'ธรณีฝั่งตะวันออก 2 วัน',en:'Eastern geopark, 2 days',sub:{th:'รอยตีนไดโนเสาร์ ปลาโบราณ นาไคร้ แล้วเดินป่าภูผาผึ้ง',en:'Footprints, fossil fish, Na Khrai, then a hike up Phu Pha Phueng'},days:[['footprints','phunamjan','nakhrai'],['phaphueng','tatsung','wangkham']],c:'#2F8F6F'}
  ],
  eras:[[0,{th:'วันนี้',en:'Today'},{th:'แผ่นดินที่เราเดินอยู่ คือชั้นหินที่บันทึกเรื่องราวนับร้อยล้านปี',en:'The ground you walk on is a record of more than a hundred million years.'}],
        [66,{th:'สิ้นยุคไดโนเสาร์ · 66 ล้านปีก่อน',en:'End of the dinosaurs · 66 Mya'},{th:'ไดโนเสาร์ที่ไม่ใช่นกสูญพันธุ์ เหลือเพียงซากไว้ในชั้นหินของอีสาน',en:'Non-bird dinosaurs die out, leaving their bones in Isan’s rocks.'}],
        [130,{th:'ครีเทเชียสตอนต้น · ราว 130 ล้านปี',en:'Early Cretaceous · ~130 Mya'},{th:'ไดโนเสาร์คอยาวกินพืชเดินเป็นฝูงที่ภูกุ้มข้าว',en:'Long-necked plant-eaters roam Phu Kum Khao.'}],
        [140,{th:'ราว 140 ล้านปี',en:'~140 Mya'},{th:'ไดโนเสาร์กินเนื้อเดินฝากรอยเท้าไว้ที่ภูแฝก',en:'Meat-eaters leave footprints at Phu Faek.'}],
        [150,{th:'จูแรสซิกตอนปลาย · ราว 150 ล้านปี',en:'Late Jurassic · ~150 Mya'},{th:'ป่าสนและปรงริมแม่น้ำ มินิโมเคอร์เซอร์ตัวเล็กวิ่งหาอาหารที่ภูน้อย',en:'Pine and cycad forests line the rivers; little Minimocursor runs through Phu Noi.'}]],
  soft:[
    {id:'dino',ic:'bone',c:'#C8643B',th:'ไดโนเสาร์',en:'Dinosaurs',s:{th:'กาฬสินธุ์มีทั้งพิพิธภัณฑ์ หลุมขุดค้น รอยเท้า และไม้กลายเป็นหิน ครบเรื่องราวตั้งแต่ยุคจูแรสซิกถึงครีเทเชียส ล่าสุดปี 2566 พบไดโนเสาร์ชนิดใหม่ของโลกที่ภูน้อย',en:'Museums, dig sites, footprints and petrified wood tell the whole story from the Jurassic to the Cretaceous. In 2023 Phu Noi gave the world a brand-new species.'}},
    {id:'silk',ic:'silk',c:'#B23A55',th:'ผ้าไหมแพรวา',en:'Phrae Wa silk',s:{th:'"แพร" คือผ้า "วา" คือความยาวหนึ่งวา ผ้าไหมทอมือลายขิดและจกของชาวผู้ไทย ได้ฉายาว่าราชินีแห่งไหม',en:'"Phrae" means cloth and "wa" an arm-span: hand-woven Phu Thai silk with intricate khit and chok motifs, called the queen of silks.'}},
    {id:'ponglang',ic:'music',c:'#2F8F6F',th:'โปงลาง',en:'Pong lang',s:{th:'เครื่องดนตรีอีสานทำจากท่อนไม้เรียงร้อย ครูเปลื้อง ฉายรัศมี ศิลปินแห่งชาติชาวกาฬสินธุ์ ทำให้โปงลางเป็นที่รู้จักทั่วประเทศ ลองเคาะดูได้เลย',en:'An Isan log xylophone. Kalasin’s national artist Plueang Chairatsami made it famous across Thailand. Tap the bars to play.'}}
  ]
};
