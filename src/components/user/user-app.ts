import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';

import {installMediaQueryWatcher} from '@leavittsoftware/titanium-elements/lib/titanium-media-query.js';
import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property, query} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

import {Actions as AppAction} from '../../actions/app-actions';
import {ApplicationState} from '../../model/state/ApplicationState';
import {adminAppReducer as AdminState} from '../../reducers/admin-app-reducer';
import {store} from '../../store';

store.addReducers({AdminState});
@customElement('user-app') export class UserAppElement extends connectMixin
(store, PolymerElement) {
  @property() isDesktopNavigationOpen: boolean = false;
  @property() isSmallScreen: boolean;
  @property() toolbarTitle: string;
  @property() route: Object;
  @property() routeData: {personId: string|null};

  @query('app-drawer') appDrawer: any;

  private userSettingDrawerClosed: boolean = true;
  private _sideMenuLoaded: boolean = false;

  ready() {
    super.ready();
  }

  connectedCallback() {
    super.connectedCallback();

    installMediaQueryWatcher(`(max-width: 736px)`, (matches) => this.isSmallScreen = matches);
    afterNextRender(this.$.header, async () => {
      try {
        store.dispatch(AppAction.pageLoadingStarted());
        await import('../../../node_modules/@polymer/app-layout/app-drawer/app-drawer.js');
      } catch (error) {
        console.warn('One or more components failed to load', error);
      }
      store.dispatch(AppAction.pageLoadingEnded());
      this.appDrawer.removeAttribute('unresolved');
    });

    this._stateChanged(store.getState());
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AdminState) {
      return;
    }

    this.toolbarTitle = state.AdminState.toolbarTitle;
  }

  @observe('routeData.personId')
  routeDataPersonIdChanged(personId: string) {
    // Validate from URI
    const _personId = Number(personId);
    if (!_personId) {
      this.set('routeData.personId', '');
      return;
    }

    // Assign to a property for change tracking
    // this.personId = Number(personId);
  }

  @observe('isSmallScreen')
  isSmallScreenChanged(isSmallScreen: boolean) {
    if (isSmallScreen) {
      this.isDesktopNavigationOpen = false;
      return;
    }

    // is a large screen
    if (this.userSettingDrawerClosed) {
      this.isDesktopNavigationOpen = false;
      if (this.appDrawer.close)
        this.appDrawer.close();
    } else {
      this.isDesktopNavigationOpen = true;
      if (this.appDrawer.close)
        this.appDrawer.close();
    }
  }

  private async _loadSideMenu() {
    store.dispatch(AppAction.pageLoadingStarted());
    try {
      // await import('../../../node_modules/@leavittsoftware/manage-side-menu/lib/manage-side-menu.js');
      this._sideMenuLoaded = true;
    } catch (error) {
      console.warn('One or more components failed to load', error);
    }
    store.dispatch(AppAction.pageLoadingEnded());
  }

  protected _toggleDrawer() {
    if (!this._sideMenuLoaded)
      this._loadSideMenu();

    if (!this.appDrawer)
      return;

    if (this.isSmallScreen) {
      if (this.appDrawer.opened) {
        this.userSettingDrawerClosed = true;
      } else {
        this.userSettingDrawerClosed = false;
      }
      if (this.appDrawer.toggle)
        this.appDrawer.toggle();
      return;
    }

    if (this.isDesktopNavigationOpen) {
      this.userSettingDrawerClosed = true;
      this.isDesktopNavigationOpen = false;
    } else {
      this.userSettingDrawerClosed = false;
      this.isDesktopNavigationOpen = true;
    }
  }

  static get template() {
    return html`<style>
  :host {
    @apply --layout-horizontal;
    margin-top: var(--toolbar-height);
    padding: 8px;
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
    color: #FFFFFF;
    padding: 0 8px;
    height: var(--toolbar-height);
  }

  app-drawer {
    --app-drawer-content-container: {
      overflow-y: auto;
    }
  }

  app-drawer manage-side-menu{
    display: block;
    margin: 0 8px;
  }

  main-content {
    @apply --layout-vertical;
    width: 100%;
  }

  side-navigation {
    @apply --layout-vertical;
    -webkit-transition: all .25s;
    transition: all .25s;
    transform: translateX(0);
    min-width: 220px;
    margin-right: 8px;
  }

  side-navigation[closed] {
    transform: translateX(-400px);
    width: 0;
    min-width: 0;
    height: 0;
    margin-right: 0;
  }

  manage-side-menu .loading {
    text-align: center;
    padding: 8px;
  }

  img[logo] {
    margin: 24px 32px 8px 35px;
    width: 150px;
  }

  svg[menu-button] {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    vertical-align: top;
    fill: white;
    cursor: pointer;
    transform: rotate(0deg);
    transition: .3s ease;
    transform-origin: 50%;
  }

  svg[menu-button][opened] {
    transform: rotate(180deg);
    transform-origin: 50%;
  }

  [unresolved] {
    display: none;
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

  header h3 {
    font-size: 13px;
    color: var(--app-text-color-lighter);
    line-height: 15px;
    font-weight: 400;
    margin: 0;
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
<app-route route="{{route}}" pattern="/admin/:personId" data="{{routeData}}"> </app-route>

<side-navigation closed$="[[!isDesktopNavigationOpen]]">
  <manage-side-menu></manage-side-menu>
</side-navigation>

<main-content>
  <header>
    <h1>User Page</h1>
  </header>
</main-content>

<app-header shadow fixed id="header">
  <app-toolbar>
    <div>
      <svg menu-button opened$="[[isDesktopNavigationOpen]]" on-click="_toggleDrawer">
        <g id="menu">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </g>
      </svg>
    </div>
    <div main-title>[[toolbarTitle]]</div>
  </app-toolbar>
</app-header>


<app-drawer swipe-open="true" unresolved>
  <manage-side-menu>
    <div class="loading">Loading...</div>
  </manage-side-menu>
</app-drawer>`;
  }
}
