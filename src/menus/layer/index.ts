import { AddLayerAction } from './add-layer';
import { DeleteLayerAction } from './delete-layer';
import { DuplicateLayerAction } from './duplicate-layer';
import { FlattenImageAction } from './flatten-image';
import { MergeDownAction } from './merge-down';
import { MoveLayerDownAction } from './move-down';
import { MoveLayerUpAction } from './move-up';
import type { MenuEntry } from '../../models/menu';

export const layerMenu: MenuEntry = {
  caption: 'Layer',
  mnemonic: 'L',
  helpText: '',
  entries: [
    {
      caption: 'Add Layer',
      mnemonic: 'A',
      helpText: 'Adds a new layer above the active layer.',
      instance: new AddLayerAction(),
    },
    {
      caption: 'Duplicate Layer',
      mnemonic: 'D',
      helpText: 'Duplicates the active layer.',
      instance: new DuplicateLayerAction(),
    },
    {
      caption: 'Delete Layer',
      mnemonic: 'e',
      helpText: 'Deletes the active layer.',
      instance: new DeleteLayerAction(),
    },
    {
      separator: true,
    },
    {
      caption: 'Move Layer Up',
      mnemonic: 'U',
      helpText: 'Moves the active layer up in the stack.',
      instance: new MoveLayerUpAction(),
    },
    {
      caption: 'Move Layer Down',
      mnemonic: 'n',
      helpText: 'Moves the active layer down in the stack.',
      instance: new MoveLayerDownAction(),
    },
    {
      separator: true,
    },
    {
      caption: 'Merge Down',
      mnemonic: 'M',
      helpText: 'Merges the active layer with the layer below it.',
      instance: new MergeDownAction(),
    },
    {
      caption: 'Flatten Image',
      mnemonic: 'F',
      helpText: 'Merges all layers into a single layer.',
      instance: new FlattenImageAction(),
    },
  ],
};
