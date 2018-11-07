import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-tabs/vaadin-tabs';
import '@vaadin/vaadin-tabs/vaadin-tab';
import '../../styles/modal-shared-styles';
import './manual-entry';
import './dumbbell-entry';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

import {ApplicationState} from '../../model/state/ApplicationState';
import WorkoutSet from '../../model/WorkoutSet';
import {store} from '../../store';

@customElement('paper-plates-dialog') export class PaperPlatesDialog extends connectMixin
(store, PolymerElement) {
  @property() opened: boolean = false;
  @property() workoutSet: WorkoutSet;
  @property() editingReps: boolean;
  @property() selectedIndex: number|null;
  @property() originalValue: number|null;
  @property() value: number|null;
  @property() displayValue: string;

  @observe('workoutSet.*', 'editingReps')
  protected _workoutSetModified() {
    if (!this.workoutSet)
      return;

    this.value = this.editingReps ? this.workoutSet.Reps : this.workoutSet.Weight;
    this.originalValue = this.value;
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }
  }

  protected _cancel() {
    this.value = this.originalValue;
    this._closeDialog();
  }

  protected _closeDialog() {
    // todo: get cancel to reset value
    this.set('value', this.editingReps ? this.workoutSet.Reps : this.workoutSet.Weight);
    this.opened = false;
  }

  public openDialogForWeight() {
    this.editingReps = false;
    this.opened = true;
    this.selectedIndex = 0;
  }

  public openDialogForReps() {
    this.editingReps = true;
    this.opened = true;
    this.selectedIndex = 2;
  }

  protected _isEqual(a: number, b: number): boolean {
    return a === b;
  }

  static get template() {
    return html`<style include="modal-shared-styles">
  :host {
    @apply --layout-vertical;
  }
</style>
<vaadin-dialog no-close-on-esc no-close-on-outside-click opened="[[opened]]">
  <template>
    <style >
        vaadin-dialog {
          @apply --layout-vertical;
          min-height: 320px;
        }

        action-buttons {
          @apply --layout-horizontal;
          @apply --layout-flex-2;
        }

        action-wrapper {

          @apply --layout-vertical;
        }

        vaadin-button {
            cursor:pointer;
        }

        main {
          height:160px;
        }

        hidden {
          display:none !important;
        }
    </style>
    <vaadin-tabs hidden$="[[editingReps]]" selected="{{selectedIndex}}">
        <vaadin-tab>Barbell</vaadin-tab>
        <vaadin-tab>Dumbbell</vaadin-tab>
        <vaadin-tab>Manual</vaadin-tab>
    </vaadin-tabs>
    <main>
      <barbell-entry value="{{value}}" hidden$="[[!_isEqual(selectedIndex,0)]]">B</barbell-entry>
      <dumbbell-entry value="{{value}}" hidden$="[[!_isEqual(selectedIndex,1)]]">D</dumbbell-entry>
      <manual-entry editing-reps="[[editingReps]]" value="{{value}}" hidden$="[[!_isEqual(selectedIndex,2)]]">M</manual-entry>
    </main>
    <action-buttons>
          <vaadin-button cancel on-click="_cancel">CANCEL</vaadin-button>
          <vaadin-button on-click="_saveWorkoutSet">SAVE</vaadin-button>
    </action-buttons>
  </template>
</vaadin-dialog>

`;
  }
}