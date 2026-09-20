---
name: robotnews-daily
description: Curate and publish exactly 10 fresh, interesting robotics news stories in Thai and English to the robotnews website, with semantic deduplication, detailed original summaries, complete article-media inventories, and automatic GitHub push. Use when asked to update หุ่นยนต์ครับ, run daily robot news, fetch ten robot stories, or execute a scheduled robotnews update.
---

# Robotnews daily publishing

Publish to `https://github.com/phawitb/robotnews.git`, branch `main`; production is `https://robotnews.vercel.app/`. Invoking this skill authorizes the ordinary verified commit and push to this repository. Do not ask again. Honor an explicit draft-only/dry-run request by stopping before commit/push. Do not send social posts, create schedules, or change hosting/account settings. Scheduling is a separate user request.

## Establish a safe run

1. Locate the repository (usual local path `/Users/phawit/Documents/ChatGPT/Robot News 2`). Read applicable AGENTS.md, repository README, `content/{articles,details,media,news-history,english}.json`, and this skill's [batch contract](references/batch-format.md).
2. Verify origin is exactly this GitHub repository. Fetch main. Use a clean main checkout updated with `git pull --ff-only`; if the workspace has unrelated changes or diverged commits, clone remote main into a temporary directory and work there. Never discard user changes, force-push, or include unrelated files.
3. Use the current actual time, not a date copied from an example. Default runId is the calendar date in the runtime's configured timezone. Record that timezone in the final report. Use one run per day; suffixes require an explicit extra-run request. Before research, inspect the remote history ledger for that runId. If it already exists, verify its existing commit/deployment and report it; do not collect a second batch.
4. Keep candidates, raw HTML, media audits and batch JSON in ignored `.news-work/`. The import lock protects writes only, not the entire editorial run. Remote push rejection is the final concurrency guard.

## Discover and select

Read [sources and selection](references/sources.md). Use available Firecrawl search/scrape skills for discovery and extraction; if unavailable, use accessible search/browser/HTTP tools. Do not install paid services or expose credentials. Search broadly enough to compare at least 20 candidates when available. Prefer the preceding 24 hours; expand to 72 hours only if needed, and verify publication timestamps on the source. Never relabel old news as new or trust search-snippet dates alone.

Select exactly 10 distinct developments from at least 3 independent publishers, maximum 4 per publisher. Related subdomains do not count as independent publishers. Prioritize real robot deployments, useful technical advances, demonstrable products, manufacturing/logistics/healthcare applications and major research; include humanoids or drones when substantive. Score each candidate 0–5 for novelty, practical impact, evidence quality and relevance to Thai readers (total 20, minimum 13). Explain the reason in Thai. Avoid filler, evergreen advice and unsupported promotional claims.

Compare candidate URLs, normalized headlines, company/product/event/date and actual facts against **all** existing articles and history, plus the pending batch. Assign a stable English `storyKey` describing the underlying event. Different language, headline, tracking URL, syndication or source does not make a new story. Reuse an existing event key so the validator rejects it. A follow-up qualifies only for a material new development; explain the difference and link the prior coverage in the draft evidence. The validator cannot perform semantic review for you.

If fewer than 10 qualifying fresh stories remain after broadening sources, preserve drafts and report the shortfall. Do not publish a partial batch, silently relax freshness, or invent news.

## Write and audit every story

Read the actual source and relevant primary announcement, not only snippets. Write a substantial **original Thai synthesis**, usually 3–6 informative sections: what happened, how it works, applications, supporting numbers, limitations and availability as relevant. Preserve units, names, dates and attribution; distinguish demonstrated features from promises. Do not reproduce or closely translate entire copyrighted articles. Do not bypass paywalls. Skip sources that do not provide enough verifiable facts for a detailed story.

Inspect the article's rendered content and raw HTML, including lazy images, srcset, picture/source, video/source/poster, iframe, YouTube/Vimeo and social embeds. Follow in-article galleries or embeds when needed. Include **every distinct editorial image and video in the article**, with captions, alt text, credits and source URLs. Choose the largest valid version of each image; different resolutions count once. Exclude ads, related-story thumbnails, avatars, trackers and site decoration with an explicit audit reason. Do not mark an inaccessible editorial asset as excluded: retain its source reference and explain the access limitation. Never claim completeness without comparing the article against the inventory.

Use existing renderer formats: images, YouTube click-to-play, native video, or `kind: link` with a useful note for unsupported/blocked players. Resolve relative URLs and preserve original media source references. Download local images only when permitted; otherwise use supported source URLs and attribution. Do not strip watermarks, circumvent access controls, or proxy blocked videos. Zero media is valid only after checking the article. Do not fabricate a cover image.

**Do not run the legacy `extract-media.py` or `enrich-media.py` for daily updates:** they target the initial import and can overwrite existing inventories. Add only this batch via the importer.

## English edition

Publish every story in both Thai and English. Include `item.english` using the batch contract: an original English title, summary, at least three substantial sections, and localized text for every image and video. Translate the verified Thai synthesis faithfully, preserving qualifications, numbers and credits; do not introduce extra claims. The same story ID and shared media URLs power `/articles/<id>.html` and `/en/articles/<id>.html`. Both editions must be complete before publication; never fall back silently to Thai on `/en`.

## Validate, publish and verify

1. Prepare `.news-work/<runId>.json` using the batch contract. Set `duplicateReviewed` and `mediaReviewed` only after completing those reviews.
2. Run `npm run news:check -- .news-work/<runId>.json`, then `npm run news:apply -- .news-work/<runId>.json`. The importer requires exactly 10, freshness, source diversity, detailed text, no recorded duplicate, and a reconciled media inventory. Review the changed data and generated pages; validation flags are evidence of your review, not a substitute.
3. Run `npm run build` and `npm run check`. Check the Thai and English homepages and all ten detail pages in both languages locally, including images, players/fallbacks, Thai text, links, and mobile layout on representative pages. Ensure original news remains intact and the homepage dataset contains all ten new IDs. Fix errors before publishing.
4. Inspect `git diff --check`, status and diff. Stage only this batch’s five content JSON files (including `content/english.json`), `dist/news-data.js`, `dist/en/news-data.js`, its ten Thai `dist/articles/<id>.html` and ten English `dist/en/articles/<id>.html` files and any intentionally added assets. Never stage credentials, caches, drafts or unrelated work. Commit as `news: publish <runId> (10 stories)` and `git push origin HEAD:main`.
5. If push rejects because remote main advanced, fetch and inspect its ledger. If this run is already there, use that run. Otherwise rebase/reconcile in a clean checkout, repeat dedupe and validation against the new state, rebuild and review; do not blindly resolve ledger conflicts or force-push.
6. Capture the pushed SHA. Verify GitHub's Vercel status for that SHA using `gh api repos/phawitb/robotnews/commits/<sha>/status`. Wait in bounded intervals (20–30 seconds, about 10 minutes total). Then fetch production `/news-data.js`, `/en/news-data.js`, `/en` and each new article URL in both languages, verifying actual IDs/titles and successful responses. A GitHub push alone is not deployment success. If Vercel fails or times out, report the exact state and available logs, preserving the published commit; don't publish another batch as a retry.

## Retry and recovery

The ledger records prepared batches, not deployment success. Identical batch+runId imports are no-ops even after the freshness window; a changed batch with the same runId is rejected. On restart always inspect remote main first, then local status and ledger. Recover the existing commit/run rather than starting over. An interrupted multi-file import may leave a lock or partial changes: inspect git diff and all five data files, restore only this run's uncommitted changes from its known clean base, then reapply the saved batch. Do not delete locks while another importer is active. Keep unrelated edits untouched.

Report in Thai: run date/timezone, 10 headlines or a compact linked list, source diversity, image/video totals and any unavailable media, commit link, and verified deployment URL/status. If blocked, state the exact stage and preserved draft location. Never say published when only prepared. No scheduled job is created by this skill itself.
