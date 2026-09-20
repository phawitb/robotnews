import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {articlePage,figure,video,safeUrl} from './build-articles.mjs';
const articles=JSON.parse(await readFile('content/articles.json','utf8'));
const details=JSON.parse(await readFile('content/details.json','utf8'));
const media=JSON.parse(await readFile('content/media.json','utf8'));
test('every article has meaningful detailed content and preserves all inventoried media',()=>{
 assert.ok(articles.length>=14);assert.equal(new Set(articles.map(a=>a.id)).size,articles.length);
 for(const a of articles){const d=details[a.id],m=media[a.id];assert.ok(d.sections.length>=3,a.id);assert.ok(d.sections.every(s=>s.paragraphs.join('').length>100),a.id);const html=articlePage(a,d,m);assert.ok(html.includes(a.title),a.id);assert.equal((html.match(/class="article-figure"/g)||[]).length,m.images.length,a.id);assert.equal((html.match(/class="video-card"/g)||[]).length,m.videos.length,a.id);assert.ok(html.includes('og:description'),a.id);assert.ok(html.includes('twitter:title'),a.id)}
});
test('media inventories distinguish galleries and multi-video articles',()=>{assert.equal(media.digit.images.length,2);assert.equal(media.digit.videos.length,5);assert.equal(media.hirebotics.videos.length,3);assert.equal(media.birotor.videos.length,14);assert.equal(media.cassie.images.length,3);assert.equal(media.marines.images.length,4);assert.equal(media.marines.videos.length,2);assert.equal(media.locus.images.length,0)});
test('unsafe URLs and markup cannot become executable embeds',()=>{assert.equal(safeUrl('javascript:alert(1)'),'');assert.equal(figure({url:'javascript:alert(1)'},'x',0),'');assert.equal(video({url:'data:text/html,<script>x</script>'},0),'');const v=video({url:'https://example.com/video',kind:'youtube',embed:'https://evil.example/iframe',title:'<script>alert(1)</script>'},0);assert.ok(!v.includes('data-embed='));assert.ok(!v.includes('<script>'));assert.ok(v.includes('&lt;script&gt;'))});
test('video embeds are user-initiated and have a source link',()=>{for(const m of Object.values(media))for(const v of m.videos){const h=video(v,0);assert.ok(h.includes('เปิดวิดีโอต้นฉบับ'));assert.ok(!h.includes('<iframe'));if(v.kind==='video')assert.ok(h.includes('preload="none"'))}});
