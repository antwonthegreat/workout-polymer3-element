import {customElement} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

@customElement('dashboard-app')
export class DashboardApp extends PolymerElement {
  static get template() {
    return html`<style>
    :host {
        @apply --layout-vertical;
    }
</style>DASHBOARD
`;
  }
}