<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BContainer>
      <!-- Header -->
      <BRow class="mt-5 pb-4 pb-lg-0 align-items-center">
        <BCol lg="8">
          <FrHeader
            :title="$t('pageTitles.MyRequests')"
            :subtitle="$t('pages.myRequests.subTitle')" />
        </BCol>
        <BCol
          v-if="!userStore.adminUser"
          lg="4">
          <div class="d-flex justify-content-lg-end">
            <BButton
              variant="primary"
              :aria-label="$t('governance.accessRequest.newRequest.newRequest')"
              @click="newRequest">
              <FrIcon
                icon-class="mr-2"
                name="add">
                {{ $t('governance.accessRequest.newRequest.newRequest') }}
              </FrIcon>
            </BButton>
          </div>
        </BCol>
      </BRow>
      <!-- Content -->
      <BRow>
        <BCol>
          <BTabs
            v-if="userStore.adminUser"
            v-model="tabIndex"
            content-class="mt-4"
            lazy
            nav-class="fr-tabs"
            @activate-tab="tabActivated">
            <BTab :title="$t('pageTitles.MyRequests')">
              <FrRequestsTab />
            </BTab>
            <BTab
              v-if="store.state.SharedStore.governanceDevEnabled"
              :title="$t('governance.accessRequest.requestTypesTabTitle')">
              <FrRequestTypesTab />
            </BTab>
          </BTabs>
          <FrRequestsTab v-else />
        </BCol>
      </BRow>
    </BContainer>
    <FrNewRequestModal />
  </div>
</template>

<script setup>
import {
  BButton,
  BCol,
  BContainer,
  BRow,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import {
  computed, onMounted, ref,
} from 'vue';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNewRequestModal from '@forgerock/platform-shared/src/components/governance/NewRequestModal';
import { useRoute } from 'vue-router';
import FrRequestsTab from './requestTabs/RequestsTab';
import FrRequestTypesTab from './requestTabs/RequestTypesTab';
import store from '@/store';

const { userId, adminUser } = useUserStore();
const { bvModal } = useBvModal();
const route = useRoute();

const userStore = computed(() => ({
  userId,
  adminUser,
}));

const tabMap = ['list', 'request-types'];
const routeTabIndex = tabMap.findIndex((key) => key === route.params.requestsTab);
const tabIndex = ref(routeTabIndex !== -1 ? routeTabIndex : 0);

function newRequest() {
  bvModal.value.show('NewRequestModal');
}

/**
 * Sets the url to the correct tab
 * @param {Number} selectedTabIndex - The selected tab index
 */
function tabActivated(selectedTabIndex) {
  window.history.pushState(window.history.state, '', `#/requests/${tabMap[selectedTabIndex]}`);
}

onMounted(() => {
  if (userStore.value.adminUser) {
    tabActivated(tabIndex.value);
  }
});

</script>
