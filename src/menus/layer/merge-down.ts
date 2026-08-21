import { syncActiveLayer } from '../../helpers/sync-active-layer';
import { updateContext } from '../../helpers/update-context';
import type { DrawingContext } from '../../models/drawing-context';
import type { MenuAction } from '../../models/menu-action';

export class MergeDownAction implements MenuAction {
  canExecute({ activeLayerIndex }: DrawingContext): boolean {
    return activeLayerIndex > 0;
  }

  execute(drawingContext: DrawingContext): void {
    const { layers, activeLayerIndex } = drawingContext;
    if (activeLayerIndex <= 0) {
      return;
    }

    const below = layers[activeLayerIndex - 1];
    const active = layers[activeLayerIndex];
    const previousAlpha = below.context.globalAlpha;
    below.context.globalAlpha = active.opacity;
    below.context.drawImage(active.canvas, 0, 0);
    below.context.globalAlpha = previousAlpha;

    layers.splice(activeLayerIndex, 1);
    drawingContext.activeLayerIndex = activeLayerIndex - 1;
    syncActiveLayer(drawingContext);
    drawingContext.history?.commit();
    updateContext(drawingContext.element);
  }
}
