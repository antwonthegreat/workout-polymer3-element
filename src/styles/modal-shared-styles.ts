import '@polymer/iron-flex-layout/iron-flex-layout.js';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');

documentContainer.innerHTML = `<dom-module id="modal-shared-styles">
  <template>
    <style>
      action-buttons {
        @apply --layout-horizontal;
        @apply --layout-end-justified;
        margin-top: 32px;
      }

      header {
        padding: 0 8px 8px 8px;
        font-size: 18px;
        border-bottom: 1px solid #eee;
      }

      vaadin-progress-bar {
        margin: 0 !important;
        padding: 0 !important;
      }

      main {
        display: block;
        padding: 8px;
        @apply --layout-vertical;
      }

      description {
        margin:8px;
      }

      vaadin-button {
        cursor: pointer;
      }

      vaadin-button[cancel] {
        --material-primary-text-color: #757575;
      }

      [invisible] {
        visibility: hidden;
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild(documentContainer);