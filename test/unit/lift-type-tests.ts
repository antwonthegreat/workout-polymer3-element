import {expect} from 'chai';
// import sinon, {SinonSpy} from 'sinon';
import sinon from 'sinon';

// import {WorkoutTypeState} from '../../src/model/state/WorkoutTypeState';
// import WorkoutType from '../../src/model/WorkoutType';
import {activeIncompleteItemsSelector, LiftTypeReducer} from '../../src/reducers/lift-type-reducer';
// import {ApiServiceFactory} from '../../src/services/api-service-factory';
// import {BaseMockApiService} from '../../src/services/base-mock-api-service';
import {createTestStore} from '../../src/testStore';

beforeEach(() => {
  sinon.reset();
});

describe('lift type tests', () => {
  it('activeIncompleteItemsSelector no active lift types at all returns empty array', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {Id: 1, WorkoutTypeId: 1, Name: '1', UserToLiftTypes: [], Lifts: [], Timed: false, WorkoutType: { Id: 1, LiftTypes: [], UserToLiftTypes: [], Name: 'Chest', Workouts: [], _odataInfo: {type: '', shortType: ''}}, _odataInfo: {type: '', shortType: ''}},
          2: {Id: 2, WorkoutTypeId: 1, Name: '2', UserToLiftTypes: [], Lifts: [], Timed: false, WorkoutType: { Id: 1, LiftTypes: [], UserToLiftTypes: [], Name: 'Chest', Workouts: [], _odataInfo: {type: '', shortType: ''}}, _odataInfo: {type: '', shortType: ''}}
        },
        selectedId: null
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemsSelector(store.getState(), 1, 1);
    expect(result.length).to.deep.equal(0);
  });

  it('activeIncompleteItemsSelector no active lift types of correct workout type returns empty array', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {Id: 1, WorkoutTypeId: 1, Name: '1', UserToLiftTypes: [], Lifts: [], Timed: false, WorkoutType: { Id: 1, LiftTypes: [], UserToLiftTypes: [], Name: 'Chest', Workouts: [], _odataInfo: {type: '', shortType: ''}}, _odataInfo: {type: '', shortType: ''}},
          2: {Id: 2, WorkoutTypeId: 1, Name: '2', UserToLiftTypes: [{Id: 1, LiftTypeId: 2, UserId: 1, _odataInfo: {type: '', shortType: ''}}], Lifts: [], Timed: false, WorkoutType: { Id: 1, LiftTypes: [], UserToLiftTypes: [], Name: 'Chest', Workouts: [], _odataInfo: {type: '', shortType: ''}}, _odataInfo: {type: '', shortType: ''}}
        },
        selectedId: null
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemsSelector(store.getState(), 1, 2);
    expect(result.length).to.deep.equal(0);
  });

  it('activeIncompleteItemsSelector returns all active lift types if not enough to return numberOfItems', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {Id: 1, WorkoutTypeId: 1, Name: '1', UserToLiftTypes: [{Id: 1, LiftTypeId: 2, UserId: 1, _odataInfo: {type: '', shortType: ''}}], Lifts: [], Timed: false, WorkoutType: { Id: 1, LiftTypes: [], UserToLiftTypes: [], Name: 'Chest', Workouts: [], _odataInfo: {type: '', shortType: ''}}, _odataInfo: {type: '', shortType: ''}},
          2: {Id: 2, WorkoutTypeId: 1, Name: '2', UserToLiftTypes: [{Id: 1, LiftTypeId: 2, UserId: 1, _odataInfo: {type: '', shortType: ''}}], Lifts: [], Timed: false, WorkoutType: { Id: 1, LiftTypes: [], UserToLiftTypes: [], Name: 'Chest', Workouts: [], _odataInfo: {type: '', shortType: ''}}, _odataInfo: {type: '', shortType: ''}}
        },
        selectedId: null
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemsSelector(store.getState(), 5, 1);
    expect(result.length).to.deep.equal(2);
  });
});