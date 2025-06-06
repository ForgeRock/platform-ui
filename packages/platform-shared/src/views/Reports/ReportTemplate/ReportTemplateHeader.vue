<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="sticky-top">
    <FrNavbar>
      <template #center-content>
        <h1 class="h4 mb-0 mr-2 d-inline-block">
          {{ templateName }}
        </h1>
        <BBadge
          v-if="reportState === 'draft'"
          class="ml-1"
          variant="light">
          {{ $t('common.draft') }}
        </BBadge>
        <BBadge
          v-else-if="reportState === 'published'"
          class="ml-1"
          variant="success">
          {{ $t('common.published') }}
        </BBadge>
      </template>
    </FrNavbar>
    <BButtonToolbar class="fr-actions-menu shadow-sm border-0 justify-content-end align-items-center px-4 py-3 bg-white">
      <FrActionsCell
        class="fr-actions-menu"
        :divider="false"
        :edit-option="false"
        @delete-clicked="$emit('delete')" />
      <FrButtonWithSpinner
        :spinner-text="$t('common.saving')"
        :disabled="disableSave || isSaving"
        :show-spinner="isSaving"
        @click="$emit('save')" />
    </BButtonToolbar>
  </div>
</template>

<script setup>
/**
 * @description
 * Create report heading panel with a menu that allows an admin to duplicate, save and delete a report template.
 */
import { BBadge, BButtonToolbar } from 'bootstrap-vue';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar/';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import i18n from '@/i18n';

// Locals
useBreadcrumb().setBreadcrumb('/reports', i18n.global.t('routeNames.Reports'));
defineEmits(['save', 'delete']);

// Props
defineProps({
  disableSave: {
    type: Boolean,
    default: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  reportState: {
    type: String,
    default: '',
  },
  templateName: {
    type: String,
    default: '',
  },
});
</script>

<style lang="scss" scoped>
:deep(.fr-actions-menu .dropdown-toggle) {
  padding: 1rem !important;
}
</style>
