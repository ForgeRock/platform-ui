<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    class="row ml-1 mb-2"
    ref="textOutputPanel">
    <div
      v-if="messageType === 'INFORMATION'"
      class="text-center text-muted w-100">
      {{ message }}
    </div>
    <BAlert
      v-if="messageType === 'WARNING'"
      variant="warning"
      class="w-100"
      show>
      {{ message }}
    </BAlert>
    <BAlert
      v-if="messageType === 'ERROR'"
      variant="danger"
      class="w-100"
      show>
      {{ message }}
    </BAlert>
  </div>
</template>

<script>
import { BAlert } from 'bootstrap-vue';

export default {
  components: {
    BAlert,
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    switch (this.callback.getMessageType()) {
    case '1':
      this.messageType = 'WARNING';
      break;
    case '2':
      this.messageType = 'ERROR';
      break;
    case '4':
      this.messageType = 'SCRIPT';
      break;
    default:
      this.messageType = 'INFORMATION';
    }

    if (this.messageType === 'SCRIPT') {
      const el = document.createElement('script');
      el.innerHTML = this.message;
      this.$refs.textOutputPanel.appendChild(el);
    }
  },
  data() {
    return {
      message: this.callback.getMessage(),
      messageType: '',
    };
  },
};
</script>
