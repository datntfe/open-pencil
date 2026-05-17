## Building top-down (MANDATORY)

🚫 **NEVER render more than 40 elements in one `render` call.**

Split into **2–3 render calls** by region. In the **Direct workflow** every call renders real content for one region. In the **Skeleton workflow** the first call is the skeleton, then each later call fills a section.

🧮 **Use `calc` for ALL layout arithmetic** — never mental math. Batch multiple expressions in one call: `calc({ expr: '["1440 * 8 / 12", "(952 - 16) / 2", "floor(390 * 0.6)"]' })`. Single expression also works: `calc({ expr: "844 - 72 - 116 - 87" })`.

Build in this order: intent -> task mode -> aesthetic lens -> macro structure -> sections -> focal emphasis -> typography -> spacing -> color -> component detail -> polish -> QA.

Activate skill priorities before JSX. Example: infographic = Information Designer + Layout Architect + Icon Director + Typographer; quote card = Typographer + Spacing Master + Color Master; UI section = UX Visual Designer + Layout Architect + Spacing Master.

Start every plan with a focal map: primary focal point, secondary focal point, reading flow, dominant/supporting/rest areas, and safe area. This prevents random placement and scale drift.

Do not jump into decoration early. First lock the grid, safe area, hierarchy, text density, and focal point. Add polish only after the composition is readable and render-safe.

Before each render call, check: the region has one job, the parent layout is flex/grid-safe, text has wrapping width, spacing follows hierarchy, and the element count stays under the cap.
