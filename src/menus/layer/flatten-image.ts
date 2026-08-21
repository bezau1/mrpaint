import { createLayer } from '../../helpers/create-layer';
import { drawLayers } from '../../helpers/draw-layers';
import { syncActiveLayer } from '../../helpers/sync-active-layer';
import { updateContext } from '../../helpers/update-context';
import type { DrawingContext } from '../../models/drawing-context';
import type { MenuAction } from '../../models/menu-action';

export class FlattenImageAction implements MenuAction {
  canExecute({ layers }: DrawingContext): boolean {
    return layers.length > 1;
  }

  execute(drawingContext: DrawingContext): void {
    const { canvas, layers } = drawingContext;
    if (!canvas || layers.length <= 1) {
      return;
    }

    const flattened = createLayer(canvas.width, canvas.height, 'Layer 1');
    drawLayers(flattened.context, layers, canvas.width, canvas.height);

    drawingContext.layers = [flattened];
    drawingContext.activeLayerIndex = 0;
    syncActiveLayer(drawingContext);
    drawingContext.history?.commit();
    updateContext(drawingContext.element);
  }
}
