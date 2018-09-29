import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {ApplicationState} from '../../model/state/ApplicationState';
import {store} from '../../store';

@customElement('marketing-error') export class MarketingError extends connectMixin
(store, PolymerElement) {
  @property() fatalErrorMessage: string;

  _stateChanged(state: ApplicationState) {
    if (!state.AppState) {
      return;
    }

    this.fatalErrorMessage = state.AppState.fatalErrorMessage;
  }

  static get template() {
    return html`<style>
  :host {
    @apply --layout-vertical;
    @apply --layout-center;
    margin-top: var(--toolbar-height);
  }

  app-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--toolbar-height);
  }

  app-toolbar {
    --app-toolbar-font-size: 14px;
    background-color: var(--app-primary-color);
    color: #fff;
    padding: 0 16px;
    height: var(--toolbar-height);
  }

  header {
    @apply --layout-flex-auto;
    @apply --layout-horizontal;
    @apply --layout-center-center;
    margin: 16px;
    padding: 16px;
    max-width: 600px;
  }

  h1 {
    font-size: 25px;
    color: var(--app-text-color);
    line-height: 30px;
    font-weight: 400;
    margin: 0 0 8px 0;
  }

  header h3 {
    font-size: 13px;
    color: var(--app-text-color-lighter);
    line-height: 15px;
    font-weight: 400;
    margin: 0;
  }

  header-text {
    @apply --layout-vertical;
    padding: 16px;
  }
  
  img {
    height: 150px;
    width: 150px;
  }
</style>

<app-header shadow fixed id="header">
  <app-toolbar>
    <div main-title>Marketing</div>
    <profile-picture-menu size="35"></profile-picture-menu>
  </app-toolbar>
</app-header>

<header>
  <header-text>
  <h1>Whoops..</h1>
  <h3>[[fatalErrorMessage]]</h3>
</header-text>
  <img src="images/robot.png" />
</header>`;
  }
}