import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {ApplicationState} from '../../model/state/ApplicationState';
import {store} from '../../store';

@customElement('user-side-menu') export class UserSideMenu extends connectMixin
(store, PolymerElement) {
  @property() route: Object;
  @property() routeData: {personId: string|null};
  @property() opened: boolean;
  @property()
  pages: Array<MenuPage> = [
    {name: 'My Workouts', route: 'workout-list'},
    {name: 'Friend\'s Workouts', route: ''},
    {name: 'Manage Muscle Groups', route: 'muscle-groups'},
    {name: 'Achievements', route: ''},
    {name: 'Friends', route: ''},
    {name: 'Settings', route: ''},
    {name: 'Hot Tips Admin', route: ''},
  ];

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }
  }

  _itemClicked(e: any) {
    const item: MenuPage = e.model.item;
    if (item && item.route) {
      this.set('routeData.page', item.route);
      this.opened = false;
    }
  }

  static get template() {
    return html`<style>
          :host {
            @apply --layout-vertical;
            margin-top: var(--toolbar-height);
            padding: 8px;
          }

          menu-items {
            @apply --layout-vertical;
          }
        </style>
        <app-location route="{{route}}"></app-location>
        <app-route route="{{route}}" pattern="/user/:page" data="{{routeData}}"> </app-route>
        <menu-items>
            <template is="dom-repeat" items="[[pages]]">
                <menu-item on-click="_itemClicked">[[item.name]]</menu-item>
            </template>
        </menu-items>

    `;
  }
}

interface MenuPage {
  route: string;
  name: string;
}