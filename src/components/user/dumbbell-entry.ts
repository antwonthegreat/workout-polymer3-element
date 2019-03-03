import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-slider/paper-slider.js';
import './dumbbell-drawing';

import {customElement, observe, property, query} from '@polymer/decorators';
import {PaperSliderElement} from '@polymer/paper-slider/paper-slider.js';
import {html, PolymerElement} from '@polymer/polymer';

@customElement('dumbbell-entry')
export class DumbbellEntry extends PolymerElement {
  @property({type: Number, notify: true}) value: number|null;
  @property() dumbbellAmounts: Array<number> = [2.5, 5, 7.5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 150, 160];
  @property() dumbbellSliderIndex: number;
  @property() maxDumbbellIndex: number;
  @property() dragging: boolean;
  @query('paper-slider') slider: PaperSliderElement;

  ready() {
    super.ready();
    this.maxDumbbellIndex = this.dumbbellAmounts.length - 1;
  }

  @observe('value')
  _valueChanged(value: number) {
    let dumbbellSliderIndex = this.dumbbellAmounts.indexOf(value);
    if (value && dumbbellSliderIndex > -1) {
      this.dumbbellSliderIndex = dumbbellSliderIndex;
    }
  }

  @observe('dumbbellSliderIndex')
  protected _dumbbellSliderIndexChanged(index: number) {
    let weight = this.dumbbellAmounts[index];
    if (weight && this.value !== weight && this.dragging) {
      this.set('value', weight);
    }
  }

  static get template() {
    return html`<style>
      :host {
        @apply --layout-vertical;
        @apply --layout-center;
      }

      dumbbell-drawing {
        margin:16px;
      }

    </style>
    <dumbbell-drawing value="[[value]]">[[value]]</dumbbell-drawing>
    <paper-slider snaps dragging="{{dragging}}" value="{{dumbbellSliderIndex}}" id="dumbbellSlider" immediate-value="{{dumbbellSliderIndex}}" min="0" max="[[maxDumbbellIndex]]"></paper-slider>
    `;
  }
}
