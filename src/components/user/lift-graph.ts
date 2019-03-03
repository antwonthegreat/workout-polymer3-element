import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import '../../styles/card-shared-styles.js';
import '../../highcharts/highcharts-chart.js';
import '../user/simple-lift-item';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property, query} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {Actions as AppActions} from '../../actions/app-actions';
import {getGraphDataAsync} from '../../actions/lift-actions';
import Lift from '../../model/Lift.js';
import {ApplicationState} from '../../model/state/ApplicationState';
import {graphDataSelector, UserWorkoutSetCollection} from '../../reducers/lift-reducer';
import {store} from '../../store';

declare var moment: any;

@customElement('lift-graph') export class LiftGraph extends connectMixin
(store, PolymerElement) {
  @property() route: Object;
  @property() routeData: {id: string|null};
  @property() itemId: number;
  @property() selectedLiftTypeName: string;
  @property() selectedPoints: any;
  @property() selectedLift: any;
  @property() lifts: Array<Lift> = [];
  @property()
  highOptions = {
    xAxis: {type: 'datetime'},

    drilldown: {series: [{name: 'test', id: 'test', data: [['v11.0', 24.13], ['v8.0', 17.2], ['v9.0', 8.11], ['v10.0', 5.33], ['v6.0', 1.06], ['v7.0', 0.5]]}]},
    plotOptions: {series: {allowPointSelect: true}}
  };

  @property() highData: any;

  @query('highcharts-chart') highChart: any;

  connectedCallback() {
    super.connectedCallback();
    this.highData = [[moment(new Date('2019-01-01')).utc().valueOf(), 0]];
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

  @observe('selectedPoints.*')
  pointSelected(selectedPointsSplice: {value: Array<{lift: Lift}>}) {
    if (selectedPointsSplice.value.length > 0) {
      this.selectedLift = selectedPointsSplice.value[0].lift;
      const shadowRoot = this.shadowRoot;
      if (!shadowRoot)
        return;
      const repeat = shadowRoot.querySelector('lift-list');
      if (!repeat)
        return;
      const element = repeat.querySelector(`#r${this.selectedLift.Id}`);
      if (!element)
        return;
      element.scrollIntoView({behavior: 'smooth'});
      // .querySelector('simple-lift-item'));
    }
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }

    const graphData = graphDataSelector(state);
    this.selectedLiftTypeName = graphData.liftTypeName;
    const workoutSetCollections = graphData.userWorkoutSetCollections;
    if (workoutSetCollections && workoutSetCollections.length > 0) {
      this._formatGoogleChartData(workoutSetCollections);
      this.lifts = graphData.allLifts;
    }
  }

  _formatGoogleChartData(workoutSetCollections: Array<UserWorkoutSetCollection>) {
    try {
      while (this.highChart._chart.series.length > 0)
        this.highChart._chart.series[0].remove(true);
    } catch (error) {
      console.warn(error);
    }

    workoutSetCollections.forEach(workoutSetCollection => {
      const dataPoints: any = [];
      workoutSetCollection.collection.forEach(lift => {
        if (lift.WorkoutSets.length === 0)
          return;

        const biggestSet = lift.WorkoutSets.sort((a, b) => b.Weight - a.Weight)[0];
        // googleChartFormattedData.push([new Date(biggestSet.StartDate), biggestSet.Weight]);
        dataPoints.push({x: new Date(biggestSet.StartDate), y: biggestSet.Weight, lift});
      });
      // dataTables.push(data1);
      try {
        if (dataPoints.length > 0)
          this.highChart.addSeries(workoutSetCollection.name, dataPoints, false, {});
      } catch (error) {
        console.warn(error);
      }
    });
  }

  protected _areEqual(a: any, b: any) {
    return a === b;
  }

  protected _onBackClick() {
    window.history.back();
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

  svg {
    fill: #757575;
  }

  vaadin-button[back] {
    background-color:#f5f5f5;
    margin: 0 16px 0 0;
    padding: 0;
    min-width: 24px;
    cursor: pointer;
    @apply --layout-self-start;
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

  lift-list {
    overflow-y:scroll;
    max-height:300px;
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
  <vaadin-button back on-click="_onBackClick">
    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
      <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
    </svg>
  </vaadin-button>
  <material-card>
    <card-section>
      <highcharts-chart type="line"
        data='[[highData]]'
        title='[[selectedLiftTypeName]]'
        highchart-options='[[highOptions]]'
        selected-points="{{selectedPoints}}"
        selected="{{selected}}"
        x-zoom x-label="Date"
        y-zoom y-label="Weight"
        credits legend>
      </highcharts-chart>
    </card-section>
  </material-card>
  <material-card>
    <card-section>
      <lift-list>
        <template id="liftItems" is="dom-repeat" items="[[lifts]]">
          <simple-lift-item selected$="[[_areEqual(item.Id,selectedLift.Id)]]" id="r[[item.Id]]" lift="[[item]]"></simple-lift-item>
        </template>
      </lift-list>
    </card-section>
  </material-card>
</main-content>
`;
  }

  _formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
