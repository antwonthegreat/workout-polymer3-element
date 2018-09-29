import '@vaadin/vaadin-button/theme/material/vaadin-button.js';
import '@vaadin/vaadin-notification/theme/material/vaadin-notification.js';
import '../../styles/notification-card-styles';

import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {Actions} from '../../actions/app-actions';
import {store} from '../../store';

@customElement('general-snack-bar')
export class GeneralSnackBar extends PolymerElement {
  @property() snackbarErrorMessage: string;

  _closeSnackbar() {
    store.dispatch(Actions.setSnackbarErrorMessage(''));
  }

  static get template() {
    return html`<style>

  vaadin-button {
    min-width: 68px;
  }
</style>
<vaadin-notification duration="0" opened="{{snackbarErrorMessage}}">
  <template>
    [[snackbarErrorMessage]]
    <vaadin-button on-click="_closeSnackbar">Close</vaadin-button>
  </template>
</vaadin-notification>`;
  }
}