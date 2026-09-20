import {englishStory} from './english.mjs';
import {readFile,writeFile,rename,mkdir,open,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const categories=new Set(['industrial-robots','humanoids','ai-automation','research','drones','industry-news']);
const requireThat=(condition,message)=>{if(!condition)throw new Error(message)};
const normalizedTitle=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
export function canonicalUrl(value){const u=new URL(value);requireThat(['http:','https:'].includes(u.protocol),'Invalid source URL');u.protocol='https:';u.hostname=u.hostname.replace(/^www\./,'');u.hash='';u.pathname=u.pathname.replace(/\/+$/,'')||'/';for(const k of [...u.searchParams.keys()])if(/^(utm_|fbclid$|gclid$|mc_|ref$|referrer$)/i.test(k))u.searchParams.delete(k);u.searchParams.sort();return u.href}
function https(value){try{return new URL(value).protocol==='https:'}catch{return false}}
export function validateBatch(batch,state,now=new Date()){
 requireThat(/^\d{4}-\d{2}-\d{2}(?:-[a-z0-9]+)?$/.test(batch.runId||''),'Invalid runId');
 requireThat(Array.isArray(batch.items)&&batch.items.length===10,'A batch must contain exactly 10 new articles');
 const asOf=Date.parse(batch.asOf);requireThat(Number.isFinite(asOf)&&Math.abs(now-asOf)<=24*3600000,'Batch asOf must be within 24 hours of this run');
 const seenIds=new Set(state.articles.map(a=>a.id)),urls=new Set(),titles=new Set(),keys=new Set();
 for(const a of state.articles){urls.add(canonicalUrl(a.url));titles.add(normalizedTitle(a.title))}
 for(const s of state.history.stories){keys.add(s.storyKey);if(s.originalTitle)titles.add(normalizedTitle(s.originalTitle));for(const u of s.urls||[])urls.add(canonicalUrl(u))}
 const sources=new Map();
 for(const item of batch.items){
  const {article:a,detail:d,media:m,editorial:r}=item;
  requireThat(a&&d&&m&&r,'Missing article/detail/media/editorial');
  requireThat(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.id)&&a.id.length<=100,'Invalid article id');
  requireThat(!seenIds.has(a.id),'Duplicate article id: '+a.id);seenIds.add(a.id);
  requireThat(categories.has(a.category),'Invalid category: '+a.id);
  requireThat(typeof a.title==='string'&&/[ก-๙]/.test(a.title)&&typeof a.summary==='string'&&a.summary.length>=20,'Missing Thai title/summary: '+a.id);
  requireThat(typeof a.source==='string'&&a.source.length>0&&https(a.url),'Invalid source: '+a.id);
  requireThat(!a.image||https(a.image)||/^\/assets\/[\w./-]+$/.test(a.image)&&!a.image.includes('..'),'Invalid image URL');
  requireThat(/^\d{4}-\d{2}-\d{2}$/.test(a.date)&&!isNaN(Date.parse(a.date)),'Invalid date');
  const pub=Date.parse(r.publishedAt);requireThat(Number.isFinite(pub),'Missing verified publication timestamp');
  requireThat(pub<=now.getTime()+300000,'Future publication date');requireThat(now-pub<=72*3600000,'Story is not fresh (72-hour limit)');
  requireThat(Math.abs(Date.parse(a.date)-pub)<48*3600000,'Article date disagrees with publication timestamp');
  requireThat(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.storyKey||''),'Missing stable storyKey');
  requireThat(!keys.has(r.storyKey),'Duplicate underlying story: '+r.storyKey);keys.add(r.storyKey);
  requireThat(r.duplicateReviewed===true&&r.mediaReviewed===true,'Editorial duplicate/media review is required');
  requireThat(typeof r.originalTitle==='string'&&r.originalTitle.length>5&&typeof r.reason==='string'&&r.reason.length>10&&Number.isInteger(r.score)&&r.score>=13&&r.score<=20,'Missing editorial selection evidence');
  const itemTitles=[normalizedTitle(a.title),normalizedTitle(r.originalTitle)];
  for(const t of itemTitles)requireThat(!titles.has(t),'Duplicate headline: '+a.id);
  itemTitles.forEach(t=>titles.add(t));
  requireThat(Array.isArray(r.sourceUrls)&&r.sourceUrls.length>0&&r.sourceUrls.every(https),'Missing source references');
  requireThat(!r.identityUrls||Array.isArray(r.identityUrls)&&r.identityUrls.every(https),'Invalid identity URLs');
  const itemUrls=new Set([a.url,...(r.identityUrls||[])].map(canonicalUrl));
  for(const u of itemUrls)requireThat(!urls.has(u),'Duplicate source URL: '+u);
  itemUrls.forEach(u=>urls.add(u));
  requireThat(Array.isArray(d.sections)&&d.sections.length>=3&&d.sections.every(s=>typeof s.heading==='string'&&s.heading.length>0&&Array.isArray(s.paragraphs)&&s.paragraphs.every(p=>typeof p==='string')&&s.paragraphs.join('').length>100),'Insufficient detailed content: '+a.id);
  requireThat(Array.isArray(m.images)&&Array.isArray(m.videos),'Missing media inventory');
  requireThat(m.images.every(i=>https(i.url)&&typeof i.alt==='string'&&typeof i.caption==='string'&&(!i.local||/^\/assets\/[\w./-]+$/.test(i.local)&&!i.local.includes('..'))),'Invalid image record');
  for(const v of m.videos){requireThat(['youtube','video','link'].includes(v.kind)&&https(v.url)&&typeof v.title==='string'&&(!v.poster||https(v.poster))&&(!v.sourceUrl||https(v.sourceUrl)),'Invalid video record');if(v.kind==='youtube')requireThat(/^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}$/.test(v.embed||''),'Invalid video embed');if(v.kind==='link')requireThat(typeof v.note==='string'&&v.note.length>5,'Missing inaccessible-video explanation')}
  requireThat(Array.isArray(r.discoveredImages)&&Array.isArray(r.discoveredVideos)&&Array.isArray(r.excludedMedia),'Missing media audit');
  const includedImages=new Set(m.images.map(i=>canonicalUrl(i.url))),includedVideos=new Set(m.videos.flatMap(v=>[v.url,v.sourceUrl].filter(Boolean)).map(canonicalUrl));
  const exclusions=new Set();for(const x of r.excludedMedia){requireThat(https(x.url)&&['advertisement','related-story','avatar','duplicate','tracking','site-decoration'].includes(x.reason),'Invalid media exclusion');exclusions.add(canonicalUrl(x.url))}
  for(const [list,included] of [[r.discoveredImages,includedImages],[r.discoveredVideos,includedVideos]])for(const u of list)requireThat(https(u)&&(included.has(canonicalUrl(u))||exclusions.has(canonicalUrl(u))),'Discovered media is missing from article: '+u);
  englishStory(a,m,item.english);
  const host=new URL(canonicalUrl(a.url)).hostname;sources.set(host,(sources.get(host)||0)+1);
 }
 requireThat(sources.size>=3&&[...sources.values()].every(n=>n<=4),'Use at least 3 independent source domains, at most 4 stories each');
 return batch.items;
}
export async function loadState(root='.'){
 const read=async file=>JSON.parse(await readFile(path.join(root,'content',file),'utf8'));
 return {articles:await read('articles.json'),details:await read('details.json'),media:await read('media.json'),history:await read('news-history.json'),english:await read('english.json')};
}
export const batchHash=batch=>createHash('sha256').update(JSON.stringify(batch)).digest('hex');
export function planBatch(batch,state,now=new Date()){
 const hash=batchHash(batch),previous=state.history.runs.find(r=>r.runId===batch.runId);
 if(previous){requireThat(previous.batchHash===hash,'Run ID already exists with different content; reconcile publication before selecting another batch');return {alreadyApplied:true,run:previous}}
 validateBatch(batch,state,now);
 const next=structuredClone(state),record={runId:batch.runId,batchHash:hash,preparedAt:now.toISOString(),articleIds:batch.items.map(i=>i.article.id)};
 for(const {article,detail,media,editorial,english} of batch.items){const a={...article,addedAt:record.preparedAt};next.articles.push(a);next.details[a.id]=detail;next.media[a.id]=media;next.english[a.id]=english;next.history.stories.push({id:a.id,storyKey:editorial.storyKey,originalTitle:editorial.originalTitle,urls:[...new Set([a.url,...(editorial.identityUrls||[])])],references:editorial.sourceUrls,publishedAt:editorial.publishedAt,addedAt:a.addedAt,runId:batch.runId,reason:editorial.reason,score:editorial.score,mediaAudit:{images:media.images.length,videos:media.videos.length,excluded:editorial.excludedMedia}})}
 next.history.runs.push(record);return {alreadyApplied:false,next,run:record};
}
export async function applyBatch(batch,root='.',now=new Date()){
 const dir=path.join(root,'.news-work');await mkdir(dir,{recursive:true});const lock=path.join(dir,'import.lock');const handle=await open(lock,'wx');
 const originals=new Map();
 try{const state=await loadState(root),plan=planBatch(batch,state,now);if(plan.alreadyApplied)return plan;
  const files={'articles.json':plan.next.articles,'details.json':plan.next.details,'media.json':plan.next.media,'news-history.json':plan.next.history,'english.json':plan.next.english};
  for(const [name,value] of Object.entries(files)){const target=path.join(root,'content',name);originals.set(target,await readFile(target));await writeFile(target+'.tmp',JSON.stringify(value,null,2)+'\n');await rename(target+'.tmp',target)}
  return {alreadyApplied:false,run:plan.run};
 }catch(error){for(const [target,bytes] of originals)await writeFile(target,bytes);throw error}finally{await handle.close();await unlink(lock)}
}
async function cli(){const [command,file]=process.argv.slice(2);if(command==='history'){const state=await loadState();console.log(JSON.stringify({runs:state.history.runs,stories:state.history.stories},null,2));return}requireThat(['check','apply'].includes(command)&&file,'Usage: node scripts/news-batch.mjs check|apply batch.json OR history');const batch=JSON.parse(await readFile(file,'utf8'));const result=command==='apply'?await applyBatch(batch):planBatch(batch,await loadState());console.log(JSON.stringify({status:result.alreadyApplied?'already-applied':command==='apply'?'applied':'valid',run:result.run},null,2))}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)cli().catch(e=>{console.error(e.message);process.exitCode=1});
