<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BRow>
      <BCol lg="12">
        <FrPriorityFilter
          v-model:value="formPriorities"
          class="mb-4 mt-2" />
      </BCol>
      <BCol lg="6">
        <FrField
          v-model="formFields.requestType"
          class="mb-4"
          :label="$t('governance.accessRequest.requestType')"
          :options="requestTypeOptions"
          testid="request-type"
          type="select" />
      </BCol>
      <BCol lg="6">
        <FrGovResourceSelect
          v-model="formFields.requestedFor"
          name="requestedFor"
          class="mb-4"
          :first-option="allRequestersOption"
          :initial-data="{ id: 'all' }"
          :label="$t('governance.accessRequest.requestedFor')"
          resource-path="user"
          data-testid="requested-for" />
      </BCol>
      <BCol lg="6">
        <FrGovResourceSelect
          v-model="formFields.requester"
          name="requester"
          class="mb-4"
          :first-option="allRequestersOption"
          :initial-data="{ id: 'all' }"
          :label="$t('governance.accessRequest.requester')"
          resource-path="user"
          data-testid="requester" />
      </BCol>
      <BCol lg="6">
        <FrField
          v-model="formFields.requestId"
          class="mb-4"
          :label="$t('governance.accessRequest.requestId')"
          testid="request-id" />
      </BCol>
    </BRow>
  </div>
</template>
<script setup>
/**
 * Component used to filter access requests
 */
import {
  BCol,
  BRow,
} from 'bootstrap-vue';
import { computed, ref, watch } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrPriorityFilter from '@forgerock/platform-shared/src/components/governance/PriorityFilter';
import { requestTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import i18n from '@/i18n';

const emit = defineEmits(['filter-change', 'filter-count']);

// data
const formFields = ref({
  requester: 'managed/user/all',
  requestedFor: 'managed/user/all',
  requestId: '',
  requestType: 'all',
});
const formPriorities = ref({
  high: true,
  medium: true,
  low: true,
  none: true,
});

const allRequestersOption = ref({
  text: i18n.global.t('governance.accessRequest.allRequesters'),
  value: 'all',
});
const requestTypeOptions = ref([
  {
    text: i18n.global.t('governance.accessRequest.requestTypes.all'),
    value: 'all',
  },
  {
    text: i18n.global.t(requestTypes.ACCOUNT_GRANT.label),
    value: requestTypes.ACCOUNT_GRANT.value,
  },
  {
    text: i18n.global.t(requestTypes.ACCOUNT_REVOKE.label),
    value: requestTypes.ACCOUNT_REVOKE.value,
  },
  {
    text: i18n.global.t(requestTypes.ENTITLEMENT_GRANT.label),
    value: requestTypes.ENTITLEMENT_GRANT.value,
  },
  {
    text: i18n.global.t(requestTypes.ENTITLEMENT_REVOKE.label),
    value: requestTypes.ENTITLEMENT_REVOKE.value,
  },
  {
    text: i18n.global.t(requestTypes.ROLE_GRANT.label),
    value: requestTypes.ROLE_GRANT.value,
  },
  {
    text: i18n.global.t(requestTypes.ROLE_REVOKE.label),
    value: requestTypes.ROLE_REVOKE.value,
  },
]);

const numFilters = computed(() => {
  let filters = 0;
  if (!formPriorities.value.high) filters += 1;
  if (!formPriorities.value.medium) filters += 1;
  if (!formPriorities.value.low) filters += 1;
  if (!formPriorities.value.none) filters += 1;
  if (formFields.value.requestType !== 'all') filters += 1;
  if (formFields.value.requestedFor !== 'managed/user/all') filters += 1;
  if (formFields.value.requester !== 'managed/user/all') filters += 1;
  if (formFields.value.requestId.length) filters += 1;

  return filters;
});

/**
 * Get an object representing the current filter properties
 */
function getFilterPayload() {
  const priorities = {
    high: formPriorities.value.high,
    medium: formPriorities.value.medium,
    low: formPriorities.value.low,
    none: formPriorities.value.none,
  };
  const requestType = formFields.value.requestType === 'all'
    ? null
    : formFields.value.requestType;
  const requestedFor = formFields.value.requestedFor === 'managed/user/all'
    ? null
    : formFields.value.requestedFor;
  const requester = formFields.value.requester === 'managed/user/all'
    ? null
    : formFields.value.requester;
  const requestId = formFields.value.requestId.length
    ? formFields.value.requestId
    : null;

  return {
    priorities,
    requestType,
    requestedFor,
    requester,
    requestId,
  };
}

watch(() => formPriorities.value, () => {
  emit('filter-count', numFilters.value);
  emit('filter-change', getFilterPayload());
}, { deep: true });

watch(() => formFields.value, () => {
  emit('filter-count', numFilters.value);
  emit('filter-change', getFilterPayload());
}, { deep: true });
</script>
