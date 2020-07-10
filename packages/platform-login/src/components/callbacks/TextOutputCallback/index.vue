<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    :class="[{'hide-polling-spinner': hideSpinner }, 'row', 'mb-2']"
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
    <div
      v-if="messageType === 'SCRIPT'"
      class="w-100"
    >
      <div
        v-if="qrCodeHtml"
        v-html="qrCodeHtml"
      />
    </div>
  </div>
</template>

<script>
import { BAlert } from 'bootstrap-vue';
import QRCodeGenerator from 'qrcode-generator';

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
  data() {
    return {
      message: this.callback.getMessage(),
      messageType: '',
      qrCodeHtml: '',
      hideSpinner: false,
    };
  },
  mounted() {
    const self = this;
    window.QRCodeReader = {
      createCode(options) {
        self.getCode(options);
      },
    };

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
  methods: {
    getCode(options) {
      const { code = 'M', version = 4, text } = options;
      const qr = new QRCodeGenerator(version, code);
      qr.addData(text);
      qr.make();

      // 3 is the size of the painted squares, 8 is the white border around the edge
      this.qrCodeHtml = qr.createImgTag(3, 8);
      this.hideSpinner = true;
    },
  },
};
</script>
