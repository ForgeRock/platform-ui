<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import Notifications from 'vue-notification';
import Vue from 'vue';
import { has } from 'lodash';

Vue.use(Notifications);

/**
 * @description Notification mixin used for generating messages to users to convey information
 *
 */
export default {
  name: 'NotificationMixin',
  methods: {
    // Display an application notification
    displayNotification(notificationGroup, notificationType, message) {
      this.$notify({
        group: notificationGroup,
        type: notificationType,
        text: message,
      });
    },
    showErrorMessage(error, defaultMessage) {
      let errorMessage = defaultMessage;

      if (has(error, 'response.data.message')) {
        errorMessage = error.response.data.message;
      }

      this.displayNotification('AdminMessage', 'danger', errorMessage);
    },
  },
};
</script>
