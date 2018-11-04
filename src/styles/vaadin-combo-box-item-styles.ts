import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@vaadin/vaadin-combo-box/theme/material/vaadin-combo-box-light';

const ComboboxStyles = document.createElement('template');

ComboboxStyles.innerHTML = `<dom-module id="minimal-combo-box-item" theme-for="vaadin-combo-box-item">
  <template>
    <style>
    :host::before {
        display: none !important;
    }

    [part="content"] {
        @apply --layout-horizontal;
        @apply --layout-center;
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild(ComboboxStyles.content);