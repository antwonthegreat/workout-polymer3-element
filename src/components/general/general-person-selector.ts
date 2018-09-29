import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-combo-box/theme/material/vaadin-combo-box-light';
import '@vaadin/vaadin-text-field/theme/material/vaadin-text-field';
import '@leavittsoftware/api-service/lib/api-service-element';
import '../../styles/vaadin-combo-box-item-styles';

import {ApiServiceElement} from '@leavittsoftware/api-service/lib/api-service-element';
import {ODataDto} from '@leavittsoftware/api-service/lib/odata-dto';
import {getSearchTokens} from '@leavittsoftware/titanium-elements/lib/titanium-search-token-mixin';
import {customElement, observe, property, query} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';

import {Person} from '../../model/Person';

export type personComboBoxItem = {
  label: string,
  value: Partial<Person>
};

@customElement('person-selector')
export class PersonSelectorElement extends PolymerElement {
  @property() isLoading: boolean = false;

  @property() controllerNamespace: string;

  @property() label: string|null;
  @property() placeholder: string|null;
  @property() personId: number;

  @property() searchTerm: string;
  @property() items: Array<personComboBoxItem>;
  @property({type: Object, notify: true}) selectedPerson: personComboBoxItem|string = '';

  @query('api-service') apiService: ApiServiceElement;

  private _debounceJob: Debouncer;

  @observe('personId')
  async personIdChanged(personId: number|undefined) {
    if (!personId || typeof this.selectedPerson === 'string') {
      return;
    }

    // This person is already selected. Do nothing.
    if (this.selectedPerson && this.selectedPerson.value.Id === personId) {
      return;
    }

    // restore selected person from person id
    try {
      const person = (await this.apiService.getAsync<Partial<Person>&ODataDto>(`People/?$filter=Id eq ${personId}&$select=Id,FirstName,LastName`, this.controllerNamespace)).firstOrDefault();
      this.isLoading = false;
      if (person) {
        // populate the combobox
        const personItem = {label: `${person.FirstName} ${person.LastName}`, value: person};
        this.items = [personItem];
        this.selectedPerson = personItem;
      }
    } catch (error) {
      this.reportError(error);
    }
  }

  private reportError(error: string) {
    this.dispatchEvent(new CustomEvent('person-selector-error', {bubbles: true, composed: true, detail: {message: error}}));
  }

  @observe('searchTerm')
  protected searchTermChanged(searchTerm: string) {
    if (!searchTerm) {
      return;
    }
    this.items = [];
    this._debounceJob = Debouncer.debounce(this._debounceJob, timeOut.after(200), async () => {
      this.items = await this._getProducers(searchTerm);
    });
  }

  private async _getProducers(searchTerm: string) {
    let tokens = getSearchTokens(searchTerm);
    if (tokens.length < 1) {
      return [];
    }
    const containsOdata = tokens.map((token: string) => `(startswith(FirstName, '${token}') or startswith(LastName, '${token}'))`).join(' and ');

    this.isLoading = true;
    try {
      const results = (await this.apiService.getAsync<Partial<Person>&ODataDto>(`People/?$filter=${containsOdata}&$top=10&$select=Id,FirstName,LastName`, this.controllerNamespace)).toList();
      this.isLoading = false;
      return results.map(o => {
        return {label: `${o.FirstName} ${o.LastName}`, value: o};
      });
    } catch (error) {
      this.reportError(error);
    }
    this.isLoading = false;
    return [];
  }

  static get template() {
    return html`<style>
  :host {
    display: block;
  }

  vaadin-combo-box-light {
    width: 100%;
  }

 vaadin-text-field {
        width: 100%;
        min-width: 0;
      }

  [hidden] {
    display: none;
  }

  svg {
    fill: var(--app-text-color-lighter);
    width: 24px;
    height: 24px;
  }

  vaadin-combo-box-light[disabled] .clear-button,
  vaadin-combo-box-light[readonly] .clear-button,
  vaadin-combo-box-light:not([has-value]) .clear-button {
    display: none;
  }
</style>
<api-service></api-service>
<vaadin-combo-box-light filter="{{searchTerm}}" filtered-items="[[items]]" allow-custom-value="true"
  selected-item="{{selectedPerson}}">
  <vaadin-text-field placeholder="[[placeholder]]" label="[[label]]">
    <template>
      <style>
        img[profile] {
          border-radius: 50%;
          margin-right:16px;
        }
      </style>
      <img profile src="https://mapi.leavitt.com/People([[item.value.Id]])/Default.Picture(size=24)" />
      <span>[[item.label]]</span>
    </template>
    <img slot="suffix" src="images/dual-ring-1s-26px.gif" hidden$="[[!isLoading]]"/>
    <svg slot="suffix" class="clear-button" viewBox="0 0 24 24">
      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>
  </vaadin-text-field>

</vaadin-combo-box-light>`;
  }
}
