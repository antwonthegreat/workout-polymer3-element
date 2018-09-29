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
import {Campaign} from '../../model/Campaign';
import {CampaignToPerson} from '../../model/CampaignToPerson';
import {ApplicationState} from '../../model/state/ApplicationState';
import {store} from '../../store';

type campaignComboBoxTemplateItem = {
  label: string,
  value: Partial<Campaign>&ODataDto
};

@customElement('admin-campaign-card') export class AdminCampaignCardElement extends connectMixin
(store, PolymerElement) {
  @property() isLoading: boolean = false;
  @property() unassignedCampaigns: Array<campaignComboBoxTemplateItem>;
  @property() assignedCampaigns: Array<Partial<Campaign>&ODataDto>;
  @property() selectedProducerId: number;
  @property() selectedCampaign: campaignComboBoxTemplateItem|string = '';
  @property() searchTerm: string;

  @query('api-service') apiService: ApiService;

  private _debounceSearch;

  @observe('selectedProducerId')
  async selectedProducerIdChanged(selectedProducerId: number) {
    if (!selectedProducerId)
      return;

    this._reset();
    this.assignedCampaigns = await this._getAssignedCampaigns();
  }

  _reset() {
    this.selectedCampaign = '';
    this.unassignedCampaigns = [];
    this.assignedCampaigns = [];
  }

  @observe('searchTerm')
  searchTermChanged(searchTerm: string) {
    if (!searchTerm)
      return;
    this._debounceSearch = Debouncer.debounce(this._debounceSearch, timeOut.after(300), async () => {
      this.unassignedCampaigns = await this._getUnassignedCampaigns(searchTerm);
    });
  }

  async _getUnassignedCampaigns(searchTerm: string) {
    if (!this.selectedProducerId)
      return [];

    this.isLoading = true;
    const conditionalFilter = isNaN(parseInt(searchTerm, 10)) ? `contains(Name, '${escapeTerm(searchTerm)}')` : `(contains(Name, '${escapeTerm(searchTerm)}') or EloquaCampaignId eq ${searchTerm})`;
    const filter = `${conditionalFilter} and CurrentStatus ne 'Completed' and CampaignToPeople/all(a: a/PersonId ne ${this.selectedProducerId})`;
    try {
      const result = (await this.apiService.getAsync<Partial<Campaign>&ODataDto>(`Campaigns?$filter=${filter}&$top=10`)).toList();
      this.isLoading = false;
      return result.map((campaign: any) => {
        return {label: `${campaign.Name} (${campaign.EloquaCampaignId})`, value: campaign};
      });
    } catch (error) {
      store.dispatch(Actions.setSnackbarErrorMessage(error));
    }
    this.isLoading = false;
    return [];
  }

  async _getAssignedCampaigns() {
    if (!this.selectedProducerId)
      return [];

    this.isLoading = true;
    try {
      const result = (await this.apiService.getAsync<Partial<Campaign>&ODataDto>(`Campaigns?$expand=CampaignToPeople($top=1)&$filter=CurrentStatus ne 'Completed' and CampaignToPeople/any(a: a/PersonId eq ${this.selectedProducerId})`)).toList();
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

  async _addCampaignClicked() {
    if (typeof this.selectedCampaign === 'string')
      return;

    this.isLoading = true;

    const campaignToPerson: Partial<CampaignToPerson> = {CampaignId: Number(this.selectedCampaign.value.Id), PersonId: this.selectedProducerId};

    try {
      const result = await this.apiService.postAsync(`CampaignToPeople`, campaignToPerson);
      if (result) {
        this.selectedCampaign.value.CampaignToPeople = [];
        this.selectedCampaign.value.CampaignToPeople.push(result as CampaignToPerson);
      }

      this.push('assignedCampaigns', this.selectedCampaign.value);
      this.unassignedCampaigns = [];
      this.selectedCampaign = '';
    } catch (error) {
      store.dispatch(Actions.setSnackbarErrorMessage(error));
    }
    this.isLoading = false;
  }

  async _deleteCampaignClicked(event: any) {
    const campaign = event.model.item;
    if (!campaign || !campaign.CampaignToPeople || campaign.CampaignToPeople.length < 1 || !campaign.CampaignToPeople[0].Id)
      return;

    this.isLoading = true;
    try {
      await this.apiService.deleteAsync(`CampaignToPeople(${campaign.CampaignToPeople[0].Id})`);
      this.splice('assignedCampaigns', this.assignedCampaigns.indexOf(campaign), 1);
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
  <card-title>Add Existing Campaign</card-title>
  <vaadin-combo-box filter="{{searchTerm}}" selected-item="{{selectedCampaign}}" items="[[unassignedCampaigns]]" label="Search Campaigns" allow-custom-value="true"
    placeholder="Name or Eloqua Id"></vaadin-combo-box>
  <vaadin-button disabled="[[!selectedCampaign]]" on-click="_addCampaignClicked">ADD CAMPAIGN</vaadin-button>
</card-header-section>
<hr />
<card-section>
  <card-sub-title>Current</card-sub-title>
  <empty-list-text hidden$="[[_gtZero(assignedCampaigns.length)]]">None</empty-list-text>
  <template is="dom-repeat" items="[[assignedCampaigns]]">
    <card-item>
      <vaadin-button icon-button item="[[item]]" on-click="_deleteCampaignClicked">
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