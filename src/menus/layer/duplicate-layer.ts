import { syncActiveLayer } from '../../helpers/sync-active-layer';
import { updateContext } from '../../helpers/update-context';
import type { DrawingContext } from '../../models/drawing-context';
import type { MenuAction } from '../../models/menu-action';

export class DuplicateLayerAction implements MenuAction {
  execute(drawingContext: DrawingContext): void {
    const { layers, activeLayerIndex } = drawingContext;
    const source = layers[activeLayerIndex];
    if (!source) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = source.canvas.width;
    canvas.height = source.canvas.height;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.drawImage(source.canvas, 0, 0);

    layers.splice(activeLayerIndex + 1, 0, {
      id: crypto.randomUUID(),
      name: `${source.name} copy`,
      visible: source.visible,
      locked: false,
      opacity: source.opacity,
      canvas,
      context,
    });
    drawingContext.activeLayerIndex = activeLayerIndex + 1;
    syncActiveLayer(drawingContext);
    drawingContext.history?.commit();
    updateContext(drawingContext.element);
  }
}
