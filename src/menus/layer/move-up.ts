import { syncActiveLayer } from '../../helpers/sync-active-layer';
import { updateContext } from '../../helpers/update-context';
import type { DrawingContext } from '../../models/drawing-context';
import type { MenuAction } from '../../models/menu-action';

export class MoveLayerUpAction implements MenuAction {
  canExecute({ layers, activeLayerIndex }: DrawingContext): boolean {
    return activeLayerIndex < layers.length - 1;
  }

  execute(drawingContext: DrawingContext): void {
    const { layers, activeLayerIndex } = drawingContext;
    if (activeLayerIndex >= layers.length - 1) {
      return;
    }

    [layers[activeLayerIndex], layers[activeLayerIndex + 1]] = [
      layers[activeLayerIndex + 1],
      layers[activeLayerIndex],
    ];
    drawingContext.activeLayerIndex = activeLayerIndex + 1;
    syncActiveLayer(drawingContext);
    drawingContext.history?.commit();
    updateContext(drawingContext.element);
  }
}
