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

  protected _activeToggleClicked(event: any) {
    event.stopPropagation();
    // store.dispatch<any>(createWorkoutSetAsync(newWorkoutSet));
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
            margin:4px;
          }

          workout-type-name {
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