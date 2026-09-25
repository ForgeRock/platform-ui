<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

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
        <FrSearchInput
          v-model="searchQueryEntitlements"
          :placeholder="$t('common.search')" />
      </div>
    </template>
    <FrSearchResultsAnnouncer
      :count="announcedCount" />
    <EntitlementsList :entitlements="filteredEntitlements" />
  </FrListGroup>
</template>

<script setup>
import { BButton } from 'bootstrap-vue';
import FrListGroup from '@forgerock/platform-shared/src/components/ListGroup';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSearchResultsAnnouncer from '@forgerock/platform-shared/src/components/SearchResultsAnnouncer';
import { computed, ref, watch } from 'vue';
import { debounce } from 'lodash';
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

// The search is a client-side filter with no explicit submit: every keystroke re-filters the list.
// Announcing per keystroke would be suppressed during active typing, so the count is announced from a debounced settled value.
// The region is cleared immediately when the query changes so each settled search produces a fresh empty -> text transition and re-announces even with an unchanged count.
const announcedCount = ref(null);
const updateAnnouncedCount = debounce(() => {
  announcedCount.value = searchQueryEntitlements.value
    ? filteredEntitlements.value.length
    : null;
}, 500);
watch(searchQueryEntitlements, () => {
  announcedCount.value = null;
  updateAnnouncedCount();
});
</script>
