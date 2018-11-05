import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';

import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

@customElement('manual-entry')
export class ManualEntry extends PolymerElement {
  @property({type: Number, notify: true}) value: number|null;
  @property() displayValue: string;

  @observe('value')
  protected valueChanged(value: number|null) {
    console.log(value);
    this.displayValue = `${value}` || '0';
  }

  protected _numberPressed(event: any) {
    let value = event.currentTarget.getAttribute('value');
    if (this.displayValue === '0') {
      this.displayValue = value;
      return;
    }

    this.displayValue = `${this.displayValue}${value}`;
    this.value = parseFloat(this.displayValue);
  }

  protected _backspacePressed() {
    this.displayValue = this.displayValue.length > 1 ? this.displayValue.substr(0, this.displayValue.length - 1) : '0';
    this.value = parseFloat(this.displayValue);
  }

  protected _decimalPressed() {
    if (this.displayValue.indexOf('.') > -1)
      return;
    this.displayValue = `${this.displayValue}.`;
    this.value = parseFloat(this.displayValue);
  }

  protected _displayDecimal(decimalActivated: boolean): string {
    return decimalActivated ? '' : '.';
  }

  static get template() {
    return html`<style include="modal-shared-styles">
      :host {
        @apply --layout-vertical;
        @apply --layout-center;
      }

      display-area {
        @apply --layout-horizontal;
        margin:8px;
      }

      button-area {
        @apply --layout-vertical;
        @apply --layout-flex-3;
      }

      button-row {
        @apply --layout-horizontal;
      }

      vaadin-button {
          margin:0;
      }
    </style>
    <display-area>[[displayValue]]</display-area>
    <button-area>
      <button-row>
        <vaadin-button on-click="_numberPressed" value="1">1</vaadin-button>
        <vaadin-button on-click="_numberPressed" value="2">2</vaadin-button>
        <vaadin-button on-click="_numberPressed" value="3">3</vaadin-button>
      </button-row>
      <button-row>
        <vaadin-button on-click="_numberPressed" value="4">4</vaadin-button>
        <vaadin-button on-click="_numberPressed" value="5">5</vaadin-button>
        <vaadin-button on-click="_numberPressed" value="6">6</vaadin-button>
      </button-row>
      <button-row>
        <vaadin-button on-click="_backspacePressed">B</vaadin-button>
        <vaadin-button on-click="_numberPressed" value="0">0</vaadin-button>
        <vaadin-button on-click="_decimalPressed">.</vaadin-button>
      </button-row>
    </button-area>
    `;
  }
}
