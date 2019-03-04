import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@material/mwc-switch/mwc-switch.js';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import LiftType from '../../model/LiftType.js';
// import {Actions as AppActions} from '../../actions/app-actions';
// import {deleteItemAsync, createItemAsync} from '../../actions/user-to-workout-type-actions';
import {ApplicationState} from '../../model/state/ApplicationState';
// import UserToLiftType from '../../model/UserToLiftType';
import {store} from '../../store';

@customElement('lift-type-item') export class LiftTypeItem extends connectMixin
(store, PolymerElement) {
  @property() liftType: LiftType;
  @property() workoutTypeEnabled: boolean;

  protected _activeToggleClicked(event: any) {
    event.stopPropagation();
    // store.dispatch<any>(createWorkoutSetAsync(newWorkoutSet));
  }

  _stateChanged(_state: ApplicationState) {
  }

  static get template() {
    return html`
    <style include="card-shared-styles">
          material-card {
            @apply --layout-horizontal;
            background-color:#cccccc;
            padding:4px;
          }

          mwc-switch {
            margin:4px;
          }

          lift-type-name {
            @apply --layout-flex-2;
          }

          hidden {
            display:none !important;
          }
        </style>
        <material-card>
          <mwc-switch on-click="_onToggleChecked" disabled="[[!workoutTypeEnabled]]" checked="[[IsEnabled]]"></mwc-switch>
          <lift-type-name>[[liftType.Name]]</lift-type-name>
        </material-card>
            `;
  }
}