import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-dialog/vaadin-dialog';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-tabs/vaadin-tabs';
import '@vaadin/vaadin-tabs/vaadin-tab';
import '../../styles/modal-shared-styles';

import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, property} from '@polymer/decorators';
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

  _stateChanged(state: ApplicationState) {
    if (!state.AppReducer) {
      return;
    }
  }

  protected _closeDialog(_e: any) {
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

  static get template() {
    return html`<style include="modal-shared-styles">
  :host {
    @apply --layout-vertical;
  }
</style>
<vaadin-dialog no-close-on-esc no-close-on-outside-click opened="[[opened]]">
  <template>
    <style >
        :host {
          @apply --layout-vertical;
        }
        paper-plates {
            display: block;
            padding: 8px;
            @apply --layout-vertical;
        }

        action-buttons {
          @apply --layout-horizontal;
          @apply --layout-end-justified;
        }

        vaadin-button {
            cursor:pointer;
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
    <action-buttons>
        <vaadin-button cancel on-click="_closeDialog">CANCEL</vaadin-button>
        <vaadin-button on-click="_saveWorkoutSet">Save</vaadin-button>
    </action-buttons>
  </template>
</vaadin-dialog>

`;
  }
}