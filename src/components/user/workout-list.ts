import '@polymer/iron-flex-layout/iron-flex-layout.js';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {getItemsAsync} from '../../actions/workout-actions';
import {ApplicationState} from '../../model/state/ApplicationState';
import Workout from '../../model/Workout';
import {itemsSelector} from '../../reducers/workout-reducer';
import {store} from '../../store';

@customElement('workout-list') export class WorkoutList extends connectMixin
(store, PolymerElement) {
  @property() workouts: Array<Workout>;

  connectedCallback() {
    super.connectedCallback();

    this._stateChanged(store.getState());
    store.dispatch<any>(getItemsAsync());
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }

    this.workouts = itemsSelector(state);
  }

  static get template() {
    return html`<style>
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

  workout-summary {
    @apply --layout-vertical;
    background-color:#fff;
    margin-bottom:1px;
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

<main-content>
  <header>
    <h1>My Workouts</h1>
  </header>
  <template is="dom-repeat" items="[[workouts]]">
    <workout-summary>
      <workout-name>[[item.Name]]</workout-name>
      <workout-date>[[_formatDate(item.StartDate)]]</workout-date>
      <ul hidden$="[[!item.Lifts.0]">
        <template is="dom-repeat" items="[[item.Lifts]]">
          <li>[[item.LiftType.Name]]</li>
        </template>
      </ul>
      <empty-message hidden$="[[item.Lifts.0]]">No Lifts</empty-message>
    </workout-summary>
  </template>
</main-content>
`;
  }

  _formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
