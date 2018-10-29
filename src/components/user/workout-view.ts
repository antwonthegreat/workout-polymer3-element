import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import '../../styles/card-shared-styles.js';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {Actions as AppActions} from '../../actions/app-actions';
import {selectEntityAsync, updateItemAsync} from '../../actions/workout-actions';
import {ApplicationState} from '../../model/state/ApplicationState';
import Workout from '../../model/Workout';
// import {loadingSelector} from '../../reducers/app-reducer';
import {selectedItemSelector} from '../../reducers/workout-reducer';
import {store} from '../../store';

@customElement('workout-view') export class WorkoutView extends connectMixin
(store, PolymerElement) {
  @property() route: Object;
  @property() routeData: {id: string|null};
  @property() itemId: number;
  @property() newWorkoutName: string;

  @property() selectedWorkout: Workout|null;

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

    store.dispatch<any>(selectEntityAsync(itemId));
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }

    this.selectedWorkout = selectedItemSelector(state);
    if (this.selectedWorkout && !this.newWorkoutName)
      this.newWorkoutName = this.selectedWorkout.Name;
  }

  protected _nameChanged(newWorkoutName: string, selectedWorkoutName: string) {
    return newWorkoutName === selectedWorkoutName;
  }

  protected _renameWorkout() {
    if (this.selectedWorkout)
      store.dispatch<any>(updateItemAsync(this.selectedWorkout.Id, {Name: this.newWorkoutName}));
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
    <card-header-section>
      <vaadin-text-field value="{{newWorkoutName}}" label="Name"></vaadin-text-field>
      <vaadin-button hidden$="[[_nameChanged(newWorkoutName, selectedWorkout.Name)]]" on-click="_renameWorkout">Save</vaadin-button>
    </card-header-section>
  </material-card>
</main-content>
`;
  }

  _formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
