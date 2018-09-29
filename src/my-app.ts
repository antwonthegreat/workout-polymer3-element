
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import '@vaadin/vaadin-progress-bar/theme/material/vaadin-progress-bar';
import '@leavittsoftware/user-manager/lib/user-manager.js';
import './components/marketing/marketing-error';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';

import {Actions} from './actions/app-actions';
import {ApplicationState} from './model/state/ApplicationState';
import {store} from './store';

@customElement('my-app') export class MyAppElement extends connectMixin
(store, PolymerElement) {
  @property() isLoading: boolean;
  @property() isOnline: boolean;
  @property() mainPage: string;
  @property() snackbarErrorMessage: string;

  @property() route: Object;
  @property() routeData: {page: string|null};

  @property() page: string;

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  @observe('routeData.page')
  routeDataPersonIdChanged(page: string) {
    const routeablePages = {admin: true, dashboard: true};

    if (!routeablePages[page]) {
      // go to default page.
      this.set('routeData.page', 'admin/');
      return;
    }

    this.page = page;
  }

  @observe('page')
  pageChanged(page: string) {
    store.dispatch(Actions.setMainPage(page));
  }

  connectedCallback() {
    super.connectedCallback();

    afterNextRender(this.$.adminApp, this._lazyLoadExtraComponents.bind(this));
    afterNextRender(this.$.dashboardApp, this._lazyLoadExtraComponents.bind(this));
  }

  async _lazyLoadExtraComponents() {
    try {
      await import('../node_modules/@leavittsoftware/titanium-elements/lib/titanium-offline-notice.js');
      await import('../node_modules/@leavittsoftware/titanium-elements/lib/titanium-sw-notifier.js');
      await import('./components/general/general-snack-bar.js');
    } catch (error) {
      console.warn('One or more components failed to load', error);
    }
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AppState)
      return;
    this.mainPage = state.AppState.mainPage;
    this.snackbarErrorMessage = state.AppState.snackbarErrorMessage;
    this.isLoading = state.AppState.loadingCounter > 0;
    document.title = state.AppState.title;
  }

  @observe('mainPage')
  protected async currentPageChanged(mainPage: string|null) {
    if (!mainPage)
      return;

    const title = `${mainPage.charAt(0).toUpperCase() + mainPage.slice(1)} - Leavitt Group Marketing`;
    store.dispatch(Actions.setTitle(title));
    try {
      switch (mainPage) {
        case 'admin':
          store.dispatch(Actions.pageLoadingStarted());
          await import('./components/admin/admin-app.js');
          store.dispatch(Actions.pageLoadingEnded());
          break;
        case 'dashboard':
          store.dispatch(Actions.pageLoadingStarted());
          await import('./components/dashboard/dashboard-app.js');
          store.dispatch(Actions.pageLoadingEnded());
          break;
      }
    } catch (error) {
      store.dispatch(Actions.showFatalError('We were unable to find the page you are looking for'));
    }

    this._removeFakeToolbar();
  }

  _removeFakeToolbar() {
    const fakeToolbar: HTMLElement|null = document.querySelector('#fakeToolbar');
    if (fakeToolbar)
      fakeToolbar.style.display = 'none';
  }

  _isActive(page: string, value: string) {
    return page === value;
  }

  static get template() {
    return html`<style>
  :host {
    --app-primary-color: #1F3B5B;
    --app-secondary-color: #3B95FF;
    --app-text-color: #424242;
    --app-text-color-lighter: #757575;
    --app-border-color: #eee;
    --material-primary-color: var(--app-secondary-color);
    --material-primary-text-color: var(--app-secondary-color);
    --toolbar-height: 48px;
    overflow: hidden;
    position: relative;
    @apply --layout-vertical;
    @apply --layout-flex-auto;
    font-family: 'Roboto';
  }

  main-content {
    @apply --layout-vertical;
    @apply --layout-flex-auto;
  }

  main-content[offline] {
    margin-top: calc(var(--toolbar-height));
  }

  vaadin-progress-bar {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 9;
    margin: 0;
  }

  [hidden],
  [unresolved] {
    display: none;
  }
</style>
<user-manager></user-manager>
<app-location route="{{route}}"></app-location>
<app-route route="{{route}}" pattern="/:page" data="{{routeData}}"> </app-route>

<vaadin-progress-bar hidden$="[[!isLoading]]" indeterminate duration="0"></vaadin-progress-bar>
<main-content offline$="[[!isOnline]]">
  <admin-app id="adminApp" hidden$="[[!_isActive(mainPage, 'admin')]]"></admin-app>
  <dashboard-app id="dashboardApp" hidden$="[[!_isActive(mainPage, 'dashboard')]]">Dashboard App</dashboard-app>
  <marketing-error hidden$="[[!_isActive(mainPage, 'error')]]">Marketing Error</marketing-error>
</main-content>
<titanium-offline-notice is-online="{{isOnline}}"> </titanium-offline-notice>
<general-snack-bar snackbar-error-message="[[snackbarErrorMessage]]"></general-snack-bar>
<titanium-sw-notifier></titanium-sw-notifier>`;
  }
}
