export interface AppState {
  mainPage: string;
  loadingCounter: number;
  title: string;
  fatalErrorMessage;
  snackbarErrorMessage;
  userId: number;
  navigateTo: string|null;
}