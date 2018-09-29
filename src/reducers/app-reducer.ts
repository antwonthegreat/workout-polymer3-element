import {Reducer} from 'redux';

import * as fromActions from '../actions/app-actions';
import {AppState} from '../model/state/AppState';

const initialState = {
  mainPage: '',
  title: '',
  loadingCounter: 0,
  fatalErrorMessage: '',
  snackbarErrorMessage: ''
} as AppState;

const reducer: Reducer<AppState> = (state = initialState, action: fromActions.Actions) => {
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
    default:
      return state;
  }
};
export {reducer as appReducer};
