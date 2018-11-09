import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field';
import './paper-plates-dialog';

import {customElement, property, query} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {deleteItemAsync} from '../../actions/workout-set-actions';
import WorkoutSet from '../../model/WorkoutSet';
import {store} from '../../store';

import {PaperPlatesDialog} from './paper-plates-dialog';

@customElement('workout-set-item')
export class WorkoutSetItem extends PolymerElement {
  @property() workoutSet: WorkoutSet;
  @query('paper-plates-dialog') paperPlatesDialog: PaperPlatesDialog;

  protected _weightClicked() {
    this.paperPlatesDialog.openDialogForWeight();
  }

  protected _repsClicked() {
    this.paperPlatesDialog.openDialogForReps();
  }

  protected _deleteClicked() {
    store.dispatch<any>(deleteItemAsync(this.workoutSet.Id));
  }

  static get template() {
    return html`<style>
          :host {
            @apply --layout-horizontal;
          }

          vaadin-text-field {
            width:80px;
            margin:8px;
          }

          vaadin-button {
            @apply --layout-end-justified;
            background-color:white;
            width:30px;
          }

          hidden {
            display:none !important;
          }
        </style>
        <vaadin-text-field on-click="_repsClicked" value="[[workoutSet.Reps]]"></vaadin-text-field>
        <vaadin-text-field on-click="_weightClicked" value="[[workoutSet.Weight]]"></vaadin-text-field>
        <vaadin-button delete-button on-click="_deleteClicked">
          <svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8.46,11.88L9.87,10.47L12,12.59L14.12,10.47L15.53,11.88L13.41,14L15.53,16.12L14.12,17.53L12,15.41L9.88,17.53L8.47,16.12L10.59,14L8.46,11.88M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z" />
          </svg>
        </vaadin-button>
        <paper-plates-dialog workout-set="[[workoutSet]]"></paper-plates-dialog>
        `;
  }
}