import type { Layer } from '../models/layer';

export function createLayer(
  width: number,
  height: number,
  name: string,
): Layer {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not create layer context.');
  }
  context.imageSmoothingEnabled = false;

  return {
    id: crypto.randomUUID(),
    name,
    visible: true,
    locked: false,
    opacity: 1,
    canvas,
    context,
  };
}
