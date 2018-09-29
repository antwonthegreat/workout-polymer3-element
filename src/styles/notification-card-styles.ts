const NotificationCardStyles = document.createElement('template');

NotificationCardStyles.innerHTML = `
<dom-module id="custom-notification" theme-for="vaadin-notification-card">
  <template>
    <style>
    :host {
      --material-primary-color: #3B95FF;
      --material-primary-text-color: #3B95FF;
    }

    [part="content"] {
      min-width: 265px;
    }
    </style>
  </template>
</dom-module>`;
document.head.appendChild(NotificationCardStyles.content);