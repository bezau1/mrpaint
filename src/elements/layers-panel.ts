import { css, CSSResultGroup, html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DRAWING_CONTEXT } from '../data/drawing-context';
import { compositeLayers } from '../helpers/composite-layers';
import { syncActiveLayer } from '../helpers/sync-active-layer';
import { updateContext } from '../helpers/update-context';
import { AddLayerAction } from '../menus/layer/add-layer';
import { DeleteLayerAction } from '../menus/layer/delete-layer';
import { DuplicateLayerAction } from '../menus/layer/duplicate-layer';
import { MergeDownAction } from '../menus/layer/merge-down';
import { MoveLayerDownAction } from '../menus/layer/move-down';
import { MoveLayerUpAction } from '../menus/layer/move-up';
import type { Layer } from '../models/layer';

const EYE_OPEN_ICON = html`<svg viewBox="0 0 16 16" fill="currentColor">
  <path
    d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8Z"
    fill="none"
    stroke="currentColor"
    stroke-width="1.2"
  />
  <circle cx="8" cy="8" r="2" />
</svg>`;

const EYE_CLOSED_ICON = html`<svg viewBox="0 0 16 16" fill="currentColor">
  <path
    d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8Z"
    fill="none"
    stroke="currentColor"
    stroke-width="1.2"
    opacity="0.35"
  />
  <path d="M2 2l12 12" stroke="currentColor" stroke-width="1.2" />
</svg>`;

const LOCK_CLOSED_ICON = html`<svg viewBox="0 0 16 16" fill="currentColor">
  <rect x="3" y="7" width="10" height="7" rx="1" />
  <path
    d="M5 7V5a3 3 0 0 1 6 0v2"
    fill="none"
    stroke="currentColor"
    stroke-width="1.2"
  />
</svg>`;

const LOCK_OPEN_ICON = html`<svg viewBox="0 0 16 16" fill="currentColor">
  <rect x="3" y="7" width="10" height="7" rx="1" opacity="0.35" />
  <path
    d="M5 7V5a3 3 0 0 1 6 0"
    fill="none"
    stroke="currentColor"
    stroke-width="1.2"
    opacity="0.6"
  />
</svg>`;

const GRIP_ICON = html`<svg viewBox="0 0 8 16" fill="currentColor">
  <circle cx="2" cy="3" r="1" />
  <circle cx="6" cy="3" r="1" />
  <circle cx="2" cy="8" r="1" />
  <circle cx="6" cy="8" r="1" />
  <circle cx="2" cy="13" r="1" />
  <circle cx="6" cy="13" r="1" />
</svg>`;

const ADD_ICON = html`<svg viewBox="0 0 12 12" fill="currentColor">
  <path d="M5 1h2v4h4v2H7v4H5V7H1V5h4V1z" />
</svg>`;

const DUPLICATE_ICON = html`<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1">
  <rect x="1.5" y="3.5" width="7" height="7" />
  <rect x="3.5" y="1.5" width="7" height="7" fill="var(--button-face)" />
</svg>`;

const DELETE_ICON = html`<svg viewBox="0 0 12 12" fill="currentColor">
  <path d="M2 3h8v1H2V3zm1 2h6l-.6 6H3.6L3 5zm2-4h2v1H5V1z" />
</svg>`;

const UP_ICON = html`<svg viewBox="0 0 12 12" fill="currentColor">
  <path d="M6 2l4 4H8v4H4V6H2l4-4z" />
</svg>`;

const DOWN_ICON = html`<svg viewBox="0 0 12 12" fill="currentColor">
  <path d="M6 10l-4-4h2V2h4v4h2l-4 4z" />
</svg>`;

const MERGE_ICON = html`<svg viewBox="0 0 12 12" fill="currentColor">
  <path d="M3 1h1v5h1L3 9 1 6h1V1zm5 0h1v5h1L8 9 6 6h1V1z" opacity="0.6" />
  <rect x="1" y="10" width="10" height="1" />
</svg>`;

@customElement('paint-layers-panel')
export class LayersPanel extends LitElement {
  @property() drawingContext = DRAWING_CONTEXT;

  private dragSourceIndex: number | null = null;

  static get styles(): CSSResultGroup {
    return css`
      :host {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: var(--z-index-menu);
        width: 200px;
        box-sizing: border-box;
        border: 1px solid var(--button-darker);
        border-top: 1px solid var(--button-face);
        border-left: 1px solid var(--button-face);
        background-color: var(--button-face);
        color: var(--button-text);
      }

      div.inset {
        border: 1px solid var(--canvas);
        border-top: 1px solid var(--button-light);
        border-left: 1px solid var(--button-light);
        display: flex;
        flex-direction: column;
      }

      div.toolbar {
        display: flex;
        gap: 1px;
        padding: 2px;
        border-bottom: 1px solid var(--button-dark);
      }

      button.icon {
        width: 20px;
        height: 20px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      button.icon svg {
        width: 12px;
        height: 12px;
      }

      div.spacer {
        flex: 1;
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 2px;
        max-height: 200px;
        overflow-y: auto;
      }

      li {
        display: flex;
        align-items: center;
        gap: 3px;
        padding: 2px;
        cursor: default;
      }

      li.active {
        background-color: var(--highlight);
        color: var(--highlight-text);
      }

      li.locked {
        opacity: 0.85;
      }

      span.grip {
        display: flex;
        cursor: grab;
      }

      span.grip svg {
        width: 6px;
        height: 14px;
      }

      button.toggle {
        width: 16px;
        height: 16px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: inherit;
      }

      button.toggle svg {
        width: 13px;
        height: 13px;
      }

      canvas.thumbnail {
        width: 20px;
        height: 20px;
        border: 1px solid var(--button-dark);
        background: white;
        image-rendering: pixelated;
      }

      span.name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      div.opacity {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 4px;
        border-top: 1px solid var(--button-dark);
      }

      div.opacity input[type='range'] {
        flex: 1;
      }

      div.opacity span.value {
        width: 28px;
        text-align: right;
      }
    `;
  }

  constructor() {
    super();
    this.addEventListener('click', (event) => event.stopPropagation());
  }

  render(): TemplateResult {
    const { layers, activeLayerIndex } = this.drawingContext;
    const activeLayer = layers[activeLayerIndex];
    const orderedLayers = layers
      .map((layer, index) => ({ layer, index }))
      .reverse();

    return html`
      <div class="inset">
        <div class="toolbar">
          <button
            class="icon"
            title="Add Layer"
            @click="${() => new AddLayerAction().execute(this.drawingContext)}"
          >
            ${ADD_ICON}
          </button>
          <button
            class="icon"
            title="Duplicate Layer"
            @click="${() =>
              new DuplicateLayerAction().execute(this.drawingContext)}"
          >
            ${DUPLICATE_ICON}
          </button>
          <button
            class="icon"
            title="Delete Layer"
            ?disabled="${!new DeleteLayerAction().canExecute(this.drawingContext)}"
            @click="${() =>
              new DeleteLayerAction().execute(this.drawingContext)}"
          >
            ${DELETE_ICON}
          </button>
          <div class="spacer"></div>
          <button
            class="icon"
            title="Move Layer Up"
            ?disabled="${!new MoveLayerUpAction().canExecute(this.drawingContext)}"
            @click="${() =>
              new MoveLayerUpAction().execute(this.drawingContext)}"
          >
            ${UP_ICON}
          </button>
          <button
            class="icon"
            title="Move Layer Down"
            ?disabled="${!new MoveLayerDownAction().canExecute(this.drawingContext)}"
            @click="${() =>
              new MoveLayerDownAction().execute(this.drawingContext)}"
          >
            ${DOWN_ICON}
          </button>
          <button
            class="icon"
            title="Merge Down"
            ?disabled="${!new MergeDownAction().canExecute(this.drawingContext)}"
            @click="${() =>
              new MergeDownAction().execute(this.drawingContext)}"
          >
            ${MERGE_ICON}
          </button>
        </div>
        <ul>
          ${orderedLayers.map(
            ({ layer, index }) => html`
              <li
                class="${index === activeLayerIndex ? 'active' : ''} ${layer.locked
                  ? 'locked'
                  : ''}"
                draggable="true"
                @click="${() => this.selectLayer(index)}"
                @dragstart="${() => (this.dragSourceIndex = index)}"
                @dragover="${(event: DragEvent) => event.preventDefault()}"
                @drop="${() => this.reorder(index)}"
              >
                <span class="grip">${GRIP_ICON}</span>
                <button
                  class="toggle"
                  title="${layer.visible ? 'Hide Layer' : 'Show Layer'}"
                  @click="${(event: Event) =>
                    this.toggleVisibility(event, layer)}"
                >
                  ${layer.visible ? EYE_OPEN_ICON : EYE_CLOSED_ICON}
                </button>
                <button
                  class="toggle"
                  title="${layer.locked ? 'Unlock Layer' : 'Lock Layer'}"
                  @click="${(event: Event) => this.toggleLocked(event, layer)}"
                >
                  ${layer.locked ? LOCK_CLOSED_ICON : LOCK_OPEN_ICON}
                </button>
                <canvas class="thumbnail" width="20" height="20"></canvas>
                <span
                  class="name"
                  @dblclick="${(event: Event) => this.rename(event, layer)}"
                  >${layer.name}</span
                >
              </li>
            `,
          )}
        </ul>
        <div class="opacity">
          <span>Opacity</span>
          <input
            type="range"
            min="0"
            max="100"
            .value="${activeLayer
              ? Math.round(activeLayer.opacity * 100).toString()
              : '100'}"
            @input="${(event: Event) => this.setOpacity(event)}"
            @change="${() => this.drawingContext.history?.commit()}"
          />
          <span class="value"
            >${activeLayer
              ? Math.round(activeLayer.opacity * 100)
              : 100}%</span
          >
        </div>
      </div>
    `;
  }

  updated(): void {
    this.renderThumbnails();
  }

  renderThumbnails(): void {
    const orderedLayers = [...this.drawingContext.layers].reverse();
    const thumbnails = this.shadowRoot?.querySelectorAll('canvas.thumbnail');
    thumbnails?.forEach((thumbnail, uiIndex) => {
      const layer = orderedLayers[uiIndex];
      const context = (thumbnail as HTMLCanvasElement).getContext('2d');
      if (layer && context) {
        context.clearRect(0, 0, 20, 20);
        context.drawImage(layer.canvas, 0, 0, 20, 20);
      }
    });
  }

  selectLayer(index: number): void {
    this.drawingContext.activeLayerIndex = index;
    syncActiveLayer(this.drawingContext);
    updateContext(this);
  }

  toggleVisibility(event: Event, layer: Layer): void {
    event.stopPropagation();
    layer.visible = !layer.visible;
    this.drawingContext.history?.commit();
    updateContext(this);
  }

  toggleLocked(event: Event, layer: Layer): void {
    event.stopPropagation();
    layer.locked = !layer.locked;
    this.drawingContext.history?.commit();
    updateContext(this);
  }

  rename(event: Event, layer: Layer): void {
    event.stopPropagation();
    const name = window.prompt('Layer name', layer.name);
    if (name && name.trim()) {
      layer.name = name.trim();
      this.drawingContext.history?.commit();
      updateContext(this);
    }
  }

  reorder(targetIndex: number): void {
    const sourceIndex = this.dragSourceIndex;
    this.dragSourceIndex = null;
    if (sourceIndex === null || sourceIndex === targetIndex) {
      return;
    }

    const { layers } = this.drawingContext;
    const activeLayer = layers[this.drawingContext.activeLayerIndex];
    const [moved] = layers.splice(sourceIndex, 1);
    layers.splice(targetIndex, 0, moved);

    this.drawingContext.activeLayerIndex = layers.indexOf(activeLayer);
    syncActiveLayer(this.drawingContext);
    this.drawingContext.history?.commit();
    updateContext(this);
  }

  setOpacity(event: Event): void {
    const layer =
      this.drawingContext.layers[this.drawingContext.activeLayerIndex];
    if (!layer) {
      return;
    }

    layer.opacity = Number((event.target as HTMLInputElement).value) / 100;
    compositeLayers(this.drawingContext);
    this.requestUpdate();
  }
}
