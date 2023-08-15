<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="clearSessionsModal"
    ref="clearSessionsModal"
    :title="$t('common.endSessions')"
    :static="isTesting"
    @hidden="$emit('close-modal')">
    <p>
      {{ $t('clearSessionsModal.modalText', { name: resourceName }) }}
    </p>
    <p>
      {{ $t('clearSessionsModal.consequencesText') }}
    </p>
    <template #modal-footer>
      <BButton
        variant="link"
        class="text-danger"
        data-testid="cancelButton"
        @click="$emit('close-modal')">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        @click="$emit('clear-sessions')"
        data-testid="clearSessionsButton"
        variant="danger">
        {{ $t('common.endSessions') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';

export default {
  name: 'ClearResourceSessions',
  components: {
    BButton,
    BModal,
  },
  props: {
    resourceName: {
      type: String,
      default: '',
    },
    show: {
      type: Boolean,
      default: false,
    },
    // Required to render modal for integration testing
    isTesting: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    show(value) {
      if (value) {
        this.$refs.clearSessionsModal.show();
      } else {
        this.$refs.clearSessionsModal.hide();
      }
    },
  },
};
</script>
