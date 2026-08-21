import type { DrawingContext } from '../models/drawing-context';

/**
 * Resizes every layer's canvas to the new document dimensions, preserving
 * existing pixels at (0,0). The bottom-most layer is backfilled with the
 * secondary color to match classic Paint's opaque-canvas behavior; other
 * layers stay transparent in the newly exposed area.
 */
export function resizeLayers(
  { canvas, previewCanvas, layers, colors }: DrawingContext,
  newWidth: number,
  newHeight: number,
): void {
  if (!canvas || !previewCanvas) {
    return;
  }

  layers.forEach((layer, index) => {
    const imageData = layer.context.getImageData(
      0,
      0,
      layer.canvas.width,
      layer.canvas.height,
    );
    layer.canvas.width = newWidth;
    layer.canvas.height = newHeight;

    if (index === 0) {
      layer.context.fillStyle = colors.secondary;
      layer.context.fillRect(0, 0, newWidth, newHeight);
    }

    layer.context.putImageData(imageData, 0, 0);
  });

  canvas.width = previewCanvas.width = newWidth;
  canvas.height = previewCanvas.height = newHeight;
}
