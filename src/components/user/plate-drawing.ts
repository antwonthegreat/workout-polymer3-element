import '@polymer/iron-flex-layout/iron-flex-layout.js';

import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

@customElement('plate-drawing')
export class PlateDrawing extends PolymerElement {
  @property() value: number;

  @observe('value')
  protected _valueChanged(value: number) {
    if (value) {
      if (value >= 25)
        this.style.height = `${value * 2.2}px`;

      if (value === 10)
        this.style.height = `${value * 6}px`;

      if (value <= 5)
        this.style.height = `${value * 10}px`;
    }
  }

  static get template() {
    return html`<style>
      :host {
				width: 20px;
				height: 20px;
				background-color: #9e9e9e;
				border: 1px solid #616161;
				border-radius: 2px;
				color: #f5f5f5;
				@apply --paper-font-caption;
				@apply --layout-horizontal;
				@apply --layout-center;
				@apply --layout-center-justified;
				transition: .6s ease;
			}
    </style>
    [[value]]
    `;
  }
}
