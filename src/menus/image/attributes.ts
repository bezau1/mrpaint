import { resizeLayers } from '../../helpers/resize-layers';
import { showDialog } from '../../helpers/dialog';
import { showMessageBox } from '../../helpers/message-box';
import type { DrawingContext } from '../../models/drawing-context';
import type { MenuAction } from '../../models/menu-action';

export class AttributesAction implements MenuAction {
  async execute(drawingContext: DrawingContext): Promise<void> {
    const { previewCanvas, canvas } = drawingContext;
    if (!previewCanvas || !canvas) {
      return;
    }

    const result = await showDialog('paint-dialog-attributes', {
      width: canvas.width.toString(),
      height: canvas.height.toString(),
      unit: 'pels',
      color: 'colors',
    });

    if (!result) {
      return;
    }

    const newWidth = parseInt(result.width, 10);
    const newHeight = parseInt(result.height, 10);
    if (!this.isValidValue(newWidth) || !this.isValidValue(newHeight)) {
      await showMessageBox(
        'Bitmaps must be greater than one pixel on a side.',
        'warning',
        'MrPaint',
      );
      return;
    }

    resizeLayers(drawingContext, newWidth, newHeight);

    drawingContext.history?.commit();
  }

  private isValidValue(value: number) {
    return isFinite(value) && value > 0;
  }
}
