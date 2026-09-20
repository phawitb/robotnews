import {readFile,writeFile,mkdir} from 'node:fs/promises';
const ui={
'ข่าวหุ่นยนต์และระบบอัตโนมัติจากทั่วโลก สรุปภาษาไทย พร้อมลิงก์แหล่งข่าวต้นฉบับ':'Robotics and automation news from around the world, with detailed English summaries and links to original sources.',
'หุ่นยนต์ครับ — ข่าวหุ่นยนต์ภาษาไทย':'Robot News — Robotics news in English',
'ติดตามหุ่นยนต์ เทคโนโลยี AI และระบบอัตโนมัติจากทั่วโลก ในภาษาไทย':'Explore robotics, AI and automation from around the world.',
'สรุปข่าวภาษาไทย พร้อมแหล่งอ้างอิงทุกบทความ · คัดสรรข่าวน่าสนใจจากหลายแหล่ง ตรวจสอบก่อนเผยแพร่':'Curated stories from multiple sources, with references for every article.',
'หุ่นยนต์ครับ รวบรวมข่าวหุ่นยนต์และระบบอัตโนมัติจากทั่วโลก แล้วสรุปเป็นภาษาไทยเพื่อให้ติดตามเทคโนโลยีได้ง่ายขึ้น':'Robot News brings together robotics and automation stories from around the world, with accessible summaries to help you follow the technology.',
'คัดข่าวจากหลายแหล่ง ตรวจสอบข้อมูลและเรียบเรียงสรุปภาษาไทย พร้อมภาพ วิดีโอ และลิงก์ต้นฉบับ':'We select and check stories from multiple sources, with detailed summaries, images, videos and links to the originals.',
'โครงสร้างได้รับแรงบันดาลใจจาก Robot News เว็บไซต์นี้เป็นต้นแบบแยกต่างหาก ไม่ใช่เว็บไซต์ทางการของ Robot News':'The layout is inspired by Robot News. This is an independent website and is not affiliated with the original Robot News site.',
'ภาพและวิดีโอเป็นของเจ้าของสื่อตามเครดิตต้นฉบับ รวบรวมเฉพาะสื่อในเนื้อหาข่าว ไม่รวมโฆษณาและข่าวแนะนำ':'Images and videos belong to their credited owners. This collection includes media from the article, excluding advertisements and related-story previews.',
'ไม่พบภาพประกอบหรือวิดีโอในเนื้อหาข่าวต้นฉบับที่ตรวจสอบ':'No editorial images or videos were found in the source article reviewed.',
'รูปนี้โหลดไม่ได้ในขณะนี้ เปิดดูภาพขนาดเต็มจากลิงก์ด้านล่างได้':'This image is currently unavailable. Try the original image link below.',
'ไม่สามารถเล่นวิดีโอนี้ได้ กรุณาเปิดวิดีโอต้นฉบับด้านล่าง':'This video could not be played. Please open the original video below.',
'เปิดวิดีโอจากเว็บไซต์เจ้าของสื่อได้ที่ลิงก์ด้านล่าง':'Open this video on its original website using the link below.',
'ค้นหาข่าว เทคโนโลยี หรือบริษัทที่คุณสนใจ...':'Search news, technologies or companies...',
'ชุดข่าวนี้รวบรวมและสรุปจาก ':'This collection features reporting from ',
'แหล่ง ทุกข่าวมีลิงก์กลับไปยังบทความต้นฉบับ':'sources. Every story links back to the original article.',
'ลองใช้คำค้นอื่น หรือเลือกแหล่งข่าวและหมวดหมู่ใหม่':'Try another search term, source or category.',
'ไม่พบข่าวที่ตรงกับการค้นหา':'No matching stories',
'ลิงก์ข่าวสำหรับคัดลอก':'Article link to copy',
'เลือกและคัดลอกลิงก์ด้านล่าง':'Select and copy the link below',
'คัดลอกลิงก์ข่าวแล้ว':'Article link copied',
'คัดลอกลิงก์ข่าว ':'Copy article link: ',
'สรุปภาษาไทยจากแหล่งข่าวต้นฉบับ':'Summaries with original sources',
'เบราว์เซอร์นี้ไม่รองรับวิดีโอ':'Your browser does not support this video.',
'หากเล่นไม่ได้ ให้เปิดจากแหล่งที่มา':'If playback fails, open the source link.',
'โลกของหุ่นยนต์ ใกล้คุณมากขึ้น':'A closer look at the world of robotics',
'อ่านข่าวโลก ในภาษาของเรา':'Global stories, clearly explained',
'เรื่องหุ่นยนต์ ที่อ่านรู้เรื่อง':'Robotics, clearly explained',
'ข่าว เทคโนโลยี และอนาคต':'News, technology and the future',
'หุ่นยนต์ฮิวแมนนอยด์':'Humanoids','หุ่นยนต์อุตสาหกรรม':'Industrial robots','AI และระบบอัตโนมัติ':'AI & automation',
'ข่าวทั้งหมด':'All news','งานวิจัย':'Research','โดรน':'Drones','ข่าววงการ':'Industry news',
'อ่านข่าวฉบับละเอียด':'Read full story','เรียบเรียงสรุปภาษาไทย':'English editorial summary','สรุปภาษาไทย':'English summary',
'แหล่งข่าวของเรา':'Our sources','ทุกแหล่งข่าว':'All sources','แหล่งข่าว':'Sources','เกี่ยวกับเรา':'About',
'ข้ามไปยังข่าว':'Skip to news','ข้ามไปเนื้อหาข่าว':'Skip to article','เมนูหลัก':'Main navigation','เปลี่ยนโหมดสี':'Toggle colour theme',
'ข่าวหุ่นยนต์':'Robotics news','ข่าวล่าสุด':'Latest news','ล่าสุด':'Latest','ฉบับวันที่ ':'Updated ',
'20 กันยายน 2569':'20 September 2026','ค้นหาและกรองข่าว':'Search and filter news','ค้นหาข่าว':'Search news',
'สำรวจตามหมวดหมู่':'Explore by category','หมวดหมู่ข่าว':'News categories','เรียงข่าว':'Sort news','ใหม่ล่าสุด':'Newest first','เก่าสุดก่อน':'Oldest first',
'คัดลอกลิงก์ ⧉':'Copy link ⧉','ล้างตัวกรอง':'Clear filters','ก่อนหน้า':'Previous','ถัดไป':'Next','ลิงก์ข่าว':'Article link',
'กลับขึ้นด้านบน':'Back to top','ปิดหน้าต่าง':'Close dialog','กลับหน้าข่าว':'Back to news','กลับไปดูข่าว':'More news: ',
'เปิดภาพขนาดเต็ม':'Open full-size image','เปิดภาพ ':'Open image ','ขนาดเต็ม':'at full size','ภาพประกอบที่ ':'Image ',
'ภาพประกอบจาก ':'Image from ','เล่นวิดีโอ':'Play video','เปิดวิดีโอต้นฉบับ':'Open original video','วิดีโอจากข่าวต้นฉบับ':'Videos from the source article',
'ภาพประกอบเพิ่มเติม':'More images','แหล่งอ้างอิง':'Sources and credits','เรียบเรียงสรุปจาก ':'Based on reporting by ',
'อ่านบทความต้นฉบับ':'Read the original article','ในบทความนี้':'In this article','บันทึกข่าว ':'Archived ',
'เนื้อหาข่าว':'Story','รูปภาพ':'Images','วิดีโอ':'Videos','บทความ':'articles','คลิป':'videos','ภาพ':'images',
'หุ่นยนต์ครับ':'Robot News','ภาษาไทย':'English','อ่านข่าว':'Read story','อ่าน ':'Read '
};
const entries=Object.entries(ui).sort((a,b)=>b[0].length-a[0].length);
export function localizeEnglish(text){
 for(const [th,en] of entries)text=text.replaceAll(th,en);
 text=text.replaceAll('th-TH','en-GB').replaceAll('lang="th"','lang="en"');
 if(/[ก-๙]/u.test(text))throw new Error('Untranslated English interface: '+text.match(/.{0,25}[ก-๙].{0,50}/u)?.[0]);
 return text;
}
export function englishStory(article,media,en){
 const fail=message=>{throw new Error('English translation '+article.id+': '+message)};
 if(!en||typeof en.title!=='string'||en.title.length<10||typeof en.summary!=='string'||en.summary.length<20)fail('missing title/summary');
 if(!Array.isArray(en.sections)||en.sections.length<3||!en.sections.every(s=>s.heading&&Array.isArray(s.paragraphs)&&s.paragraphs.every(p=>typeof p==='string')&&s.paragraphs.join('').length>100))fail('incomplete sections');
 for(const kind of ['images','videos']){
  if(!Array.isArray(en[kind])||en[kind].length!==media[kind].length)fail('missing '+kind);
  if(!en[kind].every((m,i)=>m.url===media[kind][i].url))fail('media URL/order mismatch');
 }
 if(!en.images.every(m=>typeof m.alt==='string'&&m.alt.length>0&&typeof m.caption==='string'&&m.caption.length>0)||!en.videos.every((m,i)=>typeof m.title==='string'&&m.title.length>0&&(media.videos[i].kind!=='link'||typeof m.note==='string'&&m.note.length>5)))fail('missing media text');
 if(/[ก-๙]/u.test(JSON.stringify(en)))fail('contains Thai text');
 // Only overlay editorial text. Playback URLs, embeds and local assets stay shared.
 return {article:{...article,title:en.title,summary:en.summary},detail:{sections:en.sections},media:{images:media.images.map((m,i)=>({...m,alt:en.images[i].alt,caption:en.images[i].caption})),videos:media.videos.map((m,i)=>({...m,title:en.videos[i].title,note:en.videos[i].note||''}))}};
}
export function languageLinks(html,id,language='th'){
 const th=id?`/articles/${id}.html`:'/',en=id?`/en/articles/${id}.html`:'/en/';
 const alternate=`<link rel="alternate" hreflang="th" href="${th}"><link rel="alternate" hreflang="en" href="${en}">`;
 const toggle=`<a class="language-switch" href="${language==='en'?th:en}" lang="${language==='en'?'th':'en'}" aria-label="${language==='en'?'Switch to Thai':'Switch to English'}">${language==='en'?'TH':'EN'}</a>`;
 return html.replace('</head>',alternate+'</head>').replace('<button class="theme"',toggle+'<button class="theme"');
}
export async function buildEnglish(articles,media,articlePage){
 const all=JSON.parse(await readFile('content/english.json','utf8'));
 await mkdir('dist/en/articles',{recursive:true});
 const list=[];
 for(const a of articles){const x=englishStory(a,media[a.id],all[a.id]);list.push(x.article);let html=localizeEnglish(articlePage(x.article,x.detail,x.media,'en-GB')).replaceAll('href="/?','href="/en/?').replaceAll('href="/"','href="/en/"').replace('src="/article.js"','src="/en/article.js"');await writeFile(`dist/en/articles/${a.id}.html`,languageLinks(html,a.id,'en'))}
 let home=await readFile('dist/index.html','utf8');
 // Thai homepage already includes alternate links and switch; rebuild those after translation.
 home=home.replace(/<link rel="alternate"[^>]*>/g,'').replace(/<a class="language-switch"[^>]*>.*?<\/a>/g,'');
 home=localizeEnglish(home).replaceAll('href="/"','href="/en/"').replace('src="/app.js"','src="/en/app.js"').replace('src="/news-data.js"','src="/en/news-data.js"').replace('© 2569','© 2026');
 home=home.replace('Robotics news<span>Latest</span>','Latest<span>robotics news</span>');
 await writeFile('dist/en/index.html',languageLinks(home,null,'en'));
 const app=localizeEnglish(await readFile('dist/app.js','utf8')).replaceAll("'/articles/'","'/en/articles/'");
 await writeFile('dist/en/app.js',app);
 await writeFile('dist/en/article.js',localizeEnglish(await readFile('dist/article.js','utf8')));
 const updated=articles.map(a=>a.addedAt||a.date+'T12:00:00Z').sort().at(-1);
 await writeFile('dist/en/news-data.js','window.ROBOT_NEWS_ARTICLES = '+JSON.stringify(list).replace(/</g,'\\u003c')+';\nwindow.ROBOT_NEWS_UPDATED_AT = '+JSON.stringify(updated)+';\n');
}
