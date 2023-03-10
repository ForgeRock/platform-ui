<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :class="[{'hide-polling-spinner': hideSpinner }, 'row', 'mb-2']"
    ref="textOutputPanel">
    <div
      v-if="messageType === 'INFORMATION'"
      class="text-center text-muted w-100">
      {{ getTranslation(message) }}
    </div>
    <BAlert
      v-if="messageType === 'WARNING'"
      variant="warning"
      class="w-100"
      show>
      {{ getTranslation(message) }}
    </BAlert>
    <BAlert
      v-if="messageType === 'ERROR'"
      variant="danger"
      class="w-100"
      show>
      {{ getTranslation(message) }}
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
import addAttributesToDomNodeString from '@forgerock/platform-shared/src/utils/stringDomNodeUtils';
import { CallbackType } from '@forgerock/javascript-sdk';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

export default {
  name: 'TextOutputCallback',
  components: {
    BAlert,
    BButton,
  },
  mixins: [
    TranslationMixin,
  ],
  props: {
    callback: {
      type: Object,
      required: true,
    },
    step: {
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
      this.$emit('has-scripts', this.invokeScriptWithHelpers);
    }
  },
  methods: {
    invokeScriptWithHelpers() {
      const loginHelpers = {
        disableNextButton: (bool) => { this.$emit('disable-next-button', bool); },
        hideNextButton: (bool) => { this.$emit('hide-next-button', bool); },
        nextStep: () => { this.$emit('next-step'); },
        nextStepCallback: (cb) => { this.$emit('next-step-callback', cb); },
        setHiddenCallback: (name, value) => { this.setHiddenCallback(name, value); },
      };
      const QRCodeReader = {
        createCode: (options) => { this.createCode(options); },
      };
      // eslint-disable-next-line no-new-func
      (Function(`"use strict"; return (
        function (loginHelpers, QRCodeReader) { 
          window.QRCodeReader = QRCodeReader;
          ${this.message} 
        })`)()
      )(loginHelpers, QRCodeReader);
    },
    createCode(options) {
      const { code = 'M', version = 4, text } = options;
      const qr = new QRCodeGenerator(version, code);
      qr.addData(text);
      qr.make();

      // 3 is the size of the painted squares, 8 is the white border around the edge
      const imgTagStr = qr.createImgTag(3, 8);
      const attributes = new Map().set('alt', '');
      this.qrCodeHtml = addAttributesToDomNodeString(imgTagStr, attributes);

      this.qrCodeMobileLink = text;
      this.hideSpinner = true;
    },
    setHiddenCallback(name, value) {
      // keep dom updated too
      const el = document.getElementById(name);
      if (el) el.value = value;
      this.step
        .getCallbacksOfType(CallbackType.HiddenValueCallback)
        .find((x) => x.getOutputByName('id', '') === name)
        .setInputValue(value);
    },
  },
};
</script>
