import '@polymer/iron-flex-layout/iron-flex-layout.js';

const ComboboxStyles = document.createElement('template');

ComboboxStyles.innerHTML = `<dom-module id="people-combo-box" theme-for="vaadin-combo-box-item">
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