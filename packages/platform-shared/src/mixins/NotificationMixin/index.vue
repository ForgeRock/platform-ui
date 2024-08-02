<!-- Copyright (c) 2019-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import { has } from 'lodash';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import { notify } from '@kyvg/vue3-notification';

/**
 * @description Notification mixin used for generating messages to users to convey information
 *
 */
export default {
  name: 'NotificationMixin',
  mixins: [
    TranslationMixin,
  ],
  methods: {
    // Display an application notification. Duration of 3000ms is the component default.
    displayNotification(notificationType, message, duration = 3000) {
      let type = notificationType;

      if (type === 'error') {
        type = 'danger';
      }

      notify({
        type,
        text: this.getTranslation(message),
        duration,
      });
    },
    showErrorMessage(error, defaultMessage) {
      let errorMessage = defaultMessage;

      if (has(error, 'response.data.message') && error.response.data.message.length > 0) {
        // error message may have html encoding for example &#39; aka single quote
        const errorTextElement = document.createElement('div');
        errorTextElement.innerHTML = error.response.data.message;
        errorMessage = errorTextElement.innerText;
      }

      this.displayNotification('danger', this.getTranslation(errorMessage));
    },
  },
};
</script>
