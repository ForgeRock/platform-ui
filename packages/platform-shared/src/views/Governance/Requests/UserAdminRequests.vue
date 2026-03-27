<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <BContainer
      fluid>
      <!-- Header -->
      <BRow class="mt-5 pb-4 pb-lg-0 align-items-center">
        <BCol lg="8">
          <FrHeader
            :title="$t('pageTitles.UserAdminRequests')"
            :subtitle="$t('governance.accessRequest.userAdminRequests.subTitle')" />
        </BCol>
      </BRow>
      <!-- Content -->
      <BRow>
        <BCol>
          <FrRequestsTab :title="$t('pageTitles.Requests')" />
        </BCol>
      </BRow>
    </BContainer>
    <FrNewRequestModal />
  </div>
</template>

<script setup>
import {
  BCol,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNewRequestModal from '@forgerock/platform-shared/src/components/governance/NewRequestModal';
import FrRequestsTab from '@forgerock/platform-shared/src/views/Governance/Requests/requestTabs/RequestsTab';

</script>
