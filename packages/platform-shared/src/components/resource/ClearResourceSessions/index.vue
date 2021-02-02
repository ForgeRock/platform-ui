<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="clearSessionsModal"
    ref="clearSessionsModal"
    :title="$t('common.endSessions')"
    :static="isTesting">
    <p>
      {{ $t('clearSessionsModal.modalText', { name: resourceName }) }}
    </p>
    <p>
      {{ $t('clearSessionsModal.consequencesText') }}
    </p>
    <template v-slot:modal-footer>
      <BButton
        variant="link"
        class="text-danger"
        data-test-id="cancelButton"
        @click="closeModal()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        @click="clearSessionsAndClose()"
        data-test-id="clearSessionsButton"
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
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';

export default {
  name: 'ClearResourceSessions',
  mixins: [
    NotificationMixin,
  ],
  components: {
    BButton,
    BModal,
  },
  props: {
    clearSessions: {
      type: Function,
      default: () => {
        const retv = {
          then: () => {},
        };
        return retv;
      },
    },
    closeModal: {
      type: Function,
      default: () => {
        const retv = {
          then: () => {},
        };
        return retv;
      },
    },
    resourceId: {
      type: String,
      default: '',
    },
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
  methods: {
    clearSessionsAndClose() {
      return this.clearSessions(this.resourceId)
        .then(() => {
          this.displayNotification('AdminMessage', 'success', this.$t('clearSessionsModal.successClearingSessions'));
        })
        .catch((err) => {
          this.showErrorMessage(
            err,
            this.$t('clearSessionsModal.errorClearingSessions'),
          );
        })
        .finally(() => {
          this.closeModal();
        });
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
