import '@vaadin/vaadin-button/theme/material/vaadin-button';
import '@vaadin/vaadin-combo-box/theme/material/vaadin-combo-box';
import '@vaadin/vaadin-progress-bar/theme/material/vaadin-progress-bar';
import '@leavittsoftware/api-service/lib/api-service-element';
import '../../styles/admin-card-shared-styles';

import {ApiService} from '@leavittsoftware/api-service/lib/api-service';
import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
import {escapeTerm} from '@leavittsoftware/titanium-elements/lib/titanium-odata-helpers';
import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {customElement, observe, property, query} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';

import {Actions} from '../../actions/app-actions';
import {EloquaEmailTemplate} from '../../model/EloquaEmailTemplate';
import {EloquaEmailTemplateToPerson} from '../../model/EloquaEmailTemplateToPerson';
import {ApplicationState} from '../../model/state/ApplicationState';
import {store} from '../../store';

type templateComboBoxTemplateItem = {
  label: string,
  value: Partial<EloquaEmailTemplate>&ODataDto
};

@customElement('admin-email-template-card') export class EmailTemplateCardElement extends connectMixin
(store, PolymerElement) {
  @property() isLoading: boolean = false;
  @property() unassignedEloquaEmailTemplates: Array<templateComboBoxTemplateItem>|null;
  @property() assignedEloquaEmailTemplates: Array<Partial<EloquaEmailTemplate>&ODataDto>;
  @property() selectedProducerId: number;
  @property() selectedEloquaEmailTemplate: templateComboBoxTemplateItem|string;
  @property() searchTerm: string;

  @query('api-service') apiService: ApiService;

  private _debounceSearch;

  @observe('selectedProducerId')
  async selectedProducerIdChanged(selectedProducerId: number) {
    if (!selectedProducerId)
      return;

    this._reset();
    this.assignedEloquaEmailTemplates = await this._getAssignedTemplates();
  }

  _reset() {
    this.selectedEloquaEmailTemplate = '';
    this.unassignedEloquaEmailTemplates = [];
    this.assignedEloquaEmailTemplates = [];
  }

  @observe('searchTerm')
  searchTermChanged(searchTerm: string) {
    if (!searchTerm)
      return;
    this._debounceSearch = Debouncer.debounce(this._debounceSearch, timeOut.after(300), async () => {
      this.unassignedEloquaEmailTemplates = await this._getUnassignedTemplates(searchTerm);
    });
  }

  private async _getUnassignedTemplates(searchTerm: string) {
    if (!this.selectedProducerId)
      return [];

    this.isLoading = true;
    const filter = `contains(Name, '${escapeTerm(searchTerm)}') and EloquaEmailTemplateToPeople/all(a: a/PersonId ne ${this.selectedProducerId})`;
    try {
      const result = (await this.apiService.getAsync<Partial<EloquaEmailTemplate>&ODataDto>(`EloquaEmailTemplates?$filter=${filter}&$top=10`)).toList();
      this.isLoading = false;
      return result.map((template) => {
        return {label: `${template.Name} (${template.Id})`, value: template};
      });
    } catch (error) {
      store.dispatch(Actions.setSnackbarErrorMessage(error));
    }
    this.isLoading = false;
    return [];
  }

  async _getAssignedTemplates() {
    if (!this.selectedProducerId)
      return [];

    this.isLoading = true;
    try {
      const result = (await this.apiService.getAsync<Partial<EloquaEmailTemplate>&ODataDto>(`EloquaEmailTemplates?$expand=EloquaEmailTemplateToPeople&$filter=EloquaEmailTemplateToPeople/any(a: a/PersonId eq ${this.selectedProducerId})`)).toList();
      this.isLoading = false;
      return result;
    } catch (error) {
      store.dispatch(Actions.setSnackbarErrorMessage(error));
    }
    this.isLoading = false;
    return [];
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AdminState)
      return;

    if (state.AdminState && state.AdminState.selectedProducer && state.AdminState.selectedProducer.Id)
      this.selectedProducerId = state.AdminState.selectedProducer.Id;
  }

  async _handleAddClick() {
    if (typeof this.selectedEloquaEmailTemplate === 'string')
      return;

    this.isLoading = true;

    const eloquaEmailTemplateToPerson: Partial<EloquaEmailTemplateToPerson> = {EloquaEmailTemplateId: this.selectedEloquaEmailTemplate.value.Id, PersonId: this.selectedProducerId};

    try {
      const response = await this.apiService.postAsync(`EloquaEmailTemplateToPeople`, eloquaEmailTemplateToPerson);
      this.selectedEloquaEmailTemplate.value.EloquaEmailTemplateToPeople = [];
      this.selectedEloquaEmailTemplate.value.EloquaEmailTemplateToPeople.push(response as EloquaEmailTemplateToPerson);
      this.push('assignedEloquaEmailTemplates', this.selectedEloquaEmailTemplate.value);
      this.selectedEloquaEmailTemplate = '';
      this.unassignedEloquaEmailTemplates = [];
    } catch (error) {
      store.dispatch(Actions.setSnackbarErrorMessage(error));
    }
    this.isLoading = false;
  }

  async _handleDeleteClick(event: any) {
    const template = event.model.item;
    if (!template)
      return;

    const templateToPerson = template.EloquaEmailTemplateToPeople[0];
    if (!templateToPerson)
      return;

    this.isLoading = true;

    try {
      await this.apiService.deleteAsync(`EloquaEmailTemplateToPeople(${template.EloquaEmailTemplateToPeople[0].Id})`);
      this.splice('assignedEloquaEmailTemplates', this.assignedEloquaEmailTemplates.indexOf(template), 1);
    } catch (error) {
      store.dispatch(Actions.setSnackbarErrorMessage(error));
    }
    this.isLoading = false;
  }

  protected _gtZero(num: number) {
    return num > 0;
  }

  static get template() {
    return html`<style include="admin-card-shared-styles"></style>

<api-service app-name="EloquaMarketingAdmin"></api-service>
<vaadin-progress-bar invisible$="[[!isLoading]]" indeterminate duration="0"></vaadin-progress-bar>
<card-header-section>
  <card-title>Add E-mail Templates</card-title>
  <vaadin-combo-box filter="{{searchTerm}}" selected-item="{{selectedEloquaEmailTemplate}}" items="[[unassignedEloquaEmailTemplates]]" allow-custom-value="true"
    label="Search E-mail Templates" placeholder="Name"></vaadin-combo-box>
  <vaadin-button disabled="[[!selectedEloquaEmailTemplate]]" on-click="_handleAddClick">ADD TEMPLATE</vaadin-button>
</card-header-section>
<hr />
<card-section>
  <card-sub-title>Current</card-sub-title>
  <empty-list-text hidden$="[[_gtZero(assignedEloquaEmailTemplates.length)]]">None</empty-list-text>
  <template is="dom-repeat" items="[[assignedEloquaEmailTemplates]]">
    <card-item>
      <vaadin-button icon-button item="[[item]]" on-click="_handleDeleteClick">
        <svg prefix viewBox="0 0 24 24">
          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
        </svg>
      </vaadin-button>
      [[item.Name]]
    </card-item>
  </template>
</card-section>`;
  }
}