import '@polymer/iron-flex-layout/iron-flex-layout.js';
import './plate-drawing';
import '@vaadin/vaadin-button';

import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

@customElement('barbell-entry')
export class BarbellEntry extends PolymerElement {
  @property({type: Number, notify: true}) value: number|null;
  @property() plateAmounts: Array<number> = [45, 35, 25, 10, 5, 2.5];
  @property() barbellPlates: Array<number> = [];
  @property() barbellWeight = 45;
  @property() flippedBarbellPlates: Array<number> = [];

  @observe('value')
  _valueChanged(value: number) {
    const barbellPlates: Array<number> = [];
    let remainingBarbellWeight = value - this.barbellWeight;
    let plateAmountIndex = 0;
    while (remainingBarbellWeight > 0 && plateAmountIndex < this.plateAmounts.length) {
      const plateToAdd = this.plateAmounts[plateAmountIndex];
      if (remainingBarbellWeight < plateToAdd * 2) {
        plateAmountIndex += 1;
      } else {
        barbellPlates.push(plateToAdd);
        remainingBarbellWeight -= (plateToAdd * 2);
      }
    }
    this.barbellPlates = barbellPlates;
    this.flippedBarbellPlates = barbellPlates.slice().reverse();
  }

  protected _addBarbellPlate(e: any) {
    const plateAmount: number = parseFloat(e.model.item);
    this.value = Math.max((this.value || 0) + plateAmount * 2, this.barbellWeight + plateAmount * 2);
  }

  protected _removeBarbellPlate(e: any) {
    const plateAmount: number = parseFloat(e.model.item);
    this.value = (this.value || 0) - plateAmount * 2;
  }

  static get template() {
    return html`<style>
      :host {
        @apply --layout-vertical;
        @apply --layout-flex-auto;
        height: calc(100vh - 112px);
      }


      barbell-drawing {
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-flex-4;
        min-height: 128px;
      }

      barbell-bar {
        background-color: #9e9e9e;
        min-height: 10px;
        @apply --layout-flex;
      }

      total-weight-area {
          @apply --layout-self-center;
          font-size:14px;
          @apply --layout-flex;
      }

      plate-rack {
        @apply --layout-center-center;
        margin: 16px auto;
      }

      vaadin-button {
          background-color: #424242;
          color: #f5f5f5;
          @apply --paper-font-caption;
          width: 30px;
          min-width: 0;
          height: 80px;
          margin:0;
          padding:0;
      }

      vaadin-button:nth-child(1) {
          height: 120px;
      }

      vaadin-button:nth-child(2) {
          height: 100px;
      }

      vaadin-button:nth-child(3) {
          height: 80px;
      }

      vaadin-button:nth-child(4) {
          height: 60px;
      }

      vaadin-button:nth-child(5) {
          height: 40px;
      }

      vaadin-button:nth-child(6) {
          height: 30px;
      }

    </style>
      <barbell-drawing>
        <template is="dom-repeat" items="[[flippedBarbellPlates]]">
            <plate-drawing value="[[item]]" on-click="_removeBarbellPlate"></plate-drawing>
        </template>
        <barbell-bar></barbell-bar>
        <template is="dom-repeat" items="[[barbellPlates]]">
            <plate-drawing value="[[item]]" on-click="_removeBarbellPlate"></plate-drawing>
        </template>
      </barbell-drawing>
      <total-weight-area>[[value]]</total-weight-area>
      <plate-rack>
          <template is="dom-repeat" items="[[plateAmounts]]">
              <vaadin-button class="plate" on-click="_addBarbellPlate">[[item]]</vaadin-button>
          </template>
      </plate-rack>
    `;
  }
}
