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
      :aria-hidden="!isMfaRegistrationStep && isAriaHidden"
      v-html="sanitizedMessage" />
    <div
      v-else-if="messageType === 'WARNING'"
      class="alert w-100 alert-warning white-space-pre-line"
      :id="messageElementId"
      :aria-hidden="isAriaHidden"
      v-html="sanitizedMessage" />
    <div
      v-else-if="shouldRenderErrorElement"
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
import { hasInteractiveContent } from '@forgerock/platform-shared/src/utils/accessibilityUtils';

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
    isAriaHidden() {
      return this.isFirstRenderedCallback && !hasInteractiveContent(this.sanitizedMessage);
    },
    // Only render the ERROR element after the first callback.
    shouldRenderErrorElement() {
      return this.messageType === 'ERROR' && !this.isFirstRenderedCallback;
    },
    /**
     * Determines when the live region should announce the message.
     *
     * Returns true only when assistive technology cannot read the inline message directly:
     * - ERROR on the first callback (the inline ERROR element is not rendered yet)
     * - INFORMATION/WARNING on the first callback only when the inline message is aria-hidden
     *
     * Returns false for all other cases.
     * @returns {boolean}
     */
    shouldEmitScreenReaderMessage() {
      if (!this.isFirstRenderedCallback) {
        return false;
      }

      if (this.messageType === 'ERROR') {
        return true;
      }

      return this.isAriaHidden
        && (this.messageType === 'WARNING' || (this.messageType === 'INFORMATION' && !this.isMfaRegistrationStep));
    },
    messageElementId() {
      return `message-${this.index}`;
    },
    /**
     * Returns the element id to be used by the heading container's aria-labelledby.
     * Returns false when the aria-labelledby should not be applied, which happens when the message is either not rendered or is rendered but aria-hidden.
     * In both cases, the heading container should not reference the message element because assistive technology cannot access it, and referencing a non-existent or aria-hidden element would create confusion.
     *
     * Rules:
     * - messageType === 'SCRIPT' or MFA registration step: return false
     * - ERROR: reference message id only when shouldRenderErrorElement is true (i.e. not the
     *   first rendered callback), because the ERROR element is not rendered on the first callback.
     * - INFORMATION/WARNING: reference message id only when isAriaHidden is false.
     *   isAriaHidden is only true when isFirstRenderedCallback AND the message contains
     *   no interactive content. If a first-rendered callback contains interactive content,
     *   aria-hidden is intentionally not applied (WCAG 2.1 § 4.1.2), so the element is visible
     *   to assistive technology and must be referenced.
     * - Default: return false.
     *
     * This keeps the heading label source aligned with what assistive technology can access.
     * @returns {string|boolean}
     */
    ariaLabelledbyId() {
      // Omit aria-labelledby for SCRIPT messages or MFA registration
      if (this.messageType === 'SCRIPT' || this.isMfaRegistrationStep) {
        return false;
      }

      if (this.shouldRenderErrorElement
        || ((this.messageType === 'INFORMATION' || this.messageType === 'WARNING') && !this.isAriaHidden)) {
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

    if (this.shouldEmitScreenReaderMessage) {
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
