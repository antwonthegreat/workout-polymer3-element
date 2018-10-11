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

import {Actions as AppActions} from '../../actions/app-actions';
import {getItemsAsync} from '../../actions/workout-type-actions';
import {ApplicationState} from '../../model/state/ApplicationState';
import {adminAppReducer as AdminState} from '../../reducers/admin-app-reducer';
import {WorkoutReducer} from '../../reducers/workout-reducer';
import {WorkoutTypeReducer} from '../../reducers/workout-type-reducer';

import {store} from '../../store';

store.addReducers({AdminState, WorkoutTypeReducer, WorkoutReducer});
@customElement('user-app') export class UserAppElement extends connectMixin
(store, PolymerElement) {
  @property() isDesktopNavigationOpen: boolean = false;
  @property() isSmallScreen: boolean;
  @property() toolbarTitle: string;
  @property() route: Object;
  @property() routeData: {personId: string|null};
  @property() page: string;

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
        store.dispatch(AppActions.pageLoadingStarted());
        await import('../../../node_modules/@polymer/app-layout/app-drawer/app-drawer.js');
      } catch (error) {
        console.warn('One or more components failed to load', error);
      }
      store.dispatch(AppActions.pageLoadingEnded());
      this.appDrawer.removeAttribute('unresolved');
    });

    this._stateChanged(store.getState());
    store.dispatch<any>(getItemsAsync());
    // setTimeout(() => {
    //   store.dispatch<any>(updateItemAsync(22, {Name: 'patcheedd'}));
    // }, 5000);
    // setTimeout(() => {
    //   store.dispatch<any>(deleteItemAsync(22));
    // }, 5000);
    // setTimeout(() => {
    //   store.dispatch<any>(createItemAsync({Name: 'patcheedd'}));
    // }, 5000);
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }

    this.toolbarTitle = state.AppReducer.title;
  }

  @observe('routeData.page')
  routeDataPageChanged(page: string) {
    // Validate from URI
    if (['workout-list', 'muscle-groups', 'workout'].indexOf(page) === -1) {
      this.set('routeData.page', 'workout-list');
      return;
    }

    // Assign to a property for change tracking
    this.page = page;
  }

  @observe('page')
  async pageChanged(page: string) {
    if (!page)
      return;
    try {
      switch (page) {
        case 'workout-list':
          store.dispatch(AppActions.pageLoadingStarted());
          await import('./workout-list.js');
          store.dispatch(AppActions.pageLoadingEnded());
          break;
        case 'workout':
          store.dispatch(AppActions.pageLoadingStarted());
          await import('./workout-view.js');
          store.dispatch(AppActions.pageLoadingEnded());
          break;
      }
    } catch (error) {
      store.dispatch(AppActions.showFatalError('We were unable to find the page you are looking for'));
    }
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
    store.dispatch(AppActions.pageLoadingStarted());
    try {
      // await import('../../../node_modules/@leavittsoftware/manage-side-menu/lib/manage-side-menu.js');
      this._sideMenuLoaded = true;
    } catch (error) {
      console.warn('One or more components failed to load', error);
    }
    store.dispatch(AppActions.pageLoadingEnded());
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

  protected _isActive(page: string, value: string) {
    return page === value;
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
<app-route route="{{route}}" pattern="/user/:page" data="{{routeData}}"> </app-route>

<side-navigation closed$="[[!isDesktopNavigationOpen]]">
  <manage-side-menu></manage-side-menu>
</side-navigation>

<main-content>
  <workout-list hidden$="[[!_isActive(page, 'workout-list')]]"></workout-list>
  <workout-view hidden$="[[!_isActive(page, 'workout')]]"></workout-view>
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
