import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@polymer/iron-collapse/iron-collapse';
import './workout-set-item';
import '../../styles/card-shared-styles.js';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import '../../styles/modal-shared-styles';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {deleteItemAsync} from '../../actions/lift-actions';
import {createItemAsync as createWorkoutSetAsync} from '../../actions/workout-set-actions';
import Lift from '../../model/Lift';
import {ApplicationState} from '../../model/state/ApplicationState';
import WorkoutSet from '../../model/WorkoutSet';
import {getLastLiftCompletedWithSets} from '../../reducers/lift-reducer';
import {getPersonalBest} from '../../reducers/workout-set-reducer';
import {store} from '../../store';

@customElement('lift-item') export class WorkoutView extends connectMixin
(store, PolymerElement) {
  @property() lift: Lift;
  @property() expanded: boolean = false;
  @property() lastCompletedLift: Lift|null;
  @property() confirmOpened: boolean = false;
  @property() personalBestSet: WorkoutSet|null;

  protected _headerClicked() {
    this.expanded = !this.expanded;
  }

  protected _addClicked(event: any) {
    event.stopPropagation();
    let newWorkoutSet: Partial<WorkoutSet> = {LiftId: this.lift.Id};
    if (this.lift && this.lift.WorkoutSets.length) {
      const lastSetIndex = this.lift.WorkoutSets.length - 1;
      newWorkoutSet.Reps = this.lift.WorkoutSets[lastSetIndex].Reps;
      newWorkoutSet.Weight = this.lift.WorkoutSets[lastSetIndex].Weight;
    } else if (this.lastCompletedLift && this.lastCompletedLift.WorkoutSets.length) {
      newWorkoutSet.Reps = this.lastCompletedLift.WorkoutSets[0].Reps;
      newWorkoutSet.Weight = this.lastCompletedLift.WorkoutSets[0].Weight;
    }
    store.dispatch<any>(createWorkoutSetAsync(newWorkoutSet));
  }

  protected _deleteClicked(event: any) {
    event.stopPropagation();
    if (this.lift.WorkoutSets.length)
      this.openDialog();
    else
      this._deleteLift();
  }

  private _deleteLift() {
    store.dispatch<any>(deleteItemAsync(this.lift.Id));
  }

  _stateChanged(state: ApplicationState) {
    this.lastCompletedLift = getLastLiftCompletedWithSets(state, this.lift.LiftTypeId, this.lift.StartDate);
    this.personalBestSet = getPersonalBest(state, this.lift.LiftTypeId);
  }

  protected _formatLastCompletedLift(lastCompletedLift: Lift|null) {
    if (!lastCompletedLift)
      return 'Never';

    if (lastCompletedLift.WorkoutSets.every(workoutSet => workoutSet.Weight === lastCompletedLift.WorkoutSets[0].Weight))
      return `${lastCompletedLift.WorkoutSets.map(workoutSet => workoutSet.Reps).join(',')} x ${lastCompletedLift.WorkoutSets[0].Weight}`;
    else
      return lastCompletedLift.WorkoutSets.map(workoutSet => `${workoutSet.Reps} x ${workoutSet.Weight}`).join(', ');
  }

  protected _cancelDialog() {
    this.confirmOpened = false;
  }

  protected _confirmDialog() {
    this._deleteLift();
    this.confirmOpened = false;
  }

  public openDialog() {
    this.confirmOpened = true;
  }

  static get template() {
    return html`
    <style include="modal-shared-styles"></style>
    <style include="card-shared-styles">
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

          lift-details {
            @apply --layout-vertical;
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

          invisible {
            visibility:invisible;
          }
        </style>
        <material-card>
          <header on-click="_headerClicked">
            <completed-mark invisible$="[[!lift.WorkoutSets.length]]">
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
              <last-completed-lift>Previous Attempt: [[_formatLastCompletedLift(lastCompletedLift)]]</last-completed-lift>
              <personal-best hidden$="[[!personalBestSet]]">Personal Best: [[personalBestSet.Reps]] x [[personalBestSet.Weight]]</personal-best>
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
        <vaadin-dialog no-close-on-esc no-close-on-outside-click opened="[[confirmOpened]]">
          <template>
            <main>
              Are you sure you want to delete [[lift.LiftType.Name]]?
            </main>
            <action-buttons>
              <vaadin-button cancel on-click="_cancelDialog">CANCEL</vaadin-button>
              <vaadin-button on-click="_confirmDialog">OK</vaadin-button>
            </action-buttons>
          </template>
        </vaadin-dialog>
            `;
  }
}