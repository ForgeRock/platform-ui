<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5 p-2">
    <FrHeader
      class="mb-4"
      :title="$t('governance.administer.entitlements.title')"
      :subtitle="$t('governance.administer.entitlements.subtitle')" />
    <FrGovResourceList
      class="mb-5"
      resource="entitlement"
      :additional-query-params="queryFilter"
      :columns="entitlementColumns"
      :resource-function="getEntitlementList"
      :show-add-button="showAddButton"
      :show-errors="false"
      @add-clicked="showAddEntitlementModal"
      @row-clicked="navigateToEntitlementDetails">
      <template #toolbar-right>
        <BButton
          class="ml-2 toolbar-link-text"
          @click="showFilters = !showFilters"
          variant="link">
          <FrIcon name="filter_list" />
        </BButton>
      </template>
      <template #toolbar-expanded>
        <BCollapse :visible="showFilters">
          <div class="border-bottom p-4">
            <BRow>
              <BCol lg="6">
                <FrGovResourceSelect
                  v-model="applicationFilter"
                  resource-path="application"
                  :first-option="allApplicationsOption"
                  :initial-data="{ id: 'all' }">
                  <template
                    v-for="(slotName, index) in ['singleLabel', 'option']"
                    :key="index"
                    #[slotName]="{ option }">
                    <BMedia
                      v-if="option.value !== 'all'"
                      class="align-items-center"
                      no-body>
                      <img
                        class="mr-2 size-28"
                        :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: option.name })"
                        :onerror="onImageError"
                        :src="getApplicationLogo(option)">
                      <BMediaBody class="align-self-center overflow-hidden text-nowrap">
                        {{ option.text }}
                      </BMediaBody>
                    </BMedia>
                  </template>
                </FrGovResourceSelect>
              </BCol>
              <BCol lg="6">
                <FrField
                  v-model="ownerFilter"
                  :label="$t('common.entitlementOwner')" />
              </BCol>
            </BRow>
          </div>
        </BCollapse>
      </template>
      <template #cell(entitlement)="{ item }">
        <BMedia
          class="align-items-center"
          no-body>
          <BMediaAside class="align-self-center">
            <img
              class="size-24"
              :onerror="onImageError"
              :src="getApplicationLogo(item.application)"
              :alt="$t('common.logo')">
          </BMediaAside>
          <BMediaBody class="align-self-center overflow-hidden text-nowrap">
            <p class="h5 mb-0">
              {{ item.application?.name }}
            </p>
            {{ getApplicationDisplayName(item.application) }}
          </BMediaBody>
        </BMedia>
      </template>
      <template #cell(displayName)="{ item }">
        {{ item.descriptor?.idx?.['/entitlement']?.displayName || blankValueIndicator }}
      </template>
      <template #cell(objectType)="{ item }">
        {{ item.item?.objectType || blankValueIndicator }}
      </template>
      <template #cell(accountAttribute)="{ item }">
        {{ item.application?.objectTypes?.find((x) => (x.name === item.item?.objectType))?.accountAttribute || blankValueIndicator }}
      </template>
      <template #cell(owner)="{ item }">
        <FrUserBasicInfo
          v-if="item.entitlementOwner?.[0]"
          :pic-dimension="28"
          :user="item.entitlementOwner?.[0]" />
        <template v-else>
          {{ blankValueIndicator }}
        </template>
      </template>
    </FrGovResourceList>
    <FrAddEntitlementModal />
  </BContainer>
</template>

<script setup>
/**
 * This component is used to display the entitlements list.
 * Supports searching and pagination
 */
import { onMounted, ref, watch } from 'vue';
import {
  BButton,
  BCol,
  BCollapse,
  BContainer,
  BMedia,
  BMediaAside,
  BMediaBody,
  BRow,
} from 'bootstrap-vue';
import { useRouter } from 'vue-router';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceList from '@forgerock/platform-shared/src/components/governance/GovResourceList';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrUserBasicInfo from '@forgerock/platform-shared/src/components/UserGroupList/UserBasicInfo';
import { getEntitlementList, getApplicationList } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getApplicationLogo, getApplicationDisplayName } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrAddEntitlementModal from './Add/AddEntitlementModal';
import i18n from '@/i18n';

// composables
const router = useRouter();
const { bvModal } = useBvModal();

// data
const applicationFilter = ref('');
const ownerFilter = ref('');
const queryFilter = ref('');
const showFilters = ref(false);
const showAddButton = ref(false);

const allApplicationsOption = {
  text: i18n.global.t('common.allApplications'),
  value: 'all',
};
const entitlementColumns = [
  {
    key: 'entitlement',
    label: i18n.global.t('common.entitlement'),
    initialSort: true,
    sortKey: 'application.name',
    sortable: true,
  },
  {
    key: 'displayName',
    label: i18n.global.t('common.displayName'),
    sortKey: 'descriptor.idx./entitlement.displayName',
    sortable: true,
  },
  {
    key: 'objectType',
    label: i18n.global.t('common.objectType'),
  },
  {
    key: 'accountAttribute',
    label: i18n.global.t('governance.entitlements.accountAttribute'),
  },
  {
    key: 'owner',
    label: i18n.global.t('common.owner'),
    sortKey: 'entitlementOwner.givenName',
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    class: 'w-70px',
  },
];

/**
 * Navigates to the details page of the specified entitlement.
 * @param {Object} entitlement - The entitlement object containing details to navigate to.
 */
function navigateToEntitlementDetails(entitlement) {
  router.push({
    name: 'EntitlementDetails',
    params: { entitlementId: entitlement.id },
  });
}

/**
 * Displays the modal for adding a new entitlement.
 */
function showAddEntitlementModal() {
  bvModal.value.show('add-entitlement-modal');
}

/**
 * Builds the filter query parameters for entitlements based on the provided application ID and owner query.
 * @param {string} applicationId - The ID of the application for which to build the filter query parameters.
 * @param {string} ownerQuery - The query string representing the owner filter criteria.
 * @returns {Object} The filter query parameters object.
 */
function buildFilterQueryParams(applicationId, ownerQuery) {
  const filters = [];
  const ownerFields = ['entitlementOwner.userName', 'entitlementOwner.givenName', 'entitlementOwner.sn'];
  if (applicationId !== 'managed/application/all') filters.push(`application.id eq "${applicationId.split('/').pop()}"`);
  if (ownerQuery) filters.push(`(${ownerFields.map((field) => `${field} co "${ownerQuery}"`).join(' or ')})`);
  return filters.join(' and ');
}

watch(() => applicationFilter.value, (newVal) => {
  queryFilter.value = buildFilterQueryParams(newVal, ownerFilter.value);
});

watch(() => ownerFilter.value, (newVal) => {
  queryFilter.value = buildFilterQueryParams(applicationFilter.value, newVal);
});

onMounted(async () => {
  try {
    const queryParams = {
      pageSize: 10,
      queryFilter: 'application.objectTypes.accountAttribute co ""',
    };
    const { data } = await getApplicationList(null, queryParams);
    showAddButton.value = data.totalCount > 0;
  } catch {
    showAddButton.value = false;
  }
});

</script>

<style lang="scss" scoped>
:deep {
  .w-70px {
    width: 70px;
  }

  .tr-gov-resource-list {
    height: 82px;
  }
}

.toolbar-link-text {
  color: $gray-900;
}
</style>
