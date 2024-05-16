<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    cancel-variant="link"
    id="RevokeExceptionModal"
    size="lg"
    title-class="h5"
    title-tag="h2"
    :ok-title="$t('common.revoke')"
    :static="isTesting"
    :title="$t('governance.certificationTask.actions.revokeException')"
    @ok="revokeException">
    <p class="text-muted">
      {{ $t('governance.certificationTask.actions.revokeExceptionDescription') }}
    </p>
    <BFormGroup class="mt-4">
      <FrField
        name="justificationText"
        v-model="justificationText"
        type="textarea"
        :label="$t('governance.accessRequest.newRequest.justification')"
        :rows="3" />
    </BFormGroup>
  </BModal>
</template>

<script setup>
/**
 * Modal in which exceptions can be revoked
 * @component RevokeExceptionModal
 * @prop {Boolean} isTesting - Determines if the component is in a test environment
 * @prop {String} violationId - Violation ID to revoke exception
 */

import {
  BFormGroup,
  BModal,
} from 'bootstrap-vue';
import { ref } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';

const emit = defineEmits(['revoke']);

const props = defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
  violationId: {
    type: String,
    required: true,
  },
});

const justificationText = ref('');

function revokeException() {
  emit('revoke', {
    ids: [props.violationId],
    comment: justificationText.value,
  });
  justificationText.value = '';
}
</script>
