import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import '../../styles/card-shared-styles.js';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {Actions as AppActions} from '../../actions/app-actions';
import {getGraphDataAsync} from '../../actions/lift-actions';
import {ApplicationState} from '../../model/state/ApplicationState';
import {graphDataSelector, UserWorkoutSetCollection} from '../../reducers/lift-reducer';
import {store} from '../../store';

@customElement('lift-graph') export class LiftGraph extends connectMixin
(store, PolymerElement) {
  @property() route: Object;
  @property() routeData: {id: string|null};
  @property() itemId: number;
  @property() selectedLiftTypeName: string;
  @property() workoutSetCollections: Array<UserWorkoutSetCollection>|null;

  connectedCallback() {
    super.connectedCallback();

    this._stateChanged(store.getState());
  }

  @observe('routeData.id')
  routeDataIdChanged(id: string) {
    // Validate from URI
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      store.dispatch(AppActions.showFatalError('Invalid lift type Id'));
      return;
    }

    // Assign to a property for change tracking
    this.itemId = idNumber;
  }

  @observe('itemId')
  async pageChanged(itemId: number) {
    if (!itemId)
      return;

    this.selectedLiftTypeName = '';
    store.dispatch<any>(getGraphDataAsync(itemId));
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }

    const graphData = graphDataSelector(state);
    this.selectedLiftTypeName = graphData.liftTypeName;
    this.workoutSetCollections = graphData.userWorkoutSetCollections;
    console.log(this.workoutSetCollections);
  }

  static get template() {
    return html`<style include="card-shared-styles">
  :host {
    @apply --layout-horizontal;
  }

  main-content {
    @apply --layout-vertical;
    width: 100%;
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

  vaadin-button[add] {
    background-color: var(--app-secondary-color);
    box-shadow: 1px 1px 4px var(--app-primary-color);
    border-radius: 50%;
    color: #fff;
    height: 56px;
    min-width: 56px;
    position: fixed;
    bottom: 16px;
    right: 16px;
    cursor: pointer;
  }

  svg {
    fill: #fff;
  }

  lift-item {
    margin:4px;
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
<app-route route="{{route}}" pattern="/user/lift-graph/:id" data="{{routeData}}"> </app-route>
<main-content>
  <material-card>
    <header>[[selectedLiftTypeName]]</header>
    <card-section>
      <template is="dom-repeat" items="[[selectedLifts]]">

      </template>
    </card-section>
  </material-card>
</main-content>
`;
  }

  _formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
