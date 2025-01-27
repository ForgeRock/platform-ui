<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <h1 class="h2">
      {{ $t('login.recoveryCodes.header') }}
    </h1>
    <p class="mb-0">
      {{ $t('login.recoveryCodes.subheader') }}
    </p>
    <BRow>
      <BCol
        cols="4"
        offset="4">
        <hr class="my-4">
      </BCol>
    </BRow>
    <h2 class="h5 text-left">
      {{ $t('login.recoveryCodes.subtitle') }}
    </h2>
    <p class="text-left">
      {{ $t('login.recoveryCodes.info') }}
      <strong>
        {{ $t('login.recoveryCodes.infoEmphasis') }}
      </strong>
    </p>
    <div class="border rounded bg-light mb-4" aria-hidden="true">
      <div class="p-4 text-left">
        <BRow>
          <BCol>
            <ol
              start="1"
              class="m-0 column-wrapper">
              <li
                v-for="(code, key) in recoveryCodes"
                :key="key"
                :data-testid="`recovery-code-${key}`"
                class="recovery-code">
                <span
                  class="ml-2 text-monospace">
                  {{ code }}
                </span>
              </li>
            </ol>
          </BCol>
        </BRow>
      </div>
    </div>
    <div
      class="d-flex flex-row-reverse justify-content-between">
      <BButton
        variant="primary"
        @click="$emit('next-step')"
        data-testid="btn-recovery-codes-next-step"
      >
        {{ $t('common.done') }}
      </BButton>
      <div>
        <BButton
          :autofocus="autofocus"
          data-testid="btn-copy-recovery-codes"
          :aria-label="$t('login.recoveryCodes.copyRecoveryCodesToClipboard', { recoveryCodesLength : recoveryCodes.length })"
          variant="link"
          @click="copyRecoveryCodesToClipboard">
          {{ $t('common.copy') }}
        </BButton>
        <BButton
          data-testid="btn-print-recovery-codes"
          :aria-label="$t('login.recoveryCodes.printRecoveryCodes', { recoveryCodesLength : recoveryCodes.length })"
          variant="link"
          @click="printRecoveryCodes">
          {{ $t('common.print') }}
        </BButton>
      </div>
    </div>
  </div>
</template>

<script>
import { FRRecoveryCodes } from '@forgerock/javascript-sdk';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import * as clipboard from 'clipboard-polyfill/text';
import {
  BCol,
  BRow,
  BButton,
} from 'bootstrap-vue';

export default {
  name: 'RecoveryComponent',
  mixins: [
    NotificationMixin,
  ],
  components: {
    BCol,
    BRow,
    BButton,
  },
  props: {
    autofocus: {
      type: Boolean,
      default: false,
    },
    step: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      recoveryCodes: [],
    };
  },
  mounted() {
    this.recoveryCodes = FRRecoveryCodes.getCodes(this.step);
  },
  methods: {
    copyRecoveryCodesToClipboard() {
      clipboard.writeText(this.recoveryCodes).then(() => {
        this.displayNotification('success', this.$t('common.copySuccess'));
      }, (error) => {
        this.showErrorMessage(error, this.$t('common.copyFail'));
      });
    },
    printRecoveryCodes() {
      window.print();
    },
  },
};
</script>

<style lang="scss" scoped>
.column-wrapper {
  @media (min-width: 575px) {
    column-count: 2;
  }

  .recovery-code {
    color: $gray-700;
  }
}
</style>
