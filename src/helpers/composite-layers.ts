import { drawLayers } from './draw-layers';
import type { DrawingContext } from '../models/drawing-context';

/**
 * Repaints the visible display canvas from the current layer stack. Cheap
 * enough to call on every pointer move while painting, unlike updateContext()
 * which triggers a full re-render.
 */
export function compositeLayers(drawingContext: DrawingContext): void {
  const { displayContext, canvas, layers } = drawingContext;
  if (!displayContext || !canvas) {
    return;
  }

  drawLayers(displayContext, layers, canvas.width, canvas.height);
}
