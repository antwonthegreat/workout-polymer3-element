import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import './muscle-group-item';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

// import {createItemAsync, deleteItemAsync} from '../../actions/user-to-workout-type-actions';
// import LiftType from '../../model/LiftType';
import {ApplicationState} from '../../model/state/ApplicationState';
import WorkoutType from '../../model/WorkoutType';
import {itemsWithLiftTypesAndUserInfoSelector as workoutTypeSelector} from '../../reducers/workout-type-reducer';
import {store} from '../../store';

@customElement('muscle-groups') export class MuscleGroups extends connectMixin
(store, PolymerElement) {
  @property() workoutTypes: Array<WorkoutType>;
  @property() addWorkoutTypeOpened: boolean;
  @property() newWorkoutTypeName: string;

  connectedCallback() {
    super.connectedCallback();

    this._stateChanged(store.getState());
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }

    this.workoutTypes = workoutTypeSelector(state);
    console.log(this.workoutTypes);
  }

  protected _openAddWorkoutTypeDialog() {
    this.addWorkoutTypeOpened = true;
  }

  protected _closeAddWorkoutTypeDialog() {
    this.addWorkoutTypeOpened = false;
  }

  protected _saveWorkoutTypeDisabled(): boolean {
    return true;
  }

  // _createWorkoutType() {
  //   store.dispatch<any>(createItemAsync({Name: this.newWorkoutName}));
  //   this.blankDialogOpened = false;
  // }

  static get template() {
    return html`<style>
  :host {
    @apply --layout-horizontal;
  }

  main-content {
    @apply --layout-vertical;
    width: 100%;
  }

  header {
    background-color: #fff;
    padding: 24px;
  }

  muscle-group-item {
    margin:2px;
  }

  svg {
    fill: var(--app-text-color-lighter);
    width: 24px;
    height: 24px;
  }

  [hidden] {
    display: none;
  }

  @media (max-width: 736px) {
    main-content {
      margin-left: 0;
    }
  }
</style>

<main-content>
  <header>
    <h1>Muscle Groups</h1>
  </header>
  <template is="dom-repeat" items="[[workoutTypes]]">
    <muscle-group-item workout-type="[[item]]" on-click="_handleMuscleGroupClick">[[item.Name]]</muscle-group-item>
  </template>
</main-content>
<vaadin-dialog opened="{{addWorkoutTypeOpened}}">
  <template>
    <style>
      :host {
        @apply --layout-vertical;
      }
    </style>
    <vaadin-text-field value="{{newWorkoutTypeName}}" label="Name"></vaadin-text-field>
    <action-buttons>
      <vaadin-button cancel on-click="_closeAddWorkoutTypeDialog">Cancel</vaadin-button>
      <vaadin-button disabled="[[_saveWorkoutTypeDisabled]]" on-click="_createWorkoutType">Save</vaadin-button>
    </action-buttons>
  </template>
</vaadin-dialog>
`;
  }
}
