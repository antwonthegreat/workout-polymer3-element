import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@polymer/iron-collapse/iron-collapse';
import './workout-set-item';
import '../../styles/card-shared-styles.js';

import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import Lift from '../../model/Lift';
// import {Actions} from '../../actions/lift-actions';
// import {store} from '../../store';

@customElement('lift-item')
export class WorkoutView extends PolymerElement {
  @property() lift: Lift;
  @property() expanded: boolean = false;

  protected _headerClicked() {
    this.expanded = !this.expanded;
  }

  protected _deleteClicked(event: any) {
    event.stopPropagation();
  }

  static get template() {
    return html`<style include="card-shared-styles">
          material-card {
            @apply --layout-vertical;
            background-color:#cccccc;
            padding:4px;
          }

          header {
            @apply --layout-horizontal;
            @apply --layout-center;
            cursor:pointer;
          }

          lift-name {
            @apply --layout-flex-2;
          }

          vaadin-button[delete-button] {
            @apply --layout-end-justified;
            background-color:white;
            width:10px;
          }

          svg {
            width: 24px;
            height: 24px;
          }

          hidden {
            display:none !important;
          }
        </style>
        <material-card>
          <header on-click="_headerClicked">
            <completed-mark>
              <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
              </svg>
            </completed-mark>
            <lift-name>[[lift.LiftType.Name]]</lift-name>
            <vaadin-button delete-button on-click="_deleteClicked">
              <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </vaadin-button>
          </header>
          <iron-collapse opened="[[expanded]]">
            <lift-details>
              <template is="dom-repeat" items="[[lift.WorkoutSets]]">
                <workout-set-item workout-set="[[item]]"></workout-set-item>
              </template>
              <action-buttons>
                <vaadin-button on-click="_graphClicked">Graph</vaadin-button>
                <vaadin-button on-click="_addClicked">Add Set</vaadin-button>
              </action-buttons>
            <lift-details>
          </iron-collapse>
        </material-card>
            `;
  }
}