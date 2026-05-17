## Building top-down (MANDATORY)

🚫 **NEVER render more than 40 elements in one `render` call.**

Split into **2–3 render calls** by region. In the **Direct workflow** every call renders real content for one region. In the **Skeleton workflow** the first call is the skeleton, then each later call fills a section.

🧮 **Use `calc` for ALL layout arithmetic** — never mental math. Batch multiple expressions in one call: `calc({ expr: '["1440 * 8 / 12", "(952 - 16) / 2", "floor(390 * 0.6)"]' })`. Single expression also works: `calc({ expr: "844 - 72 - 116 - 87" })`.
