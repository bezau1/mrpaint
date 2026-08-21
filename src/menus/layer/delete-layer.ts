import { syncActiveLayer } from '../../helpers/sync-active-layer';
import { updateContext } from '../../helpers/update-context';
import type { DrawingContext } from '../../models/drawing-context';
import type { MenuAction } from '../../models/menu-action';

export class DeleteLayerAction implements MenuAction {
  canExecute({ layers }: DrawingContext): boolean {
    return layers.length > 1;
  }

  execute(drawingContext: DrawingContext): void {
    const { layers, activeLayerIndex } = drawingContext;
    if (layers.length <= 1) {
      return;
    }

    layers.splice(activeLayerIndex, 1);
    drawingContext.activeLayerIndex = Math.min(
      activeLayerIndex,
      layers.length - 1,
    );
    syncActiveLayer(drawingContext);
    drawingContext.history?.commit();
    updateContext(drawingContext.element);
  }
}
