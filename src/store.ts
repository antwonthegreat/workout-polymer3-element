import {lazyReducerEnhancer, LazyReducerEnhancerStore} from '@leavittsoftware/titanium-elements/lib/titanium-redux-lazy-reducer-mixin';
import {applyMiddleware, combineReducers, compose as origCompose, createStore} from 'redux';
import thunk from 'redux-thunk';

import {ApplicationState} from './model/state/ApplicationState';
import {appReducer as AppState} from './reducers/app-reducer';
import {ApiServiceFactory} from './services/api-service-factory';
import {HttpApiServiceFactory} from './services/http-api-service-factory';

// Sets up a Chrome extension for time travel debugging.
// See https://github.com/zalmoxisus/redux-devtools-extension for more information.
const compose = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || origCompose;

// Initializes the Redux store with a lazyReducerEnhancer (so that you can
// lazily add reducers after the store has been created). See the "Redux and state management"
// section of the wiki for more details:
// https://github.com/Polymer/pwa-starter-kit/wiki/4.-Redux-and-state-management
export const store = createStore((state: ApplicationState, _action: any) => state, {}, compose(lazyReducerEnhancer(combineReducers), applyMiddleware<ApiServiceFactory>(thunk.withExtraArgument({apiServiceFactory: new HttpApiServiceFactory()})))) as LazyReducerEnhancerStore;

// Initially loaded reducers.
store.addReducers({AppState});

store.subscribe(() => {
  store.getState() as ApplicationState;
});
