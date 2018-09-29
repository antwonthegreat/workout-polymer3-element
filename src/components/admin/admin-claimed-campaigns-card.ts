import '@vaadin/vaadin-combo-box/theme/material/vaadin-combo-box';
import '@vaadin/vaadin-button/theme/material/vaadin-button';
import '@vaadin/vaadin-dialog/vaadin-dialog.js';
import '@leavittsoftware/api-service/lib/api-service-element';
import '@vaadin/vaadin-progress-bar/theme/material/vaadin-progress-bar';
import '../../styles/admin-card-shared-styles';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

import {ApiServiceElement} from '@leavittsoftware/api-service/lib/api-service-element';
import {connectMixin} from '@leavittsoftware/titanium-elements/lib/titanium-redux-connect-mixin';
import {getSearchTokens} from '@leavittsoftware/titanium-elements/lib/titanium-search-token-mixin';
import {customElement, observe, property, query} from '@polymer/decorators/lib/decorators';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {html, PolymerElement} from '@polymer/polymer/polymer-element';

import {Actions as AppActions} from '../../actions/app-actions';
import {CrmAccount} from '../../model/CrmAccount';
import {Person} from '../../model/Person';
import {ApplicationState} from '../../model/state/ApplicationState';
import {store} from '../../store';

type CrmAccountComboBoxItem = {
  label: string,
  value: CrmAccount
};

@customElement('admin-claimed-campaigns-card') export class AdminClaimedCampaignsCard extends connectMixin
(store, PolymerElement) {
  @property() searchResults: Array<CrmAccountComboBoxItem> = [];
  @property() isLoading: boolean = false;
  @property() isDeleting: boolean;
  @property() selectedCrmAccountComboBoxItem: CrmAccountComboBoxItem|string = '';
  @property() searchTerm: string;
  @property() selectedProducer: Partial<Person>|null = null;

  @query('api-service') apiService: ApiServiceElement;
  @query('vaadin-dialog') confirmDeleteDialog: any;

  protected async _disableAllCampaigns() {
    if (!this.selectedProducer) {
      return;
    }

    try {
      this.isDeleting = true;
      store.dispatch(AppActions.pageLoadingStarted());
      await this.apiService.postAsync(`People(${this.selectedProducer.Id})/Default.DisableAllCampaigns()`, {});
    } catch (error) {
      store.dispatch(AppActions.setSnackbarErrorMessage(error));
    }
    this.isDeleting = false;
    store.dispatch(AppActions.pageLoadingEnded());
    this._reset();
    this.confirmDeleteDialog.opened = false;
  }

  private _debounceSearch;

  @observe('searchTerm')
  protected searchTermChanged(searchTerm: string) {
    if (!searchTerm)
      return;
    this._debounceSearch = Debouncer.debounce(this._debounceSearch, timeOut.after(300), async () => {
      const searchResults = await this._getCrmAccounts(searchTerm);
      if (searchResults)
        this.searchResults = searchResults;
    });
  }

  @observe('selectedProducer')
  protected producerPersonIdChanged(selectedProducer: Partial<Person>|null) {
    if (!selectedProducer)
      return;

    this._reset();
  }

  private _reset() {
    this.selectedCrmAccountComboBoxItem = '';
    this.searchResults = [];
  }

  private async _getCrmAccounts(searchTerm: string): Promise<Array<CrmAccountComboBoxItem>|undefined> {
    if (!this.selectedProducer) {
      return;
    }
    const searchTokens = getSearchTokens(searchTerm);

    this.isLoading = true;

    let filter = `PersonId eq ${this.selectedProducer.Id} and CampaignToCrmAccounts/any(a: a/Campaign/CurrentStatus ne 'Completed')`;
    if (searchTokens.length > 0) {
      filter = `${filter} and ${
          searchTokens
              .map(token => {
                return `startswith(Name, '${token}')`;
              })
              .join(' and ')}`;
    }

    let searchResults: Array<CrmAccount>;

    try {
      searchResults = (await this.apiService.getAsync<CrmAccount>(`CrmAccounts?$filter=${filter}&$select=Name,Email&$expand=CampaignToCrmAccounts($filter=Campaign/CurrentStatus ne 'Completed';$select=Id;$expand=Campaign($select=Name))`)).toList();
    } catch (error) {
      store.dispatch(AppActions.setSnackbarErrorMessage(error));
      this.isLoading = false;
      return;
    }
    this.isLoading = false;
    return searchResults.map(o => {
      return {label: `${o.Name}`, value: o};
    });
  }

  _stateChanged(state: ApplicationState) {
    if (!state.AdminState || !state.AdminState.selectedProducer) {
      this.selectedProducer = null;
      return;
    }

    this.selectedProducer = state.AdminState.selectedProducer;
  }

  protected _openDialog() {
    this.confirmDeleteDialog.opened = true;
  }

  protected _closeDialog() {
    this.confirmDeleteDialog.opened = false;
  }

  protected async _unclaimClicked(e) {
    const id = e.model.item.Id;
    if (!id)
      return;
    this.isLoading = true;
    try {
      await this.apiService.deleteAsync(`CampaignToCrmAccounts(${id})`);
    } catch (error) {
      store.dispatch(AppActions.setSnackbarErrorMessage(error));
      this.isLoading = false;
      return;
    }
    this.isLoading = false;

    if (typeof this.selectedCrmAccountComboBoxItem === 'string')
      return;

    const campaignToCrmAccounts = this.selectedCrmAccountComboBoxItem;
    const target = campaignToCrmAccounts ? campaignToCrmAccounts.value.CampaignToCrmAccounts.filter(campaignToCrmAccount => campaignToCrmAccount.Id === id)[0] : null;
    if (!target || !campaignToCrmAccounts)
      return;
    const index = campaignToCrmAccounts.value.CampaignToCrmAccounts.indexOf(target);
    if (index < 0)
      return;
    this.splice('selectedCrmAccountComboBoxItem.value.CampaignToCrmAccounts', index, 1);
  }

  static get template() {
    return html`<style include="admin-card-shared-styles">
  card-section {
    min-height: 94px;
  }

  action-buttons {
    @apply --layout-horizontal;
    @apply --layout-end-justified;
  }

  vaadin-button {
    --material-primary-color: #3B95FF;
    --material-primary-text-color: #3B95FF;
  }

  vaadin-button[cancel] {
    --material-primary-text-color: #757575;
  }

  vaadin-button[disable-all] {
    margin: 8px;
  }
</style>
<api-service app-name="EloquaMarketingAdmin"></api-service>
<vaadin-progress-bar invisible$="[[!isLoading]]" indeterminate duration="0"></vaadin-progress-bar>
<card-header-section>
  <card-title>Enabled Campaigns</card-title>
  <vaadin-combo-box label="Search Accounts" filter="{{searchTerm}}" items="[[searchResults]]" selected-item="{{selectedCrmAccountComboBoxItem}}" allow-custom-value="true">
  </vaadin-combo-box>
</card-header-section>
<hr />
<card-section>
  <card-sub-title hidden$="[[!selectedCrmAccountComboBoxItem]]">Current</card-sub-title>
  <template is="dom-repeat" items="[[selectedCrmAccountComboBoxItem.value.CampaignToCrmAccounts]]">
    <card-item>
      <vaadin-button icon-button on-click="_unclaimClicked">
        <svg prefix viewBox="0 0 24 24">
          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
        </svg>
      </vaadin-button>
      [[item.Campaign.Name]]
    </card-item>
  </template>

</card-section>
<vaadin-button disable-all on-click="_openDialog" title="Disable all campaigns for every account enabled by this producer.">Disable all campaigns</vaadin-button>
<vaadin-dialog no-close-on-esc no-close-on-outside-click>
  <template>
    <style>
      :host {
        @apply --layout-vertical;
      }
    </style>
    <div>Are you sure you want to disable all campaigns in each of [[selectedProducer.FirstName]]
      [[selectedProducer.LastName]]'s CRM accounts?</div>
    <br>
    <action-buttons>
      <vaadin-button cancel disabled="[[isDeleting]]" on-click="_closeDialog">Cancel</vaadin-button>
      <vaadin-button disabled="[[isDeleting]]" on-click="_disableAllCampaigns">Ok</vaadin-button>
    </action-buttons>
  </template>
</vaadin-dialog>`;
  }
}