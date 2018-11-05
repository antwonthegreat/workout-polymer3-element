import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import '../../styles/card-shared-styles.js';
import './lift-item';
import './add-lift-dialog';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property, query} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {Actions as AppActions} from '../../actions/app-actions';
import {selectEntityAsync, updateItemAsync} from '../../actions/workout-actions';
import {ApplicationState} from '../../model/state/ApplicationState';
import Workout from '../../model/Workout';
// import {loadingSelector} from '../../reducers/app-reducer';
import {selectedItemWithLiftsWithLiftTypeAndWorkoutSetsSelector} from '../../reducers/workout-reducer';
import {store} from '../../store';
import {AddLiftDialog} from './add-lift-dialog';

@customElement('workout-view') export class WorkoutView extends connectMixin
(store, PolymerElement) {
  @property() route: Object;
  @property() routeData: {id: string|null};
  @property() itemId: number;
  @property() newWorkoutName: string;
  @property() selectedWorkout: Workout|null;
  @query('add-lift-dialog') addLiftDialog: AddLiftDialog;

  connectedCallback() {
    super.connectedCallback();

    this._stateChanged(store.getState());
  }

  @observe('routeData.id')
  routeDataPersonIdChanged(id: string) {
    // Validate from URI
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      store.dispatch(AppActions.showFatalError('Invalid workout Id'));
      return;
    }

    // Assign to a property for change tracking
    this.itemId = idNumber;
  }

  @observe('itemId')
  async pageChanged(itemId: number) {
    if (!itemId)
      return;

    this.newWorkoutName = '';
    store.dispatch<any>(selectEntityAsync(itemId));
  }

  @observe('selectedWorkout')
  selectedWorkoutChanged(selectedWorkout: Workout) {
    if (selectedWorkout && !this.newWorkoutName)
      this.newWorkoutName = selectedWorkout.Name;
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }

    this.selectedWorkout = selectedItemWithLiftsWithLiftTypeAndWorkoutSetsSelector(state);
  }

  protected _nameChanged(newWorkoutName: string, selectedWorkoutName: string) {
    return newWorkoutName === selectedWorkoutName;
  }

  protected _renameWorkout() {
    if (this.selectedWorkout)
      store.dispatch<any>(updateItemAsync(this.selectedWorkout.Id, {Name: this.newWorkoutName}));
  }

  protected _openAddLift() {
    this.addLiftDialog.openDialog();
  }

  static get template() {
    return html`<style include="card-shared-styles">
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
    margin:8px;
  }

  h1 {
    font-size: 25px;
    color: var(--app-text-color);
    line-height: 30px;
    font-weight: 400;
    margin: 0 0 8px 0;
  }

  vaadin-button[add] {
    background-color: var(--app-secondary-color);
    box-shadow: 1px 1px 4px var(--app-primary-color);
    border-radius: 50%;
    color: #fff;
    height: 56px;
    min-width: 56px;
    position: fixed;
    bottom: 16px;
    right: 16px;
    cursor: pointer;
  }

  svg {
    fill: #fff;
  }

  lift-item {
    margin:4px;
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

<app-location route="{{route}}"></app-location>
<app-route route="{{route}}" pattern="/user/workout/:id" data="{{routeData}}"> </app-route>
<main-content>
  <material-card>
    <card-section>
      <vaadin-text-field value="{{newWorkoutName}}" label="Name"></vaadin-text-field>
      <vaadin-button hidden$="[[_nameChanged(newWorkoutName, selectedWorkout.Name)]]" on-click="_renameWorkout">Save</vaadin-button>
    </card-section>
  </material-card>
  <material-card>
    <card-section>
      <template is="dom-repeat" items="[[selectedWorkout.Lifts]]">
        <lift-item lift="[[item]]"></lift-item>
      </template>
    </card-section>
  </material-card>
</main-content>
<vaadin-button on-click="_openAddLift" add>
  <svg style="width:24px;height:24px" viewBox="0 0 24 24">
    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
  </svg>
</vaadin-button>
<add-lift-dialog workout="[[selectedWorkout]]"></add-lift-dialog>
`;
  }

  _formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
