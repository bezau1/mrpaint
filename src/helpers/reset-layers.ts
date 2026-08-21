import { createLayer } from './create-layer';
import { syncActiveLayer } from './sync-active-layer';
import type { DrawingContext } from '../models/drawing-context';

/**
 * Replaces the layer stack with a single fresh layer, e.g. for New/Open,
 * where the previous layer structure no longer applies.
 */
export function resetLayers(
  drawingContext: DrawingContext,
  width: number,
  height: number,
): void {
  drawingContext.layers = [createLayer(width, height, 'Layer 1')];
  drawingContext.activeLayerIndex = 0;
  syncActiveLayer(drawingContext);
}
