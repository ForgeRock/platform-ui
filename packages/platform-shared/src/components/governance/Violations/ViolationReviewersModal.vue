<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :ok-title="$t('common.ok')"
    id="ViolationReviewersModal"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    scrollable
    size="md"
    @hidden="$emit('hidden')">
    <template #modal-header="{ close }">
      <div class="w-100 d-flex align-items-start">
        <div>
          <small class="mb-0">
            {{ $t('common.reviewers') }}
          </small>
          <h1 class="h5 modal-title text-capitalize">
            {{ violation.policyRule?.name }}
          </h1>
        </div>
        <BButtonClose
          variant="link"
          class="ml-auto"
          @click="close">
          <FrIcon
            name="close"
            icon-class="text-muted md-24" />
        </BButtonClose>
      </div>
    </template>
    <FrUserGroupList
      hide-show-more
      :users-list="violation.reviewers" />
  </BModal>
</template>

<script setup>
/**
 * Component for displaying list of reviewers on violation item
 * @component ViolationReviewersModal
 * @prop {Object} violation - Object containing details of the violation to display
 */
import { BButtonClose, BModal } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrUserGroupList from '@forgerock/platform-shared/src/components/UserGroupList/UserGroupList';

defineProps({
  violation: {
    type: Object,
    required: true,
  },
});
</script>
