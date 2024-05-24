<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrListGroup class="shadow-none">
    <template #list-group-header>
      <div class="card-header border-bottom-0">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h5 m-0">
            {{ title }} ({{ entitlements.length }})
          </h2>
          <BButton
            v-if="!added"
            variant="link"
            class="p-0"
            @click="$emit('add-all', entitlements)">
            {{ $t('common.revokeAll') }}
          </BButton>
          <FrIcon
            v-else
            icon-class="text-success mr-2"
            name="check">
            {{ $t('common.added') }}
          </FrIcon>
        </div>
        <FrSearchInput v-model="searchQueryEntitlements" />
      </div>
    </template>
    <EntitlementsList :entitlements="filteredEntitlements" />
  </FrListGroup>
</template>

<script setup>
import { BButton } from 'bootstrap-vue';
import FrListGroup from '@forgerock/platform-shared/src/components/ListGroup';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import { computed, ref } from 'vue';
import EntitlementsList from './EntitlementsList';

const props = defineProps({
  entitlements: {
    type: Array,
    default: () => [],
  },
  added: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

defineEmits(['add-all']);

const searchQueryEntitlements = ref('');

const filteredEntitlements = computed(() => {
  const searchQuery = searchQueryEntitlements.value.toLowerCase();
  return props.entitlements.filter((entitlement) => entitlement.name.toLowerCase().includes(searchQuery)
    || entitlement.appName.toLowerCase().includes(searchQuery)
    || entitlement.description.toLowerCase().includes(searchQuery));
});
</script>
