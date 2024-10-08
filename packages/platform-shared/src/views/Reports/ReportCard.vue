<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BSkeletonWrapper :loading="props.loading">
    <template #default>
      <BCard
        v-if="hasProperties"
        class="cursor-pointer h-100"
        data-testid="report-card"
        footer-class="py-3 d-flex justify-content-between"
        tag="a"
        @click="emitRouterToTemplate(props.report?.name)">
        <BCardHeader header-class="d-flex align-items-start p-0 mb-3 border-0">
          <h2 class="h5 mb-0 flex-grow-1">
            {{ startCase(props.report?.name.toLowerCase()) }}
          </h2>
          <BBadge
            v-if="!props.report.ootb"
            class="text-capitalize ml-2 "
            :variant="props.report.type === 'published' ? 'success' : 'light'">
            {{ props.report.type }}
          </BBadge>
        </BCardHeader>
        <p class="max-lines max-lines-3">
          {{ props.report?.description }}
        </p>
        <template #footer>
          <BButton
            class="px-0 py-1"
            variant="link">
            <FrIcon
              icon-class="mr-2"
              name="play_arrow">
              {{ $t('reports.run') }}
            </FrIcon>
          </BButton>
          <BSpinner
            v-if="reportIsCurrentlyProcessing"
            class="ml-auto opacity-50 mt-2 mr-3"
            small
            :label="$t('common.loadingEtc')" />
          <FrActionsCell
            v-else
            :delete-option="showCustomReport"
            :duplicate-option="showCustomReport"
            :divider="showCustomReport"
            :edit-option="showCustomReport"
            @delete-clicked.stop="$emit('delete-template', props.report.name, props.report.type)"
            @duplicate-clicked.stop="$emit('open-duplicate-modal', props.report)"
            @edit-clicked.stop="$emit('edit-template', props.report.name, reportState)"
            wrapper-class="pr-2">
            <template #custom-top-actions>
              <BDropdownItem
                v-if="showCustomReport && props.report.type === 'draft'"
                @click.stop="$emit('publish-template', props.report.name, reportState)">
                <FrIcon
                  icon-class="mr-2"
                  name="published_with_changes">
                  {{ $t('common.publish') }}
                </FrIcon>
              </BDropdownItem>
              <BDropdownItem @click.stop="emitRouterToTemplate(props.report?.name, true)">
                <FrIcon
                  icon-class="mr-2"
                  name="list_alt">
                  {{ $t('reports.menu.runHistory') }}
                </FrIcon>
              </BDropdownItem>
            </template>
          </FrActionsCell>
        </template>
      </BCard>
    </template>
    <template #loading>
      <BCard
        data-testid="skeleton-card"
        footer-class="py-3 d-flex justify-content-between">
        <BSkeleton
          class="mb-3"
          width="70%" />
        <BSkeleton
          class="mb-2"
          height="0.8125rem"
          width="100%" />
        <BSkeleton
          class="mb-2"
          height="0.8125rem"
          width="95%" />
        <BSkeleton
          class="mb-4"
          height="0.8125rem"
          width="50%" />
        <BSkeleton
          height="0.8125rem"
          width="50%" />
        <template #footer>
          <BSkeleton
            type="button"
            width="20%" />
          <BSkeleton
            type="button"
            width="20%" />
        </template>
      </BCard>
    </template>
  </BSkeletonWrapper>
</template>

<script setup>
/**
 * @description  The card that shows the info of a report template.
 */
import { computed } from 'vue';
import {
  BBadge,
  BButton,
  BCard,
  BCardHeader,
  BDropdownItem,
  BSkeleton,
  BSkeletonWrapper,
  BSpinner,
} from 'bootstrap-vue';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { startCase } from 'lodash';
import store from '@/store';

const props = defineProps({
  reportCurrentlyProcessing: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: true,
  },
  report: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits([
  'to-template',
  'delete-template',
  'open-duplicate-modal',
  'edit-template',
  'publish-template',
]);

const isAdmin = store.state.SharedStore.currentPackage === 'admin';
const hasCustomReportsFeatureEnabled = store.state.SharedStore.autoCustomReportsEnabled;
const showCustomReport = hasCustomReportsFeatureEnabled && isAdmin && props.report.ootb === false;
const hasProperties = Object.keys(props.report).length > 0;
const reportIsCurrentlyProcessing = computed(() => {
  const { id: reportNameBeingProcessed, status: reportStatusBeingProcessed } = props.reportCurrentlyProcessing;
  return reportNameBeingProcessed === props.report.name && reportStatusBeingProcessed === props.report.type;
});
const reportState = computed(() => {
  const isOutOfTheBox = props.report.ootb;
  const state = isOutOfTheBox ? 'published' : props.report.type;
  return state || 'published';
});

function emitRouterToTemplate(name, toHistory = false) {
  emit('to-template', { name, toHistory, state: reportState.value });
}
</script>
