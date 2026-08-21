import { compositeLayers } from './composite-layers';
import type { DrawingContext } from '../models/drawing-context';

export function updateContext(
  element: (HTMLElement & { drawingContext: DrawingContext }) | null,
): void {
  if (!element) {
    return;
  }

  compositeLayers(element.drawingContext);
  element.dispatchEvent(
    new CustomEvent('drawing-context-changed', {
      detail: { ...element.drawingContext },
      bubbles: true,
      composed: true,
    }),
  );
}
