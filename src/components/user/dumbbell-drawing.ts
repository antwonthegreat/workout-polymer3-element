import '@polymer/iron-flex-layout/iron-flex-layout.js';

import {customElement, observe, property, query} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

@customElement('dumbbell-drawing')
export class DumbbellDrawing extends PolymerElement {
  @property() value: number|null;
  @query('left-weight') leftWeight: HTMLElement;
  @query('right-weight') rightWeight: HTMLElement;

  @observe('value')
  protected _valueChanged(value: number) {
    if (value) {
      this.leftWeight.style.width = `${10 + value * .44}px`;
      this.rightWeight.style.width = `${10 + value * .44}px`;

      this.leftWeight.style.height = `${20 + value * .42}px`;
      this.rightWeight.style.height = `${20 + value * .42}px`;
    }
  }

  static get template() {
    return html`<style>
      :host {
        border-radius: 2px;
        color: #f5f5f5;
        @apply --paper-font-caption;
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-center-justified;
        @apply --layout-wrap;
        transition: .6s ease;
        padding: 5px;
    }

    dumbbell-container {
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-center-justified;
    }

    left-weight,
    right-weight {
        background-color: #424242;
        border: 1px solid #616161;
        width: 40px;
        height: 80px;
        border-radius: 2px;
    }

    dumbbell-handle {
        @apply --paper-font-caption;
        background-color: #9e9e9e;
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-center-justified;
        width: 40px;
        height: 16px;
        color: #f5f5f5;
    }


    </style>
    <dumbbell-container>
        <left-weight></left-weight>
        <dumbbell-handle>[[value]]</dumbbell-handle>
        <right-weight></right-weight>
    </dumbbell-container>
    `;
  }
}
