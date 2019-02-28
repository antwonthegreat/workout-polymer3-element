import '@polymer/iron-flex-layout/iron-flex-layout.js';

import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import WorkoutSet from '../../model/WorkoutSet';

@customElement('simple-workout-set-item')
export class SimpleWorkoutSetItem extends PolymerElement {
  @property() workoutSet: WorkoutSet;

  static get template() {
    return html`<style>
          :host {
            @apply --layout-horizontal;
          }

          workout-value {
            width:80px;
            margin:8px;
          }

          hidden {
            display:none !important;
          }
        </style>
        <workout-value>[[workoutSet.Reps]]</workout-value>
        <workout-value>[[workoutSet.Weight]]</workout-value>
        `;
  }
}