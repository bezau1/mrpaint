import { drawLayers } from './draw-layers';
import type { DrawingContext } from '../models/drawing-context';

/**
 * Composites all visible layers onto a throwaway canvas for export
 * (Save/Save As/Send), since PNG has no concept of layers.
 */
export function flattenLayers(
  drawingContext: DrawingContext,
): HTMLCanvasElement {
  const width = drawingContext.canvas?.width ?? 0;
  const height = drawingContext.canvas?.height ?? 0;

  const flattened = document.createElement('canvas');
  flattened.width = width;
  flattened.height = height;

  const context = flattened.getContext('2d');
  if (context) {
    drawLayers(context, drawingContext.layers, width, height);
  }

  return flattened;
}
