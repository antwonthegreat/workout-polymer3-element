import {expect} from 'chai';
// import sinon, {SinonSpy} from 'sinon';
import sinon from 'sinon';

// import {WorkoutTypeState} from '../../src/model/state/WorkoutTypeState';
import LiftType from '../../src/model/LiftType';
import {activeIncompleteItemSelector, LiftTypeReducer} from '../../src/reducers/lift-type-reducer';
// import {ApiServiceFactory} from '../../src/services/api-service-factory';
// import {BaseMockApiService} from '../../src/services/base-mock-api-service';
import {createTestStore} from '../../src/testStore';

beforeEach(() => {
  sinon.reset();
});

describe('lift type tests', () => {
  it('activeIncompleteItemsSelector no active lift types at all returns null', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {Id: 1, WorkoutTypeId: 1, Name: '1', UserToLiftTypes: [], Lifts: [], Timed: false, WorkoutType: { Id: 1, LiftTypes: [], UserToWorkoutTypes: [], Name: 'Chest', Workouts: [], _odataInfo: {type: '', shortType: ''}}, _odataInfo: {type: '', shortType: ''}},
          2: {Id: 2, WorkoutTypeId: 1, Name: '2', UserToLiftTypes: [], Lifts: [], Timed: false, WorkoutType: { Id: 1, LiftTypes: [], UserToWorkoutTypes: [], Name: 'Chest', Workouts: [], _odataInfo: {type: '', shortType: ''}}, _odataInfo: {type: '', shortType: ''}}
        },
        selectedId: null
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 1);
    expect(result).to.deep.equal(null);
  });

  it('activeIncompleteItemsSelector no active lift types of correct workout type returns null', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {Id: 1, WorkoutTypeId: 1, Name: '1', UserToLiftTypes: [], Lifts: [], Timed: false, WorkoutType: { Id: 1, LiftTypes: [], UserToWorkoutTypes: [], Name: 'Chest', Workouts: [], _odataInfo: {type: '', shortType: ''}}, _odataInfo: {type: '', shortType: ''}},
          2: {Id: 2, WorkoutTypeId: 1, Name: '2', UserToLiftTypes: [{Id: 1, LiftTypeId: 2, UserId: 1, _odataInfo: {type: '', shortType: ''}}], Lifts: [], Timed: false, WorkoutType: { Id: 1, LiftTypes: [], UserToWorkoutTypes: [], Name: 'Chest', Workouts: [], _odataInfo: {type: '', shortType: ''}}, _odataInfo: {type: '', shortType: ''}}
        },
        selectedId: null
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 2);
    expect(result).to.deep.equal(null);
  });

  it('activeIncompleteItemsSelector returns complete active lift type if no incomplete', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          2: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any
        },
        selectedId: null
      },
      WorkoutTypeReducer: {
        list: {
          1: {UserToWorkoutTypes: [{LastCompletedDate: '2010-01-01'}]} as any
        },
        selectedId: null
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 1);
    expect(result).to.not.deep.equal(null);
  });

  it('activeIncompleteItemsSelector returns incomplete (never attempted) active lift type', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          2: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          3: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          4: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          5: {Id: 5, WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}]} as any,
          6: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          7: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any
        },
        selectedId: null
      },
      UserToWorkoutTypeReducer: {
        listByWorkoutTypeId: {
          1: {LastCompletedDate: '2010-01-01'} as any
        }
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 1) as LiftType;
    expect(result.Id).to.deep.equal(5);
  });

  it('activeIncompleteItemsSelector returns incomplete (old) active lift type', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          2: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          3: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          4: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          5: {Id: 5, WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2009-01-01'}]} as any,
          6: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any,
          7: {WorkoutTypeId: 1, UserToLiftTypes: [{Id: 1}], Lifts: [{StartDate: '2011-01-01'}]} as any
        },
        selectedId: null
      },
      UserToWorkoutTypeReducer: {
        listByWorkoutTypeId: {
          1: {LastCompletedDate: '2010-01-01'} as any
        }
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 1) as LiftType;
    expect(result.Id).to.deep.equal(5);
  });
});