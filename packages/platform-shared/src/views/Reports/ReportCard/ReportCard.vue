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
        @click="emitRouterToTemplate(props.report?.name)"
      >
        <h2 class="h5">
          {{ startCase(props.report?.name.toLowerCase()) }}
        </h2>
        <p class="max-lines max-lines-3">
          {{ props.report?.description }}
        </p>
        <template #footer>
          <BButton
            class="px-0 py-1"
            variant="link"
          >
            <FrIcon
              class="mr-2"
              name="play_arrow"
            />
            {{ $t('reports.run') }}
          </BButton>
          <BDropdown
            no-caret
            right
            size="sm"
            split-class="p-0"
            variant="link"
          >
            <template #button-content>
              <FrIcon
                class="text-dark md-24"
                name="more_horiz"
              />
            </template>
            <BDropdownItem @click.stop="emitRouterToTemplate(props.report?.name, true)">
              <FrIcon
                class="mr-2"
                name="list_alt"
              />
              {{ $t('reports.menu.runHistory') }}
            </BDropdownItem>
          </BDropdown>
        </template>
      </BCard>
    </template>
    <template #loading>
      <BCard
        data-testid="skeleton-card"
        footer-class="py-3 d-flex justify-content-between"
      >
        <BSkeleton
          class="mb-3"
          width="70%"
        />
        <BSkeleton
          class="mb-2"
          height="0.8125rem"
          width="100%"
        />
        <BSkeleton
          class="mb-2"
          height="0.8125rem"
          width="95%"
        />
        <BSkeleton
          class="mb-4"
          height="0.8125rem"
          width="50%"
        />
        <BSkeleton
          height="0.8125rem"
          width="50%"
        />
        <template #footer>
          <BSkeleton
            type="button"
            width="20%"
          />
          <BSkeleton
            type="button"
            width="20%"
          />
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
  BDropdown,
  BDropdownItem,
  BSkeleton,
  BSkeletonWrapper,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { startCase } from 'lodash';

const props = defineProps({
  report: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['to-template']);

const hasProperties = Object.keys(props.report).length > 0;

function emitRouterToTemplate(name, toHistory = false) {
  emit('to-template', { name, toHistory });
}
</script>
