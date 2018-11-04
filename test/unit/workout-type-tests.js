import { expect } from 'chai';
// import sinon, {SinonSpy} from 'sinon';
import sinon from 'sinon';
import { Actions } from '../../src/actions/workout-type-actions';
// import {WorkoutTypeState} from '../../src/model/state/WorkoutTypeState';
// import WorkoutType from '../../src/model/WorkoutType';
import { itemsSelector, WorkoutTypeReducer } from '../../src/reducers/workout-type-reducer';
// import {ApiServiceFactory} from '../../src/services/api-service-factory';
// import {BaseMockApiService} from '../../src/services/base-mock-api-service';
import { createTestStore } from '../../src/testStore';
beforeEach(() => {
    sinon.reset();
});
describe('workout type tests', () => {
    it('entitiesReceived sets list', () => {
        // Arrange
        const items = { 1: { Name: 'Chest', Id: 1 } };
        const store = createTestStore({ WorkoutTypeReducer }, {});
        // Act
        store.dispatch(Actions.entitiesReceived(items));
        // Assert
        const result = itemsSelector(store.getState());
        expect(result.length).to.deep.equal(1);
        expect(result[0].Id).to.deep.equal(1);
    });
});
//# sourceMappingURL=workout-type-tests.js.map