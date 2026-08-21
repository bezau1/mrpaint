import { syncActiveLayer } from './sync-active-layer';
import { updateContext } from './update-context';
import type { DrawingContext } from '../models/drawing-context';

const MAX_STACK_SIZE = 3;

interface LayerSnapshot {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  imageData: ImageData;
}

interface CanvasHistoryEntry {
  width: number;
  height: number;
  activeLayerIndex: number;
  layers: LayerSnapshot[];
}

// TODO: Support all actions (skew, selection moves, …)
export class History {
  private readonly stack: CanvasHistoryEntry[] = [];
  private stackPointer = -1;

  constructor(private readonly drawingContext: DrawingContext) {}

  /**
   * updateContext() replaces drawingContext with a shallow copy on every
   * change (see helpers/update-context.ts), so the reference captured in the
   * constructor goes stale after the first commit. The owning element's
   * `.drawingContext` property is always kept current by Lit, so resolve
   * through it to mutate/read the live object rather than the stale one.
   */
  private get current(): DrawingContext {
    return this.drawingContext.element?.drawingContext ?? this.drawingContext;
  }

  clear(): void {
    this.stack.length = 0;
    this.stackPointer = -1;
  }

  commit(): void {
    const drawingContext = this.current;
    drawingContext.document.dirty = true;
    this.stack.splice(this.stackPointer + 1);

    if (this.stack.length === MAX_STACK_SIZE + 1) {
      this.stack.shift();
    }

    const { canvas, layers, activeLayerIndex } = drawingContext;
    const width = canvas?.width ?? 0;
    const height = canvas?.height ?? 0;

    if (width && height && layers.length) {
      const entry: CanvasHistoryEntry = {
        width,
        height,
        activeLayerIndex,
        layers: layers.map(
          ({ id, name, visible, locked, opacity, context }) => ({
            id,
            name,
            visible,
            locked,
            opacity,
            imageData: context.getImageData(0, 0, width, height),
          }),
        ),
      };
      const newLength = this.stack.push(entry);
      this.stackPointer = newLength - 1;
    }

    // TODO: An external component should do this.
    updateContext(drawingContext.element);
  }

  undo(): void {
    if (!this.canUndo()) {
      throw new Error('No actions to undo.');
    }

    this.stackPointer--;
    this.restoreEntry();
  }

  redo(): void {
    if (!this.canRedo()) {
      throw new Error('No actions to redo.');
    }

    this.stackPointer++;
    this.restoreEntry();
  }

  private restoreEntry(): void {
    const { width, height, activeLayerIndex, layers } =
      this.stack[this.stackPointer];
    const drawingContext = this.current;
    const { canvas, previewCanvas } = drawingContext;
    if (!canvas || !previewCanvas) {
      return;
    }

    canvas.width = previewCanvas.width = width;
    canvas.height = previewCanvas.height = height;

    drawingContext.layers = layers.map(
      ({ id, name, visible, locked, opacity, imageData }) => {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = width;
        layerCanvas.height = height;
        const layerContext = layerCanvas.getContext(
          '2d',
        ) as CanvasRenderingContext2D;
        layerContext.putImageData(imageData, 0, 0);
        return {
          id,
          name,
          visible,
          locked,
          opacity,
          canvas: layerCanvas,
          context: layerContext,
        };
      },
    );
    drawingContext.activeLayerIndex = Math.min(
      activeLayerIndex,
      drawingContext.layers.length - 1,
    );
    syncActiveLayer(drawingContext);

    // TODO: An external component should do this.
    updateContext(drawingContext.element);
  }

  canUndo(): boolean {
    return this.stackPointer > 0;
  }

  canRedo(): boolean {
    return this.stackPointer >= 0 && this.stackPointer < this.stack.length - 1;
  }
}
