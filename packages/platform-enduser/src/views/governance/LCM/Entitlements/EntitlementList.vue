<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <FrHeader
      class="mb-4"
      :title="$t('governance.administer.entitlements.title')"
      :subtitle="$t('governance.administer.entitlements.subtitle')" />
    <FrGovResourceList
      class="mb-5"
      resource="entitlement"
      :columns="entitlementColumns"
      :resource-function="getEntitlementList"
      @row-clicked="navigateToEntitlementDetails">
      <template #cell(entitlement)="{ item }">
        <BMedia
          class="align-items-center"
          no-body>
          <BMediaAside class="align-self-center">
            <BImg
              class="mr-2"
              height="24"
              :src="getApplicationLogo(item.application)"
              :alt="$t('common.logo')" />
          </BMediaAside>
          <BMediaBody class="align-self-center overflow-hidden text-nowrap">
            <p class="h5 mb-0">
              {{ item.application?.name }}
            </p>
            {{ getApplicationDisplayName(item.application) }} {{ item.item?.objectType }}
          </BMediaBody>
        </BMedia>
      </template>
      <template #cell(displayName)="{ item }">
        {{ item.descriptor?.idx?.['/entitlement']?.displayName || blankValueIndicator }}
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
  </BContainer>
</template>

<script setup>
/**
 * This component is used to display the entitlements list.
 * Supports searching and pagination
 */
import {
  BContainer,
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
} from 'bootstrap-vue';
import { useRouter } from 'vue-router';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrGovResourceList from '@forgerock/platform-shared/src/components/governance/GovResourceList';
import { getEntitlementList } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import FrUserBasicInfo from '@forgerock/platform-shared/src/components/UserGroupList/UserBasicInfo';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getApplicationLogo, getApplicationDisplayName } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import i18n from '@/i18n';

const router = useRouter();

const entitlementColumns = [
  {
    key: 'entitlement',
    label: i18n.global.t('common.entitlement'),
  },
  {
    key: 'displayName',
    label: i18n.global.t('common.displayName'),
  },
  {
    key: 'owner',
    label: i18n.global.t('common.owner'),
  },
  {
    key: 'actions',
    label: '',
    class: 'w-80px',
  },
];

function navigateToEntitlementDetails(entitlement) {
  router.push({
    name: 'EntitlementDetails',
    params: { entitlementId: entitlement.id },
  });
}

</script>

<style lang="scss" scoped>
:deep {
  .w-80px {
    width: 80px;
  }

  .tr-gov-resource-list {
    height: 82px;
  }
}
</style>
