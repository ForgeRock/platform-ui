<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="sticky-top">
    <FrNavbar
      hide-dropdown
      hide-toggle
      :show-docs-link="false"
      :show-help-link="false"
      :show-profile-link="false">
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
      <FrSpinner
        v-if="isDuplicating"
        class="mr-4 pr-3 opacity-50"
        size="sm" />
      <FrActionsCell
        v-else
        class="fr-actions-menu"
        :edit-option="false"
        @delete-clicked="$emit('delete')">
        <template #custom-top-actions>
          <BDropdownGroup>
            <BDropdownItem @click="$emit('duplicate')">
              <FrIcon
                icon-class="mr-2"
                name="control_point_duplicate">
                {{ $t('common.duplicate') }}
              </FrIcon>
            </BDropdownItem>
          </BDropdownGroup>
        </template>
      </FrActionsCell>
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
import {
  BBadge,
  BButtonToolbar,
  BDropdownGroup,
  BDropdownItem,
} from 'bootstrap-vue';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar/';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import i18n from '@/i18n';

// Locals
useBreadcrumb().setBreadcrumb('/reports', i18n.global.t('routeNames.Reports'));

defineEmits(['save', 'delete', 'duplicate']);

// Props
defineProps({
  disableSave: {
    type: Boolean,
    default: true,
  },
  isDuplicating: {
    type: Boolean,
    default: false,
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
