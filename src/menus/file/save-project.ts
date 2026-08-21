import { fileSave } from 'browser-fs-access';
import { serializeProject } from '../../helpers/serialize-project';
import { updateDocumentContext } from '../../helpers/update-document-context';
import type { DrawingContext } from '../../models/drawing-context';
import type { MenuAction } from '../../models/menu-action';

export class SaveProjectAction implements MenuAction {
  async execute(drawingContext: DrawingContext): Promise<void> {
    if (!drawingContext.canvas) {
      return;
    }

    const blob = serializeProject(drawingContext);
    const file = await fileSave(blob, {
      fileName: drawingContext.document.title,
      extensions: ['.paintproj'],
      description: 'Paint Project files',
    });

    if (file) {
      updateDocumentContext(file, file.name, drawingContext);
    }
  }
}
