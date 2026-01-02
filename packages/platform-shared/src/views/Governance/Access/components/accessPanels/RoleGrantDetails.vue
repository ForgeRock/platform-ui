<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-0 d-flex justify-content-start border-0 text-truncate">
    <div
      class="d-flex flex-row align-items-center text-truncate"
      no-body>
      <div>
        <FrIcon
          :icon-class="`color-blue bg-lightblue rounded-circle md-24 mr-3 p-2`"
          name="assignment_ind" />
      </div>
      <BButton
        @click.stop="openRoleModal()"
        class="p-0"
        variant="link">
        <div class="d-flex flex-column text-truncate button-text">
          <h4 class="h6 mb-1 text-truncate">
            {{ i18n.global.t('common.role') }}
          </h4>
          <h3
            class="text-truncate w-100 m-0 h5"
            :id="`node-${access.id}-title`">
            {{ getAccessDisplayName(access) }}
          </h3>
        </div>
      </BButton>
    </div>
  </div>
  <div class="mt-4">
    <BRow class="mb-4">
      <BCol lg="6">
        <small class="d-block mb-2">
          {{ $t(`governance.access.startDate`) }}
        </small>
        {{ parseDate(access.item.decision?.accessRequest?.grantStartDate) }}
      </BCol>
    </BRow>
    <BRow class="mb-4">
      <BCol lg="6">
        <small class="d-block mb-2">
          {{ $t(`governance.access.endDate`) }}
        </small>
        {{ parseDate(access.item.decision?.accessRequest?.grantEndDate) }}
      </BCol>
    </BRow>
  </div>
</template>

<script setup>

import {
  BButton,
  BCol,
  BRow,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getAccessDisplayName, parseDate } from '../../utils/accessUtility';
import i18n from '@/i18n';

const emit = defineEmits([
  'open-selected-access-modal',
]);

defineProps({
  access: {
    type: Object,
    default: () => ({}),
  },
});

function openRoleModal() {
  emit('open-selected-access-modal');
}

</script>

<style lang="scss" scoped>
.button-text {
  text-align: left;
}

</style>
