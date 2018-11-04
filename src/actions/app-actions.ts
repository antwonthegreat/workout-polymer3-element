import {ActionsUnion, createAction} from '@leavittsoftware/titanium-elements/lib/titanium-redux-action-helpers';

export const SET_MAIN_PAGE = 'SET_MAIN_PAGE';
export const SET_SNACKBAR_ERROR_MESSAGE = 'SET_SNACKBAR_ERROR_MESSAGE';
export const SHOW_FATAL_ERROR = 'SHOW_FATAL_ERROR';
export const SET_TITLE = 'SET_TITLE';
export const INCREMENT_LOADING = 'INCREMENT_LOADING';
export const DECREMENT_LOADING = 'DECREMENT_LOADING';
export const NAVIGATE = 'NAVIGATE';

export const Actions = {
  setMainPage: (page: string) => createAction(SET_MAIN_PAGE, page),
  setSnackbarErrorMessage: (message: string) => createAction(SET_SNACKBAR_ERROR_MESSAGE, message),
  showFatalError: (message: string) => createAction(SHOW_FATAL_ERROR, message),
  setTitle: (title: string) => createAction(SET_TITLE, title),
  pageLoadingStarted: () => createAction(INCREMENT_LOADING),
  pageLoadingEnded: () => createAction(DECREMENT_LOADING),
  navigate: (page: string|null) => createAction(NAVIGATE, page)
};

export type Actions = ActionsUnion<typeof Actions>;
