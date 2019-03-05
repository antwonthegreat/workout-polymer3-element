import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-collapse/iron-collapse';
import '@material/mwc-switch/mwc-switch.js';
import './lift-type-item';
import '../../styles/card-shared-styles.js';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

// import {Actions as AppActions} from '../../actions/app-actions';
import {createItemAsync, deleteItemAsync} from '../../actions/user-to-workout-type-actions';
import {ApplicationState} from '../../model/state/ApplicationState';
import WorkoutType from '../../model/WorkoutType.js';
// import UserToWorkoutType from '../../model/UserToWorkoutType';
import {store} from '../../store';

@customElement('muscle-group-item') export class MuscleGroupItem extends connectMixin
(store, PolymerElement) {
  @property() workoutType: WorkoutType;
  @property() expanded: boolean = false;
  @property() userId: number;
  @property() isEnabled: boolean;

  protected _headerClicked() {
    this.expanded = !this.expanded;
  }

  @observe('workoutType.*', 'userId')
  workoutTypeChanged(_workoutType: any, userId: number) {
    this.isEnabled = this.workoutType && this.workoutType.UserToWorkoutTypes.some(userToWorkoutType => userToWorkoutType.UserId === userId);
  }

  _stateChanged(_state: ApplicationState) {
    if (!_state.AppReducer || !_state.AppReducer.userId)
      return;

    this.userId = _state.AppReducer.userId;
  }

  protected _onToggleChecked(e: Event) {
    e.stopImmediatePropagation();
    if (e.target && (e.target as any).disabled) {
      e.preventDefault();
      return;
    }
    if (this.isEnabled) {
      store.dispatch<any>(deleteItemAsync(this.workoutType.Id));
    } else {
      store.dispatch<any>(createItemAsync({UserId: this.userId, WorkoutTypeId: this.workoutType.Id}));
    }
  }

  static get template() {
    return html`
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

          iron-collapse {
            @apply --layout-vertical;
          }

          mwc-switch {
            margin:8px;
          }

          svg {
            fill: #757575;
          }

          expand-container {
            background-color:#cccccc;
            margin: 0 16px 0 0;
            padding: 0;
            min-width: 24px;
            cursor: pointer;
            -webkit-transition: .25s ease-in-out;
            -moz-transition: .25s ease-in-out;
            -o-transition: .25s ease-in-out;
            transition: .25s ease-in-out;
          }

          expand-container[opened] {
            -webkit-transform: rotate(180deg);
            -moz-transform: translate(180deg);
            -o-transform: translate(180deg);
            -ms-transform: translate(180deg);
            transform: translate(180deg);
          }

          workout-type-name {
            @apply --layout-horizontal;
            @apply --layout-self-center;
            @apply --layout-center-center;
            @apply --layout-flex-2;
          }

          lift-type-item {
            margin: 2px 16px;
          }

          hidden {
            display:none !important;
          }
        </style>
        <material-card>
          <header on-click="_headerClicked">
            <mwc-switch on-click="_onToggleChecked" checked="[[isEnabled]]"></mwc-switch>
            <workout-type-name>[[workoutType.Name]]</workout-type-name>
            <expand-container opened$="[[expanded]]">
              <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"" />
              </svg>
            </expand-container>
          </header>
          <iron-collapse opened="[[expanded]]">
            <template is="dom-repeat" items="[[workoutType.LiftTypes]]">
              <lift-type-item workout-type-enabled="[[isEnabled]]" lift-type="[[item]]">[[item.Name]]</lift-type-item>
            </template>
          </iron-collapse>
        </material-card>
            `;
  }
}