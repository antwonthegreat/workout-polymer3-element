import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '../../styles/vaadin-combo-box-item-styles';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {createItemAsync} from '../../actions/lift-actions';
import LiftType from '../../model/LiftType';
import {ApplicationState} from '../../model/state/ApplicationState';
import Workout from '../../model/Workout';
import WorkoutType from '../../model/WorkoutType';
import {activeIncompleteItemSelector, allActiveIncompleteItemsSelector, getActiveItems} from '../../reducers/lift-type-reducer';
import {itemsSelector as workoutTypeSelector} from '../../reducers/workout-type-reducer';
import {IdMap, toDictionary} from '../../services/action-helpers';
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
  @property() selectedWorkoutTypeComboBoxItem: WorkoutTypeComboBoxItem|null = null;
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
    const activeLiftTypes = getActiveItems(store.getState(), selectedWorkoutTypeComboBoxItem.value.Id);
    const liftTypesAlreadyInWorkout: IdMap<LiftType> = this.workout.Lifts.reduce((acc: IdMap<LiftType>, lift) => {
      const liftType = activeLiftTypes.filter(liftType => liftType.Id === lift.LiftTypeId)[0];
      if (liftType)
        acc[liftType.Id] = liftType;
      return acc;
    }, {});
    const incompleteLiftTypes: IdMap<LiftType> = toDictionary(allActiveIncompleteItemsSelector(store.getState(), selectedWorkoutTypeComboBoxItem.value.Id, liftTypesAlreadyInWorkout, false));

    this.liftTypeComboBoxItems = activeLiftTypes
                                     .filter(liftType => !this.workout.Lifts.some(lift => lift.LiftTypeId === liftType.Id))  // filter out lift types already in this workout
                                     .map((liftType) => {
                                       return {label: liftType.Name, value: {...liftType, completed: !incompleteLiftTypes[liftType.Id]}};
                                     });
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
    this.selectedLiftTypeComboBoxItem = null;
    this._closeDialog();
  }

  protected _workoutTypeSelected(selectedWorkoutTypeComboBoxItem: WorkoutTypeComboBoxItem): boolean {
    return !!selectedWorkoutTypeComboBoxItem;
  }

  protected _randomClicked() {
    if (!this.selectedWorkoutTypeComboBoxItem)
      return;
    const activeLiftTypes = getActiveItems(store.getState(), this.selectedWorkoutTypeComboBoxItem.value.Id);
    const liftTypesAlreadyInWorkout: IdMap<LiftType> = this.workout.Lifts.reduce((acc: IdMap<LiftType>, lift) => {
      const liftType = activeLiftTypes.filter(liftType => liftType.Id === lift.LiftTypeId)[0];
      if (liftType)
        acc[liftType.Id] = liftType;
      return acc;
    }, {});
    const liftType = activeIncompleteItemSelector(store.getState(), this.selectedWorkoutTypeComboBoxItem.value.Id, liftTypesAlreadyInWorkout, false);
    if (!liftType)
      return;
    this.selectedLiftTypeComboBoxItem = this.liftTypeComboBoxItems.filter(item => item.value.Id === liftType.Id)[0];
  }

  static get template() {
    return html`<style include="vaadin-combo-box-item-styles">
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

  lift-type-item {
    width:100%;
    @apply --layout-horizontal;
  }

  lift-type-section {
    @apply --layout-horizontal;
    @apply --layout-end;
  }


  hidden {
          display:none !important;
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


        lift-type-item {
          width:100%;
          @apply --layout-horizontal;
        }

        hidden {
          display:none !important;
        }

        completed-mark {
          display: inline;
        }

        svg {
          @apply --layout-end-justified;
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
        <lift-type-section hidden$="[[!_workoutTypeSelected(selectedWorkoutTypeComboBoxItem)]]">
          <vaadin-combo-box-light items="[[liftTypeComboBoxItems]]" selected-item="{{selectedLiftTypeComboBoxItem}}">
              <vaadin-text-field placeholder="" label="Lift Type">
              <template>
                <lift-type-item>
                  <label>[[item.label]]</label>
                  <completed-mark hidden$="[[!item.value.completed]]">
                    <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                    </svg>
                  </completed-mark>
                <lift-type-item>
              </template>
              </vaadin-text-field>
          </vaadin-combo-box-light>
          <vaadin-button on-click="_randomClicked">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M7,5A2,2 0 0,0 5,7A2,2 0 0,0 7,9A2,2 0 0,0 9,7A2,2 0 0,0 7,5M17,15A2,2 0 0,0 15,17A2,2 0 0,0 17,19A2,2 0 0,0 19,17A2,2 0 0,0 17,15M17,10A2,2 0 0,0 15,12A2,2 0 0,0 17,14A2,2 0 0,0 19,12A2,2 0 0,0 17,10M17,5A2,2 0 0,0 15,7A2,2 0 0,0 17,9A2,2 0 0,0 19,7A2,2 0 0,0 17,5M7,10A2,2 0 0,0 5,12A2,2 0 0,0 7,14A2,2 0 0,0 9,12A2,2 0 0,0 7,10M7,15A2,2 0 0,0 5,17A2,2 0 0,0 7,19A2,2 0 0,0 9,17A2,2 0 0,0 7,15Z" />
            </svg>
          </vaadin-button>
        </lift-type-section>
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