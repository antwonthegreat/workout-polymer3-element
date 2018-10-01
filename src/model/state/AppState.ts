export interface AppState {
  mainPage: string;  // dashboard | admin | error
  loadingCounter: number;
  title: string;
  fatalErrorMessage;
  snackbarErrorMessage;
  userId: number;
}