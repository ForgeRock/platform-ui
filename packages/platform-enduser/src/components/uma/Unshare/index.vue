<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="unshareModal"
    ref="fsModal"
    cancel-variant="outline-secondary">
    <template #modal-header>
      <div class="d-flex w-100 h-100">
        <h2 class="my-0 h6">
          {{ $t('pages.uma.resources.unshareResource', {resourceName: resourceName}) }}
        </h2>
        <button
          type="button"
          :aria-label="$t('common.close')"
          class="close"
          @click="hideModal">
          <FrIcon
            icon-class="font-weight-bolder md-24 mb-1"
            name="close" />
        </button>
      </div>
    </template>
    {{ $t('pages.uma.resources.warningMessage') }}
    <template #modal-footer="{ cancel }">
      <BButton
        variant="outline-secondary mr-2"
        @click="cancel()">
        {{ $t('pages.uma.resources.cancel') }}
      </BButton>
      <BButton
        variant="danger"
        @click="unshare">
        {{ $t('pages.uma.resources.unshare') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import { BButton, BModal } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
/**
 * @description Dialog for warning a user and confirming they want to stop sharing a resource
 *
 * */
export default {
  name: 'Unshare',
  components: {
    BButton,
    BModal,
    FrIcon,
  },
  data() {
    return {};
  },
  props: {
    resourceId: {
      type: String,
      default: () => '',
    },
    resourceName: {
      type: String,
      default: () => '',
    },
  },
  methods: {
    hideModal() {
      this.$refs.fsModal.hide();
    },
    unshare() {
      this.$emit('unshareResource', this.resourceId);
      this.hideModal();
    },
  },
};
</script>
