<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :class="[{'hide-polling-spinner': hideSpinner }, 'row', 'mb-2 mx-0']"
    :aria-labelledby="ariaLabelledbyId"
    :aria-level="isFirstRenderedCallback ? 1 : 2"
    ref="textOutputPanel"
    role="heading">
    <div
      v-if="messageType === 'INFORMATION'"
      class="text-muted w-100 white-space-pre-line"
      :id="messageElementId"
      :aria-hidden="!isMfaRegistrationStep && isFirstRenderedCallback"
      v-html="sanitizedMessage" />
    <div
      v-else-if="messageType === 'WARNING'"
      class="alert w-100 alert-warning white-space-pre-line"
      :id="messageElementId"
      :aria-hidden="isFirstRenderedCallback"
      v-html="sanitizedMessage" />
    <div
      v-else-if="!isFirstRenderedCallback && messageType === 'ERROR'"
      class="alert w-100 alert-danger white-space-pre-line"
      :id="messageElementId"
      v-html="sanitizedMessage" />
    <div
      v-else-if="messageType === 'SCRIPT'"
      class="w-100">
      <div v-if="qrCodeHtml">
        <div
          v-html="qrCodeHtml" />
        <BButton
          v-if="showDeviceOption"
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
import { BButton } from 'bootstrap-vue';
import QRCodeGenerator from 'qrcode-generator';
import addAttributesToDomNodeString from '@forgerock/platform-shared/src/utils/stringDomNodeUtils';
import { CallbackType } from '@forgerock/javascript-sdk';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import { baseSanitizerConfig } from '@forgerock/platform-shared/src/utils/sanitizerConfig';

export default {
  name: 'TextOutputCallback',
  components: {
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
    index: {
      type: Number,
      default: 0,
    },
    isFirstRenderedCallback: {
      type: Boolean,
      required: true,
    },
    isMfaRegistrationStep: {
      type: Boolean,
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
      showDeviceOption: true,
    };
  },
  computed: {
    messageElementId() {
      return `message-${this.index}`;
    },
    ariaLabelledbyId() {
      // Omit aria-labelledby for SCRIPT messages or MFA registration
      if (this.messageType === 'SCRIPT' || this.isMfaRegistrationStep) {
        return false;
      }

      // Refer message element only when it's visible (not aria-hidden)
      // INFORMATION: aria-hidden when !isMfaRegistrationStep && isFirstRenderedCallback
      // So reference it when !isFirstRenderedCallback (isMfaRegistrationStep already false above)
      if (this.messageType === 'INFORMATION') {
        return !this.isFirstRenderedCallback ? this.messageElementId : false;
      }

      // WARNING: aria-hidden when isFirstRenderedCallback
      // So reference it when !isFirstRenderedCallback
      if (this.messageType === 'WARNING') {
        return !this.isFirstRenderedCallback ? this.messageElementId : false;
      }

      // ERROR: not hidden (no aria-hidden attribute), and only renders when !isFirstRenderedCallback
      // So always reference it when it exists
      if (this.messageType === 'ERROR') {
        return this.messageElementId;
      }

      return false;
    },
    sanitizedMessage() {
      return this.$sanitize(this.getTranslation(this.message), baseSanitizerConfig);
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
      this.$emit('has-scripts', this.invokeScriptWithHelpers);
    }

    // Populate screenReaderMessage with callback text only if the message callback is the first TextOutputCallback rendered and is not a script.
    if (this.isFirstRenderedCallback && (this.messageType === 'INFORMATION' || this.messageType === 'ERROR' || this.messageType === 'WARNING')) {
      this.$emit('update-screen-reader-message', this.messageType, this.sanitizedMessage);
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
        getTranslation: (text) => this.getTranslation(text),
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
      const {
        code = 'M',
        version = 4,
        text,
        showDeviceOption,
      } = options;
      const qr = new QRCodeGenerator(version, code);
      qr.addData(text);
      qr.make();

      // 3 is the size of the painted squares, 8 is the white border around the edge
      const imgTagStr = qr.createImgTag(3, 8);
      const attributes = new Map().set('alt', this.$t('common.qrCode'));
      this.qrCodeHtml = addAttributesToDomNodeString(imgTagStr, attributes);

      this.qrCodeMobileLink = text;
      this.hideSpinner = true;
      this.showDeviceOption = showDeviceOption === undefined || options.showDeviceOption;
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

<style lang="scss" scoped>
.white-space-pre-line {
  white-space: pre-line;
}
</style>
