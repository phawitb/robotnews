import json,pathlib,re
from bs4 import BeautifulSoup
p=pathlib.Path('content/media.json');m=json.loads(p.read_text())
labels={
'hirebotics':['โคบอทงานเชื่อมที่ขยายระยะทำงานด้วยรางเลื่อน | ภาพ: Hirebotics'],
'digit':['Cassie และหุ่นยนต์ Digit ในแต่ละช่วงการพัฒนา | ภาพ: Agility Robotics','Digit รุ่นแรกระหว่างการทดลองส่งกล่องถึงหน้าบ้าน | ภาพ: Agility Robotics'],
'softbank':['Marc Raibert บนเวที Robotics Summit & Expo ปี 2023 | ภาพจาก The Robot Report','Marc Raibert กับหุ่นยนต์ Atlas | เครดิตต้นฉบับ: Associated Press'],
'light':['หุ่นยนต์เคลื่อนแสงเฉพาะจุดเหนือชิ้นงานภายในเซลล์ตรวจสอบ | ภาพ: EVST'],
'coating':['หุ่นยนต์พ่นสีเข้าหาชิ้นงานที่แขวนอยู่ | ภาพ: EVST'],
'abz':['โรงงานผลิตโดรนแห่งใหม่ของ ABZ Innovation ในฮังการี | ภาพจาก DroneDJ'],
'birotor':['หุ่นยนต์สองใบพัดสองตัวที่เชื่อมต่อกัน | ภาพ: CLIMB Lab / IEEE Spectrum'],
'cassie':['Sonny รุ่นใหม่กำลังหยิบสินค้าจากชั้นวาง | ภาพ: Tutor Intelligence','โครงสร้างแพลตฟอร์มหุ่นยนต์และ AI | ภาพ: Tutor Intelligence','หุ่นยนต์ Sonny สำหรับงานในคลังสินค้า | ภาพ: Tutor Intelligence'],
'marines':['การฝึกใช้งานโดรน Skydio X2D | ภาพ: US Marine Corps / Cpl. Salvador Flores Perez','ภาพการฝึกโดรนของนาวิกโยธินสหรัฐฯ | ภาพ: US Marine Corps / Cpl. Salvador Flores Perez','การฝึกกับ Skydio X2D | ภาพ: US Marine Corps / Cpl. Salvador Flores Perez','การฝึกส่งเวชภัณฑ์ด้วยโดรนยกของหนัก | ภาพ: US Marine Corps / Lance Cpl. Carlo SouzaDeluca']}
for k,rows in labels.items():
 for item,label in zip(m[k]['images'],rows):item['originalCaption']=item.get('caption','');item['caption']=label;item['alt']=label.split(' | ')[0]
m['hirebotics']['images'][0]['local']='/assets/hirebotics.jpg'
for v in m['hirebotics']['videos']:
 if v['kind']=='video':v['title']='สาธิต Line Tracking ให้โคบอทเคลื่อนตามสายพาน';v['sourceUrl']='https://www.linkedin.com/feed/update/urn:li:activity:7506108969061445632'
for v in m['digit']['videos']:
 if v['kind']=='video':
  v['title']='วิวัฒนาการของ Digit จากรุ่นแรกถึงรุ่นปัจจุบัน';v['kind']='link';v['sourceUrl']='https://www.therobotreport.com/the-evolution-of-digit-agility-robotics-journey-from-cassie-to-digit-5';v['note']='เว็บต้นทางจำกัดการเข้าถึงไฟล์วิดีโอนี้ กรุณาเปิดจากหน้าบทความต้นฉบับ'
for k,label in [('light','การจัดแสงในเซลล์ตรวจสอบด้วยหุ่นยนต์'),('coating','ตัวอย่างการพ่นสีบนชิ้นงานที่แขวน')]:
 for v in m[k]['videos']:v['title']=label
m['marines']['videos']=[]
for key,title,url in [('training','การฝึกใช้ Skydio X2D ของนาวิกโยธินสหรัฐฯ','https://www.dvidshub.net/video/1023602/us-marines-train-with-skydio-x2d-small-unmanned-aircraft-systems'),('medical','การฝึกส่งเวชภัณฑ์เพื่อดูแลผู้บาดเจ็บ','https://www.dvidshub.net/video/1021076/b-roll-us-navy-corpsman-with-4th-medical-battalion-participate-prolonged-casualty-care')]:
 d=json.loads(pathlib.Path('.firecrawl/dvids-'+key+'.json').read_text());html=d.get('html','');direct=pathlib.Path('.firecrawl/dvids-'+key+'-direct.html')
 if direct.exists():html+='\n'+direct.read_text()
 s=BeautifulSoup(html,'html.parser');mp4=next((t.get('src') for t in s.find_all(['source','video']) if '.mp4' in t.get('src','') and t.get('src','').startswith('https://')),None)
 m['marines']['videos'].append({'kind':'video' if mp4 else 'link','title':title,'url':mp4 or url,'sourceUrl':url,'note':'' if mp4 else 'เว็บวิดีโอต้นทางไม่ตอบสนองขณะรวบรวมข้อมูล สามารถลองเปิดต้นฉบับได้จากลิงก์ด้านล่าง'})
p.write_text(json.dumps(m,ensure_ascii=False,indent=2))
print('TOTAL',sum(len(x['images']) for x in m.values()),'images',sum(len(x['videos']) for x in m.values()),'videos')
