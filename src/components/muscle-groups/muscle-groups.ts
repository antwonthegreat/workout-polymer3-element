import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import './muscle-group-item';
import '@material/mwc-fab/mwc-fab';
import '@vaadin/vaadin-tabs/vaadin-tabs';
import '@vaadin/vaadin-tabs/vaadin-tab';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {createItemAsync} from '../../actions/workout-type-actions';
// import LiftType from '../../model/LiftType';
import {ApplicationState} from '../../model/state/ApplicationState';
import WorkoutType from '../../model/WorkoutType';
import {itemsWithLiftTypesAndUserInfoSelector as workoutTypeSelector} from '../../reducers/workout-type-reducer';
import {store} from '../../store';

@customElement('muscle-groups') export class MuscleGroups extends connectMixin
(store, PolymerElement) {
  @property() workoutTypes: Array<WorkoutType>;
  @property() addModalOpened: boolean;
  @property() newWorkoutTypeName: string;
  @property() selectedTabIndex: number;

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

  protected _openAddModal() {
    this.addModalOpened = true;
  }

  protected _closeAddModal() {
    this.addModalOpened = false;
  }

  protected _saveWorkoutTypeDisabled(newWorkoutTypeName: string): boolean {
    return !newWorkoutTypeName;
  }

  _createWorkoutType() {
    store.dispatch<any>(createItemAsync({Name: this.newWorkoutTypeName}));
    this.addModalOpened = false;
  }

  protected _areEqual(a: any, b: any): boolean {
    return a === b;
  }

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

  mwc-fab {
    position: fixed;
    bottom: 16px;
    right: 16px;
  }

  add-lift-type,
  add-muscle-group {
    @apply --layout-vertical;
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
<mwc-fab on-click="_openAddModal" icon="add"></mwc-fab>
<vaadin-dialog opened="{{addModalOpened}}">
  <template>
    <style>
      :host {
        @apply --layout-vertical;
      }
    </style>
    <vaadin-tabs selected="{{selectedTabIndex}}">
        <vaadin-tab>Muscle Group</vaadin-tab>
        <vaadin-tab>Lift</vaadin-tab>
    </vaadin-tabs>
    <add-muscle-group hidden$="[[!_areEqual(selectedTabIndex,0)]]">
      <vaadin-text-field value="{{newWorkoutTypeName}}" label="Name"></vaadin-text-field>
      <action-buttons>
        <vaadin-button cancel on-click="_closeAddModal">Cancel</vaadin-button>
        <vaadin-button disabled="[[_saveWorkoutTypeDisabled(newWorkoutTypeName)]]" on-click="_createWorkoutType">Save</vaadin-button>
      </action-buttons>
    </add-muscle-group>
    <add-lift-type hidden$="[[!_areEqual(selectedTabIndex,1)]]">
      <vaadin-text-field value="{{newLiftTypeName}}" label="Name"></vaadin-text-field>
      <action-buttons>
        <vaadin-button cancel on-click="_closeAddModal">Cancel</vaadin-button>
        <vaadin-button disabled="[[_saveLiftTypeDisabled(newLiftTypeName)]]" on-click="_createLiftType">Save</vaadin-button>
      </action-buttons>
    </add-lift-type>
  </template>
</vaadin-dialog>
`;
  }
}
