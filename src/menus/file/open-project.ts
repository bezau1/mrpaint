import { fileOpen } from 'browser-fs-access';
import { deserializeProject } from '../../helpers/deserialize-project';
import { updateDocumentContext } from '../../helpers/update-document-context';
import type { DrawingContext } from '../../models/drawing-context';
import type { MenuAction } from '../../models/menu-action';

export class OpenProjectAction implements MenuAction {
  async execute(drawingContext: DrawingContext): Promise<void> {
    const file = await fileOpen({
      extensions: ['.paintproj'],
      description: 'Paint Project files',
    });
    updateDocumentContext(file.handle, file.name, drawingContext);

    await deserializeProject(file, drawingContext);
  }
}
