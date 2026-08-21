import { createLayer } from './create-layer';
import { syncActiveLayer } from './sync-active-layer';
import type { SerializedProject } from './serialize-project';
import type { DrawingContext } from '../models/drawing-context';
import type { Layer } from '../models/layer';

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load layer image.'));
    image.src = dataUrl;
  });
}

export async function deserializeProject(
  file: File,
  drawingContext: DrawingContext,
): Promise<void> {
  const project = JSON.parse(await file.text()) as SerializedProject;
  const { canvas, previewCanvas } = drawingContext;
  if (!canvas || !previewCanvas) {
    return;
  }

  canvas.width = previewCanvas.width = project.width;
  canvas.height = previewCanvas.height = project.height;

  const layers: Layer[] = await Promise.all(
    project.layers.map(async (serializedLayer) => {
      const layer = createLayer(
        project.width,
        project.height,
        serializedLayer.name,
      );
      layer.id = serializedLayer.id;
      layer.visible = serializedLayer.visible;
      layer.locked = serializedLayer.locked;
      layer.opacity = serializedLayer.opacity;
      const image = await loadImage(serializedLayer.dataUrl);
      layer.context.drawImage(image, 0, 0);
      return layer;
    }),
  );

  drawingContext.layers = layers;
  drawingContext.activeLayerIndex = Math.min(
    project.activeLayerIndex,
    layers.length - 1,
  );
  syncActiveLayer(drawingContext);
  drawingContext.history?.clear();
  drawingContext.history?.commit();
}
