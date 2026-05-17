# Example: desktop business news site

User prompt: "business media desktop site with real images, 12-col grid, 8 cols main, 4 cols sidebar, breaking news, hero, stories, opinions, sidebar news + stocks + newsletter, footer"

This is a **desktop media site** (1440px wide, scrollable) — light theme, 12-col grid, card-based layout.

**Step 1** — calc all grid dimensions in one batch:

```
calc({ expr: '["1440 - 48 - 48 - 24", "floor((1320) * 8 / 12)", "floor((1320) * 4 / 12)"]' })
```

→ Content area 1320px, Main 880px, Sidebar 440px.

**Step 2** — Skeleton render (entire page with gray placeholders):

```jsx
<Frame name="BusinessMediaSite" w={1440} h="hug" bg="#F5F5F0" flex="col">
  {/* NavBar — real content */}
  <Frame
    name="NavBar"
    w="fill"
    h={56}
    bg="#0F1923"
    flex="row"
    items="center"
    justify="between"
    px={48}
  >
    <Frame name="NavLeft" flex="row" gap={32} items="center">
      <Text name="Logo" color="#FFFFFF" size={22} weight="bold" font="Playfair Display">
        THE MARKETS
      </Text>
      <Frame name="NavLinks" flex="row" gap={24} items="center">
        <Text color="#FFFFFFCC" size={14} weight="medium">
          Markets
        </Text>
        <Text color="#FFFFFFCC" size={14} weight="medium">
          Economy
        </Text>
        <Text color="#FFFFFFCC" size={14} weight="medium">
          Technology
        </Text>
      </Frame>
    </Frame>
    <Frame name="NavRight" flex="row" gap={16} items="center">
      <Icon name="lucide:search" size={18} color="#FFFFFFCC" />
      <Frame name="SubscribeBtn" h={32} px={16} bg="#D4382C" rounded={4} flex="row" items="center">
        <Text color="#FFFFFF" size={13} weight="bold">
          Subscribe
        </Text>
      </Frame>
    </Frame>
  </Frame>

  {/* Breaking News — real content */}
  <Frame
    name="BreakingNewsTicker"
    w="fill"
    h={40}
    bg="#D4382C"
    flex="row"
    items="center"
    px={48}
    gap={16}
  >
    <Frame bg="#FFFFFF" px={12} py={4} rounded={2} flex="row" items="center">
      <Text color="#D4382C" size={11} weight="bold" textCase="upper">
        BREAKING
      </Text>
    </Frame>
    <Text color="#FFFFFF" size={13} weight="medium">
      Fed signals rate cut — S&P 500 hits record
    </Text>
  </Frame>

  {/* Content area with skeleton placeholders */}
  <Frame name="ContentArea" w="fill" flex="row" px={48} py={32} gap={24}>
    <Frame name="MainColumn" w={880} flex="col" gap={32}>
      {/* Hero skeleton */}
      <Frame name="HeroArticle" w="fill" flex="col" bg="#FFFFFF" rounded={8} overflow="hidden">
        <Rectangle name="HeroImg" w="fill" h={420} bg="#E2E8F0" />
        <Frame w="fill" flex="col" gap={12} p={24}>
          <Rectangle w={100} h={14} bg="#D4382C" rounded={4} />
          <Rectangle w="fill" h={32} bg="#CBD5E1" rounded={4} />
          <Rectangle w={600} h={32} bg="#CBD5E1" rounded={4} />
          <Rectangle w={200} h={14} bg="#E2E8F0" rounded={4} />
        </Frame>
      </Frame>
      {/* Stories skeleton */}
      <Frame name="StoriesSection" w="fill" flex="col" gap={20}>
        <Rectangle w={120} h={24} bg="#CBD5E1" rounded={4} />
        <Frame w="fill" flex="row" gap={20}>
          <Frame name="StoryMain" w={440} flex="col" bg="#FFFFFF" rounded={8} overflow="hidden">
            <Rectangle name="StoryMainImg" w="fill" h={240} bg="#E2E8F0" />
            <Frame w="fill" flex="col" gap={8} p={16}>
              <Rectangle w={80} h={12} bg="#CBD5E1" rounded={4} />
              <Rectangle w="fill" h={20} bg="#CBD5E1" rounded={4} />
            </Frame>
          </Frame>
          <Frame w={420} flex="col" gap={16}>
            {Array.from({ length: 3 }, (_, i) => (
              <Frame
                name={`StoryCard${i + 1}`}
                key={i}
                w="fill"
                flex="row"
                bg="#FFFFFF"
                rounded={8}
                overflow="hidden"
                h={120}
              >
                <Rectangle name={`StoryCardImg${i + 1}`} w={160} h="fill" bg="#E2E8F0" />
                <Frame w="fill" flex="col" gap={6} p={12}>
                  <Rectangle w={60} h={10} bg="#CBD5E1" rounded={4} />
                  <Rectangle w="fill" h={16} bg="#CBD5E1" rounded={4} />
                </Frame>
              </Frame>
            ))}
          </Frame>
        </Frame>
      </Frame>
      {/* Opinions skeleton — same pattern */}
      <Frame name="OpinionsSection" w="fill" flex="col" gap={20}>
        {/* ... same structure as StoriesSection ... */}
      </Frame>
    </Frame>
    {/* Sidebar skeletons */}
    <Frame name="Sidebar" w={440} flex="col" gap={24}>
      <Frame name="LatestNewsBlock" w="fill" flex="col" bg="#FFFFFF" rounded={8} overflow="hidden">
        <Frame w="fill" h={48} bg="#0F1923" flex="row" items="center" px={16}>
          <Rectangle w={120} h={18} bg="#FFFFFF44" rounded={4} />
        </Frame>
        {Array.from({ length: 6 }, (_, i) => (
          <Frame key={i} w="fill" flex="row" gap={12} p={16}>
            <Rectangle w={80} h={60} bg="#E2E8F0" rounded={4} />
            <Frame w="fill" flex="col" gap={6}>
              <Rectangle w="fill" h={14} bg="#CBD5E1" rounded={4} />
              <Rectangle w={80} h={10} bg="#E2E8F0" rounded={4} />
            </Frame>
          </Frame>
        ))}
      </Frame>
      <Frame name="StocksWidget" w="fill" h={360} bg="#FFFFFF" rounded={8} />
      <Frame name="NewsletterBlock" w="fill" bg="#0F1923" rounded={8} p={24} gap={16}>
        <Rectangle w={200} h={22} bg="#FFFFFF22" rounded={4} />
        <Rectangle w="fill" h={44} bg="#D4382C" rounded={8} />
      </Frame>
    </Frame>
  </Frame>
  {/* Footer — real content */}
  <Frame name="Footer" w="fill" flex="col" bg="#0F1923" px={48} pt={48} pb={24} gap={32}>
    {/* ... footer columns ... */}
  </Frame>
</Frame>
```

**Step 3** — `describe` root depth=2, fix layout with `batch_update`.

**Steps 4–9** — Replace each skeleton with real content using `replace_id`:

```
render({ jsx: "<Frame name=\"HeroArticle\" ...real content...", replace_id: "0:25" })
render({ jsx: "<Frame name=\"StoriesSection\" ...real content...", replace_id: "0:33" })
render({ jsx: "<Frame name=\"OpinionsSection\" ...real content...", replace_id: "0:65" })
render({ jsx: "<Frame name=\"LatestNewsBlock\" ...real content...", replace_id: "0:98" })
render({ jsx: "<Frame name=\"StocksWidget\" ...real content...", replace_id: "0:138" })
render({ jsx: "<Frame name=\"NewsletterBlock\" ...real content...", replace_id: "0:162" })
```

**Step 10** — `describe` depth=2, `batch_update` fixes.

**Step 11** — `stock_photo` batch all image placeholders in one call:

```
stock_photo({ requests: '[{"id":"0:203","query":"federal reserve building"},{"id":"0:221","query":"apple silicon valley technology"},...]' })
```

**Step 12** — Final `describe` depth=1, viewport_zoom_to_fit.

Key patterns in this example:

- **h="hug" on page frame** — never fixed height, content determines page length
- **Skeleton first** — gray `#E2E8F0` / `#CBD5E1` placeholders show layout before content
- **replace_id** — skeleton stays visible until content replaces it atomically
- **Named all image placeholders** — `HeroImg`, `StoryMainImg`, `StoryCardImg1` etc. for stock_photo
- **12-col grid** — MainColumn w={880} + Sidebar w={440} + gap 24 + padding 48×2 = 1440
- **Card pattern**: white bg + rounded + overflow hidden + shadow. Image rectangle + text frame with padding.
- **Section header pattern**: row with title + "See all →" link, red accent bar `<Rectangle w={4} h={24} bg="#D4382C" />`
- **One batch stock_photo** — 17 images in parallel, not 17 sequential calls
- **Footer real content from skeleton** — simple enough to render once
- **Total: 1 calc + 1 skeleton + 6 replace renders + 1 stock_photo + 2 describes + fixes = ~15 steps**
