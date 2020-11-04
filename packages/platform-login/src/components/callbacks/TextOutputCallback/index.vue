<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

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
      <div v-if="qrCodeHtml">
        <div
          v-html="qrCodeHtml" />
        <BButton
          :href="qrCodeMobileLink"
          class="mt-2"
          variant="link">
          {{ $t('common.onMobileDevice') }}
        </BButton>
      </div>
    </div>
  </div>
</template>

<script>
import { BAlert, BButton } from 'bootstrap-vue';
import QRCodeGenerator from 'qrcode-generator';

export default {
  name: 'TextOutputCallback',
  components: {
    BAlert,
    BButton,
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
      qrCodeMobileLink: '',
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
      this.$emit('has-scripts');
      // will run after $emit is done
      this.$nextTick(this.appendScript);
    }
  },
  methods: {
    appendScript() {
      const el = document.createElement('script');
      el.innerHTML = this.message;
      this.$refs.textOutputPanel.appendChild(el);
    },
    getCode(options) {
      const { code = 'M', version = 4, text } = options;
      const qr = new QRCodeGenerator(version, code);
      qr.addData(text);
      qr.make();

      // 3 is the size of the painted squares, 8 is the white border around the edge
      this.qrCodeHtml = qr.createImgTag(3, 8);
      this.qrCodeMobileLink = text;
      this.hideSpinner = true;
    },
  },
};
</script>
