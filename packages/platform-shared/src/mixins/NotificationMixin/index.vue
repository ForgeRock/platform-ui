<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import Notifications from 'vue-notification';
import velocity from 'velocity-animate';
import Vue from 'vue';
import { has } from 'lodash';

Vue.use(Notifications, { velocity });

/**
 * @description Notification mixin used for generating messages to users to convey information
 *
 */
export default {
  name: 'NotificationMixin',
  methods: {
    // Display an application notification
    displayNotification(notificationGroup, notificationType, message) {
      let type = notificationType;

      if (type === 'error') {
        type = 'danger';
      }

      this.$notify({
        type,
        text: message,
      });
    },
    showErrorMessage(error, defaultMessage) {
      let errorMessage = defaultMessage;

      if (has(error, 'response.data.message')) {
        // error message may have html encoding for example &#39; aka single quote
        const errorTextElement = document.createElement('div');
        errorTextElement.innerHTML = error.response.data.message;
        errorMessage = errorTextElement.innerText;
      }

      this.displayNotification('AdminMessage', 'danger', errorMessage);
    },
  },
};
</script>
