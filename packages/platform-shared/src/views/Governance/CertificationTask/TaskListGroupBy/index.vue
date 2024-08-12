<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-row">
    <BCard
      no-body
      class="card-flex">
      <BCardHeader class="height-75px d-flex align-items-center p-0 pl-4">
        <h1 class="h5 mb-0">
          {{ $t('governance.certificationTask.account') }}
        </h1>
      </BCardHeader>
      <FrTaskList
        v-if="campaignId && actorId"
        id="CertificationAccountsTaskList"
        certification-grant-type="accounts"
        :show-group-by="showGroupBy"
        :campaign-id="campaignId"
        :campaign-details="campaignDetails"
        :refresh-tasks="refreshTasks"
        :is-admin="isAdmin"
        :actor-id="actorId"
        :task-status="taskStatus"
        modal-prefix="account"
        @change-saving="setSaving"
        @check-progress="checkInProgress"
        @refresh-complete="refreshComplete"
        @signed-off="hideSignOff = true;"
        @set-totals="setTotals"
        @update-details="getCertificationDetails"
        @select-item="selectItem"
        @clear-item="selectedItem = null"
      />
    </BCard>
    <BCard
      no-body
      class="card-flex"
      v-if="selectedItem"
    >
      <div v-if="isLoading">
        <FrSpinner class="py-5" />
      </div>
      <BCardHeader
        v-else
        class="height-75px d-flex align-items-center p-0 pl-4">
        <BMedia
          class="clickable">
          <template #aside>
            <img
              class="mt-2"
              height="24"
              width="24"
              :alt="$t('common.logo')"
              :aria-hidden="true"
              :onerror="onImageError"
              :src="getLogo(selectedItem.application)">
          </template>
          <BMediaBody>
            <h1
              class="h5 mb-0 text-dark text-truncate">
              {{ selectedItem.application.name }}
            </h1>
            <small class="text-truncate">
              {{ selectedItem.user.cn }}
            </small>
          </BMediaBody>
        </BMedia>
      </BCardHeader>
      <FrTaskList
        v-if="campaignId && !isLoading"
        id="CertificationEntitlementsTaskList"
        certification-grant-type="entitlements"
        :campaign-id="campaignId"
        :campaign-details="campaignDetails"
        :refresh-tasks="refreshGroupByEntitlementTasks"
        :is-admin="isAdmin"
        :actor-id="actorId"
        :entitlement-user-id="userId"
        :task-status="taskStatus"
        modal-prefix="entitlement"
        @change-saving="setSaving"
        @check-progress="checkInProgress"
        @signed-off="hideSignOff = true;"
        @set-totals="setTotals"
        @update-details="getCertificationDetails"
      />
    </BCard>
  </div>
</template>

<script>
import {
  BCard,
  BCardHeader,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import FrTaskList from '../TaskList';

export default {
  name: 'TaskListGroupBy',
  components: {
    BCard,
    BCardHeader,
    BMedia,
    BMediaBody,
    FrTaskList,
    FrSpinner,
  },
  data() {
    return {
      selectedItem: null,
      isLoading: true,
      refreshGroupByEntitlementTasks: false,
    };
  },
  props: {
    campaignDetails: {
      type: Object,
      default: () => ({}),
    },
    actorId: {
      type: String,
      default: '',
    },
    campaignId: {
      type: String,
      default: null,
    },
    refreshTasks: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    certificationGrantType: {
      type: String,
      default: '',
    },
    showGroupBy: {
      type: Boolean,
      default: false,
    },
    taskStatus: {
      type: String,
      default: 'active',
    },
    isEntitlementCertificationType: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    userId() {
      return this.selectedItem?.user?.id;
    },
  },
  methods: {
    setSaving() {
      this.$emit('change-saving');
    },
    checkInProgress() {
      this.$emit('check-progress');
    },
    refreshComplete() {
      this.$emit('refresh-complete');
    },
    hidesignOff() {
      this.$emit('signed-off');
    },
    setTotals(totals) {
      this.$emit('set-totals', totals);
    },
    getCertificationDetails() {
      this.$emit('update-details');
    },
    selectItem(item) {
      this.selectedItem = item;
      this.isLoading = false;
      this.refreshGroupByEntitlementTasks = true;
    },
    getLogo(item) {
      return getApplicationLogo(item);
    },
    onImageError,
  },
};
</script>
<style lang="scss" scoped>
  .height-75px {
    height: 75px;
  }
  .card-flex {
    flex: 1;
  }
</style>
