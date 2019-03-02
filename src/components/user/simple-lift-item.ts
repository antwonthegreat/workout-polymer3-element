import '@polymer/iron-flex-layout/iron-flex-layout.js';
import './simple-workout-set-item';
import '../../styles/card-shared-styles.js';

import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import Lift from '../../model/Lift';
declare var moment: any;

@customElement('simple-lift-item')
export class SimpleLiftItem extends PolymerElement {
  @property() lift: Lift;

  protected _formatDate(startDate: string): string {
    return `${moment(startDate).fromNow()}, ${moment(startDate).format('MMM Do YYYY')}`;
  }

  static get template() {
    return html`
    <style include="card-shared-styles">
          material-card {
            @apply --layout-vertical;
            background-color:#eeeeee;
            padding:4px;
            margin:4px;
          }

          :host([selected]) material-card {
            border: 1px solid black;
          }

          header {
            @apply --layout-horizontal;
            @apply --layout-center;
            cursor:pointer;
          }

          lift-details {
            @apply --layout-vertical;
          }

          workout-set-header {
            @apply --layout-horizontal;
          }

          workout-set-header-item {
            width:80px;
            margin:8px;
          }

          hidden {
            display:none !important;
          }
        </style>
        <material-card>
            [[_formatDate(lift.StartDate)]]
            <workout-set-header>
              <workout-set-header-item>Reps</workout-set-header-item>
              <workout-set-header-item>Weight</workout-set-header-item>
            </workout-set-header>
            <template is="dom-repeat" items="[[lift.WorkoutSets]]">
              <simple-workout-set-item workout-set="[[item]]"></simple-workout-set-item>
            </template>
        </material-card>
        `;
  }
}