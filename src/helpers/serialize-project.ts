import type { DrawingContext } from '../models/drawing-context';

export interface SerializedLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  dataUrl: string;
}

export interface SerializedProject {
  version: 1;
  width: number;
  height: number;
  activeLayerIndex: number;
  layers: SerializedLayer[];
}

export function serializeProject(drawingContext: DrawingContext): Blob {
  const { canvas, layers, activeLayerIndex } = drawingContext;

  const project: SerializedProject = {
    version: 1,
    width: canvas?.width ?? 0,
    height: canvas?.height ?? 0,
    activeLayerIndex,
    layers: layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      locked: layer.locked,
      opacity: layer.opacity,
      dataUrl: layer.canvas.toDataURL('image/png'),
    })),
  };

  return new Blob([JSON.stringify(project)], { type: 'application/json' });
}
