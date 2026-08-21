import type { Layer } from '../models/layer';

/**
 * Draws visible layers (bottom to top, honoring opacity) onto the given
 * target context. Used both for live compositing onto the display canvas
 * and for flattening layers into a single export canvas.
 */
export function drawLayers(
  targetContext: CanvasRenderingContext2D,
  layers: Layer[],
  width: number,
  height: number,
): void {
  targetContext.clearRect(0, 0, width, height);
  const previousAlpha = targetContext.globalAlpha;

  for (const layer of layers) {
    if (!layer.visible) {
      continue;
    }
    targetContext.globalAlpha = layer.opacity;
    targetContext.drawImage(layer.canvas, 0, 0);
  }

  targetContext.globalAlpha = previousAlpha;
}
