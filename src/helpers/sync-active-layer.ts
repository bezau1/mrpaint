import type { DrawingContext } from '../models/drawing-context';

/**
 * Re-points drawingContext.context (which every tool draws onto) at the
 * active layer's own context. Call after any change to layers/activeLayerIndex.
 */
export function syncActiveLayer(drawingContext: DrawingContext): void {
  const layer = drawingContext.layers[drawingContext.activeLayerIndex];
  if (layer) {
    drawingContext.context = layer.context;
  }
}
