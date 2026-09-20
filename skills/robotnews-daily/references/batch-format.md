# Batch JSON contract

See `scripts/news-batch.mjs` for executable validation. This structure illustrates **one item**; a real batch must contain exactly ten genuine researched items. Example values are placeholders and must never be published.

```json
{
  "runId": "YYYY-MM-DD",
  "asOf": "CURRENT-ISO-TIMESTAMP",
  "items": [{
    "article": {
      "id": "company-product-event-yyyymmdd",
      "category": "industrial-robots",
      "title": "ชื่อข่าวภาษาไทย",
      "summary": "สรุปสาระสำคัญภาษาไทยอย่างน้อย 20 ตัวอักษร",
      "source": "Publisher name",
      "date": "YYYY-MM-DD",
      "url": "https://publisher.example/article",
      "image": ""
    },
    "detail": {"sections": [
      {"heading": "เกิดอะไรขึ้น", "paragraphs": ["ข้อความจริงที่เรียบเรียงใหม่ รวมมากกว่า 100 ตัวอักษรต่อหัวข้อ"]},
      {"heading": "ทำงานอย่างไร", "paragraphs": ["รายละเอียดที่ตรวจสอบแล้ว รวมมากกว่า 100 ตัวอักษรต่อหัวข้อ"]},
      {"heading": "ผลกระทบและข้อจำกัด", "paragraphs": ["รายละเอียดที่ตรวจสอบแล้ว รวมมากกว่า 100 ตัวอักษรต่อหัวข้อ"]}
    ]},
    "media": {"images": [], "videos": []},
    "editorial": {
      "storyKey": "company-product-specific-event-year",
      "originalTitle": "Actual original headline",
      "publishedAt": "VERIFIED-ISO-TIMESTAMP",
      "reason": "เหตุผลที่ข่าวน่าสนใจพร้อมหลักฐาน",
      "score": 17,
      "sourceUrls": ["https://publisher.example/article"],
      "duplicateReviewed": true,
      "mediaReviewed": true,
      "discoveredImages": [],
      "discoveredVideos": [],
      "excludedMedia": []
    }
  }]
}
```

Categories: `industrial-robots`, `humanoids`, `ai-automation`, `research`, `drones`, `industry-news`.

Image record: `{"url":"https://…/original.jpg","alt":"คำบรรยายภาษาไทย","caption":"คำบรรยาย · ภาพ: เจ้าของภาพ"}`. Optional `local` is `/assets/filename.jpg`; retain original url for attribution/audit. The article cover `image` may be a valid HTTPS image, an existing `/assets/` path, or empty.

Video records:
- YouTube: `{"kind":"youtube","url":"https://www.youtube.com/watch?v=VIDEO_ID","embed":"https://www.youtube-nocookie.com/embed/VIDEO_ID","title":"คำอธิบาย"}`; ID must be 11 characters.
- Native: `{"kind":"video","url":"https://…/clip.mp4","title":"คำอธิบาย","poster":"https://…/poster.jpg"}` (poster optional).
- Other/inaccessible: `{"kind":"link","url":"https://…/player-or-source","title":"คำอธิบาย","note":"เปิดชมบนเว็บไซต์ต้นฉบับ เนื่องจากไม่อนุญาตให้ฝัง"}`.
- Optional `sourceUrl` preserves the source embed URL when different from the usable video URL.

List every discovered editorial asset in discoveredImages/discoveredVideos. Match video variants through sourceUrl and image resolutions by choosing the authoritative asset; record discarded resolutions as duplicate. Exclusions are objects `{"url":"https://…","reason":"duplicate"}` with reason one of `advertisement`, `related-story`, `avatar`, `duplicate`, `tracking`, `site-decoration`. Blocked editorial media is not a valid exclusion.

All dates and media must be verified, all URLs HTTPS. Selection requires three independent publishers, at most four items each. Mechanical hostname validation is only a baseline; editorially check publisher independence. Keep original full media evidence in the ignored draft; history preserves included counts and exclusions. Generated homepage data comes from content/articles.json; never hand-edit dist/news-data.js or add news directly to app.js.

`sourceUrls` contains supporting references; two distinct developments may cite the same paper. Optional `identityUrls` lists canonical aliases/syndicated pages about this exact event and participates in URL deduplication. The primary article URL always participates. Do not put general supporting references in identityUrls.

For an inaccessible image retain its original `url`, descriptive `alt`, and write the access limitation plus credit in `caption`. The renderer always provides a visible caption and a direct source link, even if the image cannot load. Use an empty article cover if no usable cover is available. This is a reference fallback, not a claim that the image was successfully displayed.
