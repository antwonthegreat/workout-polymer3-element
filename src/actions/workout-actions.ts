import {ThunkDispatch} from 'redux-thunk';
import {ActionInjectable} from '../model/ActionInjectable';
import { ActionsUnion, createAction, Action } from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';
import {StringMap} from '@leavittsoftware/titanium-elements/lib/titanium-types';
import { ApplicationState } from '../model/state/ApplicationState';
import { Actions as AppActions} from './app-actions';
import Workout from '../model/Workout';

type EntityType = Workout;
const entityName = 'WORKOUT';

export const ENTITY_CREATED = `${entityName}_CREATED`;
export const ENTITY_UPDATED = `${entityName}_UPDATED`;
export const ENTITY_DELETED = `${entityName}_DELETED`;
export const ENTITIES_RECEIVED = `${entityName}S_RECEIVED`;

export const Actions = {
  entityCreated: (entity: EntityType) => createAction(ENTITY_CREATED, entity),
  entityDeleted: (id: number) => createAction(ENTITY_DELETED, id),
  entitiesReceived: (message: StringMap<EntityType>) => createAction(ENTITIES_RECEIVED, message),
  entityUpdated: (entity: EntityType) => createAction(ENTITY_UPDATED, entity),
};

export const getItemsAsync = () => {
  return async (dispatch: ThunkDispatch<ApplicationState, ActionInjectable, Action>, _getState: () => ApplicationState, injected: ActionInjectable) => {
    const apiService = injected.apiServiceFactory.create();
    let items: StringMap<EntityType>;
    dispatch(AppActions.pageLoadingStarted());
    try {
      items =
          (await apiService.getAsync<EntityType>(
               `Workouts?$select=Name,Id,StartDate&$expand=WorkoutType($select=Name),Lifts($expand=LiftType($select=Name))&$orderby=StartDate`))
              .toDictionary();
    } catch (error) {
      dispatch(AppActions.pageLoadingEnded());
      dispatch(AppActions.setSnackbarErrorMessage(error));
      return;
    }
    dispatch(AppActions.pageLoadingEnded());
    if (!items) dispatch(AppActions.setSnackbarErrorMessage(`Error Getting ${entityName}s`));
    dispatch(Actions.entitiesReceived(items));
    return;
  };
};

export type Actions = ActionsUnion<typeof Actions>;