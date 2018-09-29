import {customElement} from '@polymer/decorators';
import {html, PolymerElement} from '@polymer/polymer';

@customElement('public-app')
export class PublicApp extends PolymerElement {
  static get template() {
    return html`<style>
    :host {
        @apply --layout-vertical;
    }
</style>PUBLIC
`;
  }
}