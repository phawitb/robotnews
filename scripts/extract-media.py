import json,re,pathlib
from bs4 import BeautifulSoup
from urllib.parse import urlparse,urljoin,parse_qs
out={}
for p in pathlib.Path('.firecrawl/articles').glob('*.json'):
 if p.stem=='index':continue
 d=json.loads(p.read_text());s=BeautifulSoup(d.get('html',''),'html.parser')
 host=urlparse(d.get('metadata',{}).get('sourceURL','')).hostname or ''
 root=s.select_one('.article_column') or s.select_one('.post-partial') or s.select_one('.entry-content') or s.select_one('article.evst-article') or s.select_one('.post-content') or s.select_one('article') or s
 if 'roboticstomorrow' in str(p.read_text()[:1000]):root=s.select_one('section.entry') or root
 images=[];videos=[];seen=set()
 for t in root.find_all('img'):
  u=t.get('data-lazy-src') or t.get('data-src') or t.get('src','')
  if not u.startswith('https://') or any(x in u.lower() for x in ['gravatar','ytimg','yt3.','ggpht','licdn.com/aero','flags/','/themes/','robo26_','/products/','footer','/site%20icons/','spot.im','tawk']):continue
  if any(any(x in ' '.join(p.get('class',[])) for x in ['entry-summary','related','author','newsletter','advert']) for p in t.parents):continue
  key=u.split('?')[0]
  if key in seen:continue
  seen.add(key);fig=t.find_parent(['figure']) or t.find_parent(class_='wp-caption');cap=fig.select_one('figcaption,.wp-caption-text') if fig else None
  if p.stem=='birotor' and '67790149' not in u:continue
  images.append({'url':u,'alt':t.get('alt',''),'caption':cap.get_text(' ',strip=True) if cap else ''})
 raw=str(root)
 ids=[]
 for t in root.find_all(True):
  for attr in ['href','src','data-src','data-lazy-src','data-video','data-id','data-embed']:
   u=t.get(attr,'')
   if not isinstance(u,str):continue
   matches=re.findall(r'(?:youtube(?:-nocookie)?\.com/(?:watch\?v=|embed/)|youtu\.be/|i\.ytimg\.com/vi/)([\w-]{11})',u)
   for v in matches:
    if v not in ids:ids.append(v)
 for v in ids:
  a=next((a for a in root.find_all('a',href=True) if v in a['href'] and a.get_text(strip=True) not in ['Watch on',''] and len(a.get_text(strip=True))>10),None)
  videos.append({'kind':'youtube','url':'https://www.youtube.com/watch?v='+v,'embed':'https://www.youtube-nocookie.com/embed/'+v,'title':a.get_text(' ',strip=True) if a else 'วิดีโอประกอบจากต้นฉบับ'})
 for t in root.find_all(['video','source']):
  u=t.get('src','')
  if not u.startswith('https://') or '.mp3' in u or t.get('type','').startswith('audio'):continue
  key=u.split('?')[0]
  if key in seen:continue
  seen.add(key)
  videos.append({'kind':'video','url':u,'title':'วิดีโอประกอบจากต้นฉบับ','poster':t.get('poster','')})
 out[p.stem]={'images':images,'videos':videos}
 print(p.stem,len(images),'images',len(videos),'videos')
pathlib.Path('content/media.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
