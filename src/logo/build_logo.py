import json, math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
D='/tmp/claude-0/-home-claude/a941acfd-1ee4-5a72-ad7b-5b47bb706bfd/scratchpad/logo2/'
FONT='/tmp/claude-0/-home-claude/a941acfd-1ee4-5a72-ad7b-5b47bb706bfd/scratchpad/logo/node_modules/@fontsource/quicksand/files/quicksand-latin-700-normal.woff2'

# ---------- wordmark outline ----------
f=TTFont(FONT);gs=f.getGlyphSet();cmap=f.getBestCmap();upm=f['head'].unitsPerEm
def word_path(text,x0,base,height_cap):
    # scale so that x-height-ish fits; use cap height of 'J'
    sc=height_cap/700
    pen=SVGPathPen(gs);x=0;adv=[]
    out=[]
    for ch in text:
        g=cmap[ord(ch)];p=SVGPathPen(gs);tp=TransformPen(p,(sc,0,0,-sc,x0+x*sc,base));gs[g].draw(tp);out.append(p.getCommands());adv.append((x0+x*sc,gs[g].width*sc));x+=gs[g].width-18
    return ' '.join(out),x*sc,adv
W_TEXT='Journey'
wp,ww,adv=word_path(W_TEXT,0,0,1)
# normalised: width ww per unit cap. target width 960
cap=960/ww
wp,ww,adv=word_path(W_TEXT,0,0,cap)

# ---------- mark (pin + scene + swoosh + plane) in 1254 space ----------
CX,CY,R=628,430,262;TIP=(628,812)
d=TIP[1]-CY;th=math.acos(R/d)
lx,ly=CX-R*math.sin(th),CY+R*math.cos(th);rx=CX+R*math.sin(th)
pin=f"M{TIP[0]-10:.1f} {TIP[1]-8:.1f}L{lx:.1f} {ly:.1f}A{R} {R} 0 1 1 {rx:.1f} {ly:.1f}L{TIP[0]+10:.1f} {TIP[1]-8:.1f}Q{TIP[0]} {TIP[1]+4} {TIP[0]-10:.1f} {TIP[1]-8:.1f}Z"
WR=216;WY=432;HZ=548
temple=("M424 548Q430 528 444 524L450 500L456 522Q464 518 468 508L474 486L480 466L485 442L490 418L495 398L500 380L505 398L510 418L515 442L520 466L526 486L532 508Q536 518 544 522L550 500L556 522Q570 528 574 538L582 516L588 538Q602 542 612 548Z M474 486H526 M480 466H520")
tower="M757 548V430L763 418L766 400L769 418L775 430V548Z M684 548V528L700 520H740L748 528V548Z M776 548V522L806 516L832 524V548Z"
reflect=''.join(f'<rect x="{x:.0f}" y="{y}" width="{w}" height="6" rx="3"/>' for x,y,w in [(560,560,150),(585,574,120),(548,588,96),(650,588,70),(600,602,80),(565,616,40),(640,616,50)])
clouds='<rect x="436" y="364" width="120" height="10" rx="5"/><rect x="470" y="380" width="70" height="8" rx="4"/><rect x="694" y="376" width="140" height="10" rx="5"/><rect x="742" y="392" width="76" height="8" rx="4"/>'
swoosh="M300 596C212 664 238 724 420 702C620 676 840 560 982 432C846 548 640 646 450 678C290 704 236 668 300 596Z"
trail="M588 652C760 600 900 520 978 446C892 532 760 612 600 660Z"
def plane(tx,ty,ang,s=1):
    body="M-84 -9C-70 -14 40 -14 74 -10C96 -7 110 -3 110 0C110 3 96 7 74 10C40 14 -70 14 -84 9C-90 6 -90 -6 -84 -9Z"
    wings="M34 -10L-14 -92L-34 -92L-8 -10Z M34 10L-14 92L-34 92L-8 10Z M-50 -9L-74 -42L-88 -42L-74 -9Z M-50 9L-74 42L-88 42L-74 9Z"
    return f'<g transform="translate({tx} {ty}) rotate({ang}) scale({s})"><path d="{wings}" fill="#8452C8"/><path d="{body}" fill="#8452C8"/></g>'
defs=f'''<defs>
<linearGradient id="jPin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A4FC8"/><stop offset=".55" stop-color="#B26ACB"/><stop offset="1" stop-color="#EC8DB4"/></linearGradient>
<linearGradient id="jSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D88CC8"/><stop offset=".45" stop-color="#F3A3B4"/><stop offset=".8" stop-color="#FDC6A2"/><stop offset="1" stop-color="#FFE2B3"/></linearGradient>
<linearGradient id="jSea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A973CF"/><stop offset="1" stop-color="#E08BC2"/></linearGradient>
<linearGradient id="jSw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B57AD8"/><stop offset=".5" stop-color="#E487C0"/><stop offset="1" stop-color="#9A5CCF"/></linearGradient>
<linearGradient id="jWord" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A4FC6"/><stop offset=".42" stop-color="#C461B9"/><stop offset=".75" stop-color="#F07EA8"/><stop offset="1" stop-color="#FDB49A"/></linearGradient>
<clipPath id="jWin"><circle cx="{CX}" cy="{WY}" r="{WR}"/></clipPath>
</defs>'''
scene=f'''<g clip-path="url(#jWin)"><rect x="{CX-WR}" y="{WY-WR}" width="{2*WR}" height="{HZ-WY+WR}" fill="url(#jSky)"/>
<g fill="#FFE9D6" opacity=".75">{clouds}</g>
<circle cx="634" cy="512" r="86" fill="#FFE6B5"/><circle cx="634" cy="512" r="86" fill="#FFF3D6" opacity=".35"/>
<rect x="{CX-WR}" y="{HZ}" width="{2*WR}" height="{WR}" fill="url(#jSea)"/>
<g fill="#FFE2AE" opacity=".9">{reflect}</g>
<path d="{temple}" fill="#9256BE"/><path d="{tower}" fill="#9A5EC2"/></g>'''
mark_body=f'''<path d="{pin}" fill="url(#jPin)"/>
<circle cx="{CX}" cy="{WY}" r="{WR+4}" fill="#fff" opacity=".18"/>
{scene}
<path d="{swoosh}" fill="url(#jSw)" stroke="#fff" stroke-width="12" stroke-linejoin="round" paint-order="stroke"/>
<path d="{trail}" fill="#C981CF" stroke="#fff" stroke-width="8" paint-order="stroke"/>
{plane(1048,368,-36,1.05)}'''
# wordmark group placed below
WX=(1254-ww)/2;WB=1000
mini_pin=lambda x,y,s:f'<g transform="translate({x} {y}) scale({s})"><path d="M0 34C-14 18 -26 6 -26 -8A26 26 0 0 1 26 -8C26 6 14 18 0 34Z" fill="#8A4FC6"/><circle cx="0" cy="-8" r="9" fill="#fff"/></g>'
ox=adv[1][0]+adv[1][1]/2
word=f'<g transform="translate({WX:.1f} {WB})"><path d="{wp}" fill="url(#jWord)" stroke="url(#jWord)" stroke-width="16" stroke-linejoin="round"/></g>'
pinO=mini_pin(round(WX+ox),WB-cap*0.62-60,1.25)
full=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 120 1254 1010" role="img" aria-label="Journey">{defs}{mark_body}{word}{pinO}</svg>'
open(D+'journey-logo.svg','w').write(full)
mark=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="240 150 920 690" role="img" aria-label="Journey">{defs}{mark_body}</svg>'
open(D+'journey-mark.svg','w').write(mark)
icon=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{CX-300} 140 600 690">{defs}<path d="{pin}" fill="url(#jPin)"/>{scene}</svg>'
open(D+'journey-icon.svg','w').write(icon)
wordsvg_vb=f'-12 {-cap*0.75-80:.0f} {ww+24:.0f} {cap*0.75+80+cap*0.32:.0f}'
json.dump({'wp':wp,'ww':ww,'cap':cap,'ox':ox,'defs':defs,'mark_body':mark_body,'pin':pin,'scene':scene,'vb':wordsvg_vb},open(D+'parts.json','w'))
print(ww,cap,ox)
