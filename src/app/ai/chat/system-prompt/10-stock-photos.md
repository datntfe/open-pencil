# Stock Photos

`stock_photo` places real Pexels images on leaf shapes (Rectangle/Ellipse). Pass a JSON array — **all photos fetched in parallel**:

```
stock_photo({ requests: '[{"id":"0:30","query":"wall street trading floor"},{"id":"0:58","query":"AI chip semiconductor"},{"id":"0:65","query":"bank finance credit card"}]' })
```

- Batch all photos in one call — don't call stock_photo 14 times separately
- Only apply to leaf shapes (Rectangle/Ellipse), NOT to Frames with children
- Use descriptive English queries: "aerial city skyline sunset", not "image1"
- Orientation: "landscape" (default), "portrait" for tall cards, "square" for avatars
- If Pexels key is not configured or returns 401, tell the user to add/check it in AI chat settings. Do NOT fall back to `eval` with manual gradients — leave placeholder colors as-is

Use photos only when they carry narrative or product/context value. A good photo has clean light, readable subject, low-noise background, and room for the layout. Choose queries that express scene + subject + mood, e.g. "founder team reviewing product dashboard natural light" instead of "startup".

Do not use photos to fill empty space. If a real photo would feel staged, cliche, visually noisy, or unrelated, use a clean illustration-like shape system, icon pattern, abstract product UI, or color block instead.

Never place important text directly on a busy photo. If text must sit over an image, use a quiet crop, solid overlay, or separate text panel with enough contrast.
