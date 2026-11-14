set -e
SP=/tmp/claude-0/-home-claude/a941acfd-1ee4-5a72-ad7b-5b47bb706bfd/scratchpad
cd /home/claude/journey/src && python3 - <<'P'
import json
a=json.load(open('i18n_en_th.json'));a.update(json.load(open('i18n_more1.json')));a.update(json.load(open('i18n_more2.json')))
json.dump(a,open('i18n_all.json','w'),ensure_ascii=False,separators=(',',':'))
P
cd /home/claude && python3 $SP/patch11.py && python3 $SP/patch12.py && python3 $SP/patch13.py
python3 -c "
import re;s=open('/home/claude/journey.html').read();open('$SP/c.js','w').write('\n'.join(re.findall(r'<script>(.*?)</script>',s,re.S)))"
node --check $SP/c.js && echo SYNTAX OK
