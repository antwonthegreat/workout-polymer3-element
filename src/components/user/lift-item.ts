import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';

import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import Lift from '../../model/Lift';
// import {Actions} from '../../actions/lift-actions';
// import {store} from '../../store';

@customElement('lift-item')
export class WorkoutView extends PolymerElement {
  @property() lift: Lift;

  static get template() {
    return html`<style>
        </style>
        [[lift.LiftType.Name]]
            `;
  }
}