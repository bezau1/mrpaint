import { resetLayers } from './reset-layers';
import type { DrawingContext } from '../models/drawing-context';
import { getImageFromBlob } from './get-image-from-blob';

export async function loadFileAndAdjustCanvas(
  file: File,
  drawingContext: DrawingContext,
): Promise<void> {
  const { canvas, previewCanvas } = drawingContext;
  const image = await getImageFromBlob(file);
  if (canvas && previewCanvas) {
    canvas.width = previewCanvas.width = image.width;
    canvas.height = previewCanvas.height = image.height;

    resetLayers(drawingContext, image.width, image.height);
    const layer = drawingContext.layers[0];
    layer.context.fillStyle = 'white';
    layer.context.fillRect(0, 0, image.width, image.height);
    layer.context.drawImage(image, 0, 0);

    drawingContext.history?.clear();
    drawingContext.history?.commit();
  }
}
