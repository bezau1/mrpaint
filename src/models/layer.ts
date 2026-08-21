/**
 * Represents a single layer in the drawing. Each layer owns its own
 * offscreen canvas that tools draw onto when it is the active layer;
 * layers are composited together onto the visible display canvas.
 */
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}
