<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="mb-5">
      <EntitlementsList
        v-if="firstEntitlements.length"
        :entitlements="firstEntitlements" />
      <div
        v-else
        class="d-flex flex-column align-items-center justify-content-center text-center h-100 pb-4 border-top border-bottom">
        <FrIcon
          icon-class="opacity-30 mb-3 md-48 pt-4"
          name="add" />
        <h3 class="h5">
          {{ $t('governance.violations.remediate.noEntitlementsSelected') }}
        </h3>
        <p>
          {{ $t('governance.violations.remediate.addEntitlements') }}
        </p>
      </div>
      <BCollapse :visible="showMore">
        <EntitlementsList
          v-if="restOfEntitlements.length"
          :entitlements="restOfEntitlements" />
      </BCollapse>
      <BButton
        v-if="restOfEntitlements.length"
        class="w-100 text-left pl-0 pb-0"
        variant="link"
        @click="showMore = !showMore">
        {{ !showMore ? $t('common.viewMore', { count: restOfEntitlements.length }) : $t('common.viewLess') }}
      </BButton>
    </div>
  </div>
</template>

<script setup>
import {
  BButton, BCollapse,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { computed, ref } from 'vue';
import EntitlementsList from './EntitlementsList';

/**
 * this component is used to show entitlements in the cart
 */

const props = defineProps({
  entitlements: {
    type: Array,
    default: () => [],
  },
});

const showMore = ref(false);

const firstEntitlements = computed(() => props.entitlements.slice(0, 3));
const restOfEntitlements = computed(() => props.entitlements.slice(3));
</script>
