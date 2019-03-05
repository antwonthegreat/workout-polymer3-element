import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@material/mwc-switch/mwc-switch.js';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {createItemAsync, deleteItemAsync} from '../../actions/user-to-lift-type-actions';
import LiftType from '../../model/LiftType.js';
import {ApplicationState} from '../../model/state/ApplicationState';
import {store} from '../../store';

@customElement('lift-type-item') export class LiftTypeItem extends connectMixin
(store, PolymerElement) {
  @property() liftType: LiftType;
  @property() workoutTypeEnabled: boolean;
  @property() isEnabled: boolean;
  @property() userId: number;

  @observe('liftType.*', 'userId')
  workoutTypeChanged(_liftType: any, userId: number) {
    this.isEnabled = this.liftType && this.liftType.UserToLiftTypes.some(userToLiftType => userToLiftType.UserId === userId);
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
      const utlt = this.liftType.UserToLiftTypes.filter(userToLiftType => userToLiftType.UserId === this.userId)[0];
      if (utlt)
        store.dispatch<any>(deleteItemAsync(utlt.Id));
    } else {
      store.dispatch<any>(createItemAsync({UserId: this.userId, LiftTypeId: this.liftType.Id}));
    }
  }

  static get template() {
    return html`
    <style include="card-shared-styles">
          material-card {
            @apply --layout-horizontal;
            background-color:#dddddd;
            padding:4px;
          }

          mwc-switch {
            margin:4px;
          }

          lift-type-name {
            margin-left:16px;
            @apply --layout-flex-2;
          }

          hidden {
            display:none !important;
          }
        </style>
        <material-card>
          <mwc-switch on-click="_onToggleChecked" disabled="[[!workoutTypeEnabled]]" checked="[[isEnabled]]"></mwc-switch>
          <lift-type-name>[[liftType.Name]]</lift-type-name>
        </material-card>
            `;
  }
}