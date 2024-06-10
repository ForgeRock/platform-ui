<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="d-flex flex-fill flex-column justify-content-center">
    <p
      class="mb-0">
      {{ pushChallengeMessage }}
    </p>
    <h1 class="mb-2 mt-4 p-3">
      {{ pushChallengeNumber }}
    </h1>
  </div>
</template>
<script>

/**
 * @description A view to display push challenge number and message content for authorisation.
 */
export default {
  name: 'PushChallengeNumber',
  props: {
    // HiddenValueCallback object that contains the push challenge number.
    callback: {
      type: Object,
      required: true,
    },
    // Contains push challenge message
    pushMessage: {
      type: String,
      default: '',
    },
  },
  methods: {
    setPushChallengeMessage() {
      // If the push-challenge message has not been overriden by admin, replace the default AM message for the default Platform message
      const defaultString = this.$t('login.pushChallenge.message');
      const startOfString = 'Tap the number [';
      const endOfString = '] on the Push Notification to continue.';

      if (this.pushMessage.startsWith(startOfString) && this.pushMessage.endsWith(endOfString)) {
        return defaultString;
      }
      return this.pushMessage;
    },
  },
  data() {
    return {
      pushChallengeNumber: this.callback.getOutputValue(),
      pushChallengeMessage: this.setPushChallengeMessage(),
    };
  },
};
</script>
