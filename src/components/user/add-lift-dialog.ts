import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-combo-box/theme/material/vaadin-combo-box-light';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {createItemAsync} from '../../actions/lift-actions';
import LiftType from '../../model/LiftType';
import {ApplicationState} from '../../model/state/ApplicationState';
import Workout from '../../model/Workout';
import WorkoutType from '../../model/WorkoutType';
import {getActiveItems} from '../../reducers/lift-type-reducer';
import {itemsSelector as workoutTypeSelector} from '../../reducers/workout-type-reducer';
import {store} from '../../store';

type WorkoutTypeComboBoxItem = {
  label: string,
  value: WorkoutType
};

type LiftTypeComboBoxItem = {
  label: string,
  value: LiftType
};

@customElement('add-lift-dialog') export class AddLiftDialog extends connectMixin
(store, PolymerElement) {
  @property() opened: boolean = false;
  @property() workoutTypeComboBoxItems: Array<WorkoutTypeComboBoxItem>;
  @property() liftTypeComboBoxItems: Array<LiftTypeComboBoxItem>;
  @property() selectedWorkoutTypeComboBoxItem: WorkoutTypeComboBoxItem|null;
  @property() selectedLiftTypeComboBoxItem: LiftTypeComboBoxItem|null;
  @property() workout: Workout;

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }

    this.workoutTypeComboBoxItems = workoutTypeSelector(state).map(workoutType => {
      return {label: workoutType.Name, value: workoutType};
    });
  }

  @observe('selectedWorkoutTypeComboBoxItem')
  protected _selectedWorkoutTypeChanged(selectedWorkoutTypeComboBoxItem: WorkoutTypeComboBoxItem) {
    if (!selectedWorkoutTypeComboBoxItem) {
      this.liftTypeComboBoxItems = [];
      this.selectedLiftTypeComboBoxItem = null;

      return;
    }

    this.liftTypeComboBoxItems = getActiveItems(store.getState(), selectedWorkoutTypeComboBoxItem.value.Id).map((liftType) => {
      return {label: liftType.Name, value: liftType};
    });
    // TODO: filter lt aleady in workout
    // TODO: mark completed lts
  }

  protected _closeDialog() {
    this.opened = false;
  }

  public openDialog() {
    this.opened = true;
  }

  protected _saveDisabled(selectedLiftType: LiftTypeComboBoxItem) {
    return !selectedLiftType;
  }

  protected _addLift() {
    if (!this.selectedLiftTypeComboBoxItem)
      return;
    store.dispatch<any>(createItemAsync({LiftTypeId: this.selectedLiftTypeComboBoxItem.value.Id, WorkoutId: this.workout.Id}));
    this._closeDialog();
  }

  static get template() {
    return html`<style>
  :host {
    @apply --layout-horizontal;
  }

  action-buttons {
    @apply --layout-horizontal;
    @apply --layout-end-justified;
  }

  vaadin-button {
      cursor:pointer;
  }
</style>
<vaadin-dialog no-close-on-esc no-close-on-outside-click opened="[[opened]]">
  <template>
    <style>
        main {
            display: block;
            padding: 8px;
            @apply --layout-vertical;
        }
    </style>
    <main>
        <header>Add Lift</header>
        <vaadin-combo-box-light items="[[workoutTypeComboBoxItems]]" selected-item="{{selectedWorkoutTypeComboBoxItem}}">
            <vaadin-text-field placeholder="" label="Muscle Group">
            <template>
                <span>[[item.label]]</span>
            </template>
            </vaadin-text-field>
        </vaadin-combo-box-light>
        <vaadin-combo-box-light disabled="[[!selectedWorkoutTypeComboBoxItem]]" items="[[liftTypeComboBoxItems]]" selected-item="{{selectedLiftTypeComboBoxItem}}">
            <vaadin-text-field placeholder="" label="Lift Type">
            <template>
                <span>[[item.label]]</span>
            </template>
            </vaadin-text-field>
        </vaadin-combo-box-light>
        <action-buttons>
            <vaadin-button cancel on-click="_closeDialog">CANCEL</vaadin-button>
            <vaadin-button disabled="[[_saveDisabled(selectedLiftTypeComboBoxItem)]]" on-click="_addLift">Save</vaadin-button>
        </action-buttons>
    </main>
  </template>
</vaadin-dialog>

`;
  }
}