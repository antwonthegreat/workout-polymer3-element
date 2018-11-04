import {Reducer} from 'redux';
import {createSelector} from 'reselect';

import * as fromActions from '../actions/app-actions';
import {ApplicationState} from '../model/state/ApplicationState';
import {AppState} from '../model/state/AppState';

const initialState = {
  mainPage: '',
  title: '',
  loadingCounter: 0,
  fatalErrorMessage: '',
  snackbarErrorMessage: '',
  navigateTo: null
} as AppState;

export const AppReducer: Reducer<AppState> = (state = initialState, action: fromActions.Actions) => {
  switch (action.type) {
    case fromActions.SET_MAIN_PAGE: {
      return {...state, mainPage: action.payload};
    }
    case fromActions.SET_SNACKBAR_ERROR_MESSAGE: {
      return {...state, snackbarErrorMessage: action.payload};
    }
    case fromActions.SHOW_FATAL_ERROR: {
      return {...state, fatalErrorMessage: action.payload, mainPage: 'error'};
    }
    case fromActions.SET_TITLE: {
      return {...state, title: action.payload};
    }
    case fromActions.INCREMENT_LOADING: {
      return {...state, loadingCounter: state.loadingCounter + 1};
    }
    case fromActions.DECREMENT_LOADING: {
      return {...state, loadingCounter: state.loadingCounter - 1};
    }
    case fromActions.NAVIGATE: {
      return {...state, navigateTo: action.payload};
    }
    default:
      return state;
  }
};

export const getLoadingCounter = (state: ApplicationState): number => {
  if (!state.AppReducer)
    return 0;

  return state.AppReducer.loadingCounter;
};

export const loadingSelector = createSelector(getLoadingCounter, (counter: number): boolean => {
  return counter > 0;
});