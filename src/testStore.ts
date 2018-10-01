import {lazyReducerEnhancer, LazyReducerEnhancerStore} from '@leavittsoftware/titanium-elements/lib/titanium-redux-lazy-reducer-mixin';
import {applyMiddleware, combineReducers, compose as origCompose, createStore} from 'redux';
import thunk from 'redux-thunk';

import {ApplicationState} from '../src/model/state/ApplicationState';
import {ApiServiceFactory} from '../src/services/api-service-factory';

const compose = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || origCompose;

export const createTestStore = (reducers: any, initialState: Partial<ApplicationState>, apiServiceFactory?: ApiServiceFactory) => {
  const store = createStore(
                    (state: ApplicationState, _action: any) => state,
                    initialState,  // If there is local storage data, load it.
                    compose(lazyReducerEnhancer(combineReducers), applyMiddleware(thunk.withExtraArgument({apiServiceFactory})))) as LazyReducerEnhancerStore;
  if (reducers) {
    (store).addReducers(reducers);
  }

  //   store.subscribe(() => {
  //     const state = store.getState() as ApplicationState;
  //     tokenProvider.lastName = state.app.lastName || '';
  //     tokenProvider.dateOfBirth = state.app.dateOfBirth || '';
  //     tokenProvider.userGuid = state.app.userGuid || '';
  //   });
  return store;
};