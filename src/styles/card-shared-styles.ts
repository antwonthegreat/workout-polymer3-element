import '@polymer/iron-flex-layout/iron-flex-layout.js';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');

documentContainer.innerHTML = `<dom-module id="card-shared-styles">
  <template>
    <style>
      material-card {
        @apply --layout-vertical;
        background-color: #fff;
        border: 1px solid var(--app-border-color);
        border-radius: 4px;
        color: var(--app-text-color);
      }

      hr {
        border:0;
        border-bottom: 1px solid var(--app-border-color);
        margin: 0;
      }

      vaadin-button {
        @apply --layout-self-end;
        margin-top: 8px;
        cursor: pointer;
      }

      card-header-section {
        @apply --layout-vertical;
        padding: 16px;
      }

      card-section {
        @apply --layout-vertical;
        padding: 16px;
      }

      card-item {
        @apply --layout-horizontal;
        @apply --layout-center;
        line-height: 20px;
        font-size: 14px;
        padding-bottom: 4px;
      }

      card-item vaadin-button {
        margin: 0 4px 0 0;
        min-width: 0;
        border-radius: 50%;
        padding: 4px;
        flex-shrink: 0;
      }

      card-title {
        padding-bottom: 8px;
        margin-bottom: 8px;
        font-size: 20px;
        font-weight: 400;
        border-bottom: 1px solid var(--app-border-color);
      }

      card-sub-title {
        line-height: 20px;
        font-size: 14px;
        font-weight: 700;
        color: var(--app-text-color-lighter);
        margin-bottom: 8px;
      }

      vaadin-progress-bar {
        margin: 0;
      }

      empty-list-text{
        display:block;
        font-size: 12px;
        font-weight: 400;
        line-height: 20px;
        padding-left:8px;
        color:  var(--app-text-color-lighter);
      }

      [invisible] {
        visibility: hidden;
      }

      [hidden]{
        display:none;
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild(documentContainer);