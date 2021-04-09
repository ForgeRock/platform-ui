<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="deleteResource"
    ref="resourceDeleteModal"
    :static="isTesting"
    @hidden="$emit('cancel-resource-deletion')">
    <template #modal-title>
      <h5
        class="fr-modal-title mb-0">
        {{ $t(`pages.identities.deleteResource.title`, { resource: resourceNameForModalTitle }) }}
      </h5>
    </template>
    <p>{{ $t(`pages.identities.deleteResource.body`, { resource: resourceDisplayName }) }}</p>
    <template v-slot:modal-footer>
      <BButton
        variant="link"
        class="text-danger"
        data-test-id="cancelButton"
        @click="$emit('cancel-resource-deletion')">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        @click="$emit('delete-resource')"
        data-test-id="deleteButton"
        variant="danger">
        {{ $t(`pages.identities.deleteResource.primaryButton`, { resource: resourceDisplayName }) }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  capitalize,
} from 'lodash';
import {
  BButton,
  BModal,
} from 'bootstrap-vue';

export default {
  name: 'DeleteResource',
  components: {
    BButton,
    BModal,
  },
  computed: {
    resourceNameForModalTitle() {
      return capitalize(this.resourceDisplayName);
    },
  },
  props: {
    resourceToDeleteId: {
      type: String,
      default: '',
    },
    resourceDisplayName: {
      type: String,
      default: '',
    },
    // Required to render modal for integration testing
    isTesting: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    resourceToDeleteId(value) {
      if (value) {
        this.$refs.resourceDeleteModal.show();
      } else {
        this.$refs.resourceDeleteModal.hide();
      }
    },
  },
};
</script>
