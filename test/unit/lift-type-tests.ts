import {expect} from 'chai';
// import sinon, {SinonSpy} from 'sinon';
import sinon from 'sinon';

// import {WorkoutTypeState} from '../../src/model/state/WorkoutTypeState';
import {LiftReducer} from '../../src/reducers/lift-reducer';
import LiftType from '../../src/model/LiftType';
import { activeIncompleteItemSelector, LiftTypeReducer } from '../../src/reducers/lift-type-reducer';

// import {ApiServiceFactory} from '../../src/services/api-service-factory';
// import {BaseMockApiService} from '../../src/services/base-mock-api-service';
import {createTestStore} from '../../src/testStore';

beforeEach(() => {
  sinon.reset();
});

describe('lift type tests', () => {
  it('activeIncompleteItemsSelector no active lift types at all returns null', () => {
    // Arrange
    const store = createTestStore({LiftReducer, LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {Id: 1, WorkoutTypeId: 1, Name: '1'} as any,
          2: {Id: 2, WorkoutTypeId: 1, Name: '2' } as any
        },
        selectedId: null
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 1, []);
    expect(result).to.deep.equal(null);
  });

  it('activeIncompleteItemsSelector no active lift types of correct workout type returns null', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: { Id: 1, WorkoutTypeId: 1, Name: '1' } as any,
          2: { Id: 2, WorkoutTypeId: 1, Name: '2' } as any,
        },
        selectedId: null
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 2, {});
    expect(result).to.deep.equal(null);
  });

  it('activeIncompleteItemsSelector returns complete active lift type if there are none incomplete', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {Id: 1, WorkoutTypeId: 1} as any,
          2: {Id: 2, WorkoutTypeId: 1} as any
        },
        selectedId: null
      },
      LiftReducer: {
        list: {
          1: {StartDate: '2011-01-01'} as any,
          2: {StartDate: '2011-01-01'} as any
        },
      },
      UserToLiftTypeReducer: {
        list: {
          1: {Id: 1, LiftTypeId: 2} as any
        }
      },
      UserToWorkoutTypeReducer: {
        listByWorkoutTypeId: {
          1: {Id: 11, WorkoutTypeId: 1, LastCompletedDate: '2010-01-01'} as any
        }
      },
      WorkoutTypeReducer: {
        list: {
          1: {} as any
        },
        selectedId: null
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 1, {});
    expect(result).to.not.deep.equal(null);
    expect(result && result.Id).to.deep.equal(2);
  });

  it('activeIncompleteItemsSelector returns incomplete (never attempted) active lift type', () => {
    // Arrange
    const store = createTestStore({ LiftTypeReducer }, {
      LiftTypeReducer: {
        list: {
          1: { Id: 1, WorkoutTypeId: 1 } as any,
          2: { Id: 2, WorkoutTypeId: 1 } as any,
          3: { Id: 3, WorkoutTypeId: 1 } as any,
          4: { Id: 4, WorkoutTypeId: 1 } as any,
          5: { Id: 5, WorkoutTypeId: 1 } as any,
          6: { Id: 6, WorkoutTypeId: 1 } as any,
          7: { Id: 7, WorkoutTypeId: 1 } as any
        },
        selectedId: null
      },
      UserToLiftTypeReducer: {
        list: {
          1: { Id: 1, LiftTypeId: 1 } as any,
          2: { Id: 2, LiftTypeId: 2 } as any,
          3: { Id: 3, LiftTypeId: 3 } as any,
          4: { Id: 4, LiftTypeId: 4 } as any,
          5: { Id: 5, LiftTypeId: 5 } as any,
          6: { Id: 6, LiftTypeId: 6 } as any,
          7: { Id: 6, LiftTypeId: 7 } as any
        }
      },
      LiftReducer: {
        list: {
          11: {LiftTypeId: 1, StartDate: '2011-01-01'} as any,
          12: {LiftTypeId: 2, StartDate: '2011-01-01'} as any,
          13: {LiftTypeId: 3, StartDate: '2011-01-01'} as any,
          14: {LiftTypeId: 4, StartDate: '2011-01-01'} as any,
          16: {LiftTypeId: 6, StartDate: '2011-01-01'} as any,
          17: {LiftTypeId: 7, StartDate: '2011-01-01'} as any
        }
      },
      UserToWorkoutTypeReducer: {
        listByWorkoutTypeId: {
          1: {LastCompletedDate: '2010-01-01'} as any
        }
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 1, {}) as LiftType;
    expect(result.Id).to.deep.equal(5);
  });

  it('activeIncompleteItemsSelector returns incomplete (old) active lift type', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {Id: 1, WorkoutTypeId: 1} as any,
          2: {Id: 2, WorkoutTypeId: 1} as any,
          3: {Id: 3, WorkoutTypeId: 1} as any,
          4: {Id: 4, WorkoutTypeId: 1} as any,
          5: {Id: 5, WorkoutTypeId: 1} as any,
          6: {Id: 6, WorkoutTypeId: 1} as any,
          7: {Id: 7, WorkoutTypeId: 1} as any
        },
        selectedId: null
      },
      UserToLiftTypeReducer: {
        list: {
          1: { Id: 1, LiftTypeId: 1 } as any,
          2: { Id: 2, LiftTypeId: 2 } as any,
          3: { Id: 3, LiftTypeId: 3 } as any,
          4: { Id: 4, LiftTypeId: 4 } as any,
          5: { Id: 5, LiftTypeId: 5 } as any,
          6: { Id: 6, LiftTypeId: 6 } as any,
          7: { Id: 7, LiftTypeId: 7 } as any
        }
      },
      LiftReducer: {
        list: {
          11: {Id: 11, LiftTypeId: 1, StartDate: '2011-01-01'} as any,
          12: {Id: 12, LiftTypeId: 2, StartDate: '2011-01-01'} as any,
          13: {Id: 13, LiftTypeId: 3, StartDate: '2011-01-01'} as any,
          14: {Id: 14, LiftTypeId: 4, StartDate: '2011-01-01' } as any,
          15: {Id: 15, LiftTypeId: 5, StartDate: '2009-01-01'} as any,
          16: {Id: 16, LiftTypeId: 6, StartDate: '2011-01-01'} as any,
          17: {Id: 17, LiftTypeId: 7, StartDate: '2011-01-01'} as any
        }
      },
      UserToWorkoutTypeReducer: {
        listByWorkoutTypeId: {
          1: {LastCompletedDate: '2010-01-01'} as any
        }
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 1, {}) as LiftType;
    expect(result.Id).to.deep.equal(5);
  });

  it('activeIncompleteItemsSelector ignores lift type already in workout', () => {
    // Arrange
    const store = createTestStore({LiftTypeReducer}, {
      LiftTypeReducer: {
        list: {
          1: {Id: 1, WorkoutTypeId: 1} as any,
          2: {Id: 2, WorkoutTypeId: 1} as any,
          3: {Id: 3, WorkoutTypeId: 1} as any,
          4: {Id: 4, WorkoutTypeId: 1} as any,
          5: {Id: 5, WorkoutTypeId: 1} as any,
          6: {Id: 6, WorkoutTypeId: 1} as any,
          7: {Id: 7, WorkoutTypeId: 1} as any
        },
        selectedId: null
      },
      UserToLiftTypeReducer: {
        list: {
          1: { Id: 1, LiftTypeId: 1 } as any,
          2: { Id: 2, LiftTypeId: 2 } as any,
          3: { Id: 3, LiftTypeId: 3 } as any,
          4: { Id: 4, LiftTypeId: 4 } as any,
          5: { Id: 5, LiftTypeId: 5 } as any,
          6: { Id: 6, LiftTypeId: 6 } as any,
          7: { Id: 7, LiftTypeId: 7 } as any
        }
      },
      LiftReducer: {
        list: {
          11: {Id: 11, LiftTypeId: 1, StartDate: '2011-01-01'} as any,
          12: {Id: 12, LiftTypeId: 2, StartDate: '2011-01-01'} as any,
          13: {Id: 13, LiftTypeId: 3, StartDate: '2011-01-01'} as any,
          14: {Id: 14, LiftTypeId: 4, StartDate: '2011-01-01' } as any,
          15: {Id: 15, LiftTypeId: 5, StartDate: '2009-01-01'} as any,
          16: {Id: 16, LiftTypeId: 6, StartDate: '2011-01-01'} as any,
          17: {Id: 17, LiftTypeId: 7, StartDate: '2011-01-01'} as any
        }
      },
      UserToWorkoutTypeReducer: {
        listByWorkoutTypeId: {
          1: {LastCompletedDate: '2010-01-01'} as any
        }
      }
    });

    // Act

    // Assert
    const result = activeIncompleteItemSelector(store.getState(), 1, { 5: {} as LiftType }) as LiftType;
    expect(result).to.deep.equal(null);
  });
});