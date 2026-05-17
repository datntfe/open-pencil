import type { Canvas, Paint } from 'canvaskit-wasm'

import type { SkiaRenderer } from '#core/canvas/renderer'

/** Screen-fixed dotted texture, in CSS pixels. */
const DOT_SPACING = 24
const DOT_DIAMETER = 2.2

function ensureDotGridPaint(r: SkiaRenderer): Paint {
  if (!r._dotGridPaint) {
    const paint = new r.ck.Paint()
    paint.setAntiAlias(true)
    paint.setStyle(r.ck.PaintStyle.Stroke)
    paint.setStrokeCap(r.ck.StrokeCap.Round)
    r._dotGridPaint = paint
  }
  return r._dotGridPaint
}

/**
 * Draws a screen-fixed dotted texture behind the scene — mirrors the AI Canvas
 * `.canvas-stage` look. Called right after the page-colour clear, before any
 * camera transform, so the dots stay pinned to the viewport (they do not pan
 * or zoom). Editor viewport only: raster export uses its own render path.
 */
export function drawCanvasDotGrid(r: SkiaRenderer, canvas: Canvas): void {
  const width = r.viewportWidth * r.dpr
  const height = r.viewportHeight * r.dpr
  if (width <= 0 || height <= 0) return

  const spacing = DOT_SPACING * r.dpr
  if (spacing <= 0) return

  const paint = ensureDotGridPaint(r)
  paint.setStrokeWidth(DOT_DIAMETER * r.dpr)
  // Keep the dots subtle whatever the page colour is.
  const luminance = 0.299 * r.pageColor.r + 0.587 * r.pageColor.g + 0.114 * r.pageColor.b
  paint.setColor(
    luminance > 0.5 ? r.ck.Color4f(0, 0, 0, 0.09) : r.ck.Color4f(1, 1, 1, 0.07)
  )

  const points: number[] = []
  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      points.push(x, y)
    }
  }
  if (points.length > 0) {
    canvas.drawPoints(r.ck.PointMode.Points, points, paint)
  }
}
