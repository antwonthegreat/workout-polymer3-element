import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-button';
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import '../../styles/card-shared-styles.js';
import '../../highcharts/highcharts-chart.js';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property, query} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {Actions as AppActions} from '../../actions/app-actions';
import {getGraphDataAsync} from '../../actions/lift-actions';
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
  @property()
  highOptions = {
    xAxis: {type: 'datetime'},

    drilldown: {series: [{name: 'test', id: 'test', data: [['v11.0', 24.13], ['v8.0', 17.2], ['v9.0', 8.11], ['v10.0', 5.33], ['v6.0', 1.06], ['v7.0', 0.5]]}]}
  };

  @property() highData: any;

  @query('highcharts-chart') highChart: any;

  connectedCallback() {
    super.connectedCallback();
    this.highData = [
      [moment(new Date('2019-01-01')).utc().valueOf(), 0],
      [moment(new Date('2019-01-02')).utc().valueOf(), 7],
      [moment(new Date('2019-01-03')).utc().valueOf(), 1],
      [moment(new Date('2019-01-04')).utc().valueOf(), 6],
      [moment(new Date('2019-01-05')).utc().valueOf(), 8],
      [moment(new Date('2019-01-06')).utc().valueOf(), 6]
    ];
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
    const workoutSetCollections = graphData.userWorkoutSetCollections;
    if (workoutSetCollections && workoutSetCollections.length > 0)
      this._formatGoogleChartData(workoutSetCollections);
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
        dataPoints.push({x: new Date(biggestSet.StartDate), y: biggestSet.Weight, lift: workoutSetCollection.collection});
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
    <highcharts-chart type="line"
      data='[[highData]]'
      title='[[selectedLiftTypeName]]'
      highchart-options='[[highOptions]]'
      selected-points="{{selectedPoints}}"
      x-zoom x-label="Date"
      y-zoom y-label="Weight"
      credits legend>
    </highcharts-chart>

    <template is="dom-repeat" items="[[selectedLifts]]"> -->

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