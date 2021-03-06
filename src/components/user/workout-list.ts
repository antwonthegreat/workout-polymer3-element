import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import '../../styles/vaadin-combo-box-item-styles';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {createItemAsync, getItemExpandedIfNeededAsync, getItemsAsync} from '../../actions/workout-actions';
import Lift from '../../model/Lift';
import LiftType from '../../model/LiftType';
import {ApplicationState} from '../../model/state/ApplicationState';
import Workout from '../../model/Workout';
import WorkoutType from '../../model/WorkoutType';
import {loadingSelector} from '../../reducers/app-reducer';
import {activeIncompleteItemSelector} from '../../reducers/lift-type-reducer';
// import {itemsByWorkoutTypesSelector} from '../../reducers/user-to-workout-type-reducer';
import {workoutWithLiftsWithLiftTypeSelector} from '../../reducers/workout-reducer';
import {itemsSelector as workoutTypeSelector} from '../../reducers/workout-type-reducer';
import {IdMap} from '../../services/action-helpers';
import {store} from '../../store';

type WorkoutTypeComboBoxItem = {
  label: string,
  value: WorkoutType
};

@customElement('workout-list') export class WorkoutList extends connectMixin
(store, PolymerElement) {
  @property() route: Object;
  @property() routeData: {page: string|null};
  @property() workouts: Array<Workout>;
  @property() workoutTypeComboBoxItems: Array<WorkoutTypeComboBoxItem>;
  @property() isLoading: boolean;
  @property() blankDialogOpened: boolean;
  @property() randomDialogOpened: boolean;
  @property() templateDialogOpened: boolean;
  @property() newWorkoutName: string;
  @property() randomLiftCount: string;
  @property() selectedWorkoutTypeComboBoxItem: WorkoutTypeComboBoxItem|null;
  // @property() t;

  connectedCallback() {
    super.connectedCallback();

    this._stateChanged(store.getState());
    store.dispatch<any>(getItemsAsync());
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }

    this.isLoading = loadingSelector(state);
    this.workouts = workoutWithLiftsWithLiftTypeSelector(state);
    this.workoutTypeComboBoxItems = workoutTypeSelector(state).map(workoutType => {
      return {label: workoutType.Name, value: workoutType};
    });
    // this.t = itemsByWorkoutTypesSelector(state)[6].LastCompletedDate;
    // console.log(allActiveIncompleteItemsSelector(state, 6, [], false));
  }

  static get template() {
    return html`<style include="vaadin-combo-box-item-styles">
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

  workout-summary {
    @apply --layout-vertical;
    background-color:#fff;
    margin-bottom:1px;
  }

  create-buttons {
    background-color:#fff;
    @apply --layout-horizontal;
    bottom: 16px;
    right: 16px;
		position: fixed;
  }

  vaadin-button {
    @apply --layout-self-end;
    margin-top: 8px;
    cursor: pointer;
  }

  svg {
    fill: var(--app-text-color-lighter);
    width: 24px;
    height: 24px;
  }

  action-buttons {
    @apply --layout-horizontal;
    @apply --layout-end-justified;
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
<app-route route="{{route}}" pattern="/user/:page" data="{{routeData}}"> </app-route>
<main-content>
  <header>
    <h1>My Workouts</h1>
  </header>
  <template is="dom-repeat" items="[[workouts]]">
    <workout-summary on-click="_handleWorkoutSummaryClick">
      <workout-name>[[item.Name]] [[item.StartDate]]</workout-name>
      <workout-date>[[_formatDate(item.StartDate)]]</workout-date>
      <ul hidden$="[[!item.Lifts.0]">
        <template is="dom-repeat" items="[[item.Lifts]]">
          <li>[[item.LiftType.Name]]</li>
        </template>
      </ul>
      <empty-message hidden$="[[item.Lifts.0]]">No Lifts</empty-message>
    </workout-summary>
  </template>
  <create-buttons>
    <vaadin-button disabled="[[isLoading]]" icon-button item="[[item]]" on-click="_handleTemplateClick">
      <svg prefix viewBox="0 0 24 24">
      <path d="M17,9H7V7H17M17,13H7V11H17M14,17H7V15H14M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"/>
      </svg>
    </vaadin-button>
    <vaadin-button disabled="[[isLoading]]" icon-button item="[[item]]" on-click="_handleRandomClick">
      <svg prefix viewBox="0 0 24 24">
        <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M7,5A2,2 0 0,0 5,7A2,2 0 0,0 7,9A2,2 0 0,0 9,7A2,2 0 0,0 7,5M17,15A2,2 0 0,0 15,17A2,2 0 0,0 17,19A2,2 0 0,0 19,17A2,2 0 0,0 17,15M17,10A2,2 0 0,0 15,12A2,2 0 0,0 17,14A2,2 0 0,0 19,12A2,2 0 0,0 17,10M17,5A2,2 0 0,0 15,7A2,2 0 0,0 17,9A2,2 0 0,0 19,7A2,2 0 0,0 17,5M7,10A2,2 0 0,0 5,12A2,2 0 0,0 7,14A2,2 0 0,0 9,12A2,2 0 0,0 7,10M7,15A2,2 0 0,0 5,17A2,2 0 0,0 7,19A2,2 0 0,0 9,17A2,2 0 0,0 7,15Z"/>
      </svg>
    </vaadin-button>
    <vaadin-button disabled="[[isLoading]]" icon-button item="[[item]]" on-click="_handleBlankClick">
      <svg prefix viewBox="0 0 24 24">
      <path d="M9,4A3,3 0 0,1 12,1A3,3 0 0,1 15,4H19A2,2 0 0,1 21,6V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V6A2,2 0 0,1 5,4H9M12,3A1,1 0 0,0 11,4A1,1 0 0,0 12,5A1,1 0 0,0 13,4A1,1 0 0,0 12,3Z"/>
      </svg>
    </vaadin-button>
  </create-buttons>
</main-content>
<vaadin-dialog opened="{{blankDialogOpened}}">
  <template>
    <style>
      :host {
        @apply --layout-vertical;
      }
    </style>
    <vaadin-text-field value="{{newWorkoutName}}" label="Name" placeholder="(leave blank)"></vaadin-text-field>
    <action-buttons>
      <vaadin-button cancel disabled="[[isDeleting]]" on-click="_closeBlankDialog">Cancel</vaadin-button>
      <vaadin-button disabled="[[isDeleting]]" on-click="_createBlankWorkout">Ok</vaadin-button>
    </action-buttons>
  </template>
</vaadin-dialog>
<vaadin-dialog opened="{{randomDialogOpened}}">
  <template>
    <style>
      :host {
        @apply --layout-vertical;
      }

      main {
        display: block;
        padding: 8px;
        @apply --layout-vertical;
      }
    </style>
    <main>
      <vaadin-text-field value="{{newWorkoutName}}" label="Name" placeholder="(leave blank)"></vaadin-text-field>
      <vaadin-combo-box-light opened="{{opened}}" items="[[workoutTypeComboBoxItems]]" selected-item="{{selectedWorkoutTypeComboBoxItem}}">
        <vaadin-text-field placeholder="Any" label="Muscle Group">
          <template>
          <span>[[item.label]]</span>
          </template>
        </vaadin-text-field>
      </vaadin-combo-box-light>
      <vaadin-text-field value="{{randomLiftCount}}" label="Number of Lifts" placeholder="3"></vaadin-text-field>
      <action-buttons>
        <vaadin-button cancel disabled="[[isDeleting]]" on-click="_closeRandomDialog">Cancel</vaadin-button>
        <vaadin-button disabled="[[isDeleting]]" on-click="_createRandomWorkout">Ok</vaadin-button>
      </action-buttons>
    </main>
  </template>
</vaadin-dialog>
`;
  }

  _handleBlankClick() {
    this.blankDialogOpened = true;
  }

  _closeBlankDialog() {
    this.blankDialogOpened = false;
  }

  _createBlankWorkout() {
    store.dispatch<any>(createItemAsync({Name: this.newWorkoutName}));
    this.blankDialogOpened = false;
  }

  _handleRandomClick() {
    this.randomDialogOpened = true;
  }

  _closeRandomDialog() {
    this.randomDialogOpened = false;
  }

  _createRandomWorkout() {
    let liftCount = parseInt(this.randomLiftCount, 10);
    liftCount = isNaN(liftCount) || liftCount < 0 ? 3 : liftCount;
    const liftTypes: IdMap<LiftType> = {};
    while (liftCount > 0) {
      const liftType = activeIncompleteItemSelector(store.getState(), this.selectedWorkoutTypeComboBoxItem ? this.selectedWorkoutTypeComboBoxItem.value.Id : null, liftTypes, true);
      if (!liftType) {
        liftCount = 0;
        break;
      }
      liftTypes[liftType.Id] = liftType;
      liftCount--;
    }
    const lifts = Object.values(liftTypes).map(liftType => {
      return {LiftTypeId: liftType.Id};
    });
    store.dispatch<any>(createItemAsync({Name: this.newWorkoutName, Lifts: lifts as Array<Lift>}));
    this.randomDialogOpened = false;
  }

  _handleWorkoutSummaryClick(event: any) {
    store.dispatch<any>(getItemExpandedIfNeededAsync(event.model.item.Id));
  }
  // TODO:clear modal inputs on success
  _formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
