import json
g=json.load(open('/home/claude/journey/src/hl/kalasin_districts.geojson'))
lake=json.load(open('/home/claude/journey/src/hl/lampao.json'))
D=[]
for f in g['features']:
    p=f['properties'];rings=[]
    for poly in f['geometry']['coordinates']:
        r=poly[0]
        if len(r)<6: continue
        rings.append([[round(x,4),round(y,4)] for x,y in r])
    D.append([p['amp_th'],p['amp_en'],rings])
out='HL_GEO.Kalasin='+json.dumps({'d':D,'lake':lake},separators=(',',':'),ensure_ascii=False)+';\n'
open('/home/claude/journey/src/hl/kalasin_geo.js','w').write(out)
print(len(out))
