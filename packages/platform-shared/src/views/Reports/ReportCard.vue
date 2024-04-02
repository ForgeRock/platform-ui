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
        <h2 class="h5">
          {{ startCase(props.report?.name.toLowerCase()) }}
        </h2>
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
            v-if="reportNameCurrentlyProcessing === props.report.name"
            class="ml-auto opacity-50 mt-2 mr-3"
            small
            :label="$t('common.loadingEtc')" />
          <FrActionsCell
            v-else
            :delete-option="props.report.isOotb === false"
            :divider="props.report.isOotb === true"
            :edit-option="props.report.isOotb === false"
            @delete-clicked.stop="$emit('delete-template', props.report.name, props.report.type)"
            @edit-clicked.stop="$emit('edit-template', props.report.name)"
            wrapper-class="pr-2">
            <template #custom-top-actions>
              <!-- Duplicate & Publish buttons are hidden on purpose until the create report epic is complete -->
              <template v-if="false">
                <BDropdownItem
                  @click.stop="$emit('duplicate-template', props.props.report.name, props.report.type)">
                  <FrIcon
                    icon-class="mr-2"
                    name="control_point_duplicate">
                    {{ $t('common.duplicate') }}
                  </FrIcon>
                </BDropdownItem>
                <BDropdownItem
                  v-if="props.report.isOotb === false && props.report.type === 'draft'"
                  @click.stop="$emit('publish-template', props.report.name)">
                  <FrIcon
                    icon-class="mr-2"
                    name="published_with_changes">
                    {{ $t('common.publish') }}
                  </FrIcon>
                </BDropdownItem>
              </template>
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
import {
  BButton,
  BCard,
  BDropdownItem,
  BSkeleton,
  BSkeletonWrapper,
  BSpinner,
} from 'bootstrap-vue';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { startCase } from 'lodash';

const props = defineProps({
  reportNameCurrentlyProcessing: {
    type: String,
    default: '',
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
  'duplicate-template',
  'edit-template',
  'publish-template',
]);

const hasProperties = Object.keys(props.report).length > 0;

function emitRouterToTemplate(name, toHistory = false) {
  emit('to-template', { name, toHistory });
}
</script>
