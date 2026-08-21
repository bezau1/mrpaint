import { createLayer } from '../../helpers/create-layer';
import { syncActiveLayer } from '../../helpers/sync-active-layer';
import { updateContext } from '../../helpers/update-context';
import type { DrawingContext } from '../../models/drawing-context';
import type { MenuAction } from '../../models/menu-action';

export class AddLayerAction implements MenuAction {
  execute(drawingContext: DrawingContext): void {
    const { canvas, layers, activeLayerIndex } = drawingContext;
    if (!canvas) {
      return;
    }

    const layer = createLayer(
      canvas.width,
      canvas.height,
      `Layer ${layers.length + 1}`,
    );
    layers.splice(activeLayerIndex + 1, 0, layer);
    drawingContext.activeLayerIndex = activeLayerIndex + 1;
    syncActiveLayer(drawingContext);
    drawingContext.history?.commit();
    updateContext(drawingContext.element);
  }
}
